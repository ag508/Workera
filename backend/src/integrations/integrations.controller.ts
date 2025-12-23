import { Controller, Post, Get, Body, Query, Param, Patch, Delete } from '@nestjs/common';
import { DatabaseImportService, DatabaseConfig, ImportMapping } from './database-import.service';
import { LinkedInService, LinkedInConfig } from './linkedin.service';
import { WorkdayService, WorkdayConfig } from './workday.service';
import { NaukriService, NaukriConfig } from './naukri.service';
import { JobBoardsService, JobBoardConfig, JobBoardPlatform } from './job-boards.service';
import { RecruitmentFormsService, CreateFormDto, SubmitFormDto } from './recruitment-forms.service';
import { CandidatePortalService, RegisterCandidateDto, LoginCandidateDto, UpdateProfileDto } from './candidate-portal.service';
import { CandidatePortalEnhancedService } from './candidate-portal-enhanced.service';
import { IntegrationSettingsService, IntegrationSettings } from './integration-settings.service';
import { AIResumeParserService, ResumeImportSource, ParsedResumeData } from '../candidates/ai-resume-parser.service';
import { SubmissionStatus } from '../database/entities/form-submission.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly databaseImportService: DatabaseImportService,
    private readonly linkedInService: LinkedInService,
    private readonly workdayService: WorkdayService,
    private readonly naukriService: NaukriService,
    private readonly jobBoardsService: JobBoardsService,
    private readonly recruitmentFormsService: RecruitmentFormsService,
    private readonly candidatePortalService: CandidatePortalService,
    private readonly candidatePortalEnhancedService: CandidatePortalEnhancedService,
    private readonly integrationSettingsService: IntegrationSettingsService,
    private readonly aiResumeParserService: AIResumeParserService,
  ) {}

  /**
   * Get integration settings
   * GET /integrations/settings
   */
  @Get('settings')
  async getSettings(@Query('tenantId') tenantId: string) {
    return this.integrationSettingsService.getSettings(tenantId);
  }

  /**
   * Update integration settings
   * PUT /integrations/settings
   */
  @Post('settings')
  async updateSettings(
    @Query('tenantId') tenantId: string,
    @Body() settings: IntegrationSettings,
  ) {
    return this.integrationSettingsService.updateSettings(tenantId, settings);
  }

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

  // ============================================================================
  // RECRUITMENT FORMS & CANDIDATE PORTAL
  // ============================================================================

  /**
   * Create recruitment form
   * POST /integrations/forms
   */
  @Post('forms')
  async createForm(@Body() dto: CreateFormDto) {
    return this.recruitmentFormsService.createForm(dto);
  }

  /**
   * Get all forms for tenant
   * GET /integrations/forms?tenantId=xxx
   */
  @Get('forms')
  async getForms(@Query('tenantId') tenantId: string) {
    return this.recruitmentFormsService.getForms(tenantId);
  }

  /**
   * Get form by slug (public endpoint)
   * GET /integrations/forms/slug/:slug
   */
  @Public()
  @Get('forms/slug/:slug')
  async getFormBySlug(@Param('slug') slug: string) {
    return this.recruitmentFormsService.getFormBySlug(slug);
  }

  /**
   * Update recruitment form
   * PATCH /integrations/forms/:id
   */
  @Patch('forms/:id')
  async updateForm(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() updates: Partial<CreateFormDto>,
  ) {
    return this.recruitmentFormsService.updateForm(id, tenantId, updates);
  }

  /**
   * Delete/deactivate form
   * DELETE /integrations/forms/:id
   */
  @Delete('forms/:id')
  async deleteForm(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.recruitmentFormsService.deleteForm(id, tenantId);
  }

  /**
   * Submit application form (public endpoint)
   * POST /integrations/forms/submit
   */
  @Public()
  @Post('forms/submit')
  async submitForm(@Body() dto: SubmitFormDto) {
    return this.recruitmentFormsService.submitForm(dto);
  }

  /**
   * Get form submissions
   * GET /integrations/forms/:id/submissions
   */
  @Get('forms/:id/submissions')
  async getSubmissions(
    @Param('id') formId: string,
    @Query('tenantId') tenantId: string,
    @Query('status') status?: SubmissionStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.recruitmentFormsService.getSubmissions(formId, tenantId, filters);
  }

  /**
   * Update submission status
   * PATCH /integrations/forms/submissions/:id/status
   */
  @Patch('forms/submissions/:id/status')
  async updateSubmissionStatus(
    @Param('id') submissionId: string,
    @Body() body: {
      tenantId: string;
      status: SubmissionStatus;
      reviewerNotes?: string;
    },
  ) {
    return this.recruitmentFormsService.updateSubmissionStatus(
      submissionId,
      body.tenantId,
      body.status,
      body.reviewerNotes,
    );
  }

  /**
   * Get form analytics
   * GET /integrations/forms/:id/analytics
   */
  @Get('forms/:id/analytics')
  async getFormAnalytics(
    @Param('id') formId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.recruitmentFormsService.getFormAnalytics(formId, tenantId);
  }

  // ============================================================================
  // CANDIDATE PORTAL - AUTHENTICATION
  // ============================================================================

  /**
   * Register candidate (public endpoint)
   * POST /integrations/candidate/register
   */
  @Public()
  @Post('candidate/register')
  async registerCandidate(@Body() dto: RegisterCandidateDto) {
    return this.candidatePortalService.register(dto);
  }

  /**
   * Login candidate (public endpoint)
   * POST /integrations/candidate/login
   */
  @Public()
  @Post('candidate/login')
  async loginCandidate(@Body() dto: LoginCandidateDto) {
    return this.candidatePortalService.login(dto);
  }

  /**
   * Request password reset (public endpoint)
   * POST /integrations/candidate/password-reset/request
   */
  @Public()
  @Post('candidate/password-reset/request')
  async requestPasswordReset(
    @Body() body: { email: string; tenantId: string },
  ) {
    return this.candidatePortalService.requestPasswordReset(
      body.email,
      body.tenantId,
    );
  }

  /**
   * Reset password with token (public endpoint)
   * POST /integrations/candidate/password-reset/confirm
   */
  @Public()
  @Post('candidate/password-reset/confirm')
  async resetPassword(
    @Body() body: { token: string; newPassword: string; tenantId: string },
  ) {
    return this.candidatePortalService.resetPassword(
      body.token,
      body.newPassword,
      body.tenantId,
    );
  }

  /**
   * Verify email (public endpoint)
   * POST /integrations/candidate/verify-email
   */
  @Public()
  @Post('candidate/verify-email')
  async verifyEmail(
    @Body() body: { token: string; tenantId: string },
  ) {
    return this.candidatePortalService.verifyEmail(body.token, body.tenantId);
  }

  // ============================================================================
  // CANDIDATE PORTAL - PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Get candidate profile
   * GET /integrations/candidate/profile
   */
  @Get('candidate/profile')
  async getCandidateProfile(
    @Query('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.candidatePortalService.getProfile(candidateId, tenantId);
  }

  /**
   * Update candidate profile
   * PATCH /integrations/candidate/profile
   */
  @Patch('candidate/profile')
  async updateCandidateProfile(
    @Body() body: {
      candidateId: string;
      tenantId: string;
      updates: UpdateProfileDto;
    },
  ) {
    return this.candidatePortalService.updateProfile(
      body.candidateId,
      body.tenantId,
      body.updates,
    );
  }

  /**
   * Change password
   * POST /integrations/candidate/change-password
   */
  @Post('candidate/change-password')
  async changePassword(
    @Body() body: {
      candidateId: string;
      tenantId: string;
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.candidatePortalService.changePassword(
      body.candidateId,
      body.tenantId,
      body.currentPassword,
      body.newPassword,
    );
  }

  // ============================================================================
  // CANDIDATE PORTAL - APPLICATION TRACKING
  // ============================================================================

  /**
   * Get candidate's applications
   * GET /integrations/candidate/applications
   */
  @Get('candidate/applications')
  async getCandidateApplications(
    @Query('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.candidatePortalService.getMyApplications(
      candidateId,
      tenantId,
    );
  }

  /**
   * Get application details
   * GET /integrations/candidate/applications/:id
   */
  @Get('candidate/applications/:id')
  async getApplicationDetails(
    @Param('id') submissionId: string,
    @Query('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.candidatePortalService.getApplicationDetails(
      candidateId,
      submissionId,
      tenantId,
    );
  }

  /**
   * Withdraw application
   * POST /integrations/candidate/applications/:id/withdraw
   */
  @Post('candidate/applications/:id/withdraw')
  async withdrawApplication(
    @Param('id') submissionId: string,
    @Body() body: { candidateId: string; tenantId: string },
  ) {
    return this.candidatePortalService.withdrawApplication(
      body.candidateId,
      submissionId,
      body.tenantId,
    );
  }

  // ============================================================================
  // CANDIDATE PORTAL - JOB BROWSING
  // ============================================================================

  /**
   * Browse available jobs (public endpoint)
   * GET /integrations/candidate/jobs
   */
  @Public()
  @Get('candidate/jobs')
  async browseJobs(
    @Query('tenantId') tenantId: string,
    @Query('location') location?: string,
    @Query('keywords') keywords?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.candidatePortalService.browseJobs(tenantId, {
      location,
      keywords,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  /**
   * Get job details (public endpoint)
   * GET /integrations/candidate/jobs/:id
   */
  @Public()
  @Get('candidate/jobs/:id')
  async getJobDetails(
    @Param('id') jobId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.candidatePortalService.getJobDetails(jobId, tenantId);
  }

  // ============================================================================
  // CANDIDATE PORTAL - ENHANCED FEATURES (Resume Import, AI Matching)
  // ============================================================================

  /**
   * Parse resume without authentication (for initial application)
   * POST /integrations/candidate/resume/parse
   */
  @Public()
  @Post('candidate/resume/parse')
  async parseResume(
    @Body() body: {
      source: ResumeImportSource;
    },
  ): Promise<ParsedResumeData> {
    return this.aiResumeParserService.parseResume(body.source);
  }

  /**
   * Import and parse resume for authenticated candidate
   * POST /integrations/candidate/resume/import
   */
  @Post('candidate/resume/import')
  async importResume(
    @Body() body: {
      candidateId: string;
      tenantId: string;
      source: ResumeImportSource;
    },
  ): Promise<ParsedResumeData> {
    return this.candidatePortalEnhancedService.importAndParseResume(
      body.candidateId,
      body.tenantId,
      body.source,
    );
  }

  /**
   * Get enhanced profile with all parsed data
   * GET /integrations/candidate/profile/enhanced
   */
  @Get('candidate/profile/enhanced')
  async getEnhancedProfile(
    @Query('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.candidatePortalEnhancedService.getEnhancedProfile(
      candidateId,
      tenantId,
    );
  }

  /**
   * Get AI-powered job recommendations
   * GET /integrations/candidate/jobs/recommended
   */
  @Get('candidate/jobs/recommended')
  async getJobRecommendations(
    @Query('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: number,
    @Query('location') location?: string,
    @Query('jobType') jobType?: string,
  ) {
    return this.candidatePortalEnhancedService.getJobRecommendations(
      candidateId,
      tenantId,
      {
        limit: limit ? parseInt(limit.toString()) : 10,
        location,
        jobType,
      },
    );
  }

  /**
   * AI-powered job search
   * POST /integrations/candidate/jobs/search
   */
  @Public()
  @Post('candidate/jobs/search')
  async searchJobsWithAI(
    @Body() body: {
      tenantId: string;
      query: string;
      candidateId?: string;
    },
  ) {
    return this.candidatePortalEnhancedService.searchJobsWithAI(
      body.tenantId,
      body.query,
      body.candidateId,
    );
  }

  /**
   * Get application form template for a job
   * GET /integrations/candidate/jobs/:id/form-template
   */
  @Public()
  @Get('candidate/jobs/:id/form-template')
  async getApplicationFormTemplate(
    @Param('id') jobId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.candidatePortalEnhancedService.getApplicationFormTemplate(
      jobId,
      tenantId,
    );
  }

  /**
   * Submit application with form data
   * POST /integrations/candidate/apply
   */
  @Post('candidate/apply')
  async submitApplication(
    @Body() body: {
      candidateId: string;
      jobId: string;
      tenantId: string;
      formData: Record<string, any>;
      resumeData?: ParsedResumeData;
    },
  ) {
    return this.candidatePortalEnhancedService.submitApplication(
      body.candidateId,
      body.jobId,
      body.tenantId,
      body.formData,
      body.resumeData,
    );
  }

  /**
   * Calculate job match score for a resume
   * POST /integrations/candidate/jobs/:id/match-score
   */
  @Public()
  @Post('candidate/jobs/:id/match-score')
  async calculateJobMatchScore(
    @Param('id') jobId: string,
    @Body() body: {
      tenantId: string;
      resumeData: ParsedResumeData;
    },
  ) {
    const job = await this.candidatePortalService.getJobDetails(jobId, body.tenantId);
    return this.aiResumeParserService.calculateJobMatchScore(
      body.resumeData,
      {
        skills: (job as any).requirements || [],
      },
    );
  }
}
