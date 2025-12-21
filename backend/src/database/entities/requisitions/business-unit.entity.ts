import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('business_units')
@Index(['tenantId', 'code'], { unique: true })
export class BusinessUnit {
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

  @Column({ name: 'head_user_id', type: 'uuid', nullable: true })
  headUserId: string;  // Business Unit Head

  @Column({ name: 'hrbp_user_id', type: 'uuid', nullable: true })
  hrbpUserId: string;  // Assigned HRBP

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
