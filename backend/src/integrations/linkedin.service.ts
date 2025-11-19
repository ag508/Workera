import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { ConfigService } from '@nestjs/config';

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  organizationId: string;
}

export interface LinkedInJob {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  functions: string[];
  industries: string[];
  postedDate: Date;
  expiresDate?: Date;
}

export interface LinkedInCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  headline: string;
  summary: string;
  location: string;
  profileUrl: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }>;
}

@Injectable()
export class LinkedInService {
  private readonly logger = new Logger(LinkedInService.name);
  private readonly BASE_URL = 'https://api.linkedin.com/v2';

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private configService: ConfigService,
  ) {}

  /**
   * Import job postings from LinkedIn
   */
  async importJobsFromLinkedIn(
    config: LinkedInConfig,
    tenantId: string,
    options: {
      limit?: number;
      status?: 'open' | 'closed' | 'all';
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const { limit = 100, status = 'open' } = options;

    try {
      const axios = require('axios');

      // Fetch job postings from LinkedIn
      const response = await axios.get(
        `${this.BASE_URL}/jobs?q=organization&organization=${config.organizationId}&count=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      const linkedInJobs: LinkedInJob[] = response.data.elements || [];

      this.logger.log(`Fetched ${linkedInJobs.length} jobs from LinkedIn`);

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const linkedInJob of linkedInJobs) {
        try {
          // Check if job already exists
          const existingJob = await this.jobRepository.findOne({
            where: {
              title: linkedInJob.title,
              company: config.organizationId,
              tenantId,
            },
          });

          const jobData = {
            title: linkedInJob.title,
            description: linkedInJob.description,
            company: config.organizationId,
            location: linkedInJob.location,
            salary: null,
            requirements: linkedInJob.functions || [],
            status: status === 'open' ? JobStatus.POSTED : JobStatus.CLOSED,
            channels: ['LinkedIn'],
            tenantId,
          };

          if (existingJob) {
            // Update existing job
            Object.assign(existingJob, jobData);
            await this.jobRepository.save(existingJob);
          } else {
            // Create new job
            const newJob = this.jobRepository.create(jobData);
            await this.jobRepository.save(newJob);
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to import job "${linkedInJob.title}": ${error.message}`,
          );
          this.logger.error(`Failed to import job ${linkedInJob.title}:`, error);
        }
      }

      this.logger.log(
        `LinkedIn job import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('LinkedIn job import failed:', error);
      throw error;
    }
  }

  /**
   * Search for candidates on LinkedIn
   */
  async searchCandidatesOnLinkedIn(
    config: LinkedInConfig,
    searchQuery: {
      keywords?: string;
      location?: string;
      skills?: string[];
      experienceLevel?: string;
      currentCompany?: string;
      schools?: string[];
    },
    tenantId: string,
    limit: number = 25,
  ): Promise<LinkedInCandidate[]> {
    try {
      const axios = require('axios');

      // Build search parameters
      const params = new URLSearchParams();
      if (searchQuery.keywords) params.append('keywords', searchQuery.keywords);
      if (searchQuery.location) params.append('location', searchQuery.location);
      if (searchQuery.skills) params.append('skills', searchQuery.skills.join(','));
      if (searchQuery.experienceLevel) params.append('experienceLevel', searchQuery.experienceLevel);
      params.append('count', limit.toString());

      // Search LinkedIn (requires Recruiter API access)
      const response = await axios.get(
        `${this.BASE_URL}/talentSearch?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      const candidates: LinkedInCandidate[] = response.data.elements || [];

      this.logger.log(`Found ${candidates.length} candidates on LinkedIn`);

      return candidates;
    } catch (error) {
      this.logger.error('LinkedIn candidate search failed:', error);
      throw error;
    }
  }

  /**
   * Import candidates from LinkedIn search results
   */
  async importCandidatesFromLinkedIn(
    config: LinkedInConfig,
    searchQuery: any,
    tenantId: string,
    options: {
      limit?: number;
      autoParseProfiles?: boolean;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const { limit = 25, autoParseProfiles = true } = options;

    try {
      // Search for candidates
      const linkedInCandidates = await this.searchCandidatesOnLinkedIn(
        config,
        searchQuery,
        tenantId,
        limit,
      );

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const linkedInCandidate of linkedInCandidates) {
        try {
          // Extract skills
          const skills = linkedInCandidate.skills || [];

          // Check if candidate already exists
          const email = linkedInCandidate.email || `${linkedInCandidate.id}@linkedin.import`;
          const existing = await this.candidateRepository.findOne({
            where: { email, tenantId },
          });

          const candidateData = {
            email,
            firstName: linkedInCandidate.firstName,
            lastName: linkedInCandidate.lastName,
            location: linkedInCandidate.location,
            skills,
            phone: null,
            tenantId,
          };

          if (existing) {
            // Update existing
            Object.assign(existing, candidateData);
            await this.candidateRepository.save(existing);
          } else {
            // Create new
            const newCandidate = this.candidateRepository.create(candidateData);
            await this.candidateRepository.save(newCandidate);
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to import candidate ${linkedInCandidate.firstName} ${linkedInCandidate.lastName}: ${error.message}`,
          );
          this.logger.error(`Failed to import candidate:`, error);
        }
      }

      this.logger.log(
        `LinkedIn candidate import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('LinkedIn candidate import failed:', error);
      throw error;
    }
  }

  /**
   * Post job to LinkedIn
   */
  async postJobToLinkedIn(
    config: LinkedInConfig,
    job: Job,
  ): Promise<{ success: boolean; linkedInJobId?: string }> {
    try {
      const axios = require('axios');

      const jobData = {
        organization: `urn:li:organization:${config.organizationId}`,
        title: job.title,
        description: job.description,
        location: job.location,
        listedAt: new Date().getTime(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days
      };

      const response = await axios.post(
        `${this.BASE_URL}/jobs`,
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      const linkedInJobId = response.headers['x-restli-id'];

      this.logger.log(`Posted job to LinkedIn: ${linkedInJobId}`);

      return {
        success: true,
        linkedInJobId,
      };
    } catch (error) {
      this.logger.error('Failed to post job to LinkedIn:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Get applicants for a LinkedIn job posting
   */
  async getJobApplicants(
    config: LinkedInConfig,
    linkedInJobId: string,
    tenantId: string,
  ): Promise<LinkedInCandidate[]> {
    try {
      const axios = require('axios');

      const response = await axios.get(
        `${this.BASE_URL}/jobApplications?q=job&job=urn:li:job:${linkedInJobId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      const applicants: LinkedInCandidate[] = response.data.elements || [];

      this.logger.log(`Fetched ${applicants.length} applicants from LinkedIn`);

      return applicants;
    } catch (error) {
      this.logger.error('Failed to fetch LinkedIn applicants:', error);
      throw error;
    }
  }
}
