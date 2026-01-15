import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  HIRING_MANAGER = 'hiring_manager',
  VIEWER = 'viewer'
}

export enum OnboardingStep {
  EMAIL_VERIFICATION = 'email_verification',
  PROFILE_INFO = 'profile_info',
  COMPANY_INFO = 'company_info',
  PREFERENCES = 'preferences',
  COMPLETED = 'completed'
}

export enum CompanySize {
  SOLO = '1',
  SMALL = '2-10',
  MEDIUM = '11-50',
  LARGE = '51-200',
  ENTERPRISE = '201-1000',
  MEGA = '1000+'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.RECRUITER
  })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  // Email verification
  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'datetime', nullable: true })
  emailVerifiedAt: Date;

  // Onboarding status
  @Column({
    type: 'simple-enum',
    enum: OnboardingStep,
    default: OnboardingStep.EMAIL_VERIFICATION
  })
  onboardingStep: OnboardingStep;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'datetime', nullable: true })
  onboardingCompletedAt: Date;

  // Tutorial dismissed
  @Column({ default: false })
  tutorialDismissed: boolean;

  // Company/Profile info (for recruiters)
  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyWebsite: string;

  @Column({
    type: 'simple-enum',
    enum: CompanySize,
    nullable: true
  })
  companySize: CompanySize;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Tenant, tenant => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
