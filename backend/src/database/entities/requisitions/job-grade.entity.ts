import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('job_grades')
@Index(['tenantId', 'code'], { unique: true })
export class JobGrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ length: 20 })
  code: string;  // e.g., "L1", "L2", "L3", etc.

  @Column({ length: 100 })
  name: string;  // e.g., "Entry Level", "Senior", "Principal"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  level: number;  // Numeric level for comparison (1, 2, 3, etc.)

  @Column({ name: 'salary_min', type: 'decimal', precision: 15, scale: 2 })
  salaryMin: number;

  @Column({ name: 'salary_max', type: 'decimal', precision: 15, scale: 2 })
  salaryMax: number;

  @Column({ name: 'salary_mid', type: 'decimal', precision: 15, scale: 2 })
  salaryMid: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'equity_min', type: 'int', nullable: true })
  equityMin: number;  // Minimum equity shares

  @Column({ name: 'equity_max', type: 'int', nullable: true })
  equityMax: number;  // Maximum equity shares

  @Column({ name: 'bonus_target_pct', type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusTargetPct: number;  // Target bonus as percentage of salary

  @Column({ name: 'requires_executive_approval', default: false })
  requiresExecutiveApproval: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
