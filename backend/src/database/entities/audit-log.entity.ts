import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum AuditEntityType {
  CANDIDATE = 'candidate',
  JOB = 'job',
  APPLICATION = 'application',
  RESUME = 'resume',
  INTERVIEW = 'interview',
  USER = 'user',
  TENANT = 'tenant',
}

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['entityType', 'entityId'])
@Index(['userId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ type: 'simple-enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'simple-enum', enum: AuditEntityType })
  entityType: AuditEntityType;

  @Column()
  entityId: string;

  @Column({ type: 'simple-json', nullable: true })
  previousData: any;

  @Column({ type: 'simple-json', nullable: true })
  newData: any;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
    changes?: string[];
  };

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isSensitive: boolean;

  @Column({ nullable: true })
  sessionId: string;
}
