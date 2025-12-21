# Technical Implementation Specification
## Job Requisition Management System - Developer Reference

---

## Database Schema SQL

### Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MASTER DATA TABLES
-- ============================================

-- Business Unit
CREATE TABLE business_unit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES business_unit(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bu_code UNIQUE (tenant_id, code)
);

-- Department
CREATE TABLE department (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    business_unit_id UUID NOT NULL REFERENCES business_unit(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_id UUID REFERENCES users(id),
    parent_id UUID REFERENCES department(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_dept_code UNIQUE (tenant_id, code)
);

-- Location
CREATE TABLE location (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    country VARCHAR(2) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    address TEXT,
    postal_code VARCHAR(20),
    timezone VARCHAR(50) NOT NULL,
    supported_work_models VARCHAR[] NOT NULL DEFAULT ARRAY['ONSITE'],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_location_code UNIQUE (tenant_id, code)
);

-- Job Grade
CREATE TABLE job_grade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL,
    salary_band_min DECIMAL(15,2) NOT NULL,
    salary_band_max DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    requires_executive_approval BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_grade_code UNIQUE (tenant_id, code)
);

-- Cost Center
CREATE TABLE cost_center (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    budget_total DECIMAL(15,2) NOT NULL,
    budget_used DECIMAL(15,2) NOT NULL DEFAULT 0,
    budget_reserved DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fiscal_year INTEGER NOT NULL,
    owner_id UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cc_code UNIQUE (tenant_id, code, fiscal_year),
    CONSTRAINT chk_budget CHECK (budget_used + budget_reserved <= budget_total)
);

-- Position
CREATE TABLE position (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    code VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    job_id UUID NOT NULL REFERENCES job(id),
    department_id UUID NOT NULL REFERENCES department(id),
    location_id UUID NOT NULL REFERENCES location(id),
    incumbent_id UUID REFERENCES employee(id),
    reports_to_id UUID REFERENCES position(id),
    headcount INTEGER NOT NULL DEFAULT 1,
    is_vacant BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_position_code UNIQUE (tenant_id, code)
);

-- ============================================
-- CORE REQUISITION TABLES
-- ============================================

-- Job Requisition (Primary Entity)
CREATE TABLE job_requisition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_number VARCHAR(50) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    
    -- Type & Status
    requisition_type VARCHAR(50) NOT NULL CHECK (requisition_type IN (
        'POSITION_BASED', 'NON_POSITION', 'REPLACEMENT', 
        'NEW_HEADCOUNT', 'EVERGREEN', 'PIPELINE'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED',
        'POSTED', 'ACTIVE_HIRING', 'FILLED', 'CANCELLED', 'ON_HOLD', 'CLOSED'
    )),
    
    -- Organization Reference
    business_unit_id UUID NOT NULL REFERENCES business_unit(id),
    department_id UUID NOT NULL REFERENCES department(id),
    
    -- Job Reference
    job_id UUID NOT NULL REFERENCES job(id),
    position_id UUID REFERENCES position(id),
    grade_id UUID NOT NULL REFERENCES job_grade(id),
    
    -- Location & Work Model
    location_id UUID NOT NULL REFERENCES location(id),
    work_model VARCHAR(20) NOT NULL CHECK (work_model IN ('ONSITE', 'HYBRID', 'REMOTE')),
    additional_locations UUID[],
    
    -- Employment Details
    employment_type VARCHAR(30) NOT NULL CHECK (employment_type IN (
        'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY', 'CONSULTANT'
    )),
    headcount INTEGER NOT NULL CHECK (headcount > 0),
    
    -- Replacement Info
    replacement_flag BOOLEAN NOT NULL DEFAULT FALSE,
    replacement_employee_id UUID REFERENCES employee(id),
    
    -- Compensation
    salary_min DECIMAL(15,2) NOT NULL,
    salary_max DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    sign_on_bonus DECIMAL(15,2),
    relocation_amount DECIMAL(15,2),
    equity_shares INTEGER,
    vesting_period VARCHAR(20),
    
    -- Budget
    cost_center_id UUID NOT NULL REFERENCES cost_center(id),
    budget_validated BOOLEAN NOT NULL DEFAULT FALSE,
    budget_reserved_amount DECIMAL(15,2),
    
    -- Timeline
    target_start_date DATE NOT NULL,
    
    -- Content
    job_description TEXT,
    justification TEXT,
    internal_notes TEXT,
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    
    -- Team
    hiring_manager_id UUID NOT NULL REFERENCES users(id),
    recruiter_id UUID REFERENCES users(id),
    
    -- Skills (JSON array)
    required_skills JSONB DEFAULT '[]',
    
    -- Audit Fields
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    close_reason TEXT,
    
    -- Constraints
    CONSTRAINT chk_salary_range CHECK (salary_max >= salary_min),
    CONSTRAINT chk_replacement_employee CHECK (
        (replacement_flag = FALSE AND replacement_employee_id IS NULL) OR
        (replacement_flag = TRUE AND replacement_employee_id IS NOT NULL)
    ),
    CONSTRAINT chk_position_type CHECK (
        (requisition_type != 'POSITION_BASED' AND position_id IS NULL) OR
        (requisition_type = 'POSITION_BASED' AND position_id IS NOT NULL)
    )
);

