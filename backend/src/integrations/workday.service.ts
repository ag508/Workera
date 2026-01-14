import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface WorkdayConfig {
  tenantName: string;
  username: string;
  password: string;
  baseUrl: string; // e.g., https://wd2-impl-services1.workday.com
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface WorkdayJob {
  jobRequisitionId: string;
  jobTitle: string;
  jobDescription: string;
  location: string;
  employmentType: string;
  hiringManager: string;
  department: string;
  openDate: Date;
  closeDate?: Date;
  status: string;
}

export interface WorkdayCandidate {
  candidateId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  resumeText?: string;
  applicationDate?: Date;
  status?: string;
}

@Injectable()
export class WorkdayService {
  private readonly logger = new Logger(WorkdayService.name);
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
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private configService: ConfigService,
  ) {}

  /**
   * Validate Workday configuration
   */
  private validateConfig(config: WorkdayConfig): void {
    if (!config.tenantName) {
      throw new BadRequestException('Workday tenant name is required');
    }
    if (!config.username) {
      throw new BadRequestException('Workday username is required');
    }
    if (!config.password) {
      throw new BadRequestException('Workday password is required');
    }
    if (!config.baseUrl) {
      throw new BadRequestException('Workday base URL is required');
    }
    // Validate URL format
    try {
      new URL(config.baseUrl);
    } catch {
      throw new BadRequestException('Invalid Workday base URL format');
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
          throw this.handleWorkdayError(axiosError);
        }

        // Calculate delay with exponential backoff
        if (attempt < retryConfig.maxRetries) {
          const delay = Math.min(
            retryConfig.baseDelay * Math.pow(2, attempt),
            retryConfig.maxDelay,
          );
          this.logger.warn(`Workday API request failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}), retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Workday API request failed after retries');
  }

  /**
   * Handle Workday API errors
   */
  private handleWorkdayError(error: AxiosError): Error {
    const status = error.response?.status;
    const data = error.response?.data as any;

    if (status === 401) {
      return new BadRequestException('Workday credentials are invalid. Please check your username and password.');
    }
    if (status === 403) {
      return new BadRequestException('Workday API access denied. Ensure you have the required permissions.');
    }
    if (status === 429) {
      return new BadRequestException('Workday API rate limit exceeded. Please try again later.');
    }
    if (status === 404) {
      return new BadRequestException('Workday resource not found. The tenant or endpoint may not exist.');
    }

    return new Error(data?.error || `Workday API error: ${error.message}`);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test Workday connection
   */
  async testConnection(config: WorkdayConfig): Promise<{ success: boolean; message: string }> {
    try {
      this.validateConfig(config);

      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      await this.makeRequestWithRetry(async () => {
        const response = await axios.get(
          `${config.baseUrl}/ccx/service/${config.tenantName}/Recruiting/v1/status`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        );
        return response.data;
      });

      return { success: true, message: 'Workday connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Import job requisitions from Workday
   */
  async importJobsFromWorkday(
    config: WorkdayConfig,
    tenantId: string,
    options: {
      status?: 'open' | 'closed' | 'all';
      limit?: number;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const { status = 'open', limit = 100 } = options;

    // Validate configuration
    this.validateConfig(config);

    try {
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      // Workday REST API call with retry
      const response = await this.makeRequestWithRetry(async () => {
        return axios.get(
          `${config.baseUrl}/ccx/service/${config.tenantName}/Recruiting/v1/jobRequisitions`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            params: {
              status: status === 'all' ? undefined : status,
              limit,
            },
            timeout: 30000,
          },
        );
      });

      const workdayJobs: WorkdayJob[] = response.data.data || [];

      this.logger.log(`Fetched ${workdayJobs.length} jobs from Workday`);

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const workdayJob of workdayJobs) {
        try {
          // Check if job already exists
          const existing = await this.jobRepository.findOne({
            where: {
              title: workdayJob.jobTitle,
              tenantId,
            },
          });

          const jobData = {
            title: workdayJob.jobTitle,
            description: workdayJob.jobDescription,
            company: config.tenantName,
            location: workdayJob.location,
            requirements: [],
            status: workdayJob.status === 'Open' ? JobStatus.POSTED : JobStatus.CLOSED,
            channels: ['Workday'],
            tenantId,
          };

          if (existing) {
            Object.assign(existing, jobData);
            await this.jobRepository.save(existing);
          } else {
            const newJob = this.jobRepository.create(jobData);
            await this.jobRepository.save(newJob);
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to import job "${workdayJob.jobTitle}": ${error.message}`,
          );
          this.logger.error(`Failed to import job:`, error);
        }
      }

      this.logger.log(
        `Workday job import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('Workday job import failed:', error);
      throw error;
    }
  }

  /**
   * Import candidates/applicants from Workday
   */
  async importCandidatesFromWorkday(
    config: WorkdayConfig,
    tenantId: string,
    options: {
      jobRequisitionId?: string;
      status?: string;
      limit?: number;
      startDate?: Date;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const { jobRequisitionId, status, limit = 100, startDate } = options;

    try {
      const axios = require('axios');
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      // Build API endpoint
      const params: any = { limit };
      if (jobRequisitionId) params.jobRequisition = jobRequisitionId;
      if (status) params.status = status;
      if (startDate) params.from = startDate.toISOString();

      const response = await axios.get(
        `${config.baseUrl}/ccx/service/${config.tenantName}/Recruiting/v1/jobApplications`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          params,
        },
      );

      const workdayCandidates: WorkdayCandidate[] = response.data.data || [];

      this.logger.log(`Fetched ${workdayCandidates.length} candidates from Workday`);

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const workdayCandidate of workdayCandidates) {
        try {
          // Check if candidate already exists
          const existing = await this.candidateRepository.findOne({
            where: { email: workdayCandidate.email, tenantId },
          });

          const candidateData = {
            email: workdayCandidate.email,
            firstName: workdayCandidate.firstName,
            lastName: workdayCandidate.lastName,
            phone: workdayCandidate.phone,
            location: workdayCandidate.address,
            skills: [],
            tenantId,
          };

          let candidate: Candidate;
          if (existing) {
            Object.assign(existing, candidateData);
            candidate = await this.candidateRepository.save(existing);
          } else {
            candidate = this.candidateRepository.create(candidateData);
            candidate = await this.candidateRepository.save(candidate);
          }

          // Create application if jobRequisitionId is provided
          if (jobRequisitionId) {
            const job = await this.jobRepository.findOne({
              where: { title: jobRequisitionId, tenantId },
            });

            if (job) {
              const existingApp = await this.applicationRepository.findOne({
                where: {
                  candidateId: candidate.id,
                  jobId: job.id,
                },
              });

              if (!existingApp) {
                const application = this.applicationRepository.create({
                  candidateId: candidate.id,
                  jobId: job.id,
                  status: this.mapWorkdayStatusToApplicationStatus(workdayCandidate.status) || ApplicationStatus.APPLIED,
                });

                await this.applicationRepository.save(application);
              }
            }
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to import candidate ${workdayCandidate.email}: ${error.message}`,
          );
          this.logger.error(`Failed to import candidate:`, error);
        }
      }

      this.logger.log(
        `Workday candidate import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('Workday candidate import failed:', error);
      throw error;
    }
  }

  /**
   * Sync application status to Workday
   */
  async syncApplicationStatusToWorkday(
    config: WorkdayConfig,
    application: Application,
    newStatus: string,
  ): Promise<{ success: boolean }> {
    try {
      const axios = require('axios');
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      // Update application status in Workday
      await axios.put(
        `${config.baseUrl}/ccx/service/${config.tenantName}/Recruiting/v1/jobApplications/${application.id}`,
        {
          status: newStatus,
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Synced application status to Workday: ${application.id}`);

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to sync status to Workday:', error);
      return { success: false };
    }
  }

  /**
   * Post job requisition to Workday
   */
  async createJobRequisitionInWorkday(
    config: WorkdayConfig,
    job: Job,
  ): Promise<{ success: boolean; workdayJobId?: string }> {
    try {
      const axios = require('axios');
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      const jobData = {
        jobTitle: job.title,
        jobDescription: job.description,
        location: job.location,
        openDate: new Date().toISOString(),
        status: 'Open',
      };

      const response = await axios.post(
        `${config.baseUrl}/ccx/service/${config.tenantName}/Recruiting/v1/jobRequisitions`,
        jobData,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const workdayJobId = response.data.id;

      this.logger.log(`Created job requisition in Workday: ${workdayJobId}`);

      return {
        success: true,
        workdayJobId,
      };
    } catch (error) {
      this.logger.error('Failed to create job in Workday:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Sync application to Workday by application ID
   * Wrapper method that fetches the application and then syncs
   */
  async syncApplicationToWorkday(
    config: WorkdayConfig,
    applicationId: string,
    tenantId: string,
    status: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate config
      this.validateConfig(config);

      // Fetch application from database
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['candidate', 'job'],
      });

      if (!application) {
        return {
          success: false,
          error: 'Application not found',
        };
      }

      // Sync to Workday
      return this.syncApplicationStatusToWorkday(config, application, status);
    } catch (error) {
      this.logger.error(`Failed to sync application to Workday: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Map Workday application status to internal ApplicationStatus enum
   */
  private mapWorkdayStatusToApplicationStatus(workdayStatus: string): ApplicationStatus {
    const statusMap: Record<string, ApplicationStatus> = {
      'Applied': ApplicationStatus.APPLIED,
      'Screening': ApplicationStatus.SCREENING,
      'In Review': ApplicationStatus.SCREENING,
      'Shortlisted': ApplicationStatus.SHORTLISTED,
      'Interview': ApplicationStatus.INTERVIEW,
      'Interviewing': ApplicationStatus.INTERVIEW,
      'Offer': ApplicationStatus.OFFER,
      'Offer Extended': ApplicationStatus.OFFER,
      'Rejected': ApplicationStatus.REJECTED,
      'Declined': ApplicationStatus.REJECTED,
      'Hired': ApplicationStatus.HIRED,
      'Onboarding': ApplicationStatus.HIRED,
    };

    return statusMap[workdayStatus] || ApplicationStatus.APPLIED;
  }
}
