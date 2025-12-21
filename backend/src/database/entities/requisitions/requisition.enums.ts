/**
 * Requisition Type - defines the nature of the hiring request
 */
export enum RequisitionType {
  POSITION_BASED = 'POSITION_BASED',     // Linked to existing position
  NON_POSITION = 'NON_POSITION',         // Free-form job requisition
  REPLACEMENT = 'REPLACEMENT',           // Replacing departing employee
  NEW_HEADCOUNT = 'NEW_HEADCOUNT',       // New position creation
  EVERGREEN = 'EVERGREEN',               // Continuous hiring
  PIPELINE = 'PIPELINE',                 // Building talent pipeline
}

/**
 * Requisition Status - workflow states
 */
export enum RequisitionStatus {
  DRAFT = 'DRAFT',                       // Initial state
  SUBMITTED = 'SUBMITTED',               // Awaiting workflow
  PENDING_APPROVAL = 'PENDING_APPROVAL', // In approval chain
  APPROVED = 'APPROVED',                 // All approvals complete
  REJECTED = 'REJECTED',                 // Approval denied
  POSTED = 'POSTED',                     // Job published
  ACTIVE_HIRING = 'ACTIVE_HIRING',       // Accepting applications
  FILLED = 'FILLED',                     // Position(s) filled
  CANCELLED = 'CANCELLED',               // Terminated
  ON_HOLD = 'ON_HOLD',                   // Temporarily paused
  CLOSED = 'CLOSED',                     // Final state
}

/**
 * Approval Status - individual approval transaction states
 */
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
  DELEGATED = 'DELEGATED',
  ESCALATED = 'ESCALATED',
}

/**
 * Approval Decision - actions an approver can take
 */
export enum ApprovalDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND_BACK = 'SEND_BACK',
  DELEGATE = 'DELEGATE',
}

/**
 * Approver Role - types of approvers in workflow
 */
export enum ApproverRole {
  HRBP = 'HRBP',
  FINANCE = 'FINANCE',
  DEPT_HEAD = 'DEPT_HEAD',
  EXECUTIVE = 'EXECUTIVE',
  HIRING_MANAGER = 'HIRING_MANAGER',
  CUSTOM = 'CUSTOM',
}

/**
 * Priority levels for requisitions
 */
export enum RequisitionPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Employment Type
 */
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN',
  FREELANCE = 'FREELANCE',
}

/**
 * Work Model
 */
export enum WorkModel {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

/**
 * Audit Action Types
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND_BACK = 'SEND_BACK',
  DELEGATE = 'DELEGATE',
  ESCALATE = 'ESCALATE',
  CANCEL = 'CANCEL',
  HOLD = 'HOLD',
  RESUME = 'RESUME',
  CLOSE = 'CLOSE',
  POST = 'POST',
  FILL = 'FILL',
}

/**
 * SLA Status
 */
export enum SLAStatus {
  ON_TRACK = 'ON_TRACK',
  WARNING = 'WARNING',     // 75% of SLA time elapsed
  OVERDUE = 'OVERDUE',     // SLA breached
}

/**
 * Hiring Team Member Role
 */
export enum HiringTeamRole {
  HIRING_MANAGER = 'HIRING_MANAGER',
  RECRUITER = 'RECRUITER',
  INTERVIEWER = 'INTERVIEWER',
  COORDINATOR = 'COORDINATOR',
  OBSERVER = 'OBSERVER',
}
