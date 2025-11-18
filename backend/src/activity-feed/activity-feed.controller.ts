import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ActivityFeedService, CreateActivityDto, ActivityFilters } from './activity-feed.service';
import { ActivityType } from '../database/entities/activity-feed.entity';

@Controller('activity-feed')
export class ActivityFeedController {
  constructor(private readonly activityFeedService: ActivityFeedService) {}

  /**
   * Create a new activity
   * POST /activity-feed
   */
  @Post()
  async createActivity(@Body() dto: CreateActivityDto) {
    return this.activityFeedService.logActivity(dto);
  }

  /**
   * Get activity feed with filters
   * GET /activity-feed?tenantId=xxx&activityTypes=candidate_created,job_posted&limit=50&offset=0
   */
  @Get()
  async getActivities(
    @Query('tenantId') tenantId: string,
    @Query('activityTypes') activityTypes?: string,
    @Query('actorId') actorId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('isImportant') isImportant?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    const filters: ActivityFilters = {
      limit,
      offset,
    };

    if (activityTypes) {
      filters.activityTypes = activityTypes.split(',') as ActivityType[];
    }

    if (actorId) {
      filters.actorId = actorId;
    }

    if (entityType) {
      filters.entityType = entityType;
    }

    if (entityId) {
      filters.entityId = entityId;
    }

    if (isImportant !== undefined) {
      filters.isImportant = isImportant === 'true';
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.activityFeedService.getActivities(tenantId, filters);
  }

  /**
   * Get activity feed statistics
   * GET /activity-feed/stats?tenantId=xxx&startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('stats')
  async getStats(
    @Query('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.activityFeedService.getActivityStats(tenantId, start, end);
  }

  /**
   * Get important activities
   * GET /activity-feed/important?tenantId=xxx&limit=10
   */
  @Get('important')
  async getImportantActivities(
    @Query('tenantId') tenantId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.activityFeedService.getImportantActivities(tenantId, limit);
  }

  /**
   * Search activities by text
   * GET /activity-feed/search?tenantId=xxx&q=candidate&limit=50
   */
  @Get('search')
  async searchActivities(
    @Query('tenantId') tenantId: string,
    @Query('q') searchText: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.activityFeedService.searchActivities(tenantId, searchText, limit);
  }

  /**
   * Get timeline for a specific entity
   * GET /activity-feed/entity/:entityType/:entityId?tenantId=xxx
   */
  @Get('entity/:entityType/:entityId')
  async getEntityTimeline(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.activityFeedService.getEntityTimeline(
      tenantId,
      entityType,
      entityId,
    );
  }

  /**
   * Get activity by ID
   * GET /activity-feed/:id?tenantId=xxx
   */
  @Get(':id')
  async getActivityById(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.activityFeedService.getActivityById(id, tenantId);
  }

  /**
   * Purge old activities
   * DELETE /activity-feed/purge?tenantId=xxx&daysToKeep=365
   */
  @Delete('purge')
  async purgeOldActivities(
    @Query('tenantId') tenantId: string,
    @Query('daysToKeep', new DefaultValuePipe(365), ParseIntPipe)
    daysToKeep?: number,
  ) {
    const deletedCount = await this.activityFeedService.purgeOldActivities(
      tenantId,
      daysToKeep,
    );
    return {
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} old activities`,
    };
  }
}
