import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';

export interface LinkedInSettings {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  organizationId?: string;
  expiresAt?: string;
  connected?: boolean;
}

export interface IndeedSettings {
  apiKey?: string;
  employerId?: string;
  sponsoredKey?: string;
  connected?: boolean;
}

export interface NaukriSettings {
  accountId?: string;
  apiKey?: string;
  apiSecret?: string;
  connected?: boolean;
}

export interface WorkdaySettings {
  tenantName?: string;
  username?: string;
  password?: string;
  baseUrl?: string;
  connected?: boolean;
}

export interface GoogleCalendarSettings {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  calendarId?: string;
  connected?: boolean;
}

export interface OutlookCalendarSettings {
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  connected?: boolean;
}

export interface ZoomSettings {
  clientId?: string;
  clientSecret?: string;
  accountId?: string;
  accessToken?: string;
  connected?: boolean;
}

export interface TeamsSettings {
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  accessToken?: string;
  connected?: boolean;
}

export interface WebexSettings {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  connected?: boolean;
}

export interface GlassdoorSettings {
  partnerId?: string;
  partnerKey?: string;
  connected?: boolean;
}

export interface MonsterSettings {
  accountId?: string;
  apiKey?: string;
  serviceKey?: string;
  connected?: boolean;
}

export interface ZipRecruiterSettings {
  apiKey?: string;
  accountId?: string;
  connected?: boolean;
}

export interface SMTPSettings {
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
  connected?: boolean;
}

export interface SendGridSettings {
  apiKey?: string;
  fromName?: string;
  fromEmail?: string;
  sandboxMode?: boolean;
  connected?: boolean;
}

export interface EmailSettings {
  provider?: 'smtp' | 'sendgrid';
  smtp?: SMTPSettings;
  sendgrid?: SendGridSettings;
}

export interface JobBoardSettings {
  platform: string;
  apiKey?: string;
  accountId?: string;
  connected?: boolean;
}

export interface IntegrationSettings {
  // Job Boards
  linkedin?: LinkedInSettings;
  indeed?: IndeedSettings;
  naukri?: NaukriSettings;
  glassdoor?: GlassdoorSettings;
  monster?: MonsterSettings;
  ziprecruiter?: ZipRecruiterSettings;

  // Enterprise Integrations
  workday?: WorkdaySettings;

  // Video Conferencing
  zoom?: ZoomSettings;
  teams?: TeamsSettings;
  webex?: WebexSettings;

  // Calendar Integrations
  googleCalendar?: GoogleCalendarSettings;
  outlookCalendar?: OutlookCalendarSettings;

  // Email Services
  email?: EmailSettings;

  // Generic Job Boards (legacy)
  jobBoards?: JobBoardSettings[];
}

export interface IntegrationStatus {
  provider: string;
  name: string;
  category: 'job-board' | 'calendar' | 'video' | 'email' | 'enterprise';
  connected: boolean;
  lastSync?: Date;
  error?: string;
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

  async getIntegrationStatus(tenantId: string): Promise<IntegrationStatus[]> {
    const settings = await this.getSettings(tenantId);
    const statuses: IntegrationStatus[] = [];

    // Job Boards
    statuses.push({
      provider: 'linkedin',
      name: 'LinkedIn Jobs',
      category: 'job-board',
      connected: !!(settings.linkedin?.accessToken || settings.linkedin?.clientId),
    });

    statuses.push({
      provider: 'indeed',
      name: 'Indeed',
      category: 'job-board',
      connected: !!settings.indeed?.apiKey,
    });

    statuses.push({
      provider: 'naukri',
      name: 'Naukri.com',
      category: 'job-board',
      connected: !!settings.naukri?.apiKey,
    });

    statuses.push({
      provider: 'glassdoor',
      name: 'Glassdoor',
      category: 'job-board',
      connected: !!settings.glassdoor?.partnerId,
    });

    statuses.push({
      provider: 'monster',
      name: 'Monster',
      category: 'job-board',
      connected: !!settings.monster?.apiKey,
    });

    statuses.push({
      provider: 'ziprecruiter',
      name: 'ZipRecruiter',
      category: 'job-board',
      connected: !!settings.ziprecruiter?.apiKey,
    });

    // Enterprise Integrations
    statuses.push({
      provider: 'workday',
      name: 'Workday',
      category: 'enterprise',
      connected: !!(settings.workday?.username && settings.workday?.tenantName),
    });

    // Calendar Integrations
    statuses.push({
      provider: 'googleCalendar',
      name: 'Google Calendar',
      category: 'calendar',
      connected: !!(settings.googleCalendar?.accessToken || settings.googleCalendar?.clientId),
    });

    statuses.push({
      provider: 'outlookCalendar',
      name: 'Outlook Calendar',
      category: 'calendar',
      connected: !!settings.outlookCalendar?.clientId,
    });

    // Video Conferencing
    statuses.push({
      provider: 'zoom',
      name: 'Zoom',
      category: 'video',
      connected: !!settings.zoom?.clientId,
    });

    statuses.push({
      provider: 'teams',
      name: 'Microsoft Teams',
      category: 'video',
      connected: !!settings.teams?.clientId,
    });

    statuses.push({
      provider: 'webex',
      name: 'Cisco Webex',
      category: 'video',
      connected: !!settings.webex?.clientId,
    });

    // Email Services
    statuses.push({
      provider: 'email',
      name: settings.email?.provider === 'sendgrid' ? 'SendGrid' : 'SMTP',
      category: 'email',
      connected: !!(
        settings.email?.sendgrid?.apiKey ||
        (settings.email?.smtp?.host && settings.email?.smtp?.username)
      ),
    });

    return statuses;
  }