-- Indexes for JobRequisition
CREATE INDEX idx_requisition_tenant ON job_requisition(tenant_id);
CREATE INDEX idx_requisition_status ON job_requisition(status);
CREATE INDEX idx_requisition_department ON job_requisition(department_id);
CREATE INDEX idx_requisition_hiring_manager ON job_requisition(hiring_manager_id);
CREATE INDEX idx_requisition_recruiter ON job_requisition(recruiter_id);
CREATE INDEX idx_requisition_created_at ON job_requisition(created_at DESC);
CREATE INDEX idx_requisition_number ON job_requisition(requisition_number);
CREATE INDEX idx_requisition_type ON job_requisition(requisition_type);
CREATE INDEX idx_requisition_priority ON job_requisition(priority);

-- Approval Transaction
CREATE TABLE approval_transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id) ON DELETE CASCADE,
    
    -- Approval Hierarchy
    approval_level INTEGER NOT NULL,
    approval_order INTEGER NOT NULL,
    approver_role VARCHAR(50) NOT NULL CHECK (approver_role IN (
        'HRBP', 'FINANCE', 'DEPARTMENT_HEAD', 'EXECUTIVE', 'LEGAL'
    )),
    approver_user_id UUID NOT NULL REFERENCES users(id),
    delegated_from UUID REFERENCES users(id),
    
    -- Status & Decision
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'SENT_BACK', 'SKIPPED', 'DELEGATED'
    )),
    decision VARCHAR(30) CHECK (decision IN ('APPROVE', 'REJECT', 'SEND_BACK')),
    comments TEXT,
    
    -- Timing
    action_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    escalated BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_to UUID REFERENCES users(id),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_approval_decision CHECK (
        (status = 'PENDING' AND decision IS NULL) OR
        (status != 'PENDING' AND decision IS NOT NULL)
    )
);

CREATE INDEX idx_approval_requisition ON approval_transaction(requisition_id);
CREATE INDEX idx_approval_approver ON approval_transaction(approver_user_id);
CREATE INDEX idx_approval_status ON approval_transaction(status);
CREATE INDEX idx_approval_due_date ON approval_transaction(due_date);
CREATE UNIQUE INDEX idx_approval_unique_level ON approval_transaction(requisition_id, approval_level, approval_order);

-- Requisition Audit Log (Immutable)
CREATE TABLE requisition_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id),
    
    -- Change Details
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT',
        'SUBMIT', 'APPROVE', 'REJECT', 'SEND_BACK', 'DELEGATE',
        'POST', 'UNPOST', 'CANCEL', 'CLOSE', 'REOPEN', 'STATUS_CHANGE'
    )),
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    
    -- Actor
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID
);

CREATE INDEX idx_audit_requisition ON requisition_audit_log(requisition_id);
CREATE INDEX idx_audit_changed_by ON requisition_audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON requisition_audit_log(changed_at DESC);
CREATE INDEX idx_audit_action ON requisition_audit_log(action);

-- Prevent modifications to audit log
CREATE RULE prevent_audit_update AS ON UPDATE TO requisition_audit_log DO INSTEAD NOTHING;
CREATE RULE prevent_audit_delete AS ON DELETE TO requisition_audit_log DO INSTEAD NOTHING;

