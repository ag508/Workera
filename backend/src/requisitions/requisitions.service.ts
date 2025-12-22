import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  JobRequisition,
  RequisitionStatus,
  RequisitionPriority,
  RequisitionType,
  EmploymentType,
  WorkModel,
  Department,
  Location,
  BusinessUnit,
  JobGrade,
  CostCenter,
  Position,
  HiringTeamMember,
  HiringTeamRole,
} from '../database/entities/requisitions';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { BudgetValidationService } from './budget-validation.service';
import { RequisitionAuditService } from './requisition-audit.service';

export interface CreateRequisitionDto {
  tenantId: string;
  createdBy: string;
  requisitionType?: RequisitionType;
  priority?: RequisitionPriority;
  businessUnitId: string;
  departmentId: string;
  locationId: string;
  positionId?: string;
  jobTitle: string;
  jobCode?: string;
  jobFamily?: string;
  jobGradeId: string;
  jobDescription?: string;
  skills?: string[];
  qualifications?: string[];
  headcount?: number;
  employmentType?: EmploymentType;
  workModel?: WorkModel;
  targetStartDate: Date;
  targetFillDate?: Date;
  isReplacement?: boolean;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  replacementReason?: string;
  salaryMin: number;
  salaryMax: number;
  currency?: string;
  signOnBonus?: number;
  equityShares?: number;
  relocationAssistance?: boolean;
  costCenterId: string;
  hiringManagerId: string;
  hiringManagerName: string;
  recruiterId?: string;
  recruiterName?: string;
  justification?: string;
  internalNotes?: string;
}

export interface UpdateRequisitionDto extends Partial<CreateRequisitionDto> {
  updatedBy: string;
}

export interface RequisitionFilters {
  status?: RequisitionStatus[];
  priority?: RequisitionPriority[];
  departmentId?: string[];
  locationId?: string[];
  hiringManagerId?: string;
  recruiterId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  search?: string;
}

