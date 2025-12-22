import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RequisitionAuditLog,
  JobRequisition,
  AuditAction,
} from '../database/entities/requisitions';

@Injectable()
export class RequisitionAuditService {
  constructor(
    @InjectRepository(RequisitionAuditLog)
    private readonly auditRepository: Repository<RequisitionAuditLog>,
  ) {}

  private async log(
    requisition: JobRequisition,
    action: AuditAction,
    userId: string,
    changes?: Record<string, { old: any; new: any }>,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const auditLog = this.auditRepository.create({
      requisitionId: requisition.id,
      tenantId: requisition.tenantId,
      action,
      changedBy: userId,
      changedAt: new Date(),
      changes: changes ? JSON.stringify(changes) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      requisitionNumber: requisition.requisitionNumber,
      requisitionStatus: requisition.status,
    });

    await this.auditRepository.save(auditLog);
  }

  async logCreate(requisition: JobRequisition, userId: string): Promise<void> {
    await this.log(requisition, AuditAction.CREATE, userId, null, {
      jobTitle: requisition.jobTitle,
      department: requisition.departmentId,
      headcount: requisition.headcount,
    });
  }

  async logUpdate(
    requisition: JobRequisition,
    changes: Record<string, any>,
    userId: string,
  ): Promise<void> {
    const changeDetails: Record<string, { old: any; new: any }> = {};

    for (const [key, newValue] of Object.entries(changes)) {
      if (key !== 'updatedBy' && key !== 'version') {
        changeDetails[key] = {
          old: (requisition as any)[key],
          new: newValue,
        };
      }
    }

    await this.log(requisition, AuditAction.UPDATE, userId, changeDetails);
  }

  async logDelete(requisition: JobRequisition, userId: string): Promise<void> {
    await this.log(requisition, AuditAction.DELETE, userId, null, {
      jobTitle: requisition.jobTitle,
      status: requisition.status,
    });
  }

  async logSubmit(requisition: JobRequisition, userId: string): Promise<void> {
    await this.log(requisition, AuditAction.SUBMIT, userId, null, {
      submittedAt: new Date(),
    });
  }

  async logApprove(
    requisition: JobRequisition,
    userId: string,
    comments?: string,
  ): Promise<void> {
    await this.log(requisition, AuditAction.APPROVE, userId, null, {
      level: requisition.currentApprovalLevel,
      comments,
    });
  }

  async logReject(
    requisition: JobRequisition,
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.log(requisition, AuditAction.REJECT, userId, null, {
      level: requisition.currentApprovalLevel,
      reason,
    });
  }

  async logCancel(
    requisition: JobRequisition,
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.log(requisition, AuditAction.CANCEL, userId, null, { reason });
  }

  async logHold(
    requisition: JobRequisition,
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.log(requisition, AuditAction.HOLD, userId, null, {
      previousStatus: requisition.status,
      reason,
    });
  }

  async logResume(requisition: JobRequisition, userId: string): Promise<void> {
    await this.log(requisition, AuditAction.RESUME, userId, null, {
      resumedTo: requisition.previousStatus,
    });
  }

  async logPost(
    requisition: JobRequisition,
    userId: string,
    channels: string[],
  ): Promise<void> {
    await this.log(requisition, AuditAction.POST, userId, null, { channels });
  }

  async logFill(
    requisition: JobRequisition,
    userId: string,
    filledCount: number,
  ): Promise<void> {
    await this.log(requisition, AuditAction.FILL, userId, null, {
      filledCount,
      totalFilled: requisition.headcountFilled + filledCount,
      headcount: requisition.headcount,
    });
  }

  /**
   * Get audit trail for a requisition
   */
  async getAuditTrail(
    tenantId: string,
    requisitionId: string,
  ): Promise<RequisitionAuditLog[]> {
    return this.auditRepository.find({
      where: { requisitionId, tenantId },
      order: { changedAt: 'DESC' },
    });
  }

  /**
   * Get audit logs for a user
   */
  async getAuditLogsForUser(
    tenantId: string,
    userId: string,
    limit: number = 50,
  ): Promise<RequisitionAuditLog[]> {
    return this.auditRepository.find({
      where: { tenantId, changedBy: userId },
      order: { changedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get recent audit activity
   */
  async getRecentActivity(
    tenantId: string,
    limit: number = 20,
  ): Promise<RequisitionAuditLog[]> {
    return this.auditRepository.find({
      where: { tenantId },
      order: { changedAt: 'DESC' },
      take: limit,
    });
  }
}