-- Job Posting
CREATE TABLE job_posting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id),
    
    -- Channel Info
    channel VARCHAR(50) NOT NULL CHECK (channel IN (
        'INTERNAL', 'EXTERNAL', 'LINKEDIN', 'INDEED', 'GLASSDOOR',
        'MONSTER', 'NAUKRI', 'SHINE', 'TIMESJOBS', 'ZIPRECRUITER', 'DICE'
    )),
    external_job_id VARCHAR(100),
    
    -- Content Overrides
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    title_override VARCHAR(200),
    description_override TEXT,
    
    -- Visibility & Schedule
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN (
        'PUBLIC', 'INTERNAL', 'REFERRAL'
    )),
    geo_restrictions JSONB,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CLOSED'
    )),
    
    -- Analytics
    views_count INTEGER NOT NULL DEFAULT 0,
    applications_count INTEGER NOT NULL DEFAULT 0,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_posting_dates CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_posting_requisition ON job_posting(requisition_id);
CREATE INDEX idx_posting_channel ON job_posting(channel);
CREATE INDEX idx_posting_status ON job_posting(status);
CREATE UNIQUE INDEX idx_posting_unique_channel ON job_posting(requisition_id, channel, language);

-- Hiring Team Member
CREATE TABLE hiring_team_member (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'INTERVIEWER', 'COORDINATOR', 'SOURCER', 'SCREENER'
    )),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    added_by UUID NOT NULL REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_team_member UNIQUE (requisition_id, user_id, role)
);

-- Requisition Attachment
CREATE TABLE requisition_attachment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'OTHER' CHECK (category IN (
        'JOB_DESCRIPTION', 'JUSTIFICATION', 'OTHER'
    )),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_file_size CHECK (file_size > 0 AND file_size <= 10485760)
);

-- Requisition Comment
CREATE TABLE requisition_comment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT TRUE,
    parent_id UUID REFERENCES requisition_comment(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Approval Rule Configuration
CREATE TABLE approval_rule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'SALARY_THRESHOLD', 'GRADE_LEVEL', 'NEW_HEADCOUNT', 
        'DEPARTMENT', 'HEADCOUNT_THRESHOLD', 'ALL'
    )),
    condition_field VARCHAR(100) NOT NULL,
    condition_operator VARCHAR(20) NOT NULL CHECK (condition_operator IN (
        'EQ', 'NEQ', 'GT', 'GTE', 'LT', 'LTE', 'IN', 'NOT_IN', 'BETWEEN'
    )),
    condition_value TEXT NOT NULL,
    approver_role VARCHAR(50) NOT NULL,
    approval_level INTEGER NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Budget Reservation Log
CREATE TABLE budget_reservation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id UUID NOT NULL REFERENCES job_requisition(id),
    cost_center_id UUID NOT NULL REFERENCES cost_center(id),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'RESERVED', 'COMMITTED', 'RELEASED', 'CANCELLED'
    )),
    reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    committed_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    released_reason TEXT,
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Requisition Number Sequence
CREATE SEQUENCE requisition_number_seq START 1;

-- Function to generate requisition number
CREATE OR REPLACE FUNCTION generate_requisition_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.requisition_number := 'REQ-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                              LPAD(nextval('requisition_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_requisition_number
    BEFORE INSERT ON job_requisition
    FOR EACH ROW
    WHEN (NEW.requisition_number IS NULL)
    EXECUTE FUNCTION generate_requisition_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER trg_requisition_updated_at
    BEFORE UPDATE ON job_requisition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_approval_updated_at
    BEFORE UPDATE ON approval_transaction
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## TypeScript Entity Types