@Injectable()
export class RequisitionsService {
  constructor(
    @InjectRepository(JobRequisition)
    private readonly requisitionRepository: Repository<JobRequisition>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(BusinessUnit)
    private readonly businessUnitRepository: Repository<BusinessUnit>,
    @InjectRepository(JobGrade)
    private readonly jobGradeRepository: Repository<JobGrade>,
    @InjectRepository(CostCenter)
    private readonly costCenterRepository: Repository<CostCenter>,
    @InjectRepository(HiringTeamMember)
    private readonly hiringTeamRepository: Repository<HiringTeamMember>,
    private readonly approvalWorkflowService: ApprovalWorkflowService,
    private readonly budgetValidationService: BudgetValidationService,
    private readonly auditService: RequisitionAuditService,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  async create(dto: CreateRequisitionDto): Promise<JobRequisition> {
    // Validate references
    await this.validateReferences(dto);

    // Validate salary band against job grade
    await this.budgetValidationService.validateSalaryBand(
      dto.tenantId,
      dto.jobGradeId,
      dto.salaryMin,
      dto.salaryMax,
    );

    // Generate requisition number
    const requisitionNumber = await this.generateRequisitionNumber(dto.tenantId);

    // Create requisition
    const requisition = this.requisitionRepository.create({
      ...dto,
      requisitionNumber,
      status: RequisitionStatus.DRAFT,
    });

    const saved = await this.requisitionRepository.save(requisition);

    // Add hiring manager to hiring team
    await this.addToHiringTeam(saved.id, dto.tenantId, {
      userId: dto.hiringManagerId,
      userName: dto.hiringManagerName,
      role: HiringTeamRole.HIRING_MANAGER,
    });

    // Add recruiter to hiring team if specified
    if (dto.recruiterId && dto.recruiterName) {
      await this.addToHiringTeam(saved.id, dto.tenantId, {
        userId: dto.recruiterId,
        userName: dto.recruiterName,
        role: HiringTeamRole.RECRUITER,
      });
    }

    // Log audit
    await this.auditService.logCreate(saved, dto.createdBy);

    return this.findById(dto.tenantId, saved.id);
  }

  async findAll(tenantId: string, filters?: RequisitionFilters): Promise<JobRequisition[]> {
    const qb = this.requisitionRepository
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.department', 'department')
      .leftJoinAndSelect('req.location', 'location')
      .leftJoinAndSelect('req.businessUnit', 'businessUnit')
      .leftJoinAndSelect('req.jobGrade', 'jobGrade')
      .leftJoinAndSelect('req.costCenter', 'costCenter')
      .where('req.tenantId = :tenantId', { tenantId })
      .orderBy('req.createdAt', 'DESC');

    if (filters) {
      if (filters.status?.length) {
        qb.andWhere('req.status IN (:...status)', { status: filters.status });
      }
      if (filters.priority?.length) {
        qb.andWhere('req.priority IN (:...priority)', { priority: filters.priority });
      }
      if (filters.departmentId?.length) {
        qb.andWhere('req.departmentId IN (:...departmentId)', { departmentId: filters.departmentId });
      }
      if (filters.locationId?.length) {
        qb.andWhere('req.locationId IN (:...locationId)', { locationId: filters.locationId });
      }
      if (filters.hiringManagerId) {
        qb.andWhere('req.hiringManagerId = :hiringManagerId', { hiringManagerId: filters.hiringManagerId });
      }
      if (filters.recruiterId) {
        qb.andWhere('req.recruiterId = :recruiterId', { recruiterId: filters.recruiterId });
      }
      if (filters.createdFrom) {
        qb.andWhere('req.createdAt >= :createdFrom', { createdFrom: filters.createdFrom });
      }
      if (filters.createdTo) {
        qb.andWhere('req.createdAt <= :createdTo', { createdTo: filters.createdTo });
      }
      if (filters.search) {
        qb.andWhere(
          '(req.jobTitle ILIKE :search OR req.requisitionNumber ILIKE :search OR req.jobCode ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }
    }

    return qb.getMany();
  }

  async findById(tenantId: string, id: string): Promise<JobRequisition> {
    const requisition = await this.requisitionRepository.findOne({
      where: { id, tenantId },
      relations: [
        'department',
        'location',
        'businessUnit',
        'jobGrade',
        'costCenter',
        'position',
        'hiringTeam',
        'approvals',
      ],
    });

    if (!requisition) {
      throw new NotFoundException(`Requisition ${id} not found`);
    }

    return requisition;
  }

  async update(tenantId: string, id: string, dto: UpdateRequisitionDto): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    // Only allow updates in certain states
    const editableStates = [RequisitionStatus.DRAFT, RequisitionStatus.REJECTED];
    if (!editableStates.includes(requisition.status)) {
      throw new BadRequestException(`Cannot edit requisition in ${requisition.status} status`);
    }

    // Validate references if changed
    if (dto.businessUnitId || dto.departmentId || dto.locationId || dto.jobGradeId || dto.costCenterId) {
      await this.validateReferences({
        tenantId,
        businessUnitId: dto.businessUnitId || requisition.businessUnitId,
        departmentId: dto.departmentId || requisition.departmentId,
        locationId: dto.locationId || requisition.locationId,
        jobGradeId: dto.jobGradeId || requisition.jobGradeId,
        costCenterId: dto.costCenterId || requisition.costCenterId,
      } as any);
    }

    // Validate salary band if changed
    if (dto.salaryMin !== undefined || dto.salaryMax !== undefined) {
      await this.budgetValidationService.validateSalaryBand(
        tenantId,
        dto.jobGradeId || requisition.jobGradeId,
        dto.salaryMin ?? requisition.salaryMin,
        dto.salaryMax ?? requisition.salaryMax,
      );
    }

    // Increment version
    const updatedData = {
      ...dto,
      version: requisition.version + 1,
      updatedBy: dto.updatedBy,
    };

    await this.requisitionRepository.update(id, updatedData);

    // Log audit
    await this.auditService.logUpdate(requisition, updatedData, dto.updatedBy);

    return this.findById(tenantId, id);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const requisition = await this.findById(tenantId, id);

    // Only allow deletion in DRAFT status
    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new BadRequestException('Only draft requisitions can be deleted');
    }

    await this.requisitionRepository.delete(id);
    await this.auditService.logDelete(requisition, userId);
  }

  // ============================================================================
  // WORKFLOW OPERATIONS
  // ============================================================================

  async submit(tenantId: string, id: string, userId: string): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    if (requisition.status !== RequisitionStatus.DRAFT && requisition.status !== RequisitionStatus.REJECTED) {
      throw new BadRequestException(`Cannot submit requisition in ${requisition.status} status`);
    }

    // Validate budget availability
    await this.budgetValidationService.validateBudgetAvailability(
      tenantId,
      requisition.costCenterId,
      requisition.salaryMax * requisition.headcount,
    );

    // Reserve budget
    await this.budgetValidationService.reserveBudget(
      tenantId,
      requisition.id,
      requisition.costCenterId,
      requisition.salaryMax * requisition.headcount,
      userId,
    );

    // Initialize approval workflow
    const approvalLevels = await this.approvalWorkflowService.initializeWorkflow(requisition, userId);

    // Update status
    await this.requisitionRepository.update(id, {
      status: RequisitionStatus.PENDING_APPROVAL,
      totalApprovalLevels: approvalLevels,
      currentApprovalLevel: 1,
      submittedAt: new Date(),
      updatedBy: userId,
    });

    await this.auditService.logSubmit(requisition, userId);

    return this.findById(tenantId, id);
  }

