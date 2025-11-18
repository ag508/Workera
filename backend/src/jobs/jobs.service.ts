import { Injectable } from '@nestjs/common';

export interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  status: 'draft' | 'posted';
  channels: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class JobsService {
  private jobs: Job[] = [];

  createJob(title: string, description: string, company?: string): Job {
    const job: Job = {
      id: Date.now().toString(),
      title,
      description,
      company,
      status: 'draft',
      channels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.push(job);
    return job;
  }

  getAllJobs(): Job[] {
    return this.jobs;
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const job = this.getJobById(id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date() });
      return job;
    }
    return undefined;
  }

  postJob(id: string, channels: string[]): Job | undefined {
    const job = this.updateJob(id, { status: 'posted', channels });
    return job;
  }
}
