import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Tenant } from './entities/tenant.entity';
import { User, UserRole } from './entities/user.entity';
import { Job, JobStatus } from './entities/job.entity';
import { Candidate } from './entities/candidate.entity';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Interview, InterviewStatus, InterviewType } from './entities/interview.entity';
import { ActivityFeed, ActivityType } from './entities/activity-feed.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(ActivityFeed)
    private activityRepository: Repository<ActivityFeed>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Auto-seed in development mode
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const autoSeed = this.configService.get<string>('AUTO_SEED') === 'true';

    if (nodeEnv === 'development' || autoSeed) {
      await this.seed();
    }
  }

  async seed() {
    this.logger.log('Starting database seeding...');

    try {
      // Check if already seeded
      const existingTenant = await this.tenantRepository.findOne({
        where: { name: 'default-tenant' },
      });

      if (existingTenant) {
        this.logger.log('Database already seeded, skipping...');
        return { success: true, message: 'Already seeded' };
      }

      // 1. Create default tenant
      const tenant = await this.createTenant();

      // 2. Create admin user
      await this.createAdminUser(tenant.id);

      // 3. Create sample jobs
      const jobs = await this.createJobs(tenant.id);

      // 4. Create sample candidates
      const candidates = await this.createCandidates(tenant.id);

      // 5. Create applications
      const applications = await this.createApplications(jobs, candidates);

      // 6. Create interviews
      await this.createInterviews(applications);

      // 7. Create activity feed entries
      await this.createActivities(tenant.id, jobs, candidates);

      this.logger.log('Database seeding completed successfully!');
      return { success: true, message: 'Seeded successfully' };
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async createTenant(): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      id: 'default-tenant',
      name: 'Workera Demo',
      domain: 'demo.workera.ai',
      logo: '/images/brand/Workera_logo_icon.png',
      settings: {
        theme: 'light',
        primaryColor: '#10B981',
        brandName: 'Workera',
      },
      isActive: true,
    });

    return this.tenantRepository.save(tenant);
  }

  private async createAdminUser(tenantId: string): Promise<User> {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = this.userRepository.create({
      email: 'admin@workera.ai',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: UserRole.ADMIN,
      avatar: 'https://i.pravatar.cc/100?img=5',
      tenantId,
    });

    return this.userRepository.save(user);
  }

  private async createJobs(tenantId: string): Promise<Job[]> {
    const jobsData = [
      {
        title: 'Senior Frontend Engineer',
        description: 'We are looking for a Senior Frontend Engineer to join our team. You will work on building modern web applications using React, TypeScript, and Next.js. The ideal candidate has 5+ years of experience and a passion for creating beautiful, performant user interfaces.',
        company: 'Workera',
        status: JobStatus.POSTED,
        channels: ['LinkedIn', 'Indeed', 'Company Website'],
        requirements: ['5+ years React experience', 'TypeScript proficiency', 'Next.js knowledge', 'Strong CSS skills'],
        location: 'Remote',
        salary: '$150,000 - $180,000',
        tenantId,
      },
      {
        title: 'Product Designer',
        description: 'Join our design team to create intuitive and engaging user experiences. You will work closely with product managers and engineers to design features that delight our users.',
        company: 'Workera',
        status: JobStatus.POSTED,
        channels: ['LinkedIn', 'Dribbble'],
        requirements: ['4+ years UX/UI experience', 'Figma expertise', 'Design system experience', 'User research skills'],
        location: 'New York, NY',
        salary: '$130,000 - $160,000',
        tenantId,
      },
      {
        title: 'Backend Developer',
        description: 'We need a skilled Backend Developer to build robust APIs and services. You will work with Node.js, PostgreSQL, and cloud technologies to power our platform.',
        company: 'Workera',
        status: JobStatus.POSTED,
        channels: ['LinkedIn', 'Indeed'],
        requirements: ['4+ years Node.js experience', 'PostgreSQL/MySQL', 'REST API design', 'Cloud experience (AWS/GCP)'],
        location: 'San Francisco, CA',
        salary: '$140,000 - $170,000',
        tenantId,
      },
      {
        title: 'Product Manager',
        description: 'Lead product development for our core platform. Work with cross-functional teams to define product strategy, prioritize features, and deliver value to customers.',
        company: 'Workera',
        status: JobStatus.POSTED,
        channels: ['LinkedIn'],
        requirements: ['5+ years PM experience', 'B2B SaaS background', 'Data-driven mindset', 'Strong communication'],
        location: 'Remote',
        salary: '$160,000 - $190,000',
        tenantId,
      },
      {
        title: 'DevOps Engineer',
        description: 'Build and maintain our cloud infrastructure. Implement CI/CD pipelines, monitoring, and security best practices.',
        company: 'Workera',
        status: JobStatus.POSTED,
        channels: ['LinkedIn', 'Indeed'],
        requirements: ['3+ years DevOps experience', 'Kubernetes', 'Terraform', 'AWS/GCP'],
        location: 'Austin, TX',
        salary: '$130,000 - $160,000',
        tenantId,
      },
      {
        title: 'Marketing Specialist',
        description: 'Drive growth through creative marketing campaigns. Manage social media, content marketing, and demand generation initiatives.',
        company: 'Workera',
        status: JobStatus.DRAFT,
        channels: [],
        requirements: ['3+ years marketing experience', 'Content creation', 'Analytics', 'B2B marketing'],
        location: 'Remote',
        salary: '$80,000 - $110,000',
        tenantId,
      },
    ];

    const jobs: Job[] = [];
    for (const jobData of jobsData) {
      const job = this.jobRepository.create(jobData);
      jobs.push(await this.jobRepository.save(job));
    }

    return jobs;
  }

  private async createCandidates(tenantId: string): Promise<Candidate[]> {
    const candidatesData = [
      {
        email: 'alice.smith@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Node.js'],
        linkedin: 'https://linkedin.com/in/alicesmith',
        github: 'https://github.com/alicesmith',
        tenantId,
      },
      {
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        skills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
        linkedin: 'https://linkedin.com/in/bobjohnson',
        github: 'https://github.com/bobjohnson',
        tenantId,
      },
      {
        email: 'charlie.brown@example.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        phone: '+1 (555) 345-6789',
        location: 'Austin, TX',
        skills: ['Product Management', 'Agile', 'Data Analysis', 'User Research'],
        linkedin: 'https://linkedin.com/in/charliebrown',
        tenantId,
      },
      {
        email: 'diana.prince@example.com',
        firstName: 'Diana',
        lastName: 'Prince',
        phone: '+1 (555) 456-7890',
        location: 'Remote',
        skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
        linkedin: 'https://linkedin.com/in/dianaprince',
        portfolio: 'https://dianaprince.design',
        tenantId,
      },
      {
        email: 'evan.wright@example.com',
        firstName: 'Evan',
        lastName: 'Wright',
        phone: '+1 (555) 567-8901',
        location: 'Seattle, WA',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
        linkedin: 'https://linkedin.com/in/evanwright',
        github: 'https://github.com/evanwright',
        tenantId,
      },
      {
        email: 'fiona.garcia@example.com',
        firstName: 'Fiona',
        lastName: 'Garcia',
        phone: '+1 (555) 678-9012',
        location: 'Chicago, IL',
        skills: ['DevOps', 'Terraform', 'AWS', 'CI/CD', 'Kubernetes'],
        linkedin: 'https://linkedin.com/in/fionagarcia',
        tenantId,
      },
      {
        email: 'george.lee@example.com',
        firstName: 'George',
        lastName: 'Lee',
        phone: '+1 (555) 789-0123',
        location: 'Boston, MA',
        skills: ['React', 'Vue.js', 'JavaScript', 'GraphQL'],
        linkedin: 'https://linkedin.com/in/georgelee',
        github: 'https://github.com/georgelee',
        tenantId,
      },
      {
        email: 'helen.kim@example.com',
        firstName: 'Helen',
        lastName: 'Kim',
        phone: '+1 (555) 890-1234',
        location: 'Los Angeles, CA',
        skills: ['Marketing', 'Content Strategy', 'SEO', 'Analytics'],
        linkedin: 'https://linkedin.com/in/helenkim',
        tenantId,
      },
    ];

    const candidates: Candidate[] = [];
    for (const candidateData of candidatesData) {
      const candidate = this.candidateRepository.create(candidateData);
      candidates.push(await this.candidateRepository.save(candidate));
    }

    return candidates;
  }

  private async createApplications(jobs: Job[], candidates: Candidate[]): Promise<Application[]> {
    const applications: Application[] = [];

    // Create varied applications
    const applicationConfigs = [
      { jobIndex: 0, candidateIndex: 0, status: ApplicationStatus.INTERVIEW, matchScore: 92 },
      { jobIndex: 0, candidateIndex: 6, status: ApplicationStatus.SCREENING, matchScore: 85 },
      { jobIndex: 1, candidateIndex: 3, status: ApplicationStatus.OFFER, matchScore: 95 },
      { jobIndex: 2, candidateIndex: 1, status: ApplicationStatus.INTERVIEW, matchScore: 88 },
      { jobIndex: 2, candidateIndex: 4, status: ApplicationStatus.APPLIED, matchScore: 72 },
      { jobIndex: 3, candidateIndex: 2, status: ApplicationStatus.SHORTLISTED, matchScore: 90 },
      { jobIndex: 4, candidateIndex: 5, status: ApplicationStatus.INTERVIEW, matchScore: 94 },
      { jobIndex: 0, candidateIndex: 1, status: ApplicationStatus.REJECTED, matchScore: 45 },
      { jobIndex: 1, candidateIndex: 7, status: ApplicationStatus.APPLIED, matchScore: 60 },
      { jobIndex: 3, candidateIndex: 0, status: ApplicationStatus.APPLIED, matchScore: 55 },
    ];

    for (const config of applicationConfigs) {
      const application = this.applicationRepository.create({
        jobId: jobs[config.jobIndex].id,
        candidateId: candidates[config.candidateIndex].id,
        status: config.status,
        matchScore: config.matchScore,
        aiAnalysis: {
          strengths: ['Relevant experience', 'Strong technical skills'],
          gaps: ['Could improve communication'],
          recommendation: config.matchScore > 80 ? 'Highly Recommended' : 'Consider',
        },
      });
      applications.push(await this.applicationRepository.save(application));
    }

    return applications;
  }

  private async createInterviews(applications: Application[]): Promise<void> {
    const interviewApplications = applications.filter(
      app => app.status === ApplicationStatus.INTERVIEW || app.status === ApplicationStatus.OFFER
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(14, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(11, 0, 0, 0);

    const schedules = [
      { date: tomorrow, type: InterviewType.VIDEO, status: InterviewStatus.SCHEDULED },
      { date: dayAfterTomorrow, type: InterviewType.PANEL, status: InterviewStatus.CONFIRMED },
      { date: nextWeek, type: InterviewType.TECHNICAL, status: InterviewStatus.SCHEDULED },
    ];

    for (let i = 0; i < interviewApplications.length && i < schedules.length; i++) {
      const interview = this.interviewRepository.create({
        applicationId: interviewApplications[i].id,
        type: schedules[i].type,
        status: schedules[i].status,
        scheduledAt: schedules[i].date,
        duration: 60,
        interviewers: [
          { name: 'Sarah Jenkins', email: 'sarah@workera.ai', role: 'Hiring Manager' },
          { name: 'Mike Chen', email: 'mike@workera.ai', role: 'Technical Lead' },
        ],
        location: 'Google Meet',
        notes: 'Please prepare for technical questions and a coding exercise.',
      });
      await this.interviewRepository.save(interview);
    }
  }

  private async createActivities(tenantId: string, jobs: Job[], candidates: Candidate[]): Promise<void> {
    const activities = [
      {
        tenantId,
        activityType: ActivityType.CANDIDATE_STATUS_CHANGED,
        actorName: 'Sarah Jenkins',
        actorEmail: 'sarah@workera.ai',
        entityType: 'candidate',
        entityId: candidates[0].id,
        entityName: `${candidates[0].firstName} ${candidates[0].lastName}`,
        description: `moved candidate to Interview stage`,
        isImportant: true,
      },
      {
        tenantId,
        activityType: ActivityType.JOB_POSTED,
        actorName: 'Mike Ross',
        actorEmail: 'mike@workera.ai',
        entityType: 'job',
        entityId: jobs[0].id,
        entityName: jobs[0].title,
        description: `posted job "${jobs[0].title}" to LinkedIn, Indeed`,
        isImportant: true,
      },
      {
        tenantId,
        activityType: ActivityType.RESUME_PARSED,
        actorName: 'System',
        entityType: 'candidate',
        entityId: candidates[1].id,
        entityName: `${candidates[1].firstName} ${candidates[1].lastName}`,
        description: `parsed resume and extracted skills`,
        isImportant: false,
      },
      {
        tenantId,
        activityType: ActivityType.INTERVIEW_SCHEDULED,
        actorName: 'Sarah Jenkins',
        actorEmail: 'sarah@workera.ai',
        entityType: 'interview',
        entityId: candidates[0].id,
        entityName: `${candidates[0].firstName} ${candidates[0].lastName}`,
        description: `scheduled interview for tomorrow at 10:00 AM`,
        isImportant: true,
      },
      {
        tenantId,
        activityType: ActivityType.CANDIDATE_APPLIED,
        actorName: 'System',
        entityType: 'application',
        entityId: candidates[2].id,
        entityName: `${candidates[2].firstName} ${candidates[2].lastName}`,
        description: `applied for Product Manager position`,
        isImportant: false,
      },
      {
        tenantId,
        activityType: ActivityType.OFFER_EXTENDED,
        actorName: 'Sarah Jenkins',
        actorEmail: 'sarah@workera.ai',
        entityType: 'candidate',
        entityId: candidates[3].id,
        entityName: `${candidates[3].firstName} ${candidates[3].lastName}`,
        description: `extended offer for Product Designer role`,
        isImportant: true,
      },
    ];

    for (const activityData of activities) {
      const activity = this.activityRepository.create(activityData);
      await this.activityRepository.save(activity);
    }
  }

  async clearDatabase(): Promise<void> {
    this.logger.warn('Clearing database...');

    // Delete in order to respect foreign key constraints
    await this.interviewRepository.delete({});
    await this.applicationRepository.delete({});
    await this.activityRepository.delete({});
    await this.candidateRepository.delete({});
    await this.jobRepository.delete({});
    await this.userRepository.delete({});
    await this.tenantRepository.delete({});

    this.logger.log('Database cleared');
  }

  async reseed(): Promise<{ success: boolean; message: string }> {
    await this.clearDatabase();
    return this.seed();
  }
}
