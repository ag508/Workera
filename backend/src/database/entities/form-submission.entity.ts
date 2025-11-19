import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApplicationForm } from './application-form.entity';
import { CandidateUser } from './candidate-user.entity';
import { Application } from './application.entity';
import { Tenant } from './tenant.entity';

export interface SubmissionData {
  [fieldId: string]: any; // Dynamic form field responses
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER = 'offer',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ApplicationForm, form => form.submissions)
  @JoinColumn({ name: 'formId' })
  form: ApplicationForm;

  @Column()
  formId: string;

  @ManyToOne(() => CandidateUser, { nullable: true })
  @JoinColumn({ name: 'candidateUserId' })
  candidateUser: CandidateUser;

  @Column({ nullable: true })
  candidateUserId: string;

  @Column({ type: 'jsonb' })
  data: SubmissionData;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.SUBMITTED
  })
  status: SubmissionStatus;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'applicationId' })
  application: Application;

  @Column({ nullable: true })
  applicationId: string;

  @Column({ type: 'text', nullable: true })
  reviewerNotes: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiMatchScore: number;

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

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
