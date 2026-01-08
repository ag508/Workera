import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { RequisitionsService } from './requisitions.service';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { BudgetValidationService } from './budget-validation.service';
import { RequisitionAuditService } from './requisition-audit.service';
import {
  RequisitionStatus,
  RequisitionPriority,
  EmploymentType,
  WorkModel,
} from '../database/entities/requisitions';
import { CreateRequisitionDto, UpdateRequisitionDto } from './requisitions.service';

// ============================================================================
// DTOs
// ============================================================================



export class ApprovalDecisionDto {
  decision: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE';
  comments?: string;
  delegateTo?: string;
  tenantId?: string;
  userId?: string;
}

export class CancelRequisitionDto {
  reason: string;
  tenantId?: string;
  userId?: string;
}

export class HoldRequisitionDto {
  reason: string;
  tenantId?: string;
  userId?: string;
}

export class PostRequisitionDto {
  channels: string[];
  tenantId?: string;
  userId?: string;
}

export class FillRequisitionDto {
  count: number;
  tenantId?: string;
  userId?: string;
}

export class RequisitionQueryDto {
  tenantId?: string;
  status?: RequisitionStatus[];
  departmentId?: string;
  hiringManagerId?: string;
  recruiterId?: string;
  priority?: RequisitionPriority;
  employmentType?: EmploymentType;
  workModel?: WorkModel;
  createdAfter?: Date;
  createdBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================================================
// CONTROLLER
// ============================================================================

@Controller('requisitions')
export class RequisitionsController {
  constructor(
    private readonly requisitionsService: RequisitionsService,
    private readonly approvalWorkflowService: ApprovalWorkflowService,
    private readonly budgetValidationService: BudgetValidationService,
    private readonly auditService: RequisitionAuditService,
  ) { }

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  @Get()
  async getRequisitions(@Query() query: RequisitionQueryDto) {
    const tenantId = query.tenantId || '11111111-1111-1111-1111-111111111111';
    const page = query.page || 1;
    const limit = query.limit || 20;

    const filters = {
      status: query.status,
      departmentId: query.departmentId ? [query.departmentId] : undefined,
      hiringManagerId: query.hiringManagerId,
      recruiterId: query.recruiterId,
      priority: query.priority ? [query.priority] : undefined,
      createdFrom: query.createdAfter,
      createdTo: query.createdBefore,
    };

    const requisitions = await this.requisitionsService.findAll(
      tenantId,
      filters,
    );

    // Apply pagination manually
    const start = (page - 1) * limit;
    const paginatedData = requisitions.slice(start, start + limit);

    return {
      success: true,
      data: paginatedData,
      meta: {
        total: requisitions.length,
        page,
        limit,
        totalPages: Math.ceil(requisitions.length / limit),
      },
    };
  }

  @Get('stats')
  async getStatistics(@Query('tenantId') tenantId?: string) {
    const stats = await this.requisitionsService.getStats(
      tenantId || '11111111-1111-1111-1111-111111111111',
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getRequisition(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const requisition = await this.requisitionsService.findById(
      tenantId || '11111111-1111-1111-1111-111111111111',
      id,
    );

    return {
      success: !!requisition,
      data: requisition,
    };
  }

  @Post()
  async createRequisition(@Body(ValidationPipe) dto: CreateRequisitionDto) {
    const tenantId = dto.tenantId || '11111111-1111-1111-1111-111111111111';
    const createdBy = dto.createdBy || 'system';

    // Validate salary band if job grade is provided
    if (dto.jobGradeId && dto.salaryMin && dto.salaryMax) {
      await this.budgetValidationService.validateSalaryBand(
        tenantId,
        dto.jobGradeId,
        dto.salaryMin,
        dto.salaryMax,
      );
    }

    // Validate budget if cost center is provided
    if (dto.costCenterId && dto.salaryMax) {
      const budgetCheck = await this.budgetValidationService.validateBudgetAvailability(
        tenantId,
        dto.costCenterId,
        dto.salaryMax * dto.headcount,
      );

      if (!budgetCheck.available) {
        return {
          success: false,
          error: budgetCheck.message,
          data: null,
        };
      }
    }

    const requisition = await this.requisitionsService.create({
      ...dto,
      tenantId,
      createdBy,
    });

    return {
      success: true,
      data: requisition,
    };
  }

  @Put(':id')
  async updateRequisition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: UpdateRequisitionDto,
  ) {
    const tenantId = dto.tenantId || '11111111-1111-1111-1111-111111111111';
    const updatedBy = dto.updatedBy || 'system';

    const requisition = await this.requisitionsService.update(
      tenantId,
      id,
      { ...dto, updatedBy },
    );

    return {
      success: !!requisition,
      data: requisition,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRequisition(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
  ) {
    await this.requisitionsService.delete(
      tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      userId || 'system',
    );
  }

  // ============================================================================
  // WORKFLOW OPERATIONS
  // ============================================================================

  @Post(':id/submit')
  async submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
  ) {
    const requisition = await this.requisitionsService.submit(
      tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      userId || 'system',
    );

    return {
      success: true,
      data: requisition,
      message: 'Requisition submitted for approval',
    };
  }

  @Post(':id/approve')
  async processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: ApprovalDecisionDto,
  ) {
    const tenantId = dto.tenantId || '11111111-1111-1111-1111-111111111111';
    const userId = dto.userId || 'system';

    let requisition;
    if (dto.decision === 'APPROVE') {
      requisition = await this.requisitionsService.approve(
        tenantId,
        id,
        userId,
        dto.comments,
      );
    } else if (dto.decision === 'REJECT') {
      requisition = await this.requisitionsService.reject(
        tenantId,
        id,
        userId,
        dto.comments || 'Rejected',
      );
    } else {
      // SEND_BACK or DELEGATE - treat as reject for now
      requisition = await this.requisitionsService.reject(
        tenantId,
        id,
        userId,
        dto.comments || dto.decision,
      );
    }

    return {
      success: true,
      data: requisition,
      message: `Requisition ${dto.decision.toLowerCase()}d`,
    };
  }

  @Post(':id/cancel')
  async cancelRequisition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: CancelRequisitionDto,
  ) {
    const requisition = await this.requisitionsService.cancel(
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      dto.userId || 'system',
      dto.reason,
    );

    return {
      success: true,
      data: requisition,
      message: 'Requisition cancelled',
    };
  }

