import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../database/entities';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

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

  async postJob(id: string, tenantId: string, channels: string[]): Promise<Job | null> {
    const job = await this.getJobById(id, tenantId);
    if (!job) {
      return null;
    }

    job.status = JobStatus.POSTED;
    job.channels = channels;
    return await this.jobRepository.save(job);
  }
}
