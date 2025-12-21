import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('cost_centers')
@Index(['tenantId', 'code'], { unique: true })
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string;

  @Column({ name: 'budget_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetAmount: number;

  @Column({ name: 'used_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  usedAmount: number;

  @Column({ name: 'reserved_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  reservedAmount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'fiscal_year', type: 'int' })
  fiscalYear: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed property for available budget
  get availableBudget(): number {
    return this.budgetAmount - this.usedAmount - this.reservedAmount;
  }
}
