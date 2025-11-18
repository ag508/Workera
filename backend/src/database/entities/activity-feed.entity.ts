import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ActivityType {
  CANDIDATE_CREATED = 'candidate_created',
  CANDIDATE_UPDATED = 'candidate_updated',
  RESUME_UPLOADED = 'resume_uploaded',
  RESUME_PARSED = 'resume_parsed',
  JOB_CREATED = 'job_created',
  JOB_POSTED = 'job_posted',
  JOB_CLOSED = 'job_closed',
  APPLICATION_CREATED = 'application_created',
  APPLICATION_STATUS_CHANGED = 'application_status_changed',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_COMPLETED = 'interview_completed',
  INTERVIEW_CANCELLED = 'interview_cancelled',
  FEEDBACK_SUBMITTED = 'feedback_submitted',
  CAMPAIGN_SENT = 'campaign_sent',
  BULK_IMPORT = 'bulk_import',
  DATA_EXPORTED = 'data_exported',
  CANDIDATE_DELETED = 'candidate_deleted',
}

@Entity('activity_feed')
@Index(['tenantId', 'createdAt'])
@Index(['actorId'])
@Index(['entityType', 'entityId'])
export class ActivityFeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'enum', enum: ActivityType })
  activityType: ActivityType;

  @Column({ nullable: true })
  actorId: string;

  @Column({ nullable: true })
  actorName: string;

  @Column({ nullable: true })
  actorEmail: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  entityName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    oldValue?: any;
    newValue?: any;
    changes?: string[];
    additionalInfo?: any;
  };

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ default: false })
  isImportant: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
