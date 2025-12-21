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
import { ApprovalStatus, ApprovalDecision, ApproverRole, SLAStatus } from './requisition.enums';
import { JobRequisition } from './job-requisition.entity';

@Entity('approval_transactions')
@Index(['requisitionId', 'approvalLevel'])
@Index(['approverUserId', 'status'])
@Index(['tenantId', 'status'])
@Index(['dueDate', 'status'])
export class ApprovalTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'requisition_id', type: 'uuid' })
  requisitionId: string;

  @ManyToOne(() => JobRequisition, (req) => req.approvals)
  @JoinColumn({ name: 'requisition_id' })
  requisition: JobRequisition;

  // ============================================================================
  // APPROVAL LEVEL & ROLE
  // ============================================================================

  @Column({ name: 'approval_level', type: 'int' })
  approvalLevel: number;  // 1 = first level, 2 = second, etc.

  @Column({
    name: 'approver_role',
    type: 'enum',
    enum: ApproverRole,
  })
  approverRole: ApproverRole;

  @Column({ name: 'approver_user_id', type: 'uuid' })
  approverUserId: string;

  @Column({ name: 'approver_name', length: 200 })
  approverName: string;

  @Column({ name: 'approver_email', length: 255 })
  approverEmail: string;

  // ============================================================================
  // STATUS & DECISION
  // ============================================================================

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({
    type: 'enum',
    enum: ApprovalDecision,
    nullable: true,
  })
  decision: ApprovalDecision;

  @Column({ type: 'text', nullable: true })
  comments: string;

  // ============================================================================
  // SLA TRACKING
  // ============================================================================

  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt: Date;

  @Column({
    name: 'sla_status',
    type: 'enum',
    enum: SLAStatus,
    default: SLAStatus.ON_TRACK,
  })
  slaStatus: SLAStatus;

  @Column({ name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @Column({ name: 'reminder_sent_at', type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  @Column({ name: 'escalated', default: false })
  escalated: boolean;

  @Column({ name: 'escalated_at', type: 'timestamp', nullable: true })
  escalatedAt: Date;

  @Column({ name: 'escalated_to_user_id', type: 'uuid', nullable: true })
  escalatedToUserId: string;

  // ============================================================================
  // DELEGATION
  // ============================================================================

  @Column({ name: 'delegated_from_user_id', type: 'uuid', nullable: true })
  delegatedFromUserId: string;

  @Column({ name: 'delegation_reason', type: 'text', nullable: true })
  delegationReason: string;

  // ============================================================================
  // RULE REFERENCE
  // ============================================================================

  @Column({ name: 'triggered_by_rule_id', type: 'uuid', nullable: true })
  triggeredByRuleId: string;

  @Column({ name: 'rule_condition', type: 'text', nullable: true })
  ruleCondition: string;  // Human-readable description of why this approval was required

  // ============================================================================
  // METADATA
  // ============================================================================

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
