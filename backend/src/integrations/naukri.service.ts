import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { Resume } from '../database/entities/resume.entity';
import { AiService } from '../ai/ai.service';

export interface NaukriConfig {
  accountId: string;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string; // Default: https://api.naukri.com
}

export interface NaukriJob {
  jobId: string;
  title: string;
  description: string;
  location: string;
  experience: string;
  salary?: string;
  skills: string[];
  industry: string;
  functionalArea: string;
  postedDate: string;
  applicationDeadline?: string;
}

export interface NaukriCandidate {
  resumeId: string;
  name: string;
  email: string;
  phone: string;
  currentLocation: string;
  preferredLocation: string[];
  experience: string;
  currentSalary?: string;
  expectedSalary?: string;
  skills: string[];
  education: any[];
  workExperience: any[];
  resumeText?: string;
  resumeUrl?: string;
}

@Injectable()
export class NaukriService {
  private readonly logger = new Logger(NaukriService.name);
  private readonly BASE_URL = 'https://api.naukri.com';

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
   * Post a job to Naukri.com
   */
  async postJobToNaukri(
    config: NaukriConfig,
    jobId: string,
    tenantId: string,
  ): Promise<{ success: boolean; naukriJobId?: string; error?: string }> {
    try {
      const job = await this.jobRepository.findOne({
        where: { id: jobId, tenantId },
      });

      if (!job) {
        return { success: false, error: 'Job not found' };
      }

      const axios = require('axios');
      const baseUrl = config.baseUrl || this.BASE_URL;

      const jobData = {
        accountId: config.accountId,
        title: job.title,
        description: job.description,
        location: job.location || 'India',
        experience: this.extractExperience(job.requirements),
        skills: this.extractSkills(job.requirements),
        functionalArea: this.extractFunctionalArea(job.description),
        industry: 'IT-Software',
        numberOfVacancies: 1,
        salary: job.salary || 'Not Disclosed',
        educationQualification: this.extractEducation(job.requirements),
      };

      const response = await axios.post(
        `${baseUrl}/v1/jobs`,
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const naukriJobId = response.data.jobId || response.data.id;

      // Update job with Naukri job ID
      job.channels = [...(job.channels || []), 'Naukri'];
      await this.jobRepository.save(job);

      this.logger.log(`Posted job "${job.title}" to Naukri with ID: ${naukriJobId}`);

      return {
        success: true,
        naukriJobId,
      };
    } catch (error) {
      this.logger.error('Failed to post job to Naukri:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Import job applications from Naukri
   */
  async importApplicationsFromNaukri(
    config: NaukriConfig,
    naukriJobId: string,
    tenantId: string,
    options: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      parseResumes?: boolean;
    } = {},
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    const { startDate, endDate, limit = 100, parseResumes = true } = options;

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const axios = require('axios');
      const baseUrl = config.baseUrl || this.BASE_URL;

      const response = await axios.get(
        `${baseUrl}/v1/jobs/${naukriJobId}/applications`,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
          params: {
            startDate,
            endDate,
            limit,
          },
        },
      );

      const applications = response.data.applications || response.data.data || [];

      // Find corresponding job in our system
      const job = await this.jobRepository.findOne({
        where: { channels: 'Naukri', tenantId },
      });

      if (!job) {
        this.logger.warn(`Job not found for Naukri job ID: ${naukriJobId}`);
      }

      for (const naukriApp of applications) {
        try {
          const candidateData = naukriApp.candidate || naukriApp;

          // Create or update candidate
          let candidate = await this.candidateRepository.findOne({
            where: { email: candidateData.email, tenantId },
          });

          if (candidate) {
            // Update existing candidate
            candidate.phone = candidateData.phone || candidate.phone;
            candidate.location = candidateData.currentLocation || candidate.location;
            candidate.skills = candidateData.skills || candidate.skills;
            candidate = await this.candidateRepository.save(candidate);
          } else {
            // Create new candidate
            candidate = this.candidateRepository.create({
              email: candidateData.email,
              firstName: this.extractFirstName(candidateData.name),
              lastName: this.extractLastName(candidateData.name),
              phone: candidateData.phone,
              location: candidateData.currentLocation,
              skills: candidateData.skills || [],
              tenantId,
            });
            candidate = await this.candidateRepository.save(candidate);
          }

          // Import resume if available
          if (candidateData.resumeUrl || candidateData.resumeText) {
            await this.importNaukriResume(
              candidate.id,
              candidateData,
              parseResumes,
            );
          }

          // Create application if job exists
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
                status: this.mapNaukriStatusToApplicationStatus(naukriApp.status),
              });

              await this.applicationRepository.save(application);
            }
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to import application for ${naukriApp.candidate?.email}: ${error.message}`,
          );
          this.logger.error('Failed to import application:', error);
        }
      }

      this.logger.log(
        `Naukri applications import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('Failed to fetch applications from Naukri:', error);
      return {
        imported: 0,
        failed: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Search candidates on Naukri and import them
   */
  async searchAndImportCandidates(
    config: NaukriConfig,
    searchCriteria: {
      keywords?: string;
      location?: string;
      experience?: string;
      skills?: string[];
      education?: string;
      currentCompany?: string;
    },
    tenantId: string,
    options: {
      limit?: number;
      parseResumes?: boolean;
    } = {},
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    const { limit = 50, parseResumes = true } = options;

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const axios = require('axios');
      const baseUrl = config.baseUrl || this.BASE_URL;

      const response = await axios.post(
        `${baseUrl}/v1/resumes/search`,
        {
          accountId: config.accountId,
          keywords: searchCriteria.keywords,
          location: searchCriteria.location,
          experience: searchCriteria.experience,
          skills: searchCriteria.skills?.join(','),
          education: searchCriteria.education,
          currentCompany: searchCriteria.currentCompany,
          pageSize: limit,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const resumes = response.data.resumes || response.data.data || [];

      for (const naukriResume of resumes) {
        try {
          // Create or update candidate
          let candidate = await this.candidateRepository.findOne({
            where: { email: naukriResume.email, tenantId },
          });

          if (candidate) {
            // Update existing candidate
            candidate.phone = naukriResume.phone || candidate.phone;
            candidate.location = naukriResume.currentLocation || candidate.location;
            candidate.skills = naukriResume.skills || candidate.skills;
            candidate = await this.candidateRepository.save(candidate);
          } else {
            // Create new candidate
            candidate = this.candidateRepository.create({
              email: naukriResume.email,
              firstName: this.extractFirstName(naukriResume.name),
              lastName: this.extractLastName(naukriResume.name),
              phone: naukriResume.phone,
              location: naukriResume.currentLocation,
              skills: naukriResume.skills || [],
              tenantId,
            });
            candidate = await this.candidateRepository.save(candidate);
          }

          // Import resume
          if (naukriResume.resumeUrl || naukriResume.resumeText) {
            await this.importNaukriResume(
              candidate.id,
              naukriResume,
              parseResumes,
            );
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(
            `Failed to import candidate ${naukriResume.email}: ${error.message}`,
          );
          this.logger.error('Failed to import candidate:', error);
        }
      }

      this.logger.log(
        `Naukri candidate search completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('Failed to search candidates on Naukri:', error);
      return {
        imported: 0,
        failed: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Import resume from Naukri
   */
  private async importNaukriResume(
    candidateId: string,
    naukriData: any,
    parseResume: boolean,
  ): Promise<void> {
    try {
      let resumeText = naukriData.resumeText || '';

      // Fetch resume from URL if available
      if (naukriData.resumeUrl && !resumeText) {
        const axios = require('axios');
        try {
          const response = await axios.get(naukriData.resumeUrl, {
            responseType: 'text',
            timeout: 30000,
          });
          resumeText = response.data;
        } catch (error) {
          this.logger.warn(`Failed to fetch resume from URL: ${naukriData.resumeUrl}`);
        }
      }

      if (!resumeText) {
        this.logger.warn(`No resume text available for candidate ${candidateId}`);
        return;
      }

      // Parse resume with AI if enabled
      let parsedData = null;
      if (parseResume) {
        parsedData = await this.aiService.parseResume(resumeText);
      }

      const resume = this.resumeRepository.create({
        candidateId,
        fileUrl: naukriData.resumeUrl,
        rawText: resumeText,
        summary: parsedData?.summary || '',
        experience: parsedData?.experience || naukriData.workExperience || [],
        education: parsedData?.education || naukriData.education || [],
        skills: parsedData?.skills || naukriData.skills || [],
        certifications: parsedData?.certifications || [],
        isParsed: !!parsedData,
      });

      await this.resumeRepository.save(resume);
    } catch (error) {
      this.logger.error(`Failed to import resume for candidate ${candidateId}:`, error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private extractFirstName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts[0] || 'Unknown';
  }

  private extractLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  private extractExperience(requirements: string[]): string {
    // Extract experience from requirements like "5+ years of experience"
    const expRegex = /(\d+)\+?\s*(?:to\s*(\d+))?\s*years?/i;
    for (const req of requirements || []) {
      const match = req.match(expRegex);
      if (match) {
        const min = match[1];
        const max = match[2] || '';
        return max ? `${min}-${max} years` : `${min}+ years`;
      }
    }
    return '0-15 years';
  }

  private extractSkills(requirements: string[]): string[] {
    // Extract skills from requirements
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

  private extractFunctionalArea(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('software') || lowerDesc.includes('developer')) {
      return 'IT-Software - Application Programming';
    } else if (lowerDesc.includes('data') || lowerDesc.includes('analyst')) {
      return 'IT-Software - Data Analytics';
    } else if (lowerDesc.includes('devops') || lowerDesc.includes('infrastructure')) {
      return 'IT-Software - System Programming';
    }
    return 'IT-Software - Other';
  }

  private extractEducation(requirements: string[]): string {
    for (const req of requirements || []) {
      const lowerReq = req.toLowerCase();
      if (lowerReq.includes('phd') || lowerReq.includes('doctorate')) {
        return 'Doctorate';
      } else if (lowerReq.includes('master') || lowerReq.includes('mba') || lowerReq.includes('mca') || lowerReq.includes('m.tech')) {
        return 'Post Graduation';
      } else if (lowerReq.includes('bachelor') || lowerReq.includes('b.tech') || lowerReq.includes('bca') || lowerReq.includes('b.e')) {
        return 'Graduation';
      }
    }
    return 'Graduation';
  }

  private mapNaukriStatusToApplicationStatus(naukriStatus: string): ApplicationStatus {
    const statusMap: Record<string, ApplicationStatus> = {
      'Applied': ApplicationStatus.APPLIED,
      'Shortlisted': ApplicationStatus.SHORTLISTED,
      'Under Review': ApplicationStatus.SCREENING,
      'Interview Scheduled': ApplicationStatus.INTERVIEW,
      'Interviewing': ApplicationStatus.INTERVIEW,
      'Offered': ApplicationStatus.OFFER,
      'Rejected': ApplicationStatus.REJECTED,
      'Hired': ApplicationStatus.HIRED,
    };

    return statusMap[naukriStatus] || ApplicationStatus.APPLIED;
  }
}
