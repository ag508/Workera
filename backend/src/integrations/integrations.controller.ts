import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { DatabaseImportService, DatabaseConfig, ImportMapping } from './database-import.service';
import { LinkedInService, LinkedInConfig } from './linkedin.service';
import { WorkdayService, WorkdayConfig } from './workday.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly databaseImportService: DatabaseImportService,
    private readonly linkedInService: LinkedInService,
    private readonly workdayService: WorkdayService,
  ) {}

  /**
   * Import candidates from external database
   * POST /integrations/database/import
   */
  @Post('database/import')
  async importFromDatabase(
    @Body()
    body: {
      config: DatabaseConfig;
      mapping: ImportMapping;
      tenantId: string;
      options?: {
        parseResumes?: boolean;
        limit?: number;
        offset?: number;
        whereClause?: string;
      };
    },
  ) {
    if (body.config.type === 'mongodb') {
      return this.databaseImportService.importFromMongoDB(
        body.config,
        body.mapping,
        body.tenantId,
        body.options,
      );
    } else {
      return this.databaseImportService.importFromSQLDatabase(
        body.config,
        body.mapping,
        body.tenantId,
        body.options,
      );
    }
  }

  /**
   * Import jobs from LinkedIn
   * POST /integrations/linkedin/jobs/import
   */
  @Post('linkedin/jobs/import')
  async importLinkedInJobs(
    @Body()
    body: {
      config: LinkedInConfig;
      tenantId: string;
      options?: {
        limit?: number;
        status?: 'open' | 'closed' | 'all';
      };
    },
  ) {
    return this.linkedInService.importJobsFromLinkedIn(
      body.config,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Search candidates on LinkedIn
   * POST /integrations/linkedin/candidates/search
   */
  @Post('linkedin/candidates/search')
  async searchLinkedInCandidates(
    @Body()
    body: {
      config: LinkedInConfig;
      searchQuery: {
        keywords?: string;
        location?: string;
        skills?: string[];
        experienceLevel?: string;
        currentCompany?: string;
        schools?: string[];
      };
      tenantId: string;
      limit?: number;
    },
  ) {
    return this.linkedInService.searchCandidatesOnLinkedIn(
      body.config,
      body.searchQuery,
      body.tenantId,
      body.limit || 25,
    );
  }

  /**
   * Import candidates from LinkedIn
   * POST /integrations/linkedin/candidates/import
   */
  @Post('linkedin/candidates/import')
  async importLinkedInCandidates(
    @Body()
    body: {
      config: LinkedInConfig;
      searchQuery: any;
      tenantId: string;
      options?: {
        limit?: number;
        autoParseProfiles?: boolean;
      };
    },
  ) {
    return this.linkedInService.importCandidatesFromLinkedIn(
      body.config,
      body.searchQuery,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Post job to LinkedIn
   * POST /integrations/linkedin/jobs/post
   */
  @Post('linkedin/jobs/post')
  async postJobToLinkedIn(
    @Body()
    body: {
      config: LinkedInConfig;
      jobId: string;
      tenantId: string;
    },
  ) {
    // Fetch job from database
    // Then post to LinkedIn
    // This is a placeholder - implement full logic
    return { success: true };
  }

  /**
   * Import jobs from Workday
   * POST /integrations/workday/jobs/import
   */
  @Post('workday/jobs/import')
  async importWorkdayJobs(
    @Body()
    body: {
      config: WorkdayConfig;
      tenantId: string;
      options?: {
        status?: 'open' | 'closed' | 'all';
        limit?: number;
      };
    },
  ) {
    return this.workdayService.importJobsFromWorkday(
      body.config,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Import candidates from Workday
   * POST /integrations/workday/candidates/import
   */
  @Post('workday/candidates/import')
  async importWorkdayCandidates(
    @Body()
    body: {
      config: WorkdayConfig;
      tenantId: string;
      options?: {
        jobRequisitionId?: string;
        status?: string;
        limit?: number;
        startDate?: Date;
      };
    },
  ) {
    return this.workdayService.importCandidatesFromWorkday(
      body.config,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Sync application status to Workday
   * POST /integrations/workday/applications/sync
   */
  @Post('workday/applications/sync')
  async syncToWorkday(
    @Body()
    body: {
      config: WorkdayConfig;
      applicationId: string;
      status: string;
    },
  ) {
    // Fetch application and sync
    // This is a placeholder
    return { success: true };
  }
}
