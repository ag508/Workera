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
import { HiringTeamRole } from './requisition.enums';
import { JobRequisition } from './job-requisition.entity';

@Entity('hiring_team_members')
@Index(['requisitionId', 'userId'], { unique: true })
@Index(['userId', 'role'])
export class HiringTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'requisition_id', type: 'uuid' })
  requisitionId: string;

  @ManyToOne(() => JobRequisition, (req) => req.hiringTeam)
  @JoinColumn({ name: 'requisition_id' })
  requisition: JobRequisition;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'user_name', length: 200 })
  userName: string;

  @Column({ name: 'user_email', length: 255 })
  userEmail: string;

  @Column({
    type: 'enum',
    enum: HiringTeamRole,
  })
  role: HiringTeamRole;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;  // Primary contact for this role

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'added_by', type: 'uuid' })
  addedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
