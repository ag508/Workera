import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationForm, FormField, FormSettings } from '../database/entities/application-form.entity';
import { FormSubmission, SubmissionData, SubmissionStatus } from '../database/entities/form-submission.entity';
import { Job } from '../database/entities/job.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { Candidate } from '../database/entities/candidate.entity';
import { Resume } from '../database/entities/resume.entity';
import { AiService } from '../ai/ai.service';

export interface CreateFormDto {
  title: string;
  description?: string;
  jobId?: string;
  fields: FormField[];
  settings?: Partial<FormSettings>;
  welcomeMessage?: string;
  thankYouMessage?: string;
  tenantId: string;
}

export interface SubmitFormDto {
  formId: string;
  data: SubmissionData;
  resumeUrl?: string;
  coverLetter?: string;
  candidateUserId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RecruitmentFormsService {
  private readonly logger = new Logger(RecruitmentFormsService.name);

  constructor(
    @InjectRepository(ApplicationForm)
    private formRepository: Repository<ApplicationForm>,
    @InjectRepository(FormSubmission)
    private submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    private aiService: AiService,
  ) {}

  /**
   * Create a new application form
   */
  async createForm(dto: CreateFormDto): Promise<ApplicationForm> {
    // Generate unique slug from title
    const baseSlug = this.generateSlug(dto.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await this.formRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate job exists if jobId provided
    if (dto.jobId) {
      const job = await this.jobRepository.findOne({
        where: { id: dto.jobId, tenantId: dto.tenantId },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    const defaultSettings: FormSettings = {
      allowMultipleSubmissions: false,
      requireLogin: false,
      showOtherJobs: true,
      autoSendConfirmationEmail: true,
      collectResume: true,
      collectCoverLetter: false,
    };

    const form = this.formRepository.create({
      title: dto.title,
      description: dto.description,
      jobId: dto.jobId,
      fields: dto.fields,
      settings: { ...defaultSettings, ...dto.settings },
      slug,
      welcomeMessage: dto.welcomeMessage,
      thankYouMessage: dto.thankYouMessage,
      tenantId: dto.tenantId,
    });

    const savedForm = await this.formRepository.save(form);
    this.logger.log(`Created application form: ${savedForm.id} (${savedForm.slug})`);

    return savedForm;
  }

  /**
   * Get form by slug (for public access)
   */
  async getFormBySlug(slug: string): Promise<ApplicationForm> {
    const form = await this.formRepository.findOne({
      where: { slug, isActive: true },
      relations: ['job'],
    });

    if (!form) {
      throw new NotFoundException('Application form not found');
    }

    return form;
  }

  /**
   * Get all forms for a tenant
   */
  async getForms(tenantId: string): Promise<ApplicationForm[]> {
    return this.formRepository.find({
      where: { tenantId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update application form
   */
  async updateForm(
    formId: string,
    tenantId: string,
    updates: Partial<CreateFormDto>,
  ): Promise<ApplicationForm> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Update slug if title changed
    if (updates.title && updates.title !== form.title) {
      const baseSlug = this.generateSlug(updates.title);
      let slug = baseSlug;
      let counter = 1;

      while (await this.formRepository.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      form.slug = slug;
      form.title = updates.title;
    }

    if (updates.description !== undefined) form.description = updates.description;
    if (updates.fields) form.fields = updates.fields;
    if (updates.settings) form.settings = { ...form.settings, ...updates.settings };
    if (updates.welcomeMessage !== undefined) form.welcomeMessage = updates.welcomeMessage;
    if (updates.thankYouMessage !== undefined) form.thankYouMessage = updates.thankYouMessage;

    return this.formRepository.save(form);
  }

  /**
   * Delete/deactivate form
   */
  async deleteForm(formId: string, tenantId: string): Promise<void> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    form.isActive = false;
    await this.formRepository.save(form);

    this.logger.log(`Deactivated form: ${formId}`);
  }

  /**
   * Submit application form
   */
  async submitForm(dto: SubmitFormDto): Promise<FormSubmission> {
    const form = await this.formRepository.findOne({
      where: { id: dto.formId, isActive: true },
      relations: ['job'],
    });

    if (!form) {
      throw new NotFoundException('Application form not found');
    }

    // Validate required fields
    this.validateSubmission(form.fields, dto.data);

    // Check if multiple submissions allowed
    if (!form.settings.allowMultipleSubmissions && dto.candidateUserId) {
      const existingSubmission = await this.submissionRepository.findOne({
        where: {
          formId: dto.formId,
          candidateUserId: dto.candidateUserId,
        },
      });

      if (existingSubmission) {
        throw new BadRequestException('You have already submitted an application for this position');
      }
    }

    // Create submission
    const submission = this.submissionRepository.create({
      formId: dto.formId,
      candidateUserId: dto.candidateUserId,
      data: dto.data,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      tenantId: form.tenantId,
    });

    const savedSubmission = await this.submissionRepository.save(submission);

    // Increment submission count
    form.submissionCount++;
    await this.formRepository.save(form);

    // Create candidate and application if job exists
    if (form.jobId) {
      await this.processSubmissionIntoApplication(savedSubmission, form);
    }

    this.logger.log(`Form submission received: ${savedSubmission.id}`);

    return savedSubmission;
  }

  /**
   * Get form submissions
   */
  async getSubmissions(
    formId: string,
    tenantId: string,
    filters?: {
      status?: SubmissionStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<FormSubmission[]> {
    const query = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.candidateUser', 'candidateUser')
      .leftJoinAndSelect('submission.application', 'application')
      .where('submission.formId = :formId', { formId })
      .andWhere('submission.tenantId = :tenantId', { tenantId });

    if (filters?.status) {
      query.andWhere('submission.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('submission.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('submission.createdAt <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('submission.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string,
    tenantId: string,
    status: SubmissionStatus,
    reviewerNotes?: string,
  ): Promise<FormSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, tenantId },
      relations: ['application'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.status = status;
    if (reviewerNotes) {
      submission.reviewerNotes = reviewerNotes;
    }

    // Update linked application if exists
    if (submission.application) {
      const appStatus = this.mapSubmissionStatusToApplicationStatus(status);
      if (appStatus) {
        submission.application.status = appStatus;
        await this.applicationRepository.save(submission.application);
      }
    }

    return this.submissionRepository.save(submission);
  }

  /**
   * Get form analytics
   */
  async getFormAnalytics(formId: string, tenantId: string): Promise<any> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const submissions = await this.submissionRepository.find({
      where: { formId },
    });

    const statusCounts = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgMatchScore = submissions
      .filter(s => s.aiMatchScore)
      .reduce((sum, s) => sum + Number(s.aiMatchScore), 0) / submissions.filter(s => s.aiMatchScore).length;

    return {
      totalSubmissions: form.submissionCount,
      statusBreakdown: statusCounts,
      averageMatchScore: avgMatchScore || 0,
      conversionRate: form.submissionCount > 0
        ? ((statusCounts[SubmissionStatus.ACCEPTED] || 0) / form.submissionCount) * 100
        : 0,
      recentSubmissions: submissions.slice(0, 10),
    };
  }

  /**
   * Private helper methods
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private validateSubmission(fields: FormField[], data: SubmissionData): void {
    for (const field of fields) {
      if (field.required && !data[field.id]) {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }

      // Additional validation based on field type
      if (data[field.id]) {
        switch (field.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field.id])) {
              throw new BadRequestException(`Invalid email format for "${field.label}"`);
            }
            break;
          case 'phone':
            if (!/^\+?[\d\s-()]+$/.test(data[field.id])) {
              throw new BadRequestException(`Invalid phone format for "${field.label}"`);
            }
            break;
        }
      }
    }
  }

  private async processSubmissionIntoApplication(
    submission: FormSubmission,
    form: ApplicationForm,
  ): Promise<void> {
    try {
      // Extract email from submission data
      const emailField = form.fields.find(f => f.type === 'email');
      const email = emailField ? submission.data[emailField.id] : null;

      if (!email) {
        this.logger.warn('No email found in submission, skipping candidate creation');
        return;
      }

      // Create or find candidate
      let candidate = await this.candidateRepository.findOne({
        where: { email, tenantId: form.tenantId },
      });

      if (!candidate) {
        const nameFields = this.extractNameFromSubmission(form.fields, submission.data);

        candidate = this.candidateRepository.create({
          email,
          firstName: nameFields.firstName,
          lastName: nameFields.lastName,
          phone: this.extractPhoneFromSubmission(form.fields, submission.data),
          location: this.extractLocationFromSubmission(form.fields, submission.data),
          skills: [],
          tenantId: form.tenantId,
        });

        candidate = await this.candidateRepository.save(candidate);
      }

      // Create resume if provided
      if (submission.resumeUrl) {
        const resume = this.resumeRepository.create({
          candidateId: candidate.id,
          fileUrl: submission.resumeUrl,
          rawText: submission.coverLetter || '',
          isParsed: false,
        });
        await this.resumeRepository.save(resume);
      }

      // Create application
      const application = this.applicationRepository.create({
        jobId: form.jobId,
        candidateId: candidate.id,
        status: ApplicationStatus.APPLIED,
      });

      const savedApplication = await this.applicationRepository.save(application);

      // Link submission to application
      submission.applicationId = savedApplication.id;
      await this.submissionRepository.save(submission);

      // Perform AI analysis if job description available
      if (form.job && submission.resumeUrl) {
        this.performAIAnalysis(submission, form.job.description).catch(err => {
          this.logger.error('Failed to perform AI analysis:', err);
        });
      }
    } catch (error) {
      this.logger.error('Failed to process submission into application:', error);
    }
  }

  private async performAIAnalysis(submission: FormSubmission, jobDescription: string): Promise<void> {
    try {
      // Fetch resume text (simplified - would need actual implementation)
      const resumeText = submission.coverLetter || '';

      if (!resumeText) return;

      const analysis = await this.aiService.analyzeResume(resumeText, jobDescription);

      submission.aiMatchScore = analysis.matchScore;
      submission.aiAnalysis = {
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        recommendation: analysis.recommendation,
      };

      await this.submissionRepository.save(submission);
    } catch (error) {
      this.logger.error('AI analysis failed:', error);
    }
  }

  private extractNameFromSubmission(fields: FormField[], data: SubmissionData): { firstName: string; lastName: string } {
    const firstNameField = fields.find(f => f.label.toLowerCase().includes('first name'));
    const lastNameField = fields.find(f => f.label.toLowerCase().includes('last name'));
    const fullNameField = fields.find(f => f.label.toLowerCase().includes('name') && !f.label.toLowerCase().includes('first') && !f.label.toLowerCase().includes('last'));

    if (firstNameField && lastNameField) {
      return {
        firstName: data[firstNameField.id] || 'Unknown',
        lastName: data[lastNameField.id] || '',
      };
    } else if (fullNameField) {
      const parts = (data[fullNameField.id] || 'Unknown').split(' ');
      return {
        firstName: parts[0] || 'Unknown',
        lastName: parts.slice(1).join(' ') || '',
      };
    }

    return { firstName: 'Unknown', lastName: '' };
  }

  private extractPhoneFromSubmission(fields: FormField[], data: SubmissionData): string | null {
    const phoneField = fields.find(f => f.type === 'phone' || f.label.toLowerCase().includes('phone'));
    return phoneField ? data[phoneField.id] : null;
  }

  private extractLocationFromSubmission(fields: FormField[], data: SubmissionData): string | null {
    const locationField = fields.find(f => f.label.toLowerCase().includes('location') || f.label.toLowerCase().includes('city'));
    return locationField ? data[locationField.id] : null;
  }

  private mapSubmissionStatusToApplicationStatus(status: SubmissionStatus): ApplicationStatus | null {
    const map: Record<SubmissionStatus, ApplicationStatus | null> = {
      [SubmissionStatus.SUBMITTED]: ApplicationStatus.APPLIED,
      [SubmissionStatus.UNDER_REVIEW]: ApplicationStatus.SCREENING,
      [SubmissionStatus.SHORTLISTED]: ApplicationStatus.SHORTLISTED,
      [SubmissionStatus.REJECTED]: ApplicationStatus.REJECTED,
      [SubmissionStatus.INTERVIEW_SCHEDULED]: ApplicationStatus.INTERVIEW,
      [SubmissionStatus.OFFER]: ApplicationStatus.OFFER,
      [SubmissionStatus.ACCEPTED]: ApplicationStatus.HIRED,
      [SubmissionStatus.DECLINED]: ApplicationStatus.REJECTED,
    };

    return map[status] || null;
  }
}