  @Post(':id/hold')
  async holdRequisition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: HoldRequisitionDto,
  ) {
    const requisition = await this.requisitionsService.hold(
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      dto.userId || 'system',
      dto.reason,
    );

    return {
      success: true,
      data: requisition,
      message: 'Requisition placed on hold',
    };
  }

  @Post(':id/resume')
  async resumeRequisition(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
  ) {
    const requisition = await this.requisitionsService.resume(
      tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      userId || 'system',
    );

    return {
      success: true,
      data: requisition,
      message: 'Requisition resumed',
    };
  }

  @Post(':id/post')
  async postToJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: PostRequisitionDto,
  ) {
    const requisition = await this.requisitionsService.postToJob(
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      dto.userId || 'system',
      dto.channels,
    );

    return {
      success: true,
      data: requisition,
      message: 'Requisition posted to job boards',
    };
  }

  @Post(':id/fill')
  async markFilled(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) dto: FillRequisitionDto,
  ) {
    const requisition = await this.requisitionsService.markFilled(
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      id,
      dto.userId || 'system',
      dto.count,
    );

    return {
      success: true,
      data: requisition,
      message: `${dto.count} position(s) filled`,
    };
  }

  // ============================================================================
  // APPROVAL TRACKING
  // ============================================================================

  @Get(':id/approvals')
  async getApprovalStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const status = await this.approvalWorkflowService.getSLAStatus(id);

    return {
      success: true,
      data: status,
    };
  }

  @Get('pending-approvals/me')
  async getMyPendingApprovals(
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
  ) {
    const pending = await this.approvalWorkflowService.getPendingApprovalsForUser(
      tenantId || '11111111-1111-1111-1111-111111111111',
      userId || 'system',
    );

    return {
      success: true,
      data: pending,
    };
  }

  // ============================================================================
  // BUDGET OPERATIONS
  // ============================================================================

  @Get(':id/budget')
  async getBudgetReservations(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const reservations = await this.budgetValidationService.getReservationsForRequisition(
      tenantId || '11111111-1111-1111-1111-111111111111',
      id,
    );

    return {
      success: true,
      data: reservations,
    };
  }

  @Get('cost-centers/:costCenterId/budget')
  async getCostCenterBudget(
    @Param('costCenterId', ParseUUIDPipe) costCenterId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const summary = await this.budgetValidationService.getBudgetSummary(
      tenantId || '11111111-1111-1111-1111-111111111111',
      costCenterId,
    );

    return {
      success: true,
      data: summary,
    };
  }

  // ============================================================================
  // AUDIT TRAIL
  // ============================================================================

  @Get(':id/audit')
  async getAuditTrail(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const audit = await this.auditService.getAuditTrail(
      tenantId || '11111111-1111-1111-1111-111111111111',
      id,
    );

    return {
      success: true,
      data: audit,
    };
  }

  @Get('audit/recent')
  async getRecentActivity(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number,
  ) {
    const activity = await this.auditService.getRecentActivity(
      tenantId || '11111111-1111-1111-1111-111111111111',
      limit || 20,
    );

    return {
      success: true,
      data: activity,
    };
  }

  @Get('audit/user/:userId')
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.auditService.getAuditLogsForUser(
      tenantId || '11111111-1111-1111-1111-111111111111',
      userId,
      limit || 50,
    );

    return {
      success: true,
      data: logs,
    };
  }

  // ============================================================================
  // SLA MONITORING
  // ============================================================================

  @Get('sla/breaches')
  async checkSLABreaches(@Query('tenantId') tenantId?: string) {
    const escalations = await this.approvalWorkflowService.checkSLABreaches(
      tenantId || '11111111-1111-1111-1111-111111111111',
    );

    return {
      success: true,
      data: escalations,
      count: escalations.length,
    };
  }
}
