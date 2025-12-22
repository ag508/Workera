import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  JobRequisition,
  ApprovalTransaction,
  ApprovalRule,
  ApprovalStatus,
  ApprovalDecision,
  ApproverRole,
  RequisitionStatus,
  RequisitionPriority,
  SLAStatus,
} from '../database/entities/requisitions';

export interface ApprovalResult {
  isFullyApproved: boolean;
  nextLevel: number;
  pendingApprovers: string[];
}

export interface EscalationInfo {
  requisitionId: string;
  approvalId: string;
  approverId: string;
  approverName: string;
  slaBreachedAt: Date;
  escalateTo: string;
}

@Injectable()
export class ApprovalWorkflowService {
  constructor(
    @InjectRepository(ApprovalTransaction)
    private readonly approvalRepository: Repository<ApprovalTransaction>,
    @InjectRepository(ApprovalRule)
    private readonly ruleRepository: Repository<ApprovalRule>,
    @InjectRepository(JobRequisition)
    private readonly requisitionRepository: Repository<JobRequisition>,
  ) {}

  // ============================================================================
  // WORKFLOW INITIALIZATION
  // ============================================================================

  async initializeWorkflow(requisition: JobRequisition, submittedBy: string): Promise<number> {
    // Get applicable approval rules
    const rules = await this.getApplicableRules(requisition);

    if (rules.length === 0) {
      // No approval required - auto-approve
      return 0;
    }

    // Create approval transactions for each level
    for (const rule of rules) {
      const approvers = await this.getApproversForRule(rule, requisition);

      for (const approver of approvers) {
        const approval = this.approvalRepository.create({
          requisitionId: requisition.id,
          tenantId: requisition.tenantId,
          level: rule.level,
          approverId: approver.id,
          approverName: approver.name,
          approverEmail: approver.email,
          approverRole: rule.approverRole,
          status: rule.level === 1 ? ApprovalStatus.PENDING : ApprovalStatus.PENDING,
          slaHours: rule.slaHours,
          dueAt: this.calculateDueDate(rule.slaHours),
        });

        await this.approvalRepository.save(approval);
      }
    }

    return rules.length;
  }

  async getApplicableRules(requisition: JobRequisition): Promise<ApprovalRule[]> {
    const rules = await this.ruleRepository
      .createQueryBuilder('rule')
      .where('rule.tenantId = :tenantId', { tenantId: requisition.tenantId })
      .andWhere('rule.isActive = :isActive', { isActive: true })
      .andWhere('(rule.departmentId IS NULL OR rule.departmentId = :departmentId)', {
        departmentId: requisition.departmentId,
      })
      .andWhere('(rule.minSalary IS NULL OR :salary >= rule.minSalary)', {
        salary: requisition.salaryMax,
      })
      .andWhere('(rule.maxSalary IS NULL OR :salary <= rule.maxSalary)', {
        salary: requisition.salaryMax,
      })
      .andWhere('(rule.headcountThreshold IS NULL OR :headcount >= rule.headcountThreshold)', {
        headcount: requisition.headcount,
      })
      .orderBy('rule.level', 'ASC')
      .getMany();

    // Apply priority-based rules
    if (requisition.priority === RequisitionPriority.CRITICAL) {
      // Critical requisitions may have expedited approval
      return rules.filter(r => r.level <= 2); // Only first 2 levels
    }

    return rules;
  }

  private async getApproversForRule(
    rule: ApprovalRule,
    requisition: JobRequisition,
  ): Promise<{ id: string; name: string; email: string }[]> {
    // In production, this would fetch from user/employee database
    // For now, return mock approvers based on role
    const approversByRole: Record<ApproverRole, { id: string; name: string; email: string }[]> = {
      [ApproverRole.HIRING_MANAGER]: [
        { id: requisition.hiringManagerId, name: requisition.hiringManagerName, email: 'hiring.manager@company.com' },
      ],
      [ApproverRole.HRBP]: [
        { id: 'hrbp-001', name: 'HR Business Partner', email: 'hrbp@company.com' },
      ],
      [ApproverRole.FINANCE]: [
        { id: 'finance-001', name: 'Finance Director', email: 'finance@company.com' },
      ],
      [ApproverRole.DEPT_HEAD]: [
        { id: 'dept-head-001', name: 'Department Head', email: 'dept.head@company.com' },
      ],
      [ApproverRole.EXECUTIVE]: [
        { id: 'exec-001', name: 'VP of Engineering', email: 'vp@company.com' },
      ],
      [ApproverRole.CUSTOM]: rule.customApprovers || [],
    };

    return approversByRole[rule.approverRole] || [];
  }

