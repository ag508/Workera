import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';

export interface IntegrationSettings {
  linkedin?: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    organizationId: string;
  };
  workday?: {
    tenantName: string;
    username: string;
    baseUrl: string;
    // Password should ideally be stored encrypted or managed securely.
    // For this implementation, we assume it might be stored here or passed in requests.
    // We will store it here for the UI configuration requirement.
    password?: string;
  };
  naukri?: {
    accountId: string;
    apiKey: string;
  };
  jobBoards?: {
    platform: string;
    apiKey: string;
    accountId?: string;
  }[];
}

@Injectable()
export class IntegrationSettingsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async getSettings(tenantId: string): Promise<IntegrationSettings> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return (tenant.settings?.integrations as IntegrationSettings) || {};
  }

  async updateSettings(tenantId: string, settings: IntegrationSettings): Promise<IntegrationSettings> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Initialize settings if null
    if (!tenant.settings) {
      tenant.settings = {};
    }

    // Update integrations key in settings
    tenant.settings = {
      ...tenant.settings,
      integrations: {
        ...(tenant.settings.integrations || {}),
        ...settings,
      },
    };

    const savedTenant = await this.tenantRepository.save(tenant);
    return savedTenant.settings.integrations;
  }
}
