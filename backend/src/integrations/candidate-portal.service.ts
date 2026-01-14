import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateUser } from '../database/entities/candidate-user.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';
import { Job, JobStatus } from '../database/entities/job.entity';
import { WorkeraEmailService } from '../email/workera-email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

export interface RegisterCandidateDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tenantId: string;
}

export interface LoginCandidateDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
}

export interface CandidateAuthResponse {
  accessToken: string;
  candidate: Omit<CandidateUser, 'passwordHash'>;
}

@Injectable()
export class CandidatePortalService {
  private readonly logger = new Logger(CandidatePortalService.name);

  constructor(
    @InjectRepository(CandidateUser)
    private candidateUserRepository: Repository<CandidateUser>,
    @InjectRepository(FormSubmission)
    private submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private jwtService: JwtService,
    private emailService: WorkeraEmailService,
  ) {}

  /**
   * Register a new candidate
   */
  async register(dto: RegisterCandidateDto): Promise<CandidateAuthResponse> {
    // Check if candidate already exists
    const existing = await this.candidateUserRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create candidate user
    const candidate = this.candidateUserRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      emailVerificationToken,
      tenantId: dto.tenantId,
    });

    const savedCandidate = await this.candidateUserRepository.save(candidate);

    this.logger.log(`New candidate registered: ${savedCandidate.email}`);

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/portal/verify-email?token=${emailVerificationToken}`;
    try {
      await this.emailService.sendEmailVerification(
        savedCandidate.email,
        savedCandidate.firstName,
        verificationLink,
      );
      this.logger.log(`Verification email sent to: ${savedCandidate.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const accessToken = this.generateToken(savedCandidate);

    // Remove password hash from response
    const { passwordHash: _, ...candidateData } = savedCandidate;

    return {
      accessToken,
      candidate: candidateData as any,
    };
  }

  /**
   * Login candidate
   */
  async login(dto: LoginCandidateDto): Promise<CandidateAuthResponse> {
    // Find candidate with password
    const candidate = await this.candidateUserRepository
      .createQueryBuilder('candidate')
      .addSelect('candidate.passwordHash')
      .where('candidate.email = :email', { email: dto.email })
      .andWhere('candidate.tenantId = :tenantId', { tenantId: dto.tenantId })
      .getOne();

    if (!candidate) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, candidate.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    candidate.lastLoginAt = new Date();
    await this.candidateUserRepository.save(candidate);

    this.logger.log(`Candidate logged in: ${candidate.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(candidate);

    // Remove password hash from response
    const { passwordHash: _, ...candidateData } = candidate;

    return {
      accessToken,
      candidate: candidateData as any,
    };
  }

  /**
   * Get candidate profile
   */
  async getProfile(candidateId: string, tenantId: string): Promise<CandidateUser> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  /**
   * Update candidate profile
   */
  async updateProfile(
    candidateId: string,
    tenantId: string,
    updates: UpdateProfileDto,
  ): Promise<CandidateUser> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    Object.assign(candidate, updates);

    return this.candidateUserRepository.save(candidate);
  }

  /**
   * Change password
   */
  async changePassword(
    candidateId: string,
    tenantId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const candidate = await this.candidateUserRepository
      .createQueryBuilder('candidate')
      .addSelect('candidate.passwordHash')
      .where('candidate.id = :id', { id: candidateId })
      .andWhere('candidate.tenantId = :tenantId', { tenantId })
      .getOne();

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, candidate.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    candidate.passwordHash = await bcrypt.hash(newPassword, 10);

    await this.candidateUserRepository.save(candidate);

    this.logger.log(`Password changed for candidate: ${candidate.email}`);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, tenantId: string): Promise<void> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { email, tenantId },
    });

    if (!candidate) {
      // Don't reveal whether email exists
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    candidate.resetPasswordToken = resetToken;
    candidate.resetPasswordExpires = resetExpires;

    await this.candidateUserRepository.save(candidate);

    this.logger.log(`Password reset token generated for: ${email}`);

    // Send password reset email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/portal/reset-password?token=${resetToken}`;
    try {
      await this.emailService.sendPasswordReset(
        candidate.email,
        candidate.firstName,
        resetLink,
      );
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      // Don't fail if email fails - user can try again
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, tenantId: string): Promise<void> {
    const candidate = await this.candidateUserRepository
      .createQueryBuilder('candidate')
      .where('candidate.resetPasswordToken = :token', { token })
      .andWhere('candidate.tenantId = :tenantId', { tenantId })
      .andWhere('candidate.resetPasswordExpires > :now', { now: new Date() })
      .getOne();

    if (!candidate) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    candidate.passwordHash = await bcrypt.hash(newPassword, 10);
    candidate.resetPasswordToken = null;
    candidate.resetPasswordExpires = null;

    await this.candidateUserRepository.save(candidate);

    this.logger.log(`Password reset completed for: ${candidate.email}`);
  }

  /**
   * Get candidate's applications
   */
  async getMyApplications(
    candidateId: string,
    tenantId: string,
  ): Promise<FormSubmission[]> {
    return this.submissionRepository.find({
      where: { candidateUserId: candidateId, tenantId },
      relations: ['form', 'form.job', 'application'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get specific application details
   */
  async getApplicationDetails(
    candidateId: string,
    submissionId: string,
    tenantId: string,
  ): Promise<FormSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, candidateUserId: candidateId, tenantId },
      relations: ['form', 'form.job', 'application'],
    });

    if (!submission) {
      throw new NotFoundException('Application not found');
    }

    return submission;
  }

  /**
   * Withdraw application
   */
  async withdrawApplication(
    candidateId: string,
    submissionId: string,
    tenantId: string,
  ): Promise<void> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, candidateUserId: candidateId, tenantId },
    });

    if (!submission) {
      throw new NotFoundException('Application not found');
    }

    // Only allow withdrawal if not already rejected or accepted
    if (['rejected', 'accepted', 'declined'].includes(submission.status)) {
      throw new BadRequestException('Cannot withdraw application in current status');
    }

    submission.status = 'declined' as any;
    await this.submissionRepository.save(submission);

    this.logger.log(`Application withdrawn: ${submissionId}`);
  }

  /**
   * Browse available jobs
   */
  async browseJobs(
    tenantId: string,
    filters?: {
      location?: string;
      keywords?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ jobs: Job[]; total: number }> {
    const query = this.jobRepository
      .createQueryBuilder('job')
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('job.status = :status', { status: JobStatus.POSTED });

    if (filters?.location) {
      query.andWhere('job.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters?.keywords) {
      query.andWhere(
        '(job.title ILIKE :keywords OR job.description ILIKE :keywords)',
        { keywords: `%${filters.keywords}%` },
      );
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('job.createdAt', 'DESC');

    const jobs = await query.getMany();

    return { jobs, total };
  }

  /**
   * Get job details
   */
  async getJobDetails(jobId: string, tenantId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, tenantId, status: JobStatus.POSTED },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  /**
   * Get saved jobs for a candidate
   */
  async getSavedJobs(candidateId: string, tenantId: string): Promise<Job[]> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate || !candidate.savedJobIds || candidate.savedJobIds.length === 0) {
      return [];
    }

    const jobs = await this.jobRepository.find({
      where: candidate.savedJobIds.map(id => ({ id, tenantId, status: JobStatus.POSTED })),
    });

    return jobs;
  }

  /**
   * Save a job for a candidate
   */
  async saveJob(candidateId: string, jobId: string, tenantId: string): Promise<boolean> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      return false;
    }

    const savedJobIds = candidate.savedJobIds || [];
    if (!savedJobIds.includes(jobId)) {
      savedJobIds.push(jobId);
      candidate.savedJobIds = savedJobIds;
      await this.candidateUserRepository.save(candidate);
    }

    return true;
  }

  /**
   * Remove a saved job for a candidate
   */
  async unsaveJob(candidateId: string, jobId: string, tenantId: string): Promise<boolean> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      return false;
    }

    const savedJobIds = candidate.savedJobIds || [];
    candidate.savedJobIds = savedJobIds.filter(id => id !== jobId);
    await this.candidateUserRepository.save(candidate);

    return true;
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string, tenantId: string): Promise<void> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { emailVerificationToken: token, tenantId },
    });

    if (!candidate) {
      throw new BadRequestException('Invalid verification token');
    }

    candidate.isEmailVerified = true;
    candidate.emailVerificationToken = null;

    await this.candidateUserRepository.save(candidate);

    this.logger.log(`Email verified for: ${candidate.email}`);
  }

  /**
   * Private helper methods
   */
  private generateToken(candidate: CandidateUser): string {
    const payload = {
      sub: candidate.id,
      email: candidate.email,
      tenantId: candidate.tenantId,
      type: 'candidate',
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });
  }
}
