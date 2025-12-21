import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import {
  RequisitionType,
  RequisitionStatus,
  RequisitionPriority,
  EmploymentType,
  WorkModel,
} from './requisition.enums';
import { BusinessUnit } from './business-unit.entity';
import { Department } from './department.entity';
import { Location } from './location.entity';
import { JobGrade } from './job-grade.entity';
import { CostCenter } from './cost-center.entity';
import { Position } from './position.entity';
import { ApprovalTransaction } from './approval-transaction.entity';
import { HiringTeamMember } from './hiring-team-member.entity';

@Entity('job_requisitions')
@Index(['tenantId', 'requisitionNumber'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'departmentId'])
@Index(['tenantId', 'hiringManagerId'])
@Index(['tenantId', 'createdAt'])
export class JobRequisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requisition_number', length: 50 })
  requisitionNumber: string;  // Auto-generated: REQ-{YEAR}-{SEQ}

  @Column({ name: 'tenant_id' })
  tenantId: string;

  // ============================================================================
  // REQUISITION TYPE & STATUS
  // ============================================================================

  @Column({
    name: 'requisition_type',
    type: 'enum',
    enum: RequisitionType,
    default: RequisitionType.POSITION_BASED,
  })
  requisitionType: RequisitionType;

  @Column({
    type: 'enum',
    enum: RequisitionStatus,
    default: RequisitionStatus.DRAFT,
  })
  status: RequisitionStatus;

  @Column({
    type: 'enum',
    enum: RequisitionPriority,
    default: RequisitionPriority.NORMAL,
  })
  priority: RequisitionPriority;

  // ============================================================================
  // ORGANIZATION
  // ============================================================================

  @Column({ name: 'business_unit_id', type: 'uuid' })
  businessUnitId: string;

  @ManyToOne(() => BusinessUnit)
  @JoinColumn({ name: 'business_unit_id' })
  businessUnit: BusinessUnit;

  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  // ============================================================================
  // JOB DETAILS
  // ============================================================================

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId: string;  // Reference to Job entity if created

  @Column({ name: 'position_id', type: 'uuid', nullable: true })
  positionId: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'job_title', length: 200 })
  jobTitle: string;

  @Column({ name: 'job_code', length: 50, nullable: true })
  jobCode: string;

  @Column({ name: 'job_family', length: 100, nullable: true })
  jobFamily: string;

  @Column({ name: 'job_grade_id', type: 'uuid' })
  jobGradeId: string;

  @ManyToOne(() => JobGrade)
  @JoinColumn({ name: 'job_grade_id' })
  jobGrade: JobGrade;

  @Column({ name: 'job_description', type: 'text', nullable: true })
  jobDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ type: 'jsonb', nullable: true })
  qualifications: string[];

  // ============================================================================
  // HIRING DETAILS
  // ============================================================================

  @Column({ type: 'int', default: 1 })
  headcount: number;

  @Column({ name: 'headcount_filled', type: 'int', default: 0 })
  headcountFilled: number;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({
    name: 'work_model',
    type: 'enum',
    enum: WorkModel,
    default: WorkModel.ONSITE,
  })
  workModel: WorkModel;

  @Column({ name: 'target_start_date', type: 'date' })
  targetStartDate: Date;

  @Column({ name: 'target_fill_date', type: 'date', nullable: true })
  targetFillDate: Date;

  // ============================================================================
  // REPLACEMENT DETAILS
  // ============================================================================

  @Column({ name: 'is_replacement', default: false })
  isReplacement: boolean;

  @Column({ name: 'replacement_employee_id', type: 'uuid', nullable: true })
  replacementEmployeeId: string;

  @Column({ name: 'replacement_employee_name', length: 200, nullable: true })
  replacementEmployeeName: string;

  @Column({ name: 'replacement_reason', type: 'text', nullable: true })
  replacementReason: string;

  // ============================================================================
  // COMPENSATION
  // ============================================================================

  @Column({ name: 'salary_min', type: 'decimal', precision: 15, scale: 2 })
  salaryMin: number;

  @Column({ name: 'salary_max', type: 'decimal', precision: 15, scale: 2 })
  salaryMax: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'sign_on_bonus', type: 'decimal', precision: 15, scale: 2, nullable: true })
  signOnBonus: number;

  @Column({ name: 'equity_shares', type: 'int', nullable: true })
  equityShares: number;

  @Column({ name: 'relocation_assistance', default: false })
  relocationAssistance: boolean;

  // ============================================================================
  // BUDGET
  // ============================================================================

  @Column({ name: 'cost_center_id', type: 'uuid' })
  costCenterId: string;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;

  @Column({ name: 'budget_reserved', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetReserved: number;

  // ============================================================================
  // HIRING TEAM
  // ============================================================================

  @Column({ name: 'hiring_manager_id', type: 'uuid' })
  hiringManagerId: string;

  @Column({ name: 'hiring_manager_name', length: 200 })
  hiringManagerName: string;

  @Column({ name: 'recruiter_id', type: 'uuid', nullable: true })
  recruiterId: string;

  @Column({ name: 'recruiter_name', length: 200, nullable: true })
  recruiterName: string;

  @OneToMany(() => HiringTeamMember, (member) => member.requisition)
  hiringTeam: HiringTeamMember[];

  // ============================================================================
  // JUSTIFICATION
  // ============================================================================

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];

  // ============================================================================
  // APPROVAL WORKFLOW
  // ============================================================================

  @Column({ name: 'current_approval_level', type: 'int', default: 0 })
  currentApprovalLevel: number;

  @Column({ name: 'total_approval_levels', type: 'int', default: 0 })
  totalApprovalLevels: number;

  @OneToMany(() => ApprovalTransaction, (approval) => approval.requisition)
  approvals: ApprovalTransaction[];

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // ============================================================================
  // POSTING
  // ============================================================================

  @Column({ name: 'posted_at', type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ name: 'posted_channels', type: 'jsonb', nullable: true })
  postedChannels: string[];

  // ============================================================================
  // METADATA
  // ============================================================================

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'previous_status', type: 'enum', enum: RequisitionStatus, nullable: true })
  previousStatus: RequisitionStatus;  // For ON_HOLD resume

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;
}
