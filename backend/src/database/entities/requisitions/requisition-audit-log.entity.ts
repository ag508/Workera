import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AuditAction } from './requisition.enums';

/**
 * Requisition Audit Log - IMMUTABLE
 *
 * This table is append-only for compliance. No UPDATE or DELETE operations allowed.
 * Every action on a requisition is logged with complete context.
 */
@Entity('requisition_audit_logs')
@Index(['requisitionId', 'createdAt'])
@Index(['tenantId', 'createdAt'])
@Index(['changedBy', 'createdAt'])
@Index(['action', 'createdAt'])
export class RequisitionAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'requisition_id', type: 'uuid' })
  requisitionId: string;

  @Column({ name: 'requisition_number', length: 50 })
  requisitionNumber: string;

  // ============================================================================
  // ACTION DETAILS
  // ============================================================================

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ name: 'action_description', type: 'text' })
  actionDescription: string;  // Human-readable description

  // ============================================================================
  // CHANGE DETAILS
  // ============================================================================

  @Column({ name: 'field_name', length: 100, nullable: true })
  fieldName: string;  // Which field was changed

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue: string;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue: string;

  @Column({ name: 'changes', type: 'jsonb', nullable: true })
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];  // For bulk changes

  // ============================================================================
  // USER & CONTEXT
  // ============================================================================

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @Column({ name: 'changed_by_name', length: 200 })
  changedByName: string;

  @Column({ name: 'changed_by_email', length: 255 })
  changedByEmail: string;

  @Column({ name: 'changed_by_role', length: 100, nullable: true })
  changedByRole: string;

  // ============================================================================
  // REQUEST METADATA
  // ============================================================================

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  requestId: string;  // For request tracing

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string;

  // ============================================================================
  // TIMESTAMP (No UpdateDateColumn - immutable)
  // ============================================================================

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'server_timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  serverTimestamp: Date;
}
