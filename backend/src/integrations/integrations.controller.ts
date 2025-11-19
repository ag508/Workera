import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { DatabaseImportService, DatabaseConfig, ImportMapping } from './database-import.service';
import { LinkedInService, LinkedInConfig } from './linkedin.service';
import { WorkdayService, WorkdayConfig } from './workday.service';
import { NaukriService, NaukriConfig } from './naukri.service';
import { JobBoardsService, JobBoardConfig, JobBoardPlatform } from './job-boards.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly databaseImportService: DatabaseImportService,
    private readonly linkedInService: LinkedInService,
    private readonly workdayService: WorkdayService,
    private readonly naukriService: NaukriService,
    private readonly jobBoardsService: JobBoardsService,
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

  /**
   * Post job to Naukri
   * POST /integrations/naukri/jobs/post
   */
  @Post('naukri/jobs/post')
  async postJobToNaukri(
    @Body()
    body: {
      config: NaukriConfig;
      jobId: string;
      tenantId: string;
    },
  ) {
    return this.naukriService.postJobToNaukri(
      body.config,
      body.jobId,
      body.tenantId,
    );
  }

  /**
   * Import applications from Naukri
   * POST /integrations/naukri/applications/import
   */
  @Post('naukri/applications/import')
  async importNaukriApplications(
    @Body()
    body: {
      config: NaukriConfig;
      naukriJobId: string;
      tenantId: string;
      options?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
        parseResumes?: boolean;
      };
    },
  ) {
    return this.naukriService.importApplicationsFromNaukri(
      body.config,
      body.naukriJobId,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Search and import candidates from Naukri
   * POST /integrations/naukri/candidates/search
   */
  @Post('naukri/candidates/search')
  async searchNaukriCandidates(
    @Body()
    body: {
      config: NaukriConfig;
      searchCriteria: {
        keywords?: string;
        location?: string;
        experience?: string;
        skills?: string[];
        education?: string;
        currentCompany?: string;
      };
      tenantId: string;
      options?: {
        limit?: number;
        parseResumes?: boolean;
      };
    },
  ) {
    return this.naukriService.searchAndImportCandidates(
      body.config,
      body.searchCriteria,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Post job to multiple job boards
   * POST /integrations/job-boards/post
   */
  @Post('job-boards/post')
  async postJobToBoards(
    @Body()
    body: {
      configs: JobBoardConfig[];
      jobId: string;
      tenantId: string;
    },
  ) {
    return this.jobBoardsService.postJobToBoards(
      body.configs,
      body.jobId,
      body.tenantId,
    );
  }

  /**
   * Fetch applications from multiple job boards
   * POST /integrations/job-boards/applications/fetch
   */
  @Post('job-boards/applications/fetch')
  async fetchApplicationsFromBoards(
    @Body()
    body: {
      configs: JobBoardConfig[];
      jobMapping: Record<JobBoardPlatform, string>;
      tenantId: string;
      options?: {
        startDate?: Date;
        endDate?: Date;
        parseResumes?: boolean;
      };
    },
  ) {
    const jobMapping = new Map(Object.entries(body.jobMapping) as Array<[JobBoardPlatform, string]>);
    return this.jobBoardsService.fetchApplicationsFromBoards(
      body.configs,
      jobMapping,
      body.tenantId,
      body.options,
    );
  }

  /**
   * Search candidates across multiple job boards
   * POST /integrations/job-boards/candidates/search
   */
  @Post('job-boards/candidates/search')
  async searchCandidatesAcrossBoards(
    @Body()
    body: {
      configs: JobBoardConfig[];
      searchCriteria: {
        keywords?: string;
        location?: string;
        skills?: string[];
        experienceYears?: number;
        education?: string;
      };
      tenantId: string;
      options?: {
        limit?: number;
        parseResumes?: boolean;
      };
    },
  ) {
    return this.jobBoardsService.searchCandidatesAcrossBoards(
      body.configs,
      body.searchCriteria,
      body.tenantId,
      body.options,
    );
  }
}
