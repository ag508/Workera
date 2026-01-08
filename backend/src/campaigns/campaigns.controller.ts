import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignType } from '../database/entities';

export class CreateCampaignDto {
  name: string;
  description?: string;
  type: CampaignType;
  subject: string;
  htmlContent: string;
  textContent: string;
  recipientCriteria?: {
    skills?: string[];
    location?: string;
    applicationStatus?: string[];
    jobIds?: string[];
    candidateIds?: string[];
  };
  scheduledAt?: string;
  tenantId: string;
  createdBy?: string;
}

export class UpdateCampaignDto {
  name?: string;
  description?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  recipientCriteria?: any;
  tenantId: string;
}

export class ScheduleCampaignDto {
  scheduledAt: string;
  tenantId: string;
}

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  @Post()
  async createCampaign(@Body() dto: CreateCampaignDto) {
    const campaign = await this.campaignsService.createCampaign({
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      tenantId: dto.tenantId || '11111111-1111-1111-1111-111111111111',
    });

    return {
      success: true,
      data: campaign,
    };
  }

  @Get()
  async getAllCampaigns(@Query('tenantId') tenantId: string) {
    const campaigns = await this.campaignsService.getAllCampaigns(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    return {
      success: true,
      data: campaigns,
    };
  }

  @Get('stats')
  async getCampaignStats(@Query('tenantId') tenantId: string) {
    const stats = await this.campaignsService.getCampaignStats(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getCampaign(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const campaign = await this.campaignsService.getCampaignById(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    return {
      success: !!campaign,
      data: campaign,
    };
  }

  @Get(':id/recipients')
  async getCampaignRecipients(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const campaign = await this.campaignsService.getCampaignById(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    if (!campaign) {
      return {
        success: false,
        error: 'Campaign not found',
      };
    }

    const recipients = await this.campaignsService.getRecipients(campaign);

    return {
      success: true,
      data: {
        total: recipients.length,
        recipients,
      },
    };
  }

  @Put(':id')
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto
  ) {
    const campaign = await this.campaignsService.updateCampaign(
      id,
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      dto
    );

    return {
      success: !!campaign,
      data: campaign,
    };
  }

  @Post(':id/schedule')
  async scheduleCampaign(
    @Param('id') id: string,
    @Body() dto: ScheduleCampaignDto
  ) {
    const campaign = await this.campaignsService.scheduleCampaign(
      id,
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      new Date(dto.scheduledAt)
    );

    return {
      success: !!campaign,
      data: campaign,
    };
  }

  @Post(':id/send')
  async sendCampaign(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const result = await this.campaignsService.sendCampaign(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/pause')
  async pauseCampaign(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const campaign = await this.campaignsService.pauseCampaign(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    return {
      success: !!campaign,
      data: campaign,
    };
  }

  @Post(':id/cancel')
  async cancelCampaign(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const campaign = await this.campaignsService.cancelCampaign(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );

    return {
      success: !!campaign,
      data: campaign,
    };
  }

  @Delete(':id')
  async deleteCampaign(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const deleted = await this.campaignsService.deleteCampaign(
      id,
      tenantId || 'default-tenant'
    );

    return {
      success: deleted,
    };
  }
}