```typescript
// ============================================
// ENUMS
// ============================================

export enum RequisitionType {
  POSITION_BASED = 'POSITION_BASED',
  NON_POSITION = 'NON_POSITION',
  REPLACEMENT = 'REPLACEMENT',
  NEW_HEADCOUNT = 'NEW_HEADCOUNT',
  EVERGREEN = 'EVERGREEN',
  PIPELINE = 'PIPELINE'
}

export enum RequisitionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  POSTED = 'POSTED',
  ACTIVE_HIRING = 'ACTIVE_HIRING',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY',
  CONSULTANT = 'CONSULTANT'
}

export enum WorkModel {
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT_BACK = 'SENT_BACK',
  SKIPPED = 'SKIPPED',
  DELEGATED = 'DELEGATED'
}

export enum ApproverRole {
  HRBP = 'HRBP',
  FINANCE = 'FINANCE',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  EXECUTIVE = 'EXECUTIVE',
  LEGAL = 'LEGAL'
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND_BACK = 'SEND_BACK',
  DELEGATE = 'DELEGATE',
  POST = 'POST',
  UNPOST = 'UNPOST',
  CANCEL = 'CANCEL',
  CLOSE = 'CLOSE',
  STATUS_CHANGE = 'STATUS_CHANGE'
}

// ============================================
// ENTITY INTERFACES
// ============================================

export interface JobRequisition {
  id: string;
  requisitionNumber: string;
  tenantId: string;
  
  // Type & Status
  requisitionType: RequisitionType;
  status: RequisitionStatus;
  
  // Organization
  businessUnitId: string;
  departmentId: string;
  
  // Job
  jobId: string;
  positionId?: string;
  gradeId: string;
  
  // Location
  locationId: string;
  workModel: WorkModel;
  additionalLocations?: string[];
  
  // Employment
  employmentType: EmploymentType;
  headcount: number;
  
  // Replacement
  replacementFlag: boolean;
  replacementEmployeeId?: string;
  
  // Compensation
  salaryMin: number;
  salaryMax: number;
  currency: string;
  signOnBonus?: number;
  relocationAmount?: number;
  equityShares?: number;
  vestingPeriod?: string;
  
  // Budget
  costCenterId: string;
  budgetValidated: boolean;
  budgetReservedAmount?: number;
  
  // Timeline
  targetStartDate: Date;
  
  // Content
  jobDescription?: string;
  justification?: string;
  internalNotes?: string;
  priority: Priority;
  
  // Team
  hiringManagerId: string;
  recruiterId?: string;
  
  // Skills
  requiredSkills: string[];
  
  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  closedAt?: Date;
  closeReason?: string;
}

export interface ApprovalTransaction {
  id: string;
  requisitionId: string;
  
  // Hierarchy
  approvalLevel: number;
  approvalOrder: number;
  approverRole: ApproverRole;
  approverUserId: string;
  delegatedFrom?: string;
  
  // Decision
  status: ApprovalStatus;
  decision?: 'APPROVE' | 'REJECT' | 'SEND_BACK';
  comments?: string;
  
  // Timing
  actionDate?: Date;
  dueDate: Date;
  reminderSent: boolean;
  reminderSentAt?: Date;
  escalated: boolean;
  escalatedAt?: Date;
  escalatedTo?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface RequisitionAuditLog {
  id: string;
  requisitionId: string;
  action: AuditAction;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

// ============================================
// DTO INTERFACES
// ============================================

export interface CreateRequisitionDto {
  requisitionType: RequisitionType;
  businessUnitId: string;
  departmentId: string;
  jobId: string;
  positionId?: string;
  gradeId: string;
  locationId: string;
  workModel: WorkModel;
  additionalLocations?: string[];
  employmentType: EmploymentType;
  headcount: number;
  replacementFlag?: boolean;
  replacementEmployeeId?: string;
  salaryMin: number;
  salaryMax: number;
  currency?: string;
  signOnBonus?: number;
  relocationAmount?: number;
  equityShares?: number;
  vestingPeriod?: string;
  costCenterId: string;
  targetStartDate: string;
  jobDescription?: string;
  justification?: string;
  internalNotes?: string;
  priority?: Priority;
  hiringManagerId: string;
  recruiterId?: string;
  requiredSkills?: string[];
}

export interface UpdateRequisitionDto extends Partial<CreateRequisitionDto> {}

export interface ApprovalActionDto {
  action: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'DELEGATE';
  comments?: string;
  reason?: string;
  fieldsToRevise?: string[];
  resetWorkflow?: boolean;
  delegateTo?: string;
  delegateReason?: string;
  isPermanentDelegation?: boolean;
}

export interface RequisitionFilters {
  status?: RequisitionStatus[];
  requisitionType?: RequisitionType[];
  departmentId?: string[];
  locationId?: string[];
  recruiterId?: string;
  hiringManagerId?: string;
  priority?: Priority[];
  employmentType?: EmploymentType[];
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## NestJS Module Structure

```
backend/src/
├── requisition/
│   ├── requisition.module.ts
│   ├── requisition.controller.ts
│   ├── requisition.service.ts
│   ├── dto/
│   │   ├── create-requisition.dto.ts
│   │   ├── update-requisition.dto.ts
│   │   └── requisition-filters.dto.ts
│   ├── entities/
│   │   └── requisition.entity.ts
│   └── validators/
│       ├── requisition.validator.ts
│       └── salary-band.validator.ts
│
├── approval/
│   ├── approval.module.ts
│   ├── approval.controller.ts
│   ├── approval.service.ts
│   ├── workflow/
│   │   ├── workflow.engine.ts
│   │   ├── rule.evaluator.ts
│   │   └── sla.calculator.ts
│   ├── dto/
│   │   └── approval-action.dto.ts
│   └── entities/
│       ├── approval-transaction.entity.ts
│       └── approval-rule.entity.ts
│
├── posting/
│   ├── posting.module.ts
│   ├── posting.controller.ts
│   ├── posting.service.ts
│   ├── channels/
│   │   ├── linkedin.channel.ts
│   │   ├── indeed.channel.ts
│   │   └── naukri.channel.ts
│   └── entities/
│       └── job-posting.entity.ts
│
├── audit/
│   ├── audit.module.ts
│   ├── audit.service.ts
│   ├── audit.interceptor.ts
│   └── entities/
│       └── audit-log.entity.ts
│
├── budget/
│   ├── budget.module.ts
│   ├── budget.service.ts
│   └── entities/
│       ├── cost-center.entity.ts
│       └── budget-reservation.entity.ts
│
├── master-data/
│   ├── master-data.module.ts
│   ├── master-data.controller.ts
│   ├── services/
│   │   ├── business-unit.service.ts
│   │   ├── department.service.ts
│   │   ├── location.service.ts
│   │   └── job-grade.service.ts
│   └── entities/
│       ├── business-unit.entity.ts
│       ├── department.entity.ts
│       ├── location.entity.ts
│       └── job-grade.entity.ts
│
└── shared/
    ├── guards/
    │   └── role.guard.ts
    ├── decorators/
    │   └── roles.decorator.ts
    ├── interceptors/
    │   └── audit.interceptor.ts
    └── pipes/
        └── validation.pipe.ts
