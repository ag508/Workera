import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { ConfigService } from '@nestjs/config';

export interface WorkdayConfig {
  tenantName: string;
  username: string;
  password: string;
  baseUrl: string; // e.g., https://wd2-impl-services1.workday.com
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

    try {
      const axios = require('axios');
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      // Workday REST API call
      const response = await axios.get(
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
        },
      );

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
