import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApproverRole, RequisitionType } from './requisition.enums';

/**
 * Approval Rule Configuration
 *
 * Defines when specific approvals are required based on requisition attributes.
 * Rules are evaluated in order of priority to build the approval chain.
 */
@Entity('approval_rules')
@Index(['tenantId', 'isActive', 'priority'])
export class ApprovalRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 50 })
  code: string;  // Unique rule identifier e.g., "R001"

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ============================================================================
  // RULE CONDITIONS (When to apply)
  // ============================================================================

  @Column({
    name: 'condition_type',
    type: 'enum',
    enum: ['ALL', 'REQUISITION_TYPE', 'SALARY_THRESHOLD', 'GRADE_LEVEL', 'HEADCOUNT', 'DEPARTMENT', 'COST_CENTER', 'CUSTOM'],
    default: 'ALL',
  })
  conditionType: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    // Requisition type conditions
    requisitionTypes?: RequisitionType[];

    // Salary conditions
    salaryOperator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
    salaryValue?: number;
    salaryCompareToGrade?: boolean;  // Compare to grade max
    salaryGradeMultiplier?: number;  // e.g., 0.75 for 75% of grade max

    // Grade level conditions
    gradeLevel?: number;
    gradeLevelOperator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';

    // Headcount conditions
    headcountOperator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
    headcountValue?: number;

    // Department/Cost Center conditions
    departmentIds?: string[];
    costCenterIds?: string[];
    businessUnitIds?: string[];

    // Custom expression (for advanced use)
    customExpression?: string;
  };

  // ============================================================================
  // RULE ACTION (What to do when condition matches)
  // ============================================================================

  @Column({
    name: 'approver_role',
    type: 'enum',
    enum: ApproverRole,
  })
  approverRole: ApproverRole;

  @Column({ name: 'approval_level', type: 'int' })
  approvalLevel: number;  // Which level in the chain

  @Column({ name: 'specific_user_id', type: 'uuid', nullable: true })
  specificUserId: string;  // For CUSTOM role, specific user to assign

  @Column({ name: 'fallback_user_id', type: 'uuid', nullable: true })
  fallbackUserId: string;  // If primary approver unavailable

  @Column({ name: 'sla_hours', type: 'int', default: 120 })
  slaHours: number;  // SLA in hours (default 5 business days = 120 hours)

  @Column({ name: 'escalation_enabled', default: true })
  escalationEnabled: boolean;

  @Column({ name: 'escalation_hours', type: 'int', default: 48 })
  escalationHours: number;  // Hours before escalation

  @Column({ name: 'escalation_user_id', type: 'uuid', nullable: true })
  escalationUserId: string;

  // ============================================================================
  // RULE SETTINGS
  // ============================================================================

  @Column({ type: 'int', default: 100 })
  priority: number;  // Lower = higher priority

  @Column({ name: 'is_mandatory', default: true })
  isMandatory: boolean;

  @Column({ name: 'can_skip', default: false })
  canSkip: boolean;  // Allow skipping if approver unavailable

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  // ============================================================================
  // METADATA
  // ============================================================================

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