```

---

## Frontend Component Structure

```
frontend/
├── app/
│   └── requisitions/
│       ├── page.tsx                    # List page
│       ├── [id]/
│       │   └── page.tsx               # Detail page
│       ├── create/
│       │   └── page.tsx               # Create wizard
│       └── approvals/
│           └── page.tsx               # Approval queue
│
├── components/
│   └── requisitions/
│       ├── RequisitionList/
│       │   ├── RequisitionList.tsx
│       │   ├── RequisitionFilters.tsx
│       │   ├── RequisitionTable.tsx
│       │   └── RequisitionCard.tsx
│       │
│       ├── RequisitionForm/
│       │   ├── RequisitionWizard.tsx
│       │   ├── steps/
│       │   │   ├── Step1TypeSelection.tsx
│       │   │   ├── Step2JobInfo.tsx
│       │   │   ├── Step3Organization.tsx
│       │   │   ├── Step4HiringDetails.tsx
│       │   │   ├── Step5Compensation.tsx
│       │   │   ├── Step6HiringTeam.tsx
│       │   │   ├── Step7Justification.tsx
│       │   │   └── Step8Review.tsx
│       │   └── validation/
│       │       └── schema.ts
│       │
│       ├── RequisitionDetail/
│       │   ├── RequisitionDetail.tsx
│       │   ├── RequisitionTimeline.tsx
│       │   ├── RequisitionApprovals.tsx
│       │   └── RequisitionPostings.tsx
│       │
│       ├── Approval/
│       │   ├── ApprovalQueue.tsx
│       │   ├── ApprovalCard.tsx
│       │   ├── ApproveDialog.tsx
│       │   ├── RejectDialog.tsx
│       │   ├── SendBackDialog.tsx
│       │   └── DelegateDialog.tsx
│       │
│       └── Posting/
│           ├── PostingManager.tsx
│           ├── ChannelSelector.tsx
│           └── PostingPreview.tsx
│
├── hooks/
│   └── requisitions/
│       ├── useRequisition.ts
│       ├── useRequisitionList.ts
│       ├── useRequisitionForm.ts
│       ├── useApprovalQueue.ts
│       └── useApprovalAction.ts
│
├── services/
│   └── requisitions/
│       ├── requisition.service.ts
│       ├── approval.service.ts
│       └── posting.service.ts
│
└── types/
    └── requisition.types.ts