  async updateProviderSettings(
    tenantId: string,
    provider: string,
    providerSettings: any,
  ): Promise<IntegrationSettings> {
    const settings = await this.getSettings(tenantId);
    settings[provider as keyof IntegrationSettings] = providerSettings;
    return this.updateSettings(tenantId, settings);
  }

  async disconnectProvider(tenantId: string, provider: string): Promise<IntegrationSettings> {
    const settings = await this.getSettings(tenantId);
    const currentSettings = settings[provider as keyof IntegrationSettings] as any;

    if (currentSettings) {
      // Keep client credentials but remove tokens
      const { accessToken, refreshToken, expiresAt, connected, ...credentials } = currentSettings;
      settings[provider as keyof IntegrationSettings] = credentials as any;
    }

    return this.updateSettings(tenantId, settings);
  }

  async testConnection(
    tenantId: string,
    provider: string,
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettings(tenantId);
    const providerSettings = settings[provider as keyof IntegrationSettings];

    if (!providerSettings) {
      return { success: false, message: `${provider} is not configured` };
    }

    // This would be called from the controller which would use the appropriate service
    // to test the connection. For now, we just check if required fields are present.
    switch (provider) {
      case 'linkedin':
        const linkedIn = providerSettings as LinkedInSettings;
        if (!linkedIn.clientId || !linkedIn.clientSecret) {
          return { success: false, message: 'LinkedIn Client ID and Secret are required' };
        }
        if (!linkedIn.accessToken) {
          return { success: false, message: 'LinkedIn is not authenticated. Please connect your account.' };
        }
        return { success: true, message: 'LinkedIn connection is configured' };

      case 'indeed':
        const indeed = providerSettings as IndeedSettings;
        if (!indeed.apiKey || !indeed.employerId) {
          return { success: false, message: 'Indeed API Key and Employer ID are required' };
        }
        return { success: true, message: 'Indeed connection is configured' };

      case 'naukri':
        const naukri = providerSettings as NaukriSettings;
        if (!naukri.accountId || !naukri.apiKey) {
          return { success: false, message: 'Naukri Account ID and API Key are required' };
        }
        return { success: true, message: 'Naukri connection is configured' };

      case 'workday':
        const workday = providerSettings as WorkdaySettings;
        if (!workday.tenantName || !workday.username || !workday.baseUrl) {
          return { success: false, message: 'Workday Tenant Name, Username, and Base URL are required' };
        }
        return { success: true, message: 'Workday connection is configured' };

      case 'googleCalendar':
        const googleCal = providerSettings as GoogleCalendarSettings;
        if (!googleCal.clientId || !googleCal.clientSecret) {
          return { success: false, message: 'Google Calendar Client ID and Secret are required' };
        }
        if (!googleCal.accessToken) {
          return { success: false, message: 'Google Calendar is not authenticated. Please connect your account.' };
        }
        return { success: true, message: 'Google Calendar connection is configured' };

      case 'email':
        const email = providerSettings as EmailSettings;
        if (email.provider === 'sendgrid') {
          if (!email.sendgrid?.apiKey) {
            return { success: false, message: 'SendGrid API Key is required' };
          }
        } else if (email.provider === 'smtp') {
          if (!email.smtp?.host || !email.smtp?.username) {
            return { success: false, message: 'SMTP Host and Username are required' };
          }
        } else {
          return { success: false, message: 'Email provider not configured' };
        }
        return { success: true, message: 'Email service is configured' };

      default:
        return { success: false, message: `Unknown provider: ${provider}` };
    }
  }
}
