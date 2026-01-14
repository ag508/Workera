import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview, InterviewStatus, InterviewType, Application } from '../database/entities';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkeraEmailService } from '../email/workera-email.service';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private notificationsService: NotificationsService,
    private emailService: WorkeraEmailService,
  ) { }

  async scheduleInterview(data: {
    applicationId: string;
    type: InterviewType;
    scheduledAt: Date;
    durationMinutes?: number;
    meetingLink?: string;
    location?: string;
    notes?: string;
    interviewerId?: string;
    tenantId: string;
  }): Promise<Interview> {
    // Verify application exists and belongs to tenant
    const application = await this.applicationRepository.findOne({
      where: { id: data.applicationId },
      relations: ['candidate', 'job', 'job.tenant'],
    });

    if (!application || application.job.tenantId !== data.tenantId) {
      throw new NotFoundException('Application not found');
    }

    // Create interview
    const interview = this.interviewRepository.create({
      applicationId: data.applicationId,
      type: data.type,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes || 60,
      meetingLink: data.meetingLink,
      location: data.location,
      notes: data.notes,
      interviewerId: data.interviewerId,
      status: InterviewStatus.SCHEDULED,
    });

    const savedInterview = await this.interviewRepository.save(interview);

    // Send notification to candidate
    await this.notificationsService.sendInterviewInvitation({
      to: application.candidate.email,
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      jobTitle: application.job.title,
      companyName: application.job.company || 'the company',
      interviewDate: data.scheduledAt,
      interviewLink: data.meetingLink,
    });

    // Send branded interview scheduled email
    try {
      const scheduledDate = new Date(data.scheduledAt);
      await this.emailService.sendInterviewScheduled(application.candidate.email, {
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`.trim(),
        jobTitle: application.job.title,
        companyName: application.job.company || 'Workera',
        interviewDate: scheduledDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        interviewTime: scheduledDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        interviewType: data.type,
        duration: data.durationMinutes || 60,
        interviewers: data.interviewerId || 'Hiring Team',
        meetingLink: data.meetingLink,
        location: data.location,
        notes: data.notes,
      });
      this.logger.log(`Interview scheduled email sent to ${application.candidate.email}`);
    } catch (emailError) {
      this.logger.warn(`Failed to send interview scheduled email: ${emailError}`);
    }

    return savedInterview;
  }

  async getInterviewsByApplication(applicationId: string, tenantId: string): Promise<Interview[]> {
    const interviews = await this.interviewRepository.find({
      where: { applicationId },
      relations: ['application', 'application.job', 'application.job.tenant', 'interviewer'],
      order: { scheduledAt: 'ASC' },
    });

    // Filter by tenant
    return interviews.filter(i => i.application.job.tenantId === tenantId);
  }

  async getInterviewById(id: string, tenantId: string): Promise<Interview | null> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'application.job', 'application.job.tenant', 'application.candidate', 'interviewer'],
    });

    if (!interview || interview.application.job.tenantId !== tenantId) {
      return null;
    }

    return interview;
  }

  async updateInterviewStatus(
    id: string,
    status: InterviewStatus,
    tenantId: string,
  ): Promise<Interview | null> {
    const interview = await this.getInterviewById(id, tenantId);
    if (!interview) {
      return null;
    }

    interview.status = status;
    return await this.interviewRepository.save(interview);
  }

  async rescheduleInterview(
    id: string,
    newTime: Date,
    tenantId: string,
  ): Promise<Interview | null> {
    const interview = await this.getInterviewById(id, tenantId);
    if (!interview) {
      return null;
    }

    interview.scheduledAt = newTime;
    interview.status = InterviewStatus.RESCHEDULED;
    const updated = await this.interviewRepository.save(interview);

    // Send notification
    await this.notificationsService.sendInterviewInvitation({
      to: interview.application.candidate.email,
      candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
      jobTitle: interview.application.job.title,
      companyName: interview.application.job.company || 'the company',
      interviewDate: newTime,
      interviewLink: interview.meetingLink,
    });

    return updated;
  }

  async submitFeedback(
    id: string,
    feedback: {
      rating?: number;
      strengths?: string[];
      concerns?: string[];
      recommendation?: string;
      comments?: string;
    },
    tenantId: string,
  ): Promise<Interview | null> {
    const interview = await this.getInterviewById(id, tenantId);
    if (!interview) {
      return null;
    }

    interview.feedback = feedback;
    interview.status = InterviewStatus.COMPLETED;
    return await this.interviewRepository.save(interview);
  }

  async getUpcomingInterviews(tenantId: string): Promise<Interview[]> {
    const now = new Date();
    const interviews = await this.interviewRepository.find({
      where: [
        { status: InterviewStatus.SCHEDULED },
        { status: InterviewStatus.CONFIRMED },
      ],
      relations: ['application', 'application.job', 'application.job.tenant', 'application.candidate', 'interviewer'],
      order: { scheduledAt: 'ASC' },
    });

    // Filter by tenant and future dates
    return interviews.filter(
      i => i.application.job.tenantId === tenantId && i.scheduledAt > now
    );
  }

  async getAllInterviews(tenantId: string): Promise<Interview[]> {
    const interviews = await this.interviewRepository.find({
      relations: ['application', 'application.job', 'application.job.tenant', 'application.candidate', 'interviewer'],
      order: { scheduledAt: 'DESC' },
    });

    // Filter by tenant
    return interviews.filter(i => i.application?.job?.tenantId === tenantId);
  }

  async sendReminder(id: string, tenantId: string): Promise<boolean> {
    const interview = await this.getInterviewById(id, tenantId);
    if (!interview || !interview.application?.candidate) {
      return false;
    }

    try {
      await this.notificationsService.sendInterviewReminder({
        to: interview.application.candidate.email,
        candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
        jobTitle: interview.application.job?.title || 'Position',
        companyName: interview.application.job?.company || 'Company',
        interviewDate: interview.scheduledAt,
        interviewLink: interview.meetingLink,
        additionalInfo: {
          interviewType: interview.type,
          location: interview.location,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to send interview reminder:', error);
      return false;
    }
  }
}
