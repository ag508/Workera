import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { FormSubmission } from './form-submission.entity';
import { Tenant } from './tenant.entity';

@Entity('candidate_users')
export class CandidateUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ select: false }) // Don't return password in queries by default
  passwordHash: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'simple-json', nullable: true })
  skills: string[];

  @Column({ type: 'simple-json', nullable: true })
  savedJobIds: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => FormSubmission, submission => submission.candidateUser)
  submissions: FormSubmission[];

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
