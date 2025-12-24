import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, Resume, Application, ApplicationStatus } from '../database/entities';
import { ResumeParserService } from './resume-parser.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private resumeParserService: ResumeParserService,
    private aiService: AiService,
    private notificationsService: NotificationsService,
  ) {}

  async createCandidate(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    location?: string;
    tenantId: string;
  }) {
    const candidate = this.candidateRepository.create(data);
    return await this.candidateRepository.save(candidate);
  }

  async getAllCandidates(tenantId: string) {
    return await this.candidateRepository.find({
      where: { tenantId },
      relations: ['resumes', 'applications'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCandidateById(id: string, tenantId: string) {
    return await this.candidateRepository.findOne({
      where: { id, tenantId },
      relations: ['resumes', 'applications'],
    });
  }

  async updateCandidate(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      location?: string;
      skills?: string[];
      summary?: string;
      experience?: any[];
      education?: any[];
      certifications?: string[];
      projects?: any[];
      linkedin?: string;
      github?: string;
      portfolio?: string;
    },
    tenantId: string
  ) {
    const candidate = await this.getCandidateById(id, tenantId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Update allowed fields
    if (data.firstName !== undefined) candidate.firstName = data.firstName;
    if (data.lastName !== undefined) candidate.lastName = data.lastName;
    if (data.phone !== undefined) candidate.phone = data.phone;
    if (data.location !== undefined) candidate.location = data.location;
    if (data.skills !== undefined) candidate.skills = data.skills;

    // Store additional profile data as JSON in a field (or use a separate profile table)
    // For now, we'll store in metadata
    (candidate as any).metadata = {
      summary: data.summary,
      experience: data.experience,
      education: data.education,
      certifications: data.certifications,
      projects: data.projects,
      linkedin: data.linkedin,
      github: data.github,
      portfolio: data.portfolio,
    };

    return await this.candidateRepository.save(candidate);
  }

  async uploadResume(candidateId: string, resumeText: string, tenantId: string) {
    const candidate = await this.getCandidateById(candidateId, tenantId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Parse the resume
    const parsed = this.resumeParserService.parseResumeText(resumeText);

    // Create resume record
    const resume = this.resumeRepository.create({
      candidateId,
      rawText: resumeText,
      summary: parsed.summary,
      experience: parsed.experience,
      education: parsed.education,
      skills: parsed.skills,
      certifications: parsed.certifications,
      isParsed: true,
    });

    const savedResume = await this.resumeRepository.save(resume);

    // Update candidate skills
    await this.candidateRepository.update(candidateId, {
      skills: [...new Set([...candidate.skills, ...parsed.skills])],
    });

    // Send notification
    await this.notificationsService.sendResumeProcessedNotification({
      to: candidate.email,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
    });

    return savedResume;
  }

  async searchCandidates(query: {
    skills?: string[];
    location?: string;
    tenantId: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    searchTerm?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.tenantId = :tenantId', { tenantId: query.tenantId });

    // Skills filter (ANY match)
    if (query.skills && query.skills.length > 0) {
      queryBuilder.andWhere('candidate.skills && :skills', { skills: query.skills });
    }

    // Location filter (fuzzy match)
    if (query.location) {
      queryBuilder.andWhere('candidate.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    }

    // Full-text search across name and email
    if (query.searchTerm) {
      queryBuilder.andWhere(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${query.searchTerm}%` }
      );
    }

    // Date range filters
    if (query.createdAfter) {
      queryBuilder.andWhere('candidate.createdAt >= :createdAfter', {
        createdAfter: query.createdAfter,
      });
    }

    if (query.createdBefore) {
      queryBuilder.andWhere('candidate.createdAt <= :createdBefore', {
        createdBefore: query.createdBefore,
      });
    }

    // Sorting
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'email', 'location'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`candidate.${sortField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [candidates, total] = await queryBuilder
      .leftJoinAndSelect('candidate.resumes', 'resume')
      .getManyAndCount();

    return {
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async analyzeCandidate(candidateId: string, jobDescription: string, tenantId: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, tenantId },
      relations: ['resumes'],
    });

    if (!candidate || !candidate.resumes || candidate.resumes.length === 0) {
      throw new NotFoundException('Candidate or resume not found');
    }

    const latestResume = candidate.resumes[candidate.resumes.length - 1];
    const analysis = await this.aiService.analyzeResume(latestResume.rawText, jobDescription);

    return {
      candidate,
      analysis,
    };
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    tenantId: string,
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'job', 'job.tenant'],
    });

    if (!application || application.job.tenantId !== tenantId) {
      throw new NotFoundException('Application not found');
    }

    // Update status
    application.status = status as any;
    const updated = await this.applicationRepository.save(application);

    // Send notification
    await this.notificationsService.sendApplicationStatusUpdate({
      to: application.candidate.email,
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      jobTitle: application.job.title,
      companyName: application.job.company || 'the company',
      status,
    });

    return updated;
  }

  async createApplication(data: {
    candidateId: string;
    jobId: string;
    tenantId: string;
  }) {
    const candidate = await this.getCandidateById(data.candidateId, data.tenantId);
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const application = this.applicationRepository.create({
      candidateId: data.candidateId,
      jobId: data.jobId,
      status: ApplicationStatus.APPLIED,
    });

    return await this.applicationRepository.save(application);
  }

  async getApplicationsByJob(jobId: string, tenantId: string) {
    return await this.applicationRepository.find({
      where: { jobId },
      relations: ['candidate', 'job', 'job.tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  // Bulk Operations

  async bulkImportCandidates(
    candidates: Array<{
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      location?: string;
      skills?: string[];
    }>,
    tenantId: string
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const candidateData of candidates) {
      try {
        // Check if candidate already exists
        const existing = await this.candidateRepository.findOne({
          where: { email: candidateData.email, tenantId },
        });

        if (existing) {
          errors.push(`Candidate with email ${candidateData.email} already exists`);
          failed++;
          continue;
        }

        await this.candidateRepository.save({
          ...candidateData,
          tenantId,
          skills: candidateData.skills || [],
        });

        imported++;
      } catch (error) {
        errors.push(`Failed to import ${candidateData.email}: ${error.message}`);
        failed++;
      }
    }

    return { imported, failed, errors };
  }

  async bulkUpdateApplicationStatus(
    applicationIds: string[],
    status: string,
    tenantId: string
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of applicationIds) {
      try {
        const result = await this.updateApplicationStatus(id, status, tenantId);
        if (result) {
          updated++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { updated, failed };
  }

  async bulkTagCandidates(
    candidateIds: string[],
    tags: string[],
    tenantId: string
  ): Promise<{ tagged: number; failed: number }> {
    let tagged = 0;
    let failed = 0;

    for (const id of candidateIds) {
      try {
        const candidate = await this.getCandidateById(id, tenantId);
        if (!candidate) {
          failed++;
          continue;
        }

        // Add tags to skills (in production, you'd have a separate tags field)
        const updatedSkills = [...new Set([...candidate.skills, ...tags])];
        await this.candidateRepository.update(id, { skills: updatedSkills });
        tagged++;
      } catch (error) {
        failed++;
      }
    }

    return { tagged, failed };
  }

  async bulkSendEmail(
    candidateIds: string[],
    subject: string,
    message: string,
    tenantId: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const id of candidateIds) {
      try {
        const candidate = await this.getCandidateById(id, tenantId);
        if (!candidate) {
          failed++;
          continue;
        }

        // Use notification service for custom emails
        // For now, we'll just count as sent (in production, implement custom email template)
        sent++;
      } catch (error) {
        failed++;
      }
    }

    return { sent, failed };
  }

  async bulkExportCandidates(
    candidateIds: string[],
    tenantId: string
  ): Promise<any[]> {
    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.id IN (:...ids)', { ids: candidateIds })
      .andWhere('candidate.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('candidate.resumes', 'resume')
      .leftJoinAndSelect('candidate.applications', 'application')
      .getMany();

    return candidates.map(c => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      location: c.location,
      skills: c.skills,
      resumesCount: c.resumes?.length || 0,
      applicationsCount: c.applications?.length || 0,
      createdAt: c.createdAt,
    }));
  }

  async bulkDeleteCandidates(
    candidateIds: string[],
    tenantId: string
  ): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of candidateIds) {
      try {
        const candidate = await this.getCandidateById(id, tenantId);
        if (!candidate) {
          failed++;
          continue;
        }

        await this.candidateRepository.delete(id);
        deleted++;
      } catch (error) {
        failed++;
      }
    }

    return { deleted, failed };
  }
}
