import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, Candidate, Application, Interview, ApplicationStatus, InterviewStatus, JobStatus } from '../database/entities';

export interface DashboardMetrics {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  totalApplications: number;
  upcomingInterviews: number;
}

export interface ApplicationStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface HiringFunnelMetrics {
  applied: number;
  screening: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

export interface TopSkill {
  skill: string;
  count: number;
}

export interface InterviewMetrics {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  averageRating?: number;
}

export interface JobPerformance {
  jobId: string;
  jobTitle: string;
  applicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  offersCount: number;
  hiredCount: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {}

  async getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    const [totalJobs, activeJobs, totalCandidates, totalApplications] = await Promise.all([
      this.jobRepository.count({ where: { tenantId } }),
      this.jobRepository.count({ where: { tenantId, status: JobStatus.POSTED } }),
      this.candidateRepository.count({ where: { tenantId } }),
      this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('job.tenantId = :tenantId', { tenantId })
        .getCount(),
    ]);

    const now = new Date();
    const interviews = await this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoin('interview.application', 'application')
      .leftJoin('application.job', 'job')
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('interview.scheduledAt > :now', { now })
      .andWhere('interview.status IN (:...statuses)', {
        statuses: [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED],
      })
      .getCount();

    return {
      totalJobs,
      activeJobs,
      totalCandidates,
      totalApplications,
      upcomingInterviews: interviews,
    };
  }

  async getApplicationStatusDistribution(tenantId: string): Promise<ApplicationStatusDistribution[]> {
    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('application.job', 'job')
      .where('job.tenantId = :tenantId', { tenantId })
      .groupBy('application.status')
      .getRawMany();

    const total = applications.reduce((sum, app) => sum + parseInt(app.count), 0);

    return applications.map(app => ({
      status: app.status,
      count: parseInt(app.count),
      percentage: total > 0 ? (parseInt(app.count) / total) * 100 : 0,
    }));
  }

  async getHiringFunnelMetrics(tenantId: string, jobId?: string): Promise<HiringFunnelMetrics> {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .where('job.tenantId = :tenantId', { tenantId });

    if (jobId) {
      queryBuilder.andWhere('application.jobId = :jobId', { jobId });
    }

    const applications = await queryBuilder.getMany();

    const funnel: HiringFunnelMetrics = {
      applied: 0,
      screening: 0,
      shortlisted: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    applications.forEach(app => {
      const status = app.status.toLowerCase();
      if (status in funnel) {
        funnel[status as keyof HiringFunnelMetrics]++;
      }
    });

    return funnel;
  }

  async getTopSkills(tenantId: string, limit: number = 10): Promise<TopSkill[]> {
    const candidates = await this.candidateRepository.find({
      where: { tenantId },
      select: ['skills'],
    });

    const skillCounts: Record<string, number> = {};

    candidates.forEach(candidate => {
      if (candidate.skills && Array.isArray(candidate.skills)) {
        candidate.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getInterviewMetrics(tenantId: string): Promise<InterviewMetrics> {
    const interviews = await this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoin('interview.application', 'application')
      .leftJoin('application.job', 'job')
      .where('job.tenantId = :tenantId', { tenantId })
      .getMany();

    const metrics: InterviewMetrics = {
      total: interviews.length,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };

    let totalRatings = 0;
    let ratingCount = 0;

    interviews.forEach(interview => {
      if (interview.status === InterviewStatus.SCHEDULED || interview.status === InterviewStatus.CONFIRMED) {
        metrics.scheduled++;
      } else if (interview.status === InterviewStatus.COMPLETED) {
        metrics.completed++;
        if (interview.feedback?.rating) {
          totalRatings += interview.feedback.rating;
          ratingCount++;
        }
      } else if (interview.status === InterviewStatus.CANCELLED) {
        metrics.cancelled++;
      }
    });

    if (ratingCount > 0) {
      metrics.averageRating = totalRatings / ratingCount;
    }

    return metrics;
  }

  async getJobPerformance(tenantId: string, limit: number = 10): Promise<JobPerformance[]> {
    const jobs = await this.jobRepository.find({
      where: { tenantId },
      relations: ['applications'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const performance = await Promise.all(
      jobs.map(async job => {
        const applications = await this.applicationRepository.find({
          where: { jobId: job.id },
        });

        return {
          jobId: job.id,
          jobTitle: job.title,
          applicationsCount: applications.length,
          shortlistedCount: applications.filter(a => a.status === ApplicationStatus.SHORTLISTED).length,
          interviewsCount: applications.filter(
            a => a.status === ApplicationStatus.INTERVIEW || a.status === ApplicationStatus.OFFER
          ).length,
          offersCount: applications.filter(a => a.status === ApplicationStatus.OFFER).length,
          hiredCount: applications.filter(a => a.status === ApplicationStatus.HIRED).length,
        };
      })
    );

    return performance.sort((a, b) => b.applicationsCount - a.applicationsCount);
  }

  async getTimeToHire(tenantId: string): Promise<{ averageDays: number; median: number }> {
    const hiredApplications = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('application.status = :status', { status: ApplicationStatus.HIRED })
      .getMany();

    if (hiredApplications.length === 0) {
      return { averageDays: 0, median: 0 };
    }

    const daysToHire = hiredApplications.map(app => {
      const start = new Date(app.createdAt);
      const end = new Date(app.updatedAt);
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });

    const average = daysToHire.reduce((sum, days) => sum + days, 0) / daysToHire.length;

    daysToHire.sort((a, b) => a - b);
    const median = daysToHire[Math.floor(daysToHire.length / 2)];

    return {
      averageDays: Math.round(average),
      median,
    };
  }

  async getApplicationTrends(
    tenantId: string,
    days: number = 30
  ): Promise<Array<{ date: string; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job', 'job')
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('application.createdAt >= :startDate', { startDate })
      .orderBy('application.createdAt', 'ASC')
      .getMany();

    const dailyCounts: Record<string, number> = {};

    applications.forEach(app => {
      const date = app.createdAt.toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  }
}
