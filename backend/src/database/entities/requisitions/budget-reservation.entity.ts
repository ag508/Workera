import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CostCenter } from './cost-center.entity';
import { JobRequisition } from './job-requisition.entity';

/**
 * Budget Reservation
 *
 * Tracks budget reservations for requisitions.
 * Budget is reserved on submission, confirmed on approval, released on rejection/cancellation.
 */
@Entity('budget_reservations')
@Index(['requisitionId'])
@Index(['costCenterId', 'status'])
@Index(['tenantId', 'createdAt'])
export class BudgetReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'requisition_id', type: 'uuid' })
  requisitionId: string;

  @ManyToOne(() => JobRequisition)
  @JoinColumn({ name: 'requisition_id' })
  requisition: JobRequisition;

  @Column({ name: 'cost_center_id', type: 'uuid' })
  costCenterId: string;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;

  // ============================================================================
  // AMOUNTS
  // ============================================================================

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['RESERVED', 'CONFIRMED', 'RELEASED', 'PARTIALLY_USED', 'FULLY_USED'],
    default: 'RESERVED',
  })
  status: string;

  // ============================================================================
  // CALCULATION BASIS
  // ============================================================================

  @Column({ type: 'int' })
  headcount: number;

  @Column({ name: 'salary_per_head', type: 'decimal', precision: 15, scale: 2 })
  salaryPerHead: number;

  @Column({ name: 'includes_bonus', default: false })
  includesBonus: boolean;

  @Column({ name: 'includes_benefits', default: false })
  includesBenefits: boolean;

  @Column({ name: 'benefits_multiplier', type: 'decimal', precision: 5, scale: 2, default: 1.3 })
  benefitsMultiplier: number;  // e.g., 1.3 = 30% benefits load

  @Column({ type: 'text', nullable: true })
  notes: string;

  // ============================================================================
  // TRACKING
  // ============================================================================

  @Column({ name: 'reserved_at', type: 'timestamp' })
  reservedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date;

  @Column({ name: 'released_reason', type: 'text', nullable: true })
  releasedReason: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
