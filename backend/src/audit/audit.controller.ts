import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditAction, AuditEntityType } from '../database/entities';

export class GetAuditLogsDto {
  tenantId: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class PurgeLogsDto {
  tenantId: string;
  retentionDays?: number;
}

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  @Get('entity/:entityType/:entityId')
  async getEntityAuditTrail(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const result = await this.auditService.getEntityAuditTrail(
      entityType,
      entityId,
      tenantId || '11111111-1111-1111-1111-111111111111',
      {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      }
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post('logs')
  async getTenantAuditLogs(@Body() dto: GetAuditLogsDto) {
    const result = await this.auditService.getTenantAuditLogs(
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      {
        action: dto.action,
        entityType: dto.entityType,
        userId: dto.userId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        limit: dto.limit,
        offset: dto.offset,
      }
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get('statistics')
  async getAuditStatistics(
    @Query('tenantId') tenantId: string,
    @Query('days') days?: string
  ) {
    const stats = await this.auditService.getAuditStatistics(
      tenantId || '11111111-1111-1111-1111-111111111111',
      days ? parseInt(days) : 30
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Post('purge')
  async purgeOldLogs(@Body() dto: PurgeLogsDto) {
    const purged = await this.auditService.purgeOldLogs(
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      dto.retentionDays || 730
    );

    return {
      success: true,
      data: {
        purgedCount: purged,
      },
    };
  }
}