  private calculateDueDate(slaHours: number): Date {
    const due = new Date();
    due.setHours(due.getHours() + slaHours);
    return due;
  }

  // ============================================================================
  // APPROVAL PROCESSING
  // ============================================================================

  async processApproval(
    requisition: JobRequisition,
    userId: string,
    decision: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE',
    comments?: string,
    delegateTo?: string,
  ): Promise<ApprovalResult> {
    // Find pending approval for this user at current level
    const approval = await this.approvalRepository.findOne({
      where: {
        requisitionId: requisition.id,
        level: requisition.currentApprovalLevel,
        approverId: userId,
        status: ApprovalStatus.PENDING,
      },
    });

    if (!approval) {
      throw new ForbiddenException('You are not authorized to approve this requisition');
    }

    // Process decision
    switch (decision) {
      case 'APPROVE':
        return this.handleApprove(approval, requisition, comments);
      case 'REJECT':
        return this.handleReject(approval, requisition, comments);
      case 'SEND_BACK':
        return this.handleSendBack(approval, requisition, comments);
      case 'DELEGATE':
        if (!delegateTo) throw new BadRequestException('Delegate target required');
        return this.handleDelegate(approval, requisition, delegateTo, comments);
      default:
        throw new BadRequestException('Invalid decision');
    }
  }

  private async handleApprove(
    approval: ApprovalTransaction,
    requisition: JobRequisition,
    comments?: string,
  ): Promise<ApprovalResult> {
    // Update approval
    await this.approvalRepository.update(approval.id, {
      status: ApprovalStatus.APPROVED,
      decision: ApprovalDecision.APPROVE,
      comments,
      decidedAt: new Date(),
    });

    // Check if all approvers at this level have approved
    const pendingAtLevel = await this.approvalRepository.count({
      where: {
        requisitionId: requisition.id,
        level: requisition.currentApprovalLevel,
        status: ApprovalStatus.PENDING,
      },
    });

    if (pendingAtLevel === 0) {
      // Level complete - check if more levels exist
      const nextLevelApprovals = await this.approvalRepository.find({
        where: {
          requisitionId: requisition.id,
          level: requisition.currentApprovalLevel + 1,
        },
      });

      if (nextLevelApprovals.length === 0) {
        // All levels complete
        return {
          isFullyApproved: true,
          nextLevel: requisition.currentApprovalLevel,
          pendingApprovers: [],
        };
      }

      // Activate next level approvals
      await this.approvalRepository.update(
        { requisitionId: requisition.id, level: requisition.currentApprovalLevel + 1 },
        { dueAt: this.calculateDueDate(nextLevelApprovals[0].slaHours || 24) },
      );

      return {
        isFullyApproved: false,
        nextLevel: requisition.currentApprovalLevel + 1,
        pendingApprovers: nextLevelApprovals.map(a => a.approverName),
      };
    }

    // Still waiting for other approvers at this level
    return {
      isFullyApproved: false,
      nextLevel: requisition.currentApprovalLevel,
      pendingApprovers: await this.getPendingApproverNames(requisition.id, requisition.currentApprovalLevel),
    };
  }

  private async handleReject(
    approval: ApprovalTransaction,
    requisition: JobRequisition,
    comments?: string,
  ): Promise<ApprovalResult> {
    // Update approval
    await this.approvalRepository.update(approval.id, {
      status: ApprovalStatus.REJECTED,
      decision: ApprovalDecision.REJECT,
      comments,
      decidedAt: new Date(),
    });

    // Mark all other pending approvals as skipped
    await this.approvalRepository.update(
      { requisitionId: requisition.id, status: ApprovalStatus.PENDING },
      { status: ApprovalStatus.SKIPPED },
    );

    return {
      isFullyApproved: false,
      nextLevel: 0,
      pendingApprovers: [],
    };
  }

  private async handleSendBack(
    approval: ApprovalTransaction,
    requisition: JobRequisition,
    comments?: string,
  ): Promise<ApprovalResult> {
    await this.approvalRepository.update(approval.id, {
      status: ApprovalStatus.REJECTED,
      decision: ApprovalDecision.SEND_BACK,
      comments,
      decidedAt: new Date(),
    });

    return {
      isFullyApproved: false,
      nextLevel: 0,
      pendingApprovers: [],
    };
  }

