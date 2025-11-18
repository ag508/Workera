import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from '../database/entities';

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  previousData?: any;
  newData?: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
    changes?: string[];
  };
  description?: string;
  isSensitive?: boolean;
  sessionId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  async log(entry: AuditLogEntry): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...entry,
        isSensitive: entry.isSensitive || false,
      });

      const saved = await this.auditLogRepository.save(auditLog);

      this.logger.log(
        `Audit: ${entry.action} ${entry.entityType} ${entry.entityId} by ${entry.userEmail || 'system'} in tenant ${entry.tenantId}`
      );

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log a CREATE action
   */
  async logCreate(
    entityType: AuditEntityType,
    entityId: string,
    data: any,
    context: {
      tenantId: string;
      userId?: string;
      userEmail?: string;
      metadata?: any;
    }
  ): Promise<AuditLog> {
    return this.log({
      ...context,
      action: AuditAction.CREATE,
      entityType,
      entityId,
      newData: data,
      description: `Created ${entityType} ${entityId}`,
    });
  }

  /**
   * Log an UPDATE action
   */
  async logUpdate(
    entityType: AuditEntityType,
    entityId: string,
    previousData: any,
    newData: any,
    context: {
      tenantId: string;
      userId?: string;
      userEmail?: string;
      metadata?: any;
    }
  ): Promise<AuditLog> {
    const changes = this.detectChanges(previousData, newData);

    return this.log({
      ...context,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      previousData,
      newData,
      metadata: {
        ...context.metadata,
        changes,
      },
      description: `Updated ${entityType} ${entityId} (${changes.length} changes)`,
    });
  }

  /**
   * Log a DELETE action
   */
  async logDelete(
    entityType: AuditEntityType,
    entityId: string,
    data: any,
    context: {
      tenantId: string;
      userId?: string;
      userEmail?: string;
      metadata?: any;
      reason?: string;
    }
  ): Promise<AuditLog> {
    return this.log({
      ...context,
      action: AuditAction.DELETE,
      entityType,
      entityId,
      previousData: data,
      description: `Deleted ${entityType} ${entityId}${context.reason ? ` (${context.reason})` : ''}`,
      isSensitive: true, // Deletions are always sensitive
    });
  }

  /**
   * Log a READ action (for sensitive data access)
   */
  async logRead(
    entityType: AuditEntityType,
    entityId: string,
    context: {
      tenantId: string;
      userId?: string;
      userEmail?: string;
      metadata?: any;
    }
  ): Promise<AuditLog> {
    return this.log({
      ...context,
      action: AuditAction.READ,
      entityType,
      entityId,
      description: `Accessed ${entityType} ${entityId}`,
    });
  }

  /**
   * Log an EXPORT action (GDPR compliance)
   */
  async logExport(
    entityType: AuditEntityType,
    entityId: string,
    context: {
      tenantId: string;
      userId?: string;
      userEmail?: string;
      metadata?: any;
      reason?: string;
    }
  ): Promise<AuditLog> {
    return this.log({
      ...context,
      action: AuditAction.EXPORT,
      entityType,
      entityId,
      description: `Exported ${entityType} ${entityId}${context.reason ? ` (${context.reason})` : ''}`,
      isSensitive: true,
    });
  }

  /**
   * Get audit logs for an entity
   */
  async getEntityAuditTrail(
    entityType: AuditEntityType,
    entityId: string,
    tenantId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.entityType = :entityType', { entityType })
      .andWhere('audit.entityId = :entityId', { entityId })
      .andWhere('audit.tenantId = :tenantId', { tenantId })
      .orderBy('audit.createdAt', 'DESC');

    if (options?.limit) {
      queryBuilder.take(options.limit);
    }

    if (options?.offset) {
      queryBuilder.skip(options.offset);
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  /**
   * Get audit logs for a tenant
   */
  async getTenantAuditLogs(
    tenantId: string,
    filters?: {
      action?: AuditAction;
      entityType?: AuditEntityType;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.tenantId = :tenantId', { tenantId });

    if (filters?.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');

    if (filters?.limit) {
      queryBuilder.take(filters.limit);
    }

    if (filters?.offset) {
      queryBuilder.skip(filters.offset);
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  /**
   * Get audit statistics for a tenant
   */
  async getAuditStatistics(tenantId: string, days: number = 30): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    sensitiveOperations: number;
    topUsers: Array<{ userEmail: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: { tenantId },
    });

    const recentLogs = logs.filter(log => log.createdAt >= startDate);

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    let sensitiveOperations = 0;

    for (const log of recentLogs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;

      if (log.isSensitive) {
        sensitiveOperations++;
      }

      if (log.userEmail) {
        userCounts[log.userEmail] = (userCounts[log.userEmail] || 0) + 1;
      }
    }

    const topUsers = Object.entries(userCounts)
      .map(([userEmail, count]) => ({ userEmail, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: recentLogs.length,
      byAction,
      byEntityType,
      sensitiveOperations,
      topUsers,
    };
  }

  /**
   * Detect changes between two objects
   */
  private detectChanges(oldData: any, newData: any): string[] {
    const changes: string[] = [];

    if (!oldData || !newData) {
      return changes;
    }

    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push(key);
      }
    }

    return changes;
  }

  /**
   * Purge old audit logs (for data retention compliance)
   */
  async purgeOldLogs(tenantId: string, retentionDays: number = 730): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('isSensitive = false') // Never auto-delete sensitive logs
      .execute();

    this.logger.log(
      `Purged ${result.affected || 0} audit logs older than ${retentionDays} days for tenant ${tenantId}`
    );

    return result.affected || 0;
  }
}
