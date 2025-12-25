import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { InAppNotificationsService, CreateNotificationDto } from './in-app-notifications.service';
import { NotificationType } from '../database/entities/notification.entity';

@Controller('notifications')
export class InAppNotificationsController {
  constructor(private readonly notificationsService: InAppNotificationsService) {}

  @Get()
  async getNotifications(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.notificationsService.getNotifications(
      tenantId || 'default-tenant',
      userId,
      {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      },
    );

    return {
      success: true,
      data: result.notifications,
      total: result.total,
      unreadCount: result.unreadCount,
    };
  }

  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationsService.create({
      ...dto,
      tenantId: dto.tenantId || 'default-tenant',
    });

    return {
      success: true,
      data: notification,
    };
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const notification = await this.notificationsService.markAsRead(
      id,
      tenantId || 'default-tenant',
    );

    return {
      success: !!notification,
      data: notification,
    };
  }

  @Put('mark-all-read')
  async markAllAsRead(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId?: string,
  ) {
    const count = await this.notificationsService.markAllAsRead(
      tenantId || 'default-tenant',
      userId,
    );

    return {
      success: true,
      count,
      message: `${count} notifications marked as read`,
    };
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const result = await this.notificationsService.delete(
      id,
      tenantId || 'default-tenant',
    );

    return {
      success: result,
      message: result ? 'Notification deleted' : 'Failed to delete notification',
    };
  }

  @Delete('cleanup/old')
  async cleanupOldNotifications(
    @Query('tenantId') tenantId: string,
    @Query('daysOld') daysOld?: string,
  ) {
    const count = await this.notificationsService.deleteOldNotifications(
      tenantId || 'default-tenant',
      daysOld ? parseInt(daysOld, 10) : 30,
    );

    return {
      success: true,
      count,
      message: `${count} old notifications deleted`,
    };
  }
}
