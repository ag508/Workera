import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, OnboardingStep, CompanySize } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OTPService } from '../email/otp.service';
import { WorkeraEmailService } from '../email/workera-email.service';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  tenantId: string;
}

export interface OnboardingProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
}

export interface OnboardingCompanyDto {
  companyName: string;
  companyWebsite?: string;
  companySize?: CompanySize;
  industry?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface RequestOTPDto {
  email: string;
  tenantId: string;
}

export interface VerifyOTPDto {
  email: string;
  otpCode: string;
  tenantId: string;
}

export interface UserAuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OTPService,
    private emailService: WorkeraEmailService,
  ) {}

  /**
   * Register a new user (recruiter)
   */
  async register(dto: RegisterUserDto): Promise<UserAuthResponse> {
    // Check if user already exists
    const existing = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || UserRole.RECRUITER,
      tenantId: dto.tenantId,
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`New user registered: ${savedUser.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(savedUser);

    // Remove password from response
    const { password: _, ...userData } = savedUser;

    return {
      accessToken,
      user: userData as any,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginUserDto): Promise<UserAuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userData } = user;

    return {
      accessToken,
      user: userData as any,
    };
  }

  /**
   * Get user by ID
   */
  async findById(id: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, tenantId },
    });
  }

  /**
   * Get all users for a tenant
   */
  async findAll(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'isActive', 'createdAt'],
    });
  }

  /**
   * Validate user from JWT token
   */
  async validateUser(userId: string, tenantId: string): Promise<User | null> {
    return this.findById(userId, tenantId);
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      type: 'user',
    };

    const secret = process.env.JWT_SECRET || 'workera-jwt-secret-change-in-production';
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '8h',
    });
  }

  // ============================================================================
  // OTP AUTHENTICATION
  // ============================================================================

  /**
   * Request OTP for login
   */
  async requestLoginOTP(dto: RequestOTPDto): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: 'If the email exists, an OTP has been sent.' };
    }

    const result = await this.otpService.sendOTP(
      user.email,
      user.firstName || 'User',
      'login',
    );

    if (!result.success) {
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    this.logger.log(`Login OTP sent to: ${user.email}`);

    return {
      success: true,
      message: 'OTP sent to your email',
      expiresIn: result.expiresIn,
    };
  }

  /**
   * Verify OTP and login
   */
  async verifyOTPAndLogin(dto: VerifyOTPDto): Promise<UserAuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const verification = this.otpService.verifyOTP(dto.email, dto.otpCode, 'login');

    if (!verification.valid) {
      throw new UnauthorizedException(verification.error || 'Invalid OTP');
    }

    this.logger.log(`User logged in via OTP: ${user.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userData } = user;

    return {
      accessToken,
      user: userData as any,
    };
  }

  /**
   * Request OTP for registration (email verification)
   */
  async requestRegistrationOTP(email: string, firstName: string): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    const result = await this.otpService.sendOTP(email, firstName, 'register');

    if (!result.success) {
      throw new BadRequestException('Failed to send verification code. Please try again.');
    }

    this.logger.log(`Registration OTP sent to: ${email}`);

    return {
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: result.expiresIn,
    };
  }

  /**
   * Verify registration OTP and create user
   */
  async verifyOTPAndRegister(
    dto: RegisterUserDto & { otpCode: string },
  ): Promise<UserAuthResponse> {
    // Verify OTP first
    const verification = this.otpService.verifyOTP(dto.email, dto.otpCode, 'register');

    if (!verification.valid) {
      throw new UnauthorizedException(verification.error || 'Invalid verification code');
    }

    // Check if user already exists
    const existing = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with email verified and onboarding starting
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || UserRole.RECRUITER,
      tenantId: dto.tenantId,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      onboardingStep: OnboardingStep.PROFILE_INFO, // Start at profile info step
      onboardingCompleted: false,
      tutorialDismissed: false,
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`New user registered via OTP: ${savedUser.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(savedUser);

    // Remove password from response
    const { password: _, ...userData } = savedUser;

    return {
      accessToken,
      user: userData as any,
    };
  }

  /**
   * Request password reset OTP
   */
  async requestPasswordResetOTP(email: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { email, tenantId },
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true, message: 'If the email exists, a reset code has been sent.' };
    }

    const result = await this.otpService.sendOTP(email, user.firstName || 'User', 'password-reset');

    if (!result.success) {
      throw new BadRequestException('Failed to send reset code. Please try again.');
    }

    this.logger.log(`Password reset OTP sent to: ${email}`);

    return {
      success: true,
      message: 'Password reset code sent to your email',
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPasswordWithOTP(
    email: string,
    otpCode: string,
    newPassword: string,
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    const verification = this.otpService.verifyOTP(email, otpCode, 'password-reset');

    if (!verification.valid) {
      throw new UnauthorizedException(verification.error || 'Invalid reset code');
    }

    const user = await this.userRepository.findOne({
      where: { email, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    this.logger.log(`Password reset for: ${email}`);

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }

  // ============================================================================
  // ONBOARDING
  // ============================================================================

  /**
   * Update user profile info (onboarding step 1)
   */
  async updateOnboardingProfile(
    userId: string,
    tenantId: string,
    dto: OnboardingProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update profile fields
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.jobTitle) user.jobTitle = dto.jobTitle;

    // Move to next step
    user.onboardingStep = OnboardingStep.COMPANY_INFO;

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User ${userId} completed profile onboarding step`);

    const { password: _, ...userData } = savedUser;
    return userData as User;
  }

  /**
   * Update company info (onboarding step 2)
   */
  async updateOnboardingCompany(
    userId: string,
    tenantId: string,
    dto: OnboardingCompanyDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update company fields
    user.companyName = dto.companyName;
    if (dto.companyWebsite) user.companyWebsite = dto.companyWebsite;
    if (dto.companySize) user.companySize = dto.companySize;
    if (dto.industry) user.industry = dto.industry;

    // Move to preferences or complete
    user.onboardingStep = OnboardingStep.PREFERENCES;

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User ${userId} completed company onboarding step`);

    const { password: _, ...userData } = savedUser;
    return userData as User;
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.onboardingStep = OnboardingStep.COMPLETED;
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User ${userId} completed onboarding`);

    // Send welcome email after onboarding complete
    await this.emailService.sendWelcomeRecruiter(
      savedUser.email,
      savedUser.firstName || 'there',
      process.env.FRONTEND_URL || 'http://localhost:3000/dashboard',
    );

    const { password: _, ...userData } = savedUser;
    return userData as User;
  }

  /**
   * Skip onboarding (for users who want to set up later)
   */
  async skipOnboarding(userId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark as completed but with minimal info
    user.onboardingStep = OnboardingStep.COMPLETED;
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User ${userId} skipped onboarding`);

    const { password: _, ...userData } = savedUser;
    return userData as User;
  }

  /**
   * Dismiss tutorial
   */
  async dismissTutorial(userId: string, tenantId: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.tutorialDismissed = true;
    await this.userRepository.save(user);

    this.logger.log(`User ${userId} dismissed tutorial`);

    return { success: true };
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(userId: string, tenantId: string): Promise<{
    step: OnboardingStep;
    completed: boolean;
    tutorialDismissed: boolean;
    profile: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      jobTitle?: string;
    };
    company: {
      companyName?: string;
      companyWebsite?: string;
      companySize?: CompanySize;
      industry?: string;
    };
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      step: user.onboardingStep,
      completed: user.onboardingCompleted,
      tutorialDismissed: user.tutorialDismissed,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        jobTitle: user.jobTitle,
      },
      company: {
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        industry: user.industry,
      },
    };
  }
}
