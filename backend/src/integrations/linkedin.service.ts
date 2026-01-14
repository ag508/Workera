import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  organizationId: string;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
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
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  };

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private configService: ConfigService,
  ) {}

  /**
   * Validate LinkedIn configuration
   */
  private validateConfig(config: LinkedInConfig): void {
    if (!config.accessToken) {
      throw new BadRequestException('LinkedIn access token is required');
    }
    if (!config.organizationId) {
      throw new BadRequestException('LinkedIn organization ID is required');
    }
    // Validate token format (basic check)
    if (config.accessToken.length < 20) {
      throw new BadRequestException('Invalid LinkedIn access token format');
    }
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequestWithRetry<T>(
    requestFn: () => Promise<T>,
    retryConfig: RetryConfig = this.defaultRetryConfig,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;

        // Don't retry on client errors (4xx) except rate limiting (429)
        if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500 && axiosError.response.status !== 429) {
          throw this.handleLinkedInError(axiosError);
        }

        // Calculate delay with exponential backoff
        if (attempt < retryConfig.maxRetries) {
          const delay = Math.min(
            retryConfig.baseDelay * Math.pow(2, attempt),
            retryConfig.maxDelay,
          );
          this.logger.warn(`LinkedIn API request failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}), retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('LinkedIn API request failed after retries');
  }

  /**
   * Handle LinkedIn API errors
   */
  private handleLinkedInError(error: AxiosError): Error {
    const status = error.response?.status;
    const data = error.response?.data as any;

    if (status === 401) {
      return new BadRequestException('LinkedIn access token is invalid or expired. Please reconnect your LinkedIn account.');
    }
    if (status === 403) {
      return new BadRequestException('LinkedIn API access denied. Ensure you have the required permissions.');
    }
    if (status === 429) {
      return new BadRequestException('LinkedIn API rate limit exceeded. Please try again later.');
    }
    if (status === 404) {
      return new BadRequestException('LinkedIn resource not found. The organization or job may not exist.');
    }

    return new Error(data?.message || `LinkedIn API error: ${error.message}`);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test LinkedIn connection
   */
  async testConnection(config: LinkedInConfig): Promise<{ success: boolean; message: string }> {
    try {
      this.validateConfig(config);

      await this.makeRequestWithRetry(async () => {
        const response = await axios.get(`${this.BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
          },
        });
        return response.data;
      });

      return { success: true, message: 'LinkedIn connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

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

    // Validate configuration
    this.validateConfig(config);

    try {
      // Fetch job postings from LinkedIn with retry
      const response = await this.makeRequestWithRetry(async () => {
        return axios.get(
          `${this.BASE_URL}/jobs?q=organization&organization=${config.organizationId}&count=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${config.accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
            },
            timeout: 30000, // 30 second timeout
          },
        );
      });

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
