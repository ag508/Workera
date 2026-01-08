import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface IndeedConfig {
  apiKey: string;
  employerId: string;
  sponsoredKey?: string;
  baseUrl?: string;
}

export interface IndeedJobPosting {
  id?: string;
  title: string;
  description: string;
  company: string;
  location: {
    city?: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  salary?: {
    min?: number;
    max?: number;
    type: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY';
    currency: string;
  };
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  experienceLevel?: string;
  requiredQualifications?: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  applyUrl?: string;
  sponsored?: boolean;
  remoteType?: 'REMOTE' | 'HYBRID' | 'ONSITE';
}

export interface IndeedApplication {
  id: string;
  jobId: string;
  candidateEmail: string;
  candidateName: string;
  candidatePhone?: string;
  resumeUrl?: string;
  resumeText?: string;
  coverLetter?: string;
  appliedAt: Date;
  status: string;
  source: string;
}

export interface IndeedCandidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills?: string[];
  experience?: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }[];
  education?: {
    school: string;
    degree?: string;
    field?: string;
    graduationDate?: string;
  }[];
  resumeUrl?: string;
}

@Injectable()
export class IndeedService {
  private readonly logger = new Logger(IndeedService.name);
  private readonly BASE_URL = 'https://apis.indeed.com/v3';
  private readonly GRAPHQL_URL = 'https://apis.indeed.com/graphql';

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
   * Post a job to Indeed
   */
  async postJob(
    config: IndeedConfig,
    jobPosting: IndeedJobPosting,
    tenantId: string,
  ): Promise<{ success: boolean; indeedJobId?: string; error?: string }> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;

      const jobData = {
        employer_id: config.employerId,
        title: jobPosting.title,
        description: jobPosting.description,
        company: jobPosting.company,
        location: {
          city: jobPosting.location.city,
          state: jobPosting.location.state,
          country: jobPosting.location.country,
          postal_code: jobPosting.location.postalCode,
        },
        job_type: jobPosting.jobType.toLowerCase().replace('_', '-'),
        ...(jobPosting.salary && {
          salary: {
            min: jobPosting.salary.min,
            max: jobPosting.salary.max,
            type: jobPosting.salary.type.toLowerCase(),
            currency: jobPosting.salary.currency,
          },
        }),
        ...(jobPosting.requiredQualifications && {
          required_qualifications: jobPosting.requiredQualifications,
        }),
        ...(jobPosting.preferredQualifications && {
          preferred_qualifications: jobPosting.preferredQualifications,
        }),
        ...(jobPosting.benefits && { benefits: jobPosting.benefits }),
        ...(jobPosting.applyUrl && { apply_url: jobPosting.applyUrl }),
        ...(jobPosting.remoteType && { remote_type: jobPosting.remoteType.toLowerCase() }),
        sponsored: jobPosting.sponsored || false,
        ...(jobPosting.sponsored && config.sponsoredKey && {
          sponsored_key: config.sponsoredKey,
        }),
      };

