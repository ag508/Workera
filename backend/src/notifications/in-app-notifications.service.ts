import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType } from '../database/entities/notification.entity';

export interface CreateNotificationDto {
  tenantId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  description: string;
  link?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class InAppNotificationsService {
  private readonly logger = new Logger(InAppNotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Create a new notification
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(dto);
    const saved = await this.notificationRepository.save(notification);
    this.logger.log(`Created notification: ${saved.id} - ${saved.title}`);
    return saved;
  }

  /**
   * Get all notifications for a tenant/user
   */
  async getNotifications(
    tenantId: string,
    userId?: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.tenantId = :tenantId', { tenantId });

    if (userId) {
      queryBuilder.andWhere('(notification.userId = :userId OR notification.userId IS NULL)', { userId });
    }

    if (options?.unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    queryBuilder.orderBy('notification.createdAt', 'DESC');

    const total = await queryBuilder.getCount();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: userId
        ? [
            { tenantId, userId, isRead: false },
            { tenantId, userId: undefined, isRead: false },
          ]
        : { tenantId, isRead: false },
    });

    if (options?.limit) {
      queryBuilder.take(options.limit);
    }
    if (options?.offset) {
      queryBuilder.skip(options.offset);
    }

    const notifications = await queryBuilder.getMany();

    return { notifications, total, unreadCount };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, tenantId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId },
    });

    if (!notification) return null;

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(tenantId: string, userId?: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('isRead = :isRead', { isRead: false })
      .andWhere(userId ? '(userId = :userId OR userId IS NULL)' : '1=1', { userId })
      .execute();

    return result.affected || 0;
  }

  /**
   * Delete a notification
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({ id, tenantId });
    return (result.affected || 0) > 0;
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(tenantId: string, daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      tenantId,
      createdAt: LessThan(cutoffDate),
      isRead: true,
    });

    return result.affected || 0;
  }

  /**
   * Create system notifications for common events
   */
  async notifyNewApplication(
    tenantId: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string,
  ): Promise<Notification> {
    return this.create({
      tenantId,
      type: NotificationType.APPLICATION,
      title: 'New Application Received',
      description: `${candidateName} applied for ${jobTitle} position.`,
      link: `/dashboard/applications/${applicationId}`,
      metadata: { candidateName, jobTitle, applicationId },
    });
  }

  async notifyInterviewScheduled(
    tenantId: string,
    candidateName: string,
    jobTitle: string,
    interviewDate: Date,
    interviewId: string,
  ): Promise<Notification> {
    return this.create({
      tenantId,
      type: NotificationType.INTERVIEW,
      title: 'Interview Scheduled',
      description: `Interview with ${candidateName} for ${jobTitle} scheduled for ${interviewDate.toLocaleString()}.`,
      link: `/dashboard/interviews`,
      metadata: { candidateName, jobTitle, interviewDate, interviewId },
    });
  }

  async notifyInterviewReminder(
    tenantId: string,
    candidateName: string,
    jobTitle: string,
    minutesUntil: number,
  ): Promise<Notification> {
    return this.create({
      tenantId,
      type: NotificationType.INTERVIEW,
      title: 'Interview Reminder',
      description: `Interview with ${candidateName} for ${jobTitle} starts in ${minutesUntil} minutes.`,
      link: `/dashboard/interviews`,
      metadata: { candidateName, jobTitle, minutesUntil },
    });
  }

  async notifyResumesParsed(
    tenantId: string,
    count: number,
  ): Promise<Notification> {
    return this.create({
      tenantId,
      type: NotificationType.RESUME,
      title: 'Resume Analysis Complete',
      description: `AI has finished parsing ${count} new resume${count > 1 ? 's' : ''}.`,
      link: `/dashboard/candidates`,
      metadata: { count },
    });
  }
}
