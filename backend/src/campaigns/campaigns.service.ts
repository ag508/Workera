import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailCampaign, CampaignStatus, CampaignType, Candidate } from '../database/entities';
import { NotificationsService } from '../notifications/notifications.service';

export interface CampaignRecipient {
  candidateId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SendResult {
  campaignId: string;
  totalRecipients: number;
  sent: number;
  failed: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
}

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);
  private readonly RATE_LIMIT_PER_SECOND = 10; // 10 emails per second
  private readonly BATCH_SIZE = 50; // Process 50 at a time

  constructor(
    @InjectRepository(EmailCampaign)
    private campaignRepository: Repository<EmailCampaign>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new campaign
   */
  async createCampaign(data: {
    name: string;
    description?: string;
    type: CampaignType;
    subject: string;
    htmlContent: string;
    textContent: string;
    recipientCriteria?: any;
    scheduledAt?: Date;
    tenantId: string;
    createdBy?: string;
  }): Promise<EmailCampaign> {
    const campaign = this.campaignRepository.create({
      ...data,
      status: CampaignStatus.DRAFT,
      totalRecipients: 0,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      failedCount: 0,
    });

    const saved = await this.campaignRepository.save(campaign);
    this.logger.log(`Created campaign ${saved.id} for tenant ${data.tenantId}`);

    return saved;
  }

  /**
   * Get all campaigns for a tenant
   */
  async getAllCampaigns(tenantId: string): Promise<EmailCampaign[]> {
    return await this.campaignRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: string, tenantId: string): Promise<EmailCampaign | null> {
    return await this.campaignRepository.findOne({
      where: { id, tenantId },
    });
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    id: string,
    tenantId: string,
    updates: Partial<EmailCampaign>
  ): Promise<EmailCampaign | null> {
    const campaign = await this.getCampaignById(id, tenantId);
    if (!campaign) {
      return null;
    }

    // Don't allow updates to sent campaigns
    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Cannot update sent campaign');
    }

    Object.assign(campaign, updates);
    return await this.campaignRepository.save(campaign);
  }

  /**
   * Get recipients based on campaign criteria
   */
  async getRecipients(campaign: EmailCampaign): Promise<CampaignRecipient[]> {
    const criteria = campaign.recipientCriteria || {};
    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.tenantId = :tenantId', { tenantId: campaign.tenantId });

    // Filter by candidate IDs
    if (criteria.candidateIds && criteria.candidateIds.length > 0) {
      queryBuilder.andWhere('candidate.id IN (:...ids)', { ids: criteria.candidateIds });
    }

    // Filter by skills
    if (criteria.skills && criteria.skills.length > 0) {
      queryBuilder.andWhere('candidate.skills && :skills', { skills: criteria.skills });
    }

    // Filter by location
    if (criteria.location) {
      queryBuilder.andWhere('candidate.location ILIKE :location', {
        location: `%${criteria.location}%`,
      });
    }

    // Filter by application status
    if (criteria.applicationStatus && criteria.applicationStatus.length > 0) {
      queryBuilder
        .leftJoin('candidate.applications', 'application')
        .andWhere('application.status IN (:...statuses)', {
          statuses: criteria.applicationStatus,
        });
    }

    // Filter by job IDs
    if (criteria.jobIds && criteria.jobIds.length > 0) {
      queryBuilder
        .leftJoin('candidate.applications', 'app')
        .andWhere('app.jobId IN (:...jobIds)', { jobIds: criteria.jobIds });
    }

    const candidates = await queryBuilder.getMany();

    return candidates.map(c => ({
      candidateId: c.id,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
    }));
  }

  /**
   * Schedule campaign for sending
   */
  async scheduleCampaign(
    id: string,
    tenantId: string,
    scheduledAt: Date
  ): Promise<EmailCampaign | null> {
    const campaign = await this.getCampaignById(id, tenantId);
    if (!campaign) {
      return null;
    }

    // Get recipient count
    const recipients = await this.getRecipients(campaign);

    campaign.status = CampaignStatus.SCHEDULED;
    campaign.scheduledAt = scheduledAt;
    campaign.totalRecipients = recipients.length;

    const updated = await this.campaignRepository.save(campaign);
    this.logger.log(`Scheduled campaign ${id} for ${scheduledAt} with ${recipients.length} recipients`);

    return updated;
  }

  /**
   * Send campaign immediately with rate limiting
   */
  async sendCampaign(id: string, tenantId: string): Promise<SendResult> {
    const campaign = await this.getCampaignById(id, tenantId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Update status to sending
    campaign.status = CampaignStatus.SENDING;
    await this.campaignRepository.save(campaign);

    const startedAt = new Date();
    const recipients = await this.getRecipients(campaign);
    const errors: string[] = [];
    let sent = 0;
    let failed = 0;

    this.logger.log(`Starting to send campaign ${id} to ${recipients.length} recipients`);

    // Process in batches with rate limiting
    for (let i = 0; i < recipients.length; i += this.BATCH_SIZE) {
      const batch = recipients.slice(i, i + this.BATCH_SIZE);

      for (const recipient of batch) {
        try {
          // Personalize content
          const personalizedHtml = this.personalizeContent(
            campaign.htmlContent,
            recipient
          );
          const personalizedText = this.personalizeContent(
            campaign.textContent,
            recipient
          );

          // Send email (using notification service)
          // In production, this would use actual email service
          await this.notificationsService.sendBulkNotification(
            [recipient.email],
            () => ({
              subject: campaign.subject,
              html: personalizedHtml,
              text: personalizedText,
            })
          );

          sent++;

          // Rate limiting: wait to avoid hitting rate limits
          await this.sleep(1000 / this.RATE_LIMIT_PER_SECOND);
        } catch (error) {
          failed++;
          errors.push(`Failed to send to ${recipient.email}: ${error.message}`);
          this.logger.error(`Failed to send to ${recipient.email}:`, error);
        }
      }

      // Log progress
      this.logger.log(`Campaign ${id}: Sent ${sent}/${recipients.length}`);
    }

    const completedAt = new Date();

    // Update campaign status
    campaign.status = CampaignStatus.SENT;
    campaign.sentCount = sent;
    campaign.failedCount = failed;
    campaign.sentAt = completedAt;
    await this.campaignRepository.save(campaign);

    this.logger.log(
      `Completed campaign ${id}: ${sent} sent, ${failed} failed in ${
        (completedAt.getTime() - startedAt.getTime()) / 1000
      }s`
    );

    return {
      campaignId: id,
      totalRecipients: recipients.length,
      sent,
      failed,
      errors,
      startedAt,
      completedAt,
    };
  }

  /**
   * Pause a sending campaign
   */
  async pauseCampaign(id: string, tenantId: string): Promise<EmailCampaign | null> {
    const campaign = await this.getCampaignById(id, tenantId);
    if (!campaign) {
      return null;
    }

    if (campaign.status !== CampaignStatus.SENDING) {
      throw new BadRequestException('Can only pause sending campaigns');
    }

    campaign.status = CampaignStatus.PAUSED;
    return await this.campaignRepository.save(campaign);
  }

  /**
   * Cancel a campaign
   */
  async cancelCampaign(id: string, tenantId: string): Promise<EmailCampaign | null> {
    const campaign = await this.getCampaignById(id, tenantId);
    if (!campaign) {
      return null;
    }

    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Cannot cancel sent campaign');
    }

    campaign.status = CampaignStatus.CANCELLED;
    return await this.campaignRepository.save(campaign);
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(tenantId: string): Promise<{
    totalCampaigns: number;
    byCampaignStatus: Record<string, number>;
    totalSent: number;
    totalFailed: number;
    averageOpenRate: number;
    averageClickRate: number;
  }> {
    const campaigns = await this.getAllCampaigns(tenantId);

    const stats = {
      totalCampaigns: campaigns.length,
      byCampaignStatus: {} as Record<string, number>,
      totalSent: 0,
      totalFailed: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
    };

    let totalOpens = 0;
    let totalClicks = 0;

    for (const campaign of campaigns) {
      stats.byCampaignStatus[campaign.status] =
        (stats.byCampaignStatus[campaign.status] || 0) + 1;
      stats.totalSent += campaign.sentCount;
      stats.totalFailed += campaign.failedCount;
      totalOpens += campaign.openedCount;
      totalClicks += campaign.clickedCount;
    }

    if (stats.totalSent > 0) {
      stats.averageOpenRate = (totalOpens / stats.totalSent) * 100;
      stats.averageClickRate = (totalClicks / stats.totalSent) * 100;
    }

    return stats;
  }

  /**
   * Personalize content with candidate data
   */
  private personalizeContent(content: string, recipient: CampaignRecipient): string {
    return content
      .replace(/{{firstName}}/g, recipient.firstName)
      .replace(/{{lastName}}/g, recipient.lastName)
      .replace(/{{email}}/g, recipient.email);
  }

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string, tenantId: string): Promise<boolean> {
    const campaign = await this.getCampaignById(id, tenantId);
    if (!campaign) {
      return false;
    }

    if (campaign.status === CampaignStatus.SENDING) {
      throw new BadRequestException('Cannot delete campaign that is currently sending');
    }

    await this.campaignRepository.delete(id);
    this.logger.log(`Deleted campaign ${id}`);
    return true;
  }
}