  private async handleDelegate(
    approval: ApprovalTransaction,
    requisition: JobRequisition,
    delegateTo: string,
    comments?: string,
  ): Promise<ApprovalResult> {
    // Mark original as delegated
    await this.approvalRepository.update(approval.id, {
      status: ApprovalStatus.DELEGATED,
      decision: ApprovalDecision.DELEGATE,
      comments: `Delegated to: ${delegateTo}. ${comments || ''}`,
      decidedAt: new Date(),
    });

    // Create new approval for delegate
    const delegateApproval = this.approvalRepository.create({
      ...approval,
      id: undefined,
      approverId: delegateTo,
      approverName: delegateTo, // Would fetch from user service
      status: ApprovalStatus.PENDING,
      dueAt: this.calculateDueDate(approval.slaHours || 24),
      delegatedFrom: approval.approverId,
    });

    await this.approvalRepository.save(delegateApproval);

    return {
      isFullyApproved: false,
      nextLevel: requisition.currentApprovalLevel,
      pendingApprovers: [delegateTo],
    };
  }

  private async getPendingApproverNames(requisitionId: string, level: number): Promise<string[]> {
    const pending = await this.approvalRepository.find({
      where: { requisitionId, level, status: ApprovalStatus.PENDING },
    });
    return pending.map(a => a.approverName);
  }

  // ============================================================================
  // SLA MONITORING
  // ============================================================================

  async checkSLABreaches(tenantId: string): Promise<EscalationInfo[]> {
    const now = new Date();

    const overdueApprovals = await this.approvalRepository
      .createQueryBuilder('approval')
      .innerJoin('approval.requisition', 'req')
      .where('approval.tenantId = :tenantId', { tenantId })
      .andWhere('approval.status = :status', { status: ApprovalStatus.PENDING })
      .andWhere('approval.dueAt < :now', { now })
      .andWhere('approval.escalated = :escalated', { escalated: false })
      .getMany();

    const escalations: EscalationInfo[] = [];

    for (const approval of overdueApprovals) {
      // Mark as escalated
      await this.approvalRepository.update(approval.id, {
        escalated: true,
        escalatedAt: now,
        slaStatus: SLAStatus.OVERDUE,
      });

      // Create escalation record for notification
      escalations.push({
        requisitionId: approval.requisitionId,
        approvalId: approval.id,
        approverId: approval.approverId,
        approverName: approval.approverName,
        slaBreachedAt: approval.dueAt,
        escalateTo: approval.escalateToId || 'supervisor', // Would be configured per rule
      });
    }

    return escalations;
  }

  async getSLAStatus(requisitionId: string): Promise<{
    currentLevel: number;
    approvals: Array<{
      level: number;
      approverName: string;
      status: ApprovalStatus;
      slaStatus: SLAStatus;
      dueAt: Date;
      decidedAt?: Date;
    }>;
  }> {
    const requisition = await this.requisitionRepository.findOne({
      where: { id: requisitionId },
    });

    const approvals = await this.approvalRepository.find({
      where: { requisitionId },
      order: { level: 'ASC' },
    });

    const now = new Date();

    return {
      currentLevel: requisition?.currentApprovalLevel || 0,
      approvals: approvals.map(a => ({
        level: a.level,
        approverName: a.approverName,
        status: a.status,
        slaStatus: this.calculateSLAStatus(a, now),
        dueAt: a.dueAt,
        decidedAt: a.decidedAt,
      })),
    };
  }

  private calculateSLAStatus(approval: ApprovalTransaction, now: Date): SLAStatus {
    if (approval.status !== ApprovalStatus.PENDING) {
      return SLAStatus.ON_TRACK;
    }

    if (!approval.dueAt) {
      return SLAStatus.ON_TRACK;
    }

    const timeToDeadline = approval.dueAt.getTime() - now.getTime();
    const totalTime = approval.dueAt.getTime() - (approval.createdAt?.getTime() || now.getTime());

    if (timeToDeadline <= 0) {
      return SLAStatus.OVERDUE;
    }

    if (timeToDeadline / totalTime <= 0.25) {
      return SLAStatus.WARNING;
    }

    return SLAStatus.ON_TRACK;
  }

  // ============================================================================
  // PENDING APPROVALS
  // ============================================================================

  async getPendingApprovalsForUser(
    tenantId: string,
    userId: string,
  ): Promise<Array<{
    requisition: JobRequisition;
    approval: ApprovalTransaction;
    slaStatus: SLAStatus;
  }>> {
    const approvals = await this.approvalRepository
      .createQueryBuilder('approval')
      .innerJoinAndSelect('approval.requisition', 'req')
      .where('approval.tenantId = :tenantId', { tenantId })
      .andWhere('approval.approverId = :userId', { userId })
      .andWhere('approval.status = :status', { status: ApprovalStatus.PENDING })
      .orderBy('approval.dueAt', 'ASC')
      .getMany();

    const now = new Date();

    return approvals.map(a => ({
      requisition: a.requisition,
      approval: a,
      slaStatus: this.calculateSLAStatus(a, now),
    }));
  }
}