      const response = await axios.post(
        `${baseUrl}/jobs`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      const indeedJobId = response.data.job_id || response.data.id;

      this.logger.log(`Posted job to Indeed: ${indeedJobId}`);

      return { success: true, indeedJobId };
    } catch (error: any) {
      this.logger.error('Failed to post job to Indeed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Post job from local database to Indeed
   */
  async postJobFromDatabase(
    config: IndeedConfig,
    jobId: string,
    tenantId: string,
    options: { sponsored?: boolean } = {},
  ): Promise<{ success: boolean; indeedJobId?: string; error?: string }> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, tenantId },
    });

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    const jobPosting: IndeedJobPosting = {
      title: job.title,
      description: job.description,
      company: job.company,
      location: this.parseLocation(job.location),
      jobType: this.mapJobType(job.requirements),
      salary: this.parseSalary(job.salary),
      requiredQualifications: job.requirements,
      sponsored: options.sponsored,
    };

    const result = await this.postJob(config, jobPosting, tenantId);

    if (result.success) {
      // Update job with Indeed reference
      job.channels = [...(job.channels || []), 'Indeed'];
      await this.jobRepository.save(job);
    }

    return result;
  }

  /**
   * Update a job posting on Indeed
   */
  async updateJob(
    config: IndeedConfig,
    indeedJobId: string,
    updates: Partial<IndeedJobPosting>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;

      await axios.patch(
        `${baseUrl}/jobs/${indeedJobId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      this.logger.log(`Updated job on Indeed: ${indeedJobId}`);

      return { success: true };
    } catch (error: any) {
      this.logger.error('Failed to update job on Indeed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Close/expire a job posting on Indeed
   */
  async closeJob(
    config: IndeedConfig,
    indeedJobId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;

      await axios.delete(
        `${baseUrl}/jobs/${indeedJobId}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      this.logger.log(`Closed job on Indeed: ${indeedJobId}`);

      return { success: true };
    } catch (error: any) {
      this.logger.error('Failed to close job on Indeed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get all job postings for employer
   */
  async getEmployerJobs(
    config: IndeedConfig,
    options: { status?: string; limit?: number; offset?: number } = {},
  ): Promise<IndeedJobPosting[]> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;
      const { status, limit = 100, offset = 0 } = options;

      const params = new URLSearchParams({
        employer_id: config.employerId,
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (status) params.append('status', status);

      const response = await axios.get(
        `${baseUrl}/jobs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      return response.data.jobs?.map((job: any) => ({
        id: job.job_id,
        title: job.title,
        description: job.description,
        company: job.company,
        location: {
          city: job.location?.city,
          state: job.location?.state,
          country: job.location?.country,
          postalCode: job.location?.postal_code,
        },
        jobType: job.job_type?.toUpperCase().replace('-', '_'),
        salary: job.salary,
        sponsored: job.sponsored,
      })) || [];
    } catch (error: any) {
      this.logger.error('Failed to get employer jobs:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Indeed jobs');
    }
  }

  /**
   * Get applications for a job
   */
  async getJobApplications(
    config: IndeedConfig,
    indeedJobId: string,
    options: { startDate?: Date; endDate?: Date; limit?: number } = {},
  ): Promise<IndeedApplication[]> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;
      const { startDate, endDate, limit = 100 } = options;

      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());

      const response = await axios.get(
        `${baseUrl}/jobs/${indeedJobId}/applications?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      return response.data.applications?.map((app: any) => ({
        id: app.application_id,
        jobId: indeedJobId,
        candidateEmail: app.candidate?.email,
        candidateName: `${app.candidate?.first_name} ${app.candidate?.last_name}`,
        candidatePhone: app.candidate?.phone,
        resumeUrl: app.resume?.url,
        resumeText: app.resume?.text,
        coverLetter: app.cover_letter,
        appliedAt: new Date(app.applied_at),
        status: app.status,
        source: 'Indeed',
      })) || [];
    } catch (error: any) {
      this.logger.error('Failed to get job applications:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Indeed applications');
    }
  }

  /**
   * Import applications from Indeed to local database
   */
  async importApplications(
    config: IndeedConfig,
    indeedJobId: string,
    localJobId: string,
    tenantId: string,
    options: { parseResumes?: boolean } = {},
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const applications = await this.getJobApplications(config, indeedJobId);

      const job = await this.jobRepository.findOne({
        where: { id: localJobId, tenantId },
      });

      if (!job) {
        return { imported: 0, failed: 0, errors: ['Local job not found'] };
      }

      for (const application of applications) {
        try {
          // Create or update candidate
          let candidate = await this.candidateRepository.findOne({
            where: { email: application.candidateEmail, tenantId },
          });

          const nameParts = application.candidateName.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || '';

          if (candidate) {
            candidate.phone = application.candidatePhone || candidate.phone;
            candidate = await this.candidateRepository.save(candidate);
          } else {
            candidate = this.candidateRepository.create({
              email: application.candidateEmail,
              firstName,
              lastName,
              phone: application.candidatePhone,
              tenantId,
            });
            candidate = await this.candidateRepository.save(candidate);
          }

          // Create application if not exists
          const existingApp = await this.applicationRepository.findOne({
            where: {
              candidateId: candidate.id,
              jobId: job.id,
            },
          });

          if (!existingApp) {
            const newApplication = this.applicationRepository.create({
              candidateId: candidate.id,
              jobId: job.id,
              status: this.mapIndeedStatus(application.status),
              notes: `Imported from Indeed. Applied: ${application.appliedAt}`,
            });
            await this.applicationRepository.save(newApplication);
          }

          imported++;
        } catch (error: any) {
          failed++;
          errors.push(`Failed to import application ${application.id}: ${error.message}`);
        }
      }

      this.logger.log(`Indeed applications import: ${imported} imported, ${failed} failed`);

      return { imported, failed, errors };
    } catch (error: any) {
      return {
        imported: 0,
        failed: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Search candidates on Indeed Resume Database
   */
  async searchCandidates(
    config: IndeedConfig,
    searchCriteria: {
      keywords?: string;
      location?: string;
      radius?: number;
      skills?: string[];
      experienceYears?: { min?: number; max?: number };
      education?: string;
      lastActive?: number; // days
    },
    options: { limit?: number; offset?: number } = {},
  ): Promise<IndeedCandidate[]> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;
      const { limit = 25, offset = 0 } = options;

      const searchData = {
        employer_id: config.employerId,
        query: {
          keywords: searchCriteria.keywords,
          location: searchCriteria.location,
          radius: searchCriteria.radius || 25,
          ...(searchCriteria.skills && { skills: searchCriteria.skills }),
          ...(searchCriteria.experienceYears && {
            experience_years: searchCriteria.experienceYears,
          }),
          ...(searchCriteria.education && { education: searchCriteria.education }),
          ...(searchCriteria.lastActive && {
            last_active_days: searchCriteria.lastActive,
          }),
        },
        pagination: {
          limit,
          offset,
        },
      };

      const response = await axios.post(
        `${baseUrl}/resumes/search`,
        searchData,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      return response.data.candidates?.map((candidate: any) => ({
        id: candidate.candidate_id,
        email: candidate.email,
        firstName: candidate.first_name,
        lastName: candidate.last_name,
        phone: candidate.phone,
        location: candidate.location,
        headline: candidate.headline,
        summary: candidate.summary,
        skills: candidate.skills,
        experience: candidate.work_experience?.map((exp: any) => ({
          title: exp.title,
          company: exp.company,
          startDate: exp.start_date,
          endDate: exp.end_date,
          current: exp.is_current,
          description: exp.description,
        })),
        education: candidate.education?.map((edu: any) => ({
          school: edu.school,
          degree: edu.degree,
          field: edu.field_of_study,
          graduationDate: edu.graduation_date,
        })),
        resumeUrl: candidate.resume_url,
      })) || [];
    } catch (error: any) {
      this.logger.error('Failed to search candidates:', error.response?.data || error.message);
      throw new BadRequestException('Failed to search Indeed candidates');
    }
  }

  /**
   * Import candidates from Indeed search to local database
   */
  async importCandidates(
    candidates: IndeedCandidate[],
    tenantId: string,
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const indeedCandidate of candidates) {
      try {
        const email = indeedCandidate.email || `indeed-${indeedCandidate.id}@import.local`;

        const existing = await this.candidateRepository.findOne({
          where: { email, tenantId },
        });

        const candidateData = {
          email,
          firstName: indeedCandidate.firstName,
          lastName: indeedCandidate.lastName,
          phone: indeedCandidate.phone,
          location: indeedCandidate.location,
          skills: indeedCandidate.skills || [],
          tenantId,
        };

        if (existing) {
          Object.assign(existing, candidateData);
          await this.candidateRepository.save(existing);
        } else {
          const newCandidate = this.candidateRepository.create(candidateData);
          await this.candidateRepository.save(newCandidate);
        }

        imported++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to import ${indeedCandidate.firstName} ${indeedCandidate.lastName}: ${error.message}`);
      }
    }

    return { imported, failed, errors };
  }

  /**
   * Get sponsored job performance metrics
   */
  async getSponsoredJobMetrics(
    config: IndeedConfig,
    indeedJobId: string,
    dateRange: { startDate: Date; endDate: Date },
  ): Promise<{
    impressions: number;
    clicks: number;
    applications: number;
    spend: number;
    costPerClick: number;
    costPerApplication: number;
  }> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;

      const response = await axios.get(
        `${baseUrl}/jobs/${indeedJobId}/metrics`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Indeed-Partner-Id': config.employerId,
          },
          params: {
            start_date: dateRange.startDate.toISOString().split('T')[0],
            end_date: dateRange.endDate.toISOString().split('T')[0],
          },
        },
      );

      const metrics = response.data;

      return {
        impressions: metrics.impressions || 0,
        clicks: metrics.clicks || 0,
        applications: metrics.applications || 0,
        spend: metrics.spend || 0,
        costPerClick: metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0,
        costPerApplication: metrics.applications > 0 ? metrics.spend / metrics.applications : 0,
      };
    } catch (error: any) {
      this.logger.error('Failed to get job metrics:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Indeed metrics');
    }
  }

  /**
   * Test connection to Indeed
   */
  async testConnection(config: IndeedConfig): Promise<{ success: boolean; message: string }> {
    try {
      const baseUrl = config.baseUrl || this.BASE_URL;

      await axios.get(
        `${baseUrl}/employers/${config.employerId}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Indeed-Partner-Id': config.employerId,
          },
        },
      );

      return {
        success: true,
        message: 'Successfully connected to Indeed',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Indeed. Please check your credentials.',
      };
    }
  }

  /**
   * Helper: Parse location string into structured format
   */
  private parseLocation(location: string): IndeedJobPosting['location'] {
    const parts = location?.split(',').map(p => p.trim()) || [];
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2] || 'US',
    };
  }

  /**
   * Helper: Parse salary string into structured format
   */
  private parseSalary(salary: string | null): IndeedJobPosting['salary'] | undefined {
    if (!salary) return undefined;

    const match = salary.match(/\$?([\d,]+)(?:\s*-\s*\$?([\d,]+))?/);
    if (!match) return undefined;

    const min = parseInt(match[1].replace(/,/g, ''));
    const max = match[2] ? parseInt(match[2].replace(/,/g, '')) : min;

    return {
      min,
      max,
      type: 'YEARLY',
      currency: 'USD',
    };
  }

  /**
   * Helper: Map job requirements to job type
   */
  private mapJobType(requirements: string[]): IndeedJobPosting['jobType'] {
    const reqText = requirements?.join(' ').toLowerCase() || '';
    if (reqText.includes('part-time') || reqText.includes('part time')) return 'PART_TIME';
    if (reqText.includes('contract')) return 'CONTRACT';
    if (reqText.includes('temporary')) return 'TEMPORARY';
    if (reqText.includes('intern')) return 'INTERNSHIP';
    return 'FULL_TIME';
  }

  /**
   * Helper: Map Indeed application status to internal status
   */
  private mapIndeedStatus(indeedStatus: string): ApplicationStatus {
    const statusMap: Record<string, ApplicationStatus> = {
      'new': ApplicationStatus.APPLIED,
      'reviewed': ApplicationStatus.SCREENING,
      'contacted': ApplicationStatus.SCREENING,
      'interviewing': ApplicationStatus.INTERVIEW,
      'offered': ApplicationStatus.OFFER,
      'hired': ApplicationStatus.HIRED,
      'rejected': ApplicationStatus.REJECTED,
      'withdrawn': ApplicationStatus.REJECTED,
    };

    return statusMap[indeedStatus?.toLowerCase()] || ApplicationStatus.APPLIED;
  }
}
