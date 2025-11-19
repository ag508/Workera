import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Job } from './job.entity';
import { Tenant } from './tenant.entity';
import { FormSubmission } from './form-submission.entity';

export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'checkbox' | 'radio' | 'number';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select, multiselect, radio
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireLogin: boolean;
  showOtherJobs: boolean;
  autoSendConfirmationEmail: boolean;
  confirmationEmailTemplate?: string;
  redirectUrl?: string;
  customCss?: string;
  collectResume: boolean;
  collectCoverLetter: boolean;
}

@Entity('application_forms')
export class ApplicationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ nullable: true })
  jobId: string;

  @Column({ type: 'jsonb', default: [] })
  fields: FormField[];

  @Column({ type: 'jsonb', default: {} })
  settings: FormSettings;

  @Column({ default: true })
  isActive: boolean;

  @Column({ unique: true })
  slug: string; // For shareable URL like /apply/software-engineer-2024

  @Column({ type: 'text', nullable: true })
  welcomeMessage: string;

  @Column({ type: 'text', nullable: true })
  thankYouMessage: string;

  @Column({ default: 0 })
  submissionCount: number;

  @OneToMany(() => FormSubmission, submission => submission.form)
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