```

---

## API Response Examples

### Create Requisition Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "requisitionNumber": "REQ-2025-000001",
  "status": "DRAFT",
  "requisitionType": "REPLACEMENT",
  "job": {
    "id": "job-uuid",
    "title": "Senior Software Engineer",
    "code": "ENG-SSE-001",
    "family": "Engineering"
  },
  "organization": {
    "businessUnit": { "id": "bu-uuid", "name": "Technology Division" },
    "department": { "id": "dept-uuid", "name": "Platform Engineering" },
    "location": { "id": "loc-uuid", "name": "San Francisco, CA" }
  },
  "compensation": {
    "salaryMin": 150000,
    "salaryMax": 175000,
    "currency": "USD"
  },
  "hiringDetails": {
    "headcount": 2,
    "employmentType": "FULL_TIME",
    "workModel": "HYBRID",
    "targetStartDate": "2026-02-01",
    "priority": "NORMAL"
  },
  "createdAt": "2025-12-21T10:00:00Z",
  "createdBy": "user-uuid"
}
```

### Submit Response with Workflow
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "requisitionNumber": "REQ-2025-000001",
  "status": "SUBMITTED",
  "workflow": {
    "id": "workflow-uuid",
    "totalLevels": 3,
    "currentLevel": 1,
    "estimatedCompletion": "2025-12-28",
    "approvers": [
      {
        "level": 1,
        "role": "HRBP",
        "user": { "id": "user-uuid", "name": "Sarah Chen" },
        "status": "PENDING",
        "dueDate": "2025-12-26T18:00:00Z"
      },
      {
        "level": 2,
        "role": "FINANCE",
        "user": { "id": "user-uuid", "name": "Robert Brown" },
        "status": "WAITING",
        "dueDate": null
      },
      {
        "level": 3,
        "role": "DEPARTMENT_HEAD",
        "user": { "id": "user-uuid", "name": "Jane Doe" },
        "status": "WAITING",
        "dueDate": null
      }
    ]
  }
}
```

### Approval Queue Response
```json
{
  "data": [
    {
      "id": "approval-uuid",
      "requisition": {
        "id": "req-uuid",
        "requisitionNumber": "REQ-2025-000001",
        "jobTitle": "Senior Software Engineer",
        "hiringManager": { "id": "user-uuid", "name": "Jane Doe" },
        "department": "Platform Engineering",
        "salaryRange": "$150,000 - $175,000",
        "headcount": 2,
        "priority": "NORMAL"
      },
      "approvalLevel": 1,
      "approverRole": "HRBP",
      "status": "PENDING",
      "dueDate": "2025-12-26T18:00:00Z",
      "isOverdue": false,
      "daysPending": 2,
      "createdAt": "2025-12-21T10:00:00Z"
    }
  ],
  "summary": {
    "overdue": 3,
    "dueToday": 5,
    "upcoming": 12
  },
  "pagination": {
    "total": 20,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Weeks 1-4)
- [ ] Database schema creation
- [ ] Entity models with TypeORM
- [ ] Core API structure (NestJS modules)
- [ ] Authentication/Authorization
- [ ] Role-based guards
- [ ] Basic CRUD operations

### Phase 2: Core Functionality (Weeks 5-8)
- [ ] Create Requisition Wizard (8 steps)
- [ ] Requisition List with filters
- [ ] Requisition Detail view
- [ ] Field-level validations
- [ ] Business rule engine
- [ ] State machine implementation

### Phase 3: Workflow Engine (Weeks 9-12)
- [ ] Approval rule configuration
- [ ] Dynamic workflow generation
- [ ] Approval actions (approve, reject, send back, delegate)
- [ ] SLA monitoring and escalation
- [ ] Notification system (email, in-app)

### Phase 4: Job Posting (Weeks 13-14)
- [ ] Posting management UI
- [ ] Internal posting channel
- [ ] External channel integrations
- [ ] Posting analytics

### Phase 5: Reporting & Analytics (Weeks 15-16)
- [ ] Standard reports
- [ ] Dashboard widgets
- [ ] Export functionality
- [ ] Scheduled reports

### Phase 6: Admin & Configuration (Week 17)
- [ ] System configuration screens
- [ ] Approval rule editor
- [ ] Master data management
- [ ] User role management

### Phase 7: Integration & Testing (Weeks 18-20)
- [ ] Integration with existing Workera modules
- [ ] External system integrations
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit

### Phase 8: Deployment & Training (Weeks 21-22)
- [ ] Production deployment
- [ ] Data migration scripts
- [ ] User training materials
- [ ] Documentation

---

*This technical specification supplements the BRD document and provides implementation details for developers.*
