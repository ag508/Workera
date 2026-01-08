import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private notificationsService: NotificationsService,
  ) { }

  async createJob(
    title: string,
    description: string,
    tenantId: string,
    company?: string,
    requirements?: string[]
  ): Promise<Job> {
    const job = this.jobRepository.create({
      title,
      description,
      company,
      tenantId,
      requirements: requirements || [],
      status: JobStatus.DRAFT,
      channels: [],
    });

    return await this.jobRepository.save(job);
  }

  async getAllJobs(tenantId: string): Promise<Job[]> {
    return await this.jobRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getJobById(id: string, tenantId: string): Promise<Job | null> {
    return await this.jobRepository.findOne({
      where: { id, tenantId },
    });
  }

  async updateJob(id: string, tenantId: string, updates: Partial<Job>): Promise<Job | null> {
    const job = await this.getJobById(id, tenantId);
    if (!job) {
      return null;
    }

    Object.assign(job, updates);
    return await this.jobRepository.save(job);
  }

  async postJob(
    id: string,
    tenantId: string,
    channels: string[],
    recruiterEmail?: string
  ): Promise<Job | null> {
    const job = await this.getJobById(id, tenantId);
    if (!job) {
      return null;
    }

    job.status = JobStatus.POSTED;
    job.channels = channels;
    const savedJob = await this.jobRepository.save(job);

    // Send notification to recruiter if email provided
    if (recruiterEmail) {
      await this.notificationsService.sendJobPostedConfirmation({
        to: recruiterEmail,
        candidateName: 'Recruiter', // In production, use actual user name from auth context
        jobTitle: job.title,
        companyName: job.company || 'your company',
        additionalInfo: { channels },
      });
    }

    return savedJob;
  }

  async deleteJob(id: string, tenantId: string): Promise<boolean> {
    const job = await this.getJobById(id, tenantId);
    if (!job) {
      return false;
    }

    await this.jobRepository.remove(job);
    return true;
  }

  async duplicateJob(id: string, tenantId: string): Promise<Job | null> {
    const job = await this.getJobById(id, tenantId);
    if (!job) {
      return null;
    }

    const duplicate = this.jobRepository.create({
      title: `${job.title} (Copy)`,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary,
      tenantId: job.tenantId,
      requirements: job.requirements || [],
      status: JobStatus.DRAFT,
      channels: [],
    });

    return await this.jobRepository.save(duplicate);
  }
}