  async approve(
    tenantId: string,
    id: string,
    userId: string,
    comments?: string,
  ): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    if (requisition.status !== RequisitionStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Requisition is not pending approval');
    }

    const result = await this.approvalWorkflowService.processApproval(
      requisition,
      userId,
      'APPROVE',
      comments,
    );

    if (result.isFullyApproved) {
      await this.requisitionRepository.update(id, {
        status: RequisitionStatus.APPROVED,
        currentApprovalLevel: requisition.totalApprovalLevels,
        approvedAt: new Date(),
        updatedBy: userId,
      });
    } else {
      await this.requisitionRepository.update(id, {
        currentApprovalLevel: result.nextLevel,
        updatedBy: userId,
      });
    }

    await this.auditService.logApprove(requisition, userId, comments);

    return this.findById(tenantId, id);
  }

  async reject(
    tenantId: string,
    id: string,
    userId: string,
    reason: string,
  ): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    if (requisition.status !== RequisitionStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Requisition is not pending approval');
    }

    await this.approvalWorkflowService.processApproval(
      requisition,
      userId,
      'REJECT',
      reason,
    );

    // Release reserved budget
    await this.budgetValidationService.releaseBudget(
      tenantId,
      requisition.id,
      userId,
    );

    await this.requisitionRepository.update(id, {
      status: RequisitionStatus.REJECTED,
      rejectedAt: new Date(),
      rejectionReason: reason,
      updatedBy: userId,
    });

    await this.auditService.logReject(requisition, userId, reason);

    return this.findById(tenantId, id);
  }

  async cancel(tenantId: string, id: string, userId: string, reason: string): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    const cancellableStates = [
      RequisitionStatus.DRAFT,
      RequisitionStatus.PENDING_APPROVAL,
      RequisitionStatus.APPROVED,
      RequisitionStatus.POSTED,
      RequisitionStatus.ACTIVE_HIRING,
      RequisitionStatus.ON_HOLD,
    ];

    if (!cancellableStates.includes(requisition.status)) {
      throw new BadRequestException(`Cannot cancel requisition in ${requisition.status} status`);
    }

    // Release reserved budget
    await this.budgetValidationService.releaseBudget(tenantId, requisition.id, userId);

    await this.requisitionRepository.update(id, {
      status: RequisitionStatus.CANCELLED,
      closedAt: new Date(),
      internalNotes: `Cancelled: ${reason}\n\n${requisition.internalNotes || ''}`,
      updatedBy: userId,
    });

    await this.auditService.logCancel(requisition, userId, reason);

    return this.findById(tenantId, id);
  }

  async hold(tenantId: string, id: string, userId: string, reason: string): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    const holdableStates = [
      RequisitionStatus.PENDING_APPROVAL,
      RequisitionStatus.APPROVED,
      RequisitionStatus.POSTED,
      RequisitionStatus.ACTIVE_HIRING,
    ];

    if (!holdableStates.includes(requisition.status)) {
      throw new BadRequestException(`Cannot put requisition on hold in ${requisition.status} status`);
    }

    await this.requisitionRepository.update(id, {
      previousStatus: requisition.status,
      status: RequisitionStatus.ON_HOLD,
      internalNotes: `On Hold: ${reason}\n\n${requisition.internalNotes || ''}`,
      updatedBy: userId,
    });

    await this.auditService.logHold(requisition, userId, reason);

    return this.findById(tenantId, id);
  }

  async resume(tenantId: string, id: string, userId: string): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    if (requisition.status !== RequisitionStatus.ON_HOLD) {
      throw new BadRequestException('Only on-hold requisitions can be resumed');
    }

    const resumeStatus = requisition.previousStatus || RequisitionStatus.APPROVED;

    await this.requisitionRepository.update(id, {
      status: resumeStatus,
      previousStatus: null,
      updatedBy: userId,
    });

    await this.auditService.logResume(requisition, userId);

    return this.findById(tenantId, id);
  }

  async postToJob(tenantId: string, id: string, userId: string, channels: string[]): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    if (requisition.status !== RequisitionStatus.APPROVED) {
      throw new BadRequestException('Only approved requisitions can be posted');
    }

    await this.requisitionRepository.update(id, {
      status: RequisitionStatus.POSTED,
      postedAt: new Date(),
      postedChannels: channels,
      updatedBy: userId,
    });

    await this.auditService.logPost(requisition, userId, channels);

    return this.findById(tenantId, id);
  }

  async markFilled(
    tenantId: string,
    id: string,
    userId: string,
    filledCount: number = 1,
  ): Promise<JobRequisition> {
    const requisition = await this.findById(tenantId, id);

    const filledStates = [RequisitionStatus.POSTED, RequisitionStatus.ACTIVE_HIRING];
    if (!filledStates.includes(requisition.status)) {
      throw new BadRequestException('Requisition must be posted or actively hiring');
    }

    const newFilledCount = requisition.headcountFilled + filledCount;
    const isFully = newFilledCount >= requisition.headcount;

    await this.requisitionRepository.update(id, {
      headcountFilled: newFilledCount,
      status: isFully ? RequisitionStatus.FILLED : RequisitionStatus.ACTIVE_HIRING,
      closedAt: isFully ? new Date() : null,
      updatedBy: userId,
    });

    await this.auditService.logFill(requisition, userId, filledCount);

    return this.findById(tenantId, id);
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getStats(tenantId: string): Promise<{
    total: number;
    byStatus: Record<RequisitionStatus, number>;
    byPriority: Record<RequisitionPriority, number>;
    pendingApproval: number;
    activeHiring: number;
    filledThisMonth: number;
    avgTimeToFill: number;
  }> {
    const requisitions = await this.requisitionRepository.find({ where: { tenantId } });

    const byStatus = {} as Record<RequisitionStatus, number>;
    const byPriority = {} as Record<RequisitionPriority, number>;

    Object.values(RequisitionStatus).forEach(s => byStatus[s] = 0);
    Object.values(RequisitionPriority).forEach(p => byPriority[p] = 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let filledThisMonth = 0;
    let totalTimeToFill = 0;
    let filledCount = 0;

    requisitions.forEach(req => {
      byStatus[req.status]++;
      byPriority[req.priority]++;

      if (req.status === RequisitionStatus.FILLED && req.closedAt) {
        if (req.closedAt >= startOfMonth) {
          filledThisMonth++;
        }
        const timeToFill = req.closedAt.getTime() - req.submittedAt.getTime();
        totalTimeToFill += timeToFill;
        filledCount++;
      }
    });

    return {
      total: requisitions.length,
      byStatus,
      byPriority,
      pendingApproval: byStatus[RequisitionStatus.PENDING_APPROVAL],
      activeHiring: byStatus[RequisitionStatus.ACTIVE_HIRING] + byStatus[RequisitionStatus.POSTED],
      filledThisMonth,
      avgTimeToFill: filledCount > 0 ? Math.round(totalTimeToFill / filledCount / (1000 * 60 * 60 * 24)) : 0,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async validateReferences(dto: Partial<CreateRequisitionDto>): Promise<void> {
    const checks: Promise<any>[] = [];

    if (dto.businessUnitId) {
      checks.push(
        this.businessUnitRepository.findOne({
          where: { id: dto.businessUnitId, tenantId: dto.tenantId, isActive: true },
        }).then(r => {
          if (!r) throw new BadRequestException('Invalid business unit');
        }),
      );
    }

    if (dto.departmentId) {
      checks.push(
        this.departmentRepository.findOne({
          where: { id: dto.departmentId, tenantId: dto.tenantId, isActive: true },
        }).then(r => {
          if (!r) throw new BadRequestException('Invalid department');
        }),
      );
    }

    if (dto.locationId) {
      checks.push(
        this.locationRepository.findOne({
          where: { id: dto.locationId, tenantId: dto.tenantId, isActive: true },
        }).then(r => {
          if (!r) throw new BadRequestException('Invalid location');
        }),
      );
    }

    if (dto.jobGradeId) {
      checks.push(
        this.jobGradeRepository.findOne({
          where: { id: dto.jobGradeId, tenantId: dto.tenantId, isActive: true },
        }).then(r => {
          if (!r) throw new BadRequestException('Invalid job grade');
        }),
      );
    }

    if (dto.costCenterId) {
      checks.push(
        this.costCenterRepository.findOne({
          where: { id: dto.costCenterId, tenantId: dto.tenantId, isActive: true },
        }).then(r => {
          if (!r) throw new BadRequestException('Invalid cost center');
        }),
      );
    }

    await Promise.all(checks);
  }

  private async generateRequisitionNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REQ-${year}-`;

    const lastReq = await this.requisitionRepository
      .createQueryBuilder('req')
      .where('req.tenantId = :tenantId', { tenantId })
      .andWhere('req.requisitionNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('req.requisitionNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastReq) {
      const lastSeq = parseInt(lastReq.requisitionNumber.replace(prefix, ''), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }

  private async addToHiringTeam(
    requisitionId: string,
    tenantId: string,
    member: { userId: string; userName: string; role: HiringTeamRole },
  ): Promise<void> {
    const teamMember = this.hiringTeamRepository.create({
      requisitionId,
      tenantId,
      userId: member.userId,
      userName: member.userName,
      role: member.role,
    });

    await this.hiringTeamRepository.save(teamMember);
  }
}
