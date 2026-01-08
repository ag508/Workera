import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

export class SendMessageDto {
  to: string;
  toName?: string;
  subject: string;
  content: string;
  candidateId?: string;
  jobTitle?: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  sendEmailNotification?: boolean;
  tenantId: string;
}

export class ReplyMessageDto {
  content: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  sendEmailNotification?: boolean;
  tenantId: string;
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Get()
  async getMessages(
    @Query('tenantId') tenantId: string,
    @Query('userEmail') userEmail: string,
    @Query('unread') unread?: string,
    @Query('starred') starred?: string,
    @Query('archived') archived?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters = {
      unread: unread ? unread === 'true' : undefined,
      starred: starred ? starred === 'true' : undefined,
      archived: archived ? archived === 'true' : false,
      search,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const result = await this.messagesService.getMessages(
      tenantId || '11111111-1111-1111-1111-111111111111',
      userEmail || 'recruiter@workera.ai',
      filters,
    );

    return {
      success: true,
      data: result.messages,
      total: result.total,
    };
  }

  @Get('unread-count')
  async getUnreadCount(
    @Query('tenantId') tenantId: string,
    @Query('userEmail') userEmail: string,
  ) {
    const count = await this.messagesService.getUnreadCount(
      tenantId || '11111111-1111-1111-1111-111111111111',
      userEmail || 'recruiter@workera.ai',
    );

    return {
      success: true,
      count,
    };
  }

  @Get(':id')
  async getMessage(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const message = await this.messagesService.getMessageById(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111',
    );

    return {
      success: !!message,
      data: message,
    };
  }

  @Post()
  async sendMessage(@Body() dto: SendMessageDto) {
    const message = await this.messagesService.sendMessage({
      tenantId: dto.tenantId || '11111111-1111-1111-1111-111111111111',
      senderName: dto.senderName,
      senderEmail: dto.senderEmail,
      senderAvatar: dto.senderAvatar,
      recipientEmail: dto.to,
      recipientName: dto.toName,
      subject: dto.subject,
      content: dto.content,
      candidateId: dto.candidateId,
      jobTitle: dto.jobTitle,
      sendEmailNotification: dto.sendEmailNotification,
    });

    return {
      success: true,
      data: message,
      message: 'Message sent successfully',
    };
  }

  @Post(':id/reply')
  async replyToMessage(
    @Param('id') id: string,
    @Body() dto: ReplyMessageDto,
  ) {
    // Get parent message to get recipient info
    const parent = await this.messagesService.getMessageById(
      id,
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
    );

    if (!parent) {
      return {
        success: false,
        message: 'Parent message not found',
      };
    }

    const reply = await this.messagesService.replyToMessage(id, {
      tenantId: dto.tenantId || '11111111-1111-1111-1111-111111111111',
      senderName: dto.senderName,
      senderEmail: dto.senderEmail,
      senderAvatar: dto.senderAvatar,
      recipientEmail: parent.senderEmail,
      recipientName: parent.senderName,
      subject: parent.subject,
      content: dto.content,
      candidateId: parent.candidateId,
      jobTitle: parent.jobTitle,
      sendEmailNotification: dto.sendEmailNotification,
    });

    return {
      success: true,
      data: reply,
      message: 'Reply sent successfully',
    };
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const message = await this.messagesService.markAsRead(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111',
    );

    return {
      success: !!message,
      data: message,
    };
  }

  @Put('mark-all-read')
  async markAllAsRead(
    @Query('tenantId') tenantId: string,
    @Query('userEmail') userEmail: string,
  ) {
    const count = await this.messagesService.markAllAsRead(
      tenantId || '11111111-1111-1111-1111-111111111111',
      userEmail || 'recruiter@workera.ai',
    );

    return {
      success: true,
      count,
      message: `${count} messages marked as read`,
    };
  }

  @Put(':id/star')
  async toggleStar(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const message = await this.messagesService.toggleStar(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111',
    );

    return {
      success: !!message,
      data: message,
    };
  }

  @Put(':id/archive')
  async archiveMessage(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const message = await this.messagesService.archiveMessage(
      id,
      tenantId || 'default-tenant',
    );

    return {
      success: !!message,
      data: message,
      message: 'Message archived',
    };
  }

  @Delete(':id')
  async deleteMessage(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    const result = await this.messagesService.deleteMessage(
      id,
      tenantId || 'default-tenant',
    );

    return {
      success: result,
      message: result ? 'Message deleted' : 'Failed to delete message',
    };
  }
}
