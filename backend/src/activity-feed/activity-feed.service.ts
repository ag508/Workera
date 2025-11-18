import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityFeed, ActivityType } from '../database/entities/activity-feed.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface CreateActivityDto {
  tenantId: string;
  activityType: ActivityType;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  description: string;
  metadata?: {
    oldValue?: any;
    newValue?: any;
    changes?: string[];
    additionalInfo?: any;
  };
  ipAddress?: string;
  isImportant?: boolean;
}

export interface ActivityFilters {
  activityTypes?: ActivityType[];
  actorId?: string;
  entityType?: string;
  entityId?: string;
  isImportant?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ActivityFeedService {
  constructor(
    @InjectRepository(ActivityFeed)
    private activityRepository: Repository<ActivityFeed>,
    private realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Log a new activity to the feed
   */
  async logActivity(dto: CreateActivityDto): Promise<ActivityFeed> {
    const activity = this.activityRepository.create(dto);
    const savedActivity = await this.activityRepository.save(activity);

    // Emit real-time notification
    this.realtimeGateway.broadcastToTenant(dto.tenantId, {
      type: 'activity_created',
      data: { activity: savedActivity },
      tenantId: dto.tenantId,
      timestamp: new Date(),
    });

    return savedActivity;
  }

  /**
   * Get activity feed for a tenant with filters
   */
  async getActivities(
    tenantId: string,
    filters: ActivityFilters = {},
  ): Promise<{ activities: ActivityFeed[]; total: number }> {
    const {
      activityTypes,
      actorId,
      entityType,
      entityId,
      isImportant,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.tenantId = :tenantId', { tenantId });

    if (activityTypes && activityTypes.length > 0) {
      query.andWhere('activity.activityType IN (:...activityTypes)', {
        activityTypes,
      });
    }

    if (actorId) {
      query.andWhere('activity.actorId = :actorId', { actorId });
    }

    if (entityType) {
      query.andWhere('activity.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('activity.entityId = :entityId', { entityId });
    }

    if (isImportant !== undefined) {
      query.andWhere('activity.isImportant = :isImportant', { isImportant });
    }

    if (startDate) {
      query.andWhere('activity.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    query.orderBy('activity.createdAt', 'DESC').skip(offset).take(limit);

    const [activities, total] = await query.getManyAndCount();

    return { activities, total };
  }

  /**
   * Get timeline for a specific entity
   */
  async getEntityTimeline(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<ActivityFeed[]> {
    return this.activityRepository.find({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get recent important activities
   */
  async getImportantActivities(
    tenantId: string,
    limit: number = 10,
  ): Promise<ActivityFeed[]> {
    return this.activityRepository.find({
      where: {
        tenantId,
        isImportant: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get activity statistics for a tenant
   */
  async getActivityStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalActivities: number;
    activitiesByType: { type: string; count: number }[];
    activitiesByActor: { actorName: string; actorEmail: string; count: number }[];
    recentTrend: { date: string; count: number }[];
  }> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.tenantId = :tenantId', { tenantId });

    if (startDate) {
      query.andWhere('activity.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    // Total activities
    const totalActivities = await query.getCount();

    // Activities by type
    const activitiesByType = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('activity.tenantId = :tenantId', { tenantId })
      .groupBy('activity.activityType')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Activities by actor
    const activitiesByActor = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.actorName', 'actorName')
      .addSelect('activity.actorEmail', 'actorEmail')
      .addSelect('COUNT(*)', 'count')
      .where('activity.tenantId = :tenantId', { tenantId })
      .andWhere('activity.actorId IS NOT NULL')
      .groupBy('activity.actorName, activity.actorEmail')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Recent trend (last 7 days)
    const recentTrend = await this.activityRepository
      .createQueryBuilder('activity')
      .select("DATE(activity.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('activity.tenantId = :tenantId', { tenantId })
      .andWhere('activity.createdAt >= NOW() - INTERVAL \'7 days\'')
      .groupBy('DATE(activity.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      totalActivities,
      activitiesByType,
      activitiesByActor,
      recentTrend,
    };
  }

  /**
   * Delete old activities (for data retention compliance)
   */
  async purgeOldActivities(
    tenantId: string,
    daysToKeep: number = 365,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.activityRepository
      .createQueryBuilder()
      .delete()
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('isImportant = :isImportant', { isImportant: false })
      .execute();

    return result.affected || 0;
  }

  /**
   * Get activity by ID
   */
  async getActivityById(id: string, tenantId: string): Promise<ActivityFeed> {
    const activity = await this.activityRepository.findOne({
      where: { id, tenantId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  /**
   * Search activities by text
   */
  async searchActivities(
    tenantId: string,
    searchText: string,
    limit: number = 50,
  ): Promise<ActivityFeed[]> {
    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(activity.description ILIKE :searchText OR activity.entityName ILIKE :searchText OR activity.actorName ILIKE :searchText)',
        { searchText: `%${searchText}%` },
      )
      .orderBy('activity.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
