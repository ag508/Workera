import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { Resume } from '../database/entities/resume.entity';
import { AiService } from '../ai/ai.service';

export type JobBoardPlatform =
  | 'indeed'
  | 'monster'
  | 'glassdoor'
  | 'careerbuilder'
  | 'ziprecruiter'
  | 'dice'
  | 'simplyhired'
  | 'angelist'
  | 'stackoverflow'
  | 'github'
  | 'wellfound'
  | 'shine'
  | 'timesjobs'
  | 'freshersworld'
  | 'hirist'
  | 'instahyre'
  | 'cutshort'
  | 'apnaCircle'
  | 'foundIt';

export interface JobBoardConfig {
  platform: JobBoardPlatform;
  apiKey: string;
  apiSecret?: string;
  accountId?: string;
  employerId?: string;
  baseUrl?: string;
  webhookUrl?: string;
}

export interface UnifiedJobPost {
  title: string;
  description: string;
  location: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  benefits?: string[];
  remoteOk?: boolean;
}

export interface UnifiedApplication {
  candidateName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumeText?: string;
  location?: string;
  appliedDate: Date;
  source: JobBoardPlatform;
  sourceId: string;
}

@Injectable()
export class JobBoardsService {
  private readonly logger = new Logger(JobBoardsService.name);

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    private aiService: AiService,
  ) {}

  /**
   * Post job to multiple job boards
   */
  async postJobToBoards(
    configs: JobBoardConfig[],
    jobId: string,
    tenantId: string,
  ): Promise<{
    successful: string[];
    failed: Array<{ platform: JobBoardPlatform; error: string }>;
  }> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, tenantId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const successful: string[] = [];
    const failed: Array<{ platform: JobBoardPlatform; error: string }> = [];

    const unifiedJob: UnifiedJobPost = {
      title: job.title,
      description: job.description,
      location: job.location || 'Remote',
      skills: this.extractSkills(job.requirements || []),
      remoteOk: job.location?.toLowerCase().includes('remote'),
    };

    for (const config of configs) {
      try {
        await this.postToSingleBoard(config, unifiedJob, job);
        successful.push(config.platform);

        // Update job channels
        if (!job.channels.includes(this.getPlatformDisplayName(config.platform))) {
          job.channels.push(this.getPlatformDisplayName(config.platform));
        }
      } catch (error) {
        this.logger.error(`Failed to post to ${config.platform}:`, error);
        failed.push({ platform: config.platform, error: error.message });
      }
    }

    await this.jobRepository.save(job);

    this.logger.log(
      `Posted job to ${successful.length} platforms, ${failed.length} failed`,
    );

    return { successful, failed };
  }

  /**
   * Fetch applications from multiple job boards
   */
  async fetchApplicationsFromBoards(
    configs: JobBoardConfig[],
    jobMapping: Map<JobBoardPlatform, string>, // Map of platform to their job IDs
    tenantId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      parseResumes?: boolean;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
    byPlatform: Record<string, number>;
  }> {
    let totalImported = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];
    const byPlatform: Record<string, number> = {};

    for (const config of configs) {
      const platformJobId = jobMapping.get(config.platform);
      if (!platformJobId) {
        this.logger.warn(`No job ID mapping for platform: ${config.platform}`);
        continue;
      }

      try {
        const applications = await this.fetchApplicationsFromSingleBoard(
          config,
          platformJobId,
          options,
        );

        let imported = 0;
        let failed = 0;

        for (const app of applications) {
          try {
            await this.importUnifiedApplication(app, tenantId, options.parseResumes);
            imported++;
          } catch (error) {
            failed++;
            allErrors.push(`[${config.platform}] ${error.message}`);
          }
        }

        totalImported += imported;
        totalFailed += failed;
        byPlatform[config.platform] = imported;

        this.logger.log(`Imported ${imported} applications from ${config.platform}`);
      } catch (error) {
        this.logger.error(`Failed to fetch from ${config.platform}:`, error);
        allErrors.push(`[${config.platform}] ${error.message}`);
      }
    }

    return {
      imported: totalImported,
      failed: totalFailed,
      errors: allErrors,
      byPlatform,
    };
  }

  /**
   * Search candidates across multiple job boards
   */
  async searchCandidatesAcrossBoards(
    configs: JobBoardConfig[],
    searchCriteria: {
      keywords?: string;
      location?: string;
      skills?: string[];
      experienceYears?: number;
      education?: string;
    },
    tenantId: string,
    options: {
      limit?: number;
      parseResumes?: boolean;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
    byPlatform: Record<string, number>;
  }> {
    let totalImported = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];
    const byPlatform: Record<string, number> = {};

    for (const config of configs) {
      try {
        const candidates = await this.searchCandidatesOnSingleBoard(
          config,
          searchCriteria,
          options.limit || 50,
        );

        let imported = 0;
        let failed = 0;

        for (const candidate of candidates) {
          try {
            await this.importUnifiedCandidate(candidate, tenantId, options.parseResumes);
            imported++;
          } catch (error) {
            failed++;
            allErrors.push(`[${config.platform}] ${error.message}`);
          }
        }

        totalImported += imported;
        totalFailed += failed;
        byPlatform[config.platform] = imported;

        this.logger.log(`Imported ${imported} candidates from ${config.platform}`);
      } catch (error) {
        this.logger.error(`Failed to search on ${config.platform}:`, error);
        allErrors.push(`[${config.platform}] ${error.message}`);
      }
    }

    return {
      imported: totalImported,
      failed: totalFailed,
      errors: allErrors,
      byPlatform,
    };
  }

  /**
   * Post to a single job board (platform-specific implementation)
   */
  private async postToSingleBoard(
    config: JobBoardConfig,
    job: UnifiedJobPost,
    jobEntity: Job,
  ): Promise<string> {
    const axios = require('axios');

    switch (config.platform) {
      case 'indeed':
        return await this.postToIndeed(config, job, axios);

      case 'monster':
        return await this.postToMonster(config, job, axios);

      case 'glassdoor':
        return await this.postToGlassdoor(config, job, axios);

      case 'ziprecruiter':
        return await this.postToZipRecruiter(config, job, axios);

      case 'dice':
        return await this.postToDice(config, job, axios);

      case 'shine':
        return await this.postToShine(config, job, axios);

      case 'timesjobs':
        return await this.postToTimesJobs(config, job, axios);

      case 'instahyre':
        return await this.postToInstahyre(config, job, axios);

      case 'foundIt':
        return await this.postToFoundIt(config, job, axios);

      default:
        return await this.postToGenericBoard(config, job, axios);
    }
  }

  /**
   * Platform-specific posting implementations
   */
  private async postToIndeed(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://apis.indeed.com/ads/v1/jobs',
      {
        title: job.title,
        description: job.description,
        location: job.location,
        jobType: job.employmentType,
        salary: job.salaryMax ? `${job.salaryMin || 0}-${job.salaryMax}` : undefined,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.id || response.data.jobId;
  }

  private async postToMonster(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.monster.com/v1/jobs',
      {
        accountId: config.accountId,
        jobTitle: job.title,
        jobDescription: job.description,
        location: job.location,
        employmentType: job.employmentType,
        skills: job.skills,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.jobId;
  }

  private async postToGlassdoor(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.glassdoor.com/api/employer/jobs',
      {
        partnerId: config.accountId,
        jobTitle: job.title,
        jobDescription: job.description,
        city: job.location,
        employmentType: job.employmentType,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.job.jobId;
  }

  private async postToZipRecruiter(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.ziprecruiter.com/jobs/v1',
      {
        name: job.title,
        description: job.description,
        location: job.location,
        employment_type: job.employmentType,
        skills: job.skills.join(', '),
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.job_id;
  }

  private async postToDice(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.dice.com/v1/jobs',
      {
        title: job.title,
        description: job.description,
        location: job.location,
        skills: job.skills,
        employmentType: job.employmentType,
      },
      {
        headers: {
          'X-API-Key': config.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.jobId;
  }

  private async postToShine(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.shine.com/recruiter/api/v1/jobs',
      {
        jobTitle: job.title,
        jobDescription: job.description,
        jobLocation: job.location,
        keySkills: job.skills.join(','),
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.jobId;
  }

  private async postToTimesJobs(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.timesjobs.com/v1/postings',
      {
        title: job.title,
        description: job.description,
        location: job.location,
        skills: job.skills,
        accountId: config.accountId,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.posting_id;
  }

  private async postToInstahyre(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    const response = await axios.post(
      'https://api.instahyre.com/v1/jobs',
      {
        title: job.title,
        description: job.description,
        location: job.location,
        skills: job.skills,
        remoteOk: job.remoteOk,
      },
      {
        headers: {
          'Authorization': `Token ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.id;
  }

  private async postToFoundIt(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    // FoundIt (formerly Monster India)
    const response = await axios.post(
      'https://api.foundit.in/v1/jobs',
      {
        jobTitle: job.title,
        jobDescription: job.description,
        location: job.location,
        keySkills: job.skills.join(','),
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.jobId;
  }

  private async postToGenericBoard(config: JobBoardConfig, job: UnifiedJobPost, axios: any): Promise<string> {
    // Generic implementation for other boards
    const baseUrl = config.baseUrl || `https://api.${config.platform}.com`;
    const response = await axios.post(
      `${baseUrl}/v1/jobs`,
      {
        title: job.title,
        description: job.description,
        location: job.location,
        skills: job.skills,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.id || response.data.jobId;
  }

  /**
   * Fetch applications from a single board
   */
  private async fetchApplicationsFromSingleBoard(
    config: JobBoardConfig,
    jobId: string,
    options: any,
  ): Promise<UnifiedApplication[]> {
    const axios = require('axios');
    const applications: UnifiedApplication[] = [];

    try {
      let url: string;
      let headers: any;

      switch (config.platform) {
        case 'indeed':
          url = `https://apis.indeed.com/ads/v1/jobs/${jobId}/applications`;
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
          break;

        case 'monster':
          url = `https://api.monster.com/v1/jobs/${jobId}/applications`;
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
          break;

        case 'ziprecruiter':
          url = `https://api.ziprecruiter.com/jobs/v1/${jobId}/applications`;
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
          break;

        default:
          url = `${config.baseUrl || `https://api.${config.platform}.com`}/v1/jobs/${jobId}/applications`;
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
      }

      const response = await axios.get(url, { headers });
      const data = response.data.applications || response.data.data || response.data;

      for (const app of data) {
        applications.push(this.normalizeApplication(app, config.platform));
      }
    } catch (error) {
      this.logger.error(`Failed to fetch applications from ${config.platform}:`, error);
      throw error;
    }

    return applications;
  }

  /**
   * Search candidates on a single board
   */
  private async searchCandidatesOnSingleBoard(
    config: JobBoardConfig,
    criteria: any,
    limit: number,
  ): Promise<any[]> {
    const axios = require('axios');
    const candidates: any[] = [];

    try {
      let url: string;
      let headers: any;
      let payload: any;

      switch (config.platform) {
        case 'indeed':
          url = 'https://apis.indeed.com/resume-search/v1/resumes';
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
          payload = {
            query: criteria.keywords,
            location: criteria.location,
            limit,
          };
          break;

        case 'monster':
          url = 'https://api.monster.com/v1/resumes/search';
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
          payload = {
            keywords: criteria.keywords,
            location: criteria.location,
            skills: criteria.skills,
            limit,
          };
          break;

        case 'dice':
          url = 'https://api.dice.com/v1/candidates/search';
          headers = { 'X-API-Key': config.apiKey };
          payload = {
            keywords: criteria.keywords,
            location: criteria.location,
            skills: criteria.skills?.join(','),
            limit,
          };
          break;

        default:
          url = `${config.baseUrl || `https://api.${config.platform}.com`}/v1/candidates/search`;
          headers = { 'Authorization': `Bearer ${config.apiKey}` };
          payload = { ...criteria, limit };
      }

      const response = await axios.post(url, payload, { headers });
      const data = response.data.candidates || response.data.resumes || response.data.data || response.data;

      return Array.isArray(data) ? data : [];
    } catch (error) {
      this.logger.error(`Failed to search candidates on ${config.platform}:`, error);
      return [];
    }
  }

  /**
   * Import unified application into system
   */
  private async importUnifiedApplication(
    app: UnifiedApplication,
    tenantId: string,
    parseResume: boolean = true,
  ): Promise<void> {
    // Create or update candidate
    let candidate = await this.candidateRepository.findOne({
      where: { email: app.email, tenantId },
    });

    if (!candidate) {
      const [firstName, ...lastNameParts] = app.candidateName.split(' ');
      candidate = this.candidateRepository.create({
        email: app.email,
        firstName,
        lastName: lastNameParts.join(' '),
        phone: app.phone,
        location: app.location,
        tenantId,
      });
      candidate = await this.candidateRepository.save(candidate);
    }

    // Import resume if available
    if (app.resumeUrl || app.resumeText) {
      let resumeText = app.resumeText || '';

      if (!resumeText && app.resumeUrl) {
        const axios = require('axios');
        try {
          const response = await axios.get(app.resumeUrl, {
            responseType: 'text',
            timeout: 30000,
          });
          resumeText = response.data;
        } catch (error) {
          this.logger.warn(`Failed to fetch resume from ${app.resumeUrl}`);
        }
      }

      if (resumeText) {
        let parsedData = null;
        if (parseResume) {
          parsedData = await this.aiService.parseResume(resumeText);
        }

        const resume = this.resumeRepository.create({
          candidateId: candidate.id,
          fileUrl: app.resumeUrl,
          rawText: resumeText,
          summary: parsedData?.summary || '',
          experience: parsedData?.experience || [],
          education: parsedData?.education || [],
          skills: parsedData?.skills || [],
          certifications: parsedData?.certifications || [],
          isParsed: !!parsedData,
        });

        await this.resumeRepository.save(resume);
      }
    }
  }

  /**
   * Import unified candidate into system
   */
  private async importUnifiedCandidate(
    candidateData: any,
    tenantId: string,
    parseResume: boolean = true,
  ): Promise<void> {
    const app: UnifiedApplication = {
      candidateName: candidateData.name || candidateData.fullName,
      email: candidateData.email,
      phone: candidateData.phone,
      resumeUrl: candidateData.resumeUrl,
      resumeText: candidateData.resumeText,
      location: candidateData.location || candidateData.currentLocation,
      appliedDate: new Date(),
      source: candidateData.source,
      sourceId: candidateData.id,
    };

    await this.importUnifiedApplication(app, tenantId, parseResume);
  }

  /**
   * Normalize application data from different platforms
   */
  private normalizeApplication(app: any, platform: JobBoardPlatform): UnifiedApplication {
    return {
      candidateName: app.name || app.candidateName || app.applicant?.name || 'Unknown',
      email: app.email || app.applicant?.email,
      phone: app.phone || app.applicant?.phone,
      resumeUrl: app.resumeUrl || app.resume?.url || app.applicant?.resumeUrl,
      resumeText: app.resumeText || app.resume?.text,
      location: app.location || app.applicant?.location,
      appliedDate: new Date(app.appliedDate || app.applicationDate || Date.now()),
      source: platform,
      sourceId: app.id || app.applicationId,
    };
  }

  /**
   * Helper methods
   */
  private extractSkills(requirements: string[]): string[] {
    const skills: string[] = [];
    const commonSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'python',
      'java', 'c++', 'c#', 'sql', 'nosql', 'mongodb', 'postgresql', 'aws',
      'azure', 'gcp', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
    ];

    for (const req of requirements || []) {
      const lowerReq = req.toLowerCase();
      for (const skill of commonSkills) {
        if (lowerReq.includes(skill) && !skills.includes(skill)) {
          skills.push(skill);
        }
      }
    }

    return skills;
  }

  private getPlatformDisplayName(platform: JobBoardPlatform): string {
    const nameMap: Record<JobBoardPlatform, string> = {
      indeed: 'Indeed',
      monster: 'Monster',
      glassdoor: 'Glassdoor',
      careerbuilder: 'CareerBuilder',
      ziprecruiter: 'ZipRecruiter',
      dice: 'Dice',
      simplyhired: 'SimplyHired',
      angelist: 'AngelList',
      stackoverflow: 'Stack Overflow',
      github: 'GitHub Jobs',
      wellfound: 'Wellfound',
      shine: 'Shine',
      timesjobs: 'TimesJobs',
      freshersworld: 'FreshersWorld',
      hirist: 'Hirist',
      instahyre: 'Instahyre',
      cutshort: 'Cutshort',
      apnaCircle: 'Apna',
      foundIt: 'FoundIt',
    };

    return nameMap[platform] || platform;
  }
}
