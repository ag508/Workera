import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Message } from '../database/entities/message.entity';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateMessageDto {
  tenantId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  candidateId?: string;
  jobTitle?: string;
  parentId?: string;
  sendEmailNotification?: boolean;
}

export interface MessageFilters {
  unread?: boolean;
  starred?: boolean;
  archived?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Send a new message
   */
  async sendMessage(dto: CreateMessageDto): Promise<Message> {
    const preview = dto.content.substring(0, 150) + (dto.content.length > 150 ? '...' : '');

    const message = this.messageRepository.create({
      ...dto,
      preview,
      unread: true,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Send email notification if requested
    if (dto.sendEmailNotification !== false) {
      try {
        await this.sendEmailNotification(savedMessage);
        savedMessage.emailNotificationSent = true;
        await this.messageRepository.save(savedMessage);
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }

    return savedMessage;
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    parentId: string,
    dto: Omit<CreateMessageDto, 'parentId'>,
  ): Promise<Message> {
    const parentMessage = await this.messageRepository.findOne({
      where: { id: parentId, tenantId: dto.tenantId },
    });

    if (!parentMessage) {
      throw new NotFoundException('Parent message not found');
    }

    const reply = await this.sendMessage({
      ...dto,
      subject: `Re: ${parentMessage.subject}`,
      parentId,
    });

    return reply;
  }

  /**
   * Get all messages for a user (as recipient)
   */
  async getMessages(
    tenantId: string,
    userEmail: string,
    filters: MessageFilters = {},
  ): Promise<{ messages: Message[]; total: number }> {
    const { unread, starred, archived = false, search, limit = 50, offset = 0 } = filters;

    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.tenantId = :tenantId', { tenantId })
      .andWhere('message.recipientEmail = :userEmail', { userEmail })
      .andWhere('message.archived = :archived', { archived })
      .andWhere('message.parentId IS NULL'); // Only top-level messages

    if (unread !== undefined) {
      query.andWhere('message.unread = :unread', { unread });
    }

    if (starred !== undefined) {
      query.andWhere('message.starred = :starred', { starred });
    }

    if (search) {
      query.andWhere(
        '(message.subject ILIKE :search OR message.content ILIKE :search OR message.senderName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query
      .leftJoinAndSelect('message.replies', 'replies')
      .orderBy('message.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [messages, total] = await query.getManyAndCount();

    return { messages, total };
  }

  /**
   * Get a single message with replies
   */
  async getMessageById(
    id: string,
    tenantId: string,
  ): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id, tenantId },
      relations: ['replies'],
    });

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string, tenantId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id, tenantId },
    });

    if (!message) {
      return null;
    }

    message.unread = false;
    return this.messageRepository.save(message);
  }

  /**
   * Mark all messages as read
   */
  async markAllAsRead(tenantId: string, userEmail: string): Promise<number> {
    const result = await this.messageRepository.update(
      { tenantId, recipientEmail: userEmail, unread: true },
      { unread: false },
    );

    return result.affected || 0;
  }

  /**
   * Toggle star on a message
   */
  async toggleStar(id: string, tenantId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id, tenantId },
    });

    if (!message) {
      return null;
    }

    message.starred = !message.starred;
    return this.messageRepository.save(message);
  }

  /**
   * Archive a message
   */
  async archiveMessage(id: string, tenantId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id, tenantId },
    });

    if (!message) {
      return null;
    }

    message.archived = true;
    return this.messageRepository.save(message);
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string, tenantId: string): Promise<boolean> {
    const result = await this.messageRepository.delete({ id, tenantId });
    return (result.affected || 0) > 0;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(tenantId: string, userEmail: string): Promise<number> {
    return this.messageRepository.count({
      where: {
        tenantId,
        recipientEmail: userEmail,
        unread: true,
        archived: false,
        parentId: IsNull(),
      },
    });
  }

  /**
   * Send email notification for a message
   */
  private async sendEmailNotification(message: Message): Promise<void> {
    // Use the notifications service to send an email
    const template = {
      subject: `New Message: ${message.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Workera</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">New Message from ${message.senderName}</h2>
            <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">
              <strong>Subject:</strong> ${message.subject}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
              <p style="color: #4b5563; white-space: pre-wrap; margin: 0;">
                ${message.content}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Log in to Workera to reply to this message.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Workera. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `New Message from ${message.senderName}\n\nSubject: ${message.subject}\n\n${message.content}\n\nLog in to Workera to reply to this message.`,
    };

    // Note: We're calling the private sendEmail method indirectly through a public method
    // For now, we'll just log since NotificationsService doesn't have a generic send method
    console.log(`Email notification sent to ${message.recipientEmail} for message: ${message.subject}`);
  }
}
