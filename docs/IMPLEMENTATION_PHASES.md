# Workera Platform Implementation Phases

## Overview

This document outlines the comprehensive implementation plan for the Workera Job Requisition Management System, derived from:
- BRD_Job_Requisition_Management_System.docx
- Technical_Implementation_Specification.md
- Workera_Platform_Enhancement_BRD.docx
- Workera_Technical_Implementation_Guide.md

## Architecture Goals

- **Enterprise-Grade**: Oracle HCM-equivalent functionality
- **Multi-Tenant**: Support multiple clients with data isolation
- **White-Label Ready**: Deployable on Azure/AWS/GCP/On-Prem with custom branding
- **Workflow-Driven**: Dynamic approval chains based on business rules
- **Fully Auditable**: Immutable audit trail for compliance

---

## Phase 1: Foundation & Critical Fixes (Weeks 1-2)

### 1.1 Authentication & Security
- [ ] Implement JWT Auth Guard with global protection
- [ ] Create `@Public()` decorator for public endpoints
- [ ] Add rate limiting (throttler) middleware
- [ ] Remove demo bypass code
- [ ] Configure environment variables properly
- [ ] Add refresh token mechanism

### 1.2 Database Configuration
- [ ] Configure PostgreSQL connection pool
- [ ] Generate TypeORM migrations
- [ ] Add composite indexes for performance
- [ ] Set up backup strategy

### 1.3 Files Created
- `backend/src/auth/auth.module.ts`
- `backend/src/auth/jwt-auth.guard.ts`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/decorators/public.decorator.ts`
- `backend/src/common/decorators/roles.decorator.ts`

---

## Phase 2: Database Schema & Entities (Weeks 3-4)

### 2.1 Core Requisition Tables
- [ ] `job_requisition` - Main requisition entity
- [ ] `approval_transaction` - Approval workflow tracking
- [ ] `requisition_audit_log` - Immutable audit trail
- [ ] `approval_rule` - Workflow rule configuration
- [ ] `budget_reservation` - Budget tracking

### 2.2 Master Data Tables
- [ ] `business_unit` - Organizational units
- [ ] `department` - Department hierarchy
- [ ] `location` - Work locations
- [ ] `job_grade` - Salary bands
- [ ] `cost_center` - Budget allocation
- [ ] `position` - Position management

### 2.3 TypeORM Entities
- [ ] JobRequisition entity with all relationships
- [ ] ApprovalTransaction entity
- [ ] ApprovalRule entity
- [ ] CostCenter entity
- [ ] JobGrade entity
- [ ] Position entity

### 2.4 Enums & Types
```typescript
enum RequisitionType {
  POSITION_BASED, NON_POSITION, REPLACEMENT,
  NEW_HEADCOUNT, EVERGREEN, PIPELINE
}

enum RequisitionStatus {
  DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED,
  REJECTED, POSTED, ACTIVE_HIRING, FILLED,
  CANCELLED, ON_HOLD, CLOSED
}

enum ApprovalStatus {
  PENDING, APPROVED, REJECTED, SKIPPED,
  DELEGATED, ESCALATED
}
```

---

## Phase 3: Navigation & UI Streamlining (Weeks 5-6)

### 3.1 Sidebar Restructuring (15 → 9 items)
**BEFORE:**
- Dashboard, Jobs, Post Job, Candidates, Resumes, Shortlist, Forms, Interviews, Search, Messages, Notifications, Analytics, Integrations, Settings

**AFTER:**
1. Dashboard - Overview, KPIs, Activity Feed
2. Requisitions (NEW) - Create, List, Approvals, Budget
3. Jobs - Active Jobs, Create, Forms, Postings
4. Talent Pool - Candidates + Resumes + Shortlist merged
5. Interviews - Scheduled, Calendar, Feedback
6. Inbox - Messages + Notifications merged
7. Analytics - Hiring Metrics, Pipeline Reports
8. Settings - Profile, Team, Integrations, Billing

### 3.2 Global Search
- [ ] Add search to header
- [ ] Implement semantic search across all entities
- [ ] Add quick actions menu

### 3.3 New Pages
- [ ] `/dashboard/requisitions` - Requisition list
- [ ] `/dashboard/requisitions/create` - 8-step wizard
- [ ] `/dashboard/requisitions/[id]` - Detail view
- [ ] `/dashboard/requisitions/approvals` - Approval queue
- [ ] `/dashboard/requisitions/budget` - Budget dashboard

---

## Phase 4: Requisition Module Backend (Weeks 7-10)

### 4.1 Core Services
- [ ] `RequisitionService` - CRUD operations
- [ ] `ApprovalWorkflowService` - Dynamic workflow engine
- [ ] `BudgetValidationService` - Budget checks
- [ ] `AuditService` - Immutable logging

### 4.2 Workflow Engine
- [ ] Rule-based approval chain generation
- [ ] SLA monitoring and escalation
- [ ] Email notifications
- [ ] Delegation support

### 4.3 API Endpoints
```
POST   /api/v1/requisitions           - Create requisition
GET    /api/v1/requisitions           - List with filters
GET    /api/v1/requisitions/:id       - Get details
PUT    /api/v1/requisitions/:id       - Update (draft only)
DELETE /api/v1/requisitions/:id       - Delete draft
POST   /api/v1/requisitions/:id/submit - Submit for approval
POST   /api/v1/requisitions/:id/clone  - Clone requisition

GET    /api/v1/approvals/queue        - Pending approvals
POST   /api/v1/approvals/:id/action   - Approve/Reject/SendBack
GET    /api/v1/approvals/history      - Approval history
```

### 4.4 Validation Rules
| Rule ID | Rule Name | Severity |
|---------|-----------|----------|
| BR001 | Salary within grade band | ERROR |
| BR002 | Budget available | ERROR |
| BR003 | Position vacant | ERROR |
| BR004 | Replacement employee valid | ERROR |
| BR005 | No duplicate active req | WARNING |
| BR006 | Target date >= today + 14 | ERROR |
| BR007 | Recruiter assigned | ERROR |

---

## Phase 5: Requisition Module Frontend (Weeks 11-14)

### 5.1 8-Step Creation Wizard
1. **Requisition Type** - Select type (POSITION_BASED, REPLACEMENT, etc.)
2. **Job Information** - Job title, code, family, grade, description
3. **Organization Details** - Business unit, department, location, work model
4. **Hiring Details** - Headcount, employment type, target date, priority
5. **Budget & Compensation** - Salary range, cost center, bonuses
6. **Hiring Team** - Hiring manager, recruiter, interviewers
7. **Justification & Attachments** - Business justification, documents
8. **Review & Submit** - Summary, approval preview, confirmation

### 5.2 List & Detail Views
- [ ] Requisition list with advanced filters
- [ ] Status badges and progress indicators
- [ ] Timeline view for requisition history
- [ ] Quick actions (Edit, Clone, Submit, Cancel)

### 5.3 Approval Queue
- [ ] Pending approvals grouped by urgency
- [ ] Overdue items highlighted
- [ ] Quick approve/reject buttons
- [ ] Bulk actions support

---

## Phase 6: Enhanced Search System (Weeks 15-16)

### 6.1 Vector Database Integration
- [ ] Set up Pinecone/Weaviate
- [ ] Generate embeddings for candidates
- [ ] Hybrid search (dense + sparse vectors)
- [ ] Real-time index updates

### 6.2 Advanced Filters (20+ dimensions)
| Category | Filters |
|----------|---------|
| Experience | Years, Role Level, Industry |
| Skills | Required, Proficiency, Certifications |
| Education | Degree, Field, Institution |
| Location | Current, Willing to Relocate, Work Auth |
| Availability | Notice Period, Employment Type, Work Model |
| Compensation | Expected Salary Range |
| Status | Application Status, Source Channel |

### 6.3 Natural Language Query
```
"Senior React developers in SF with 5+ years"
→ skills:[React] AND location:SF AND experience:>=5 AND level:Senior
```

---

## Phase 7: Job Posting Integration (Weeks 17-18)

### 7.1 Channel Integrations
- [ ] Internal Career Site
- [ ] Employee Referral Portal
- [ ] LinkedIn Jobs API
- [ ] Indeed API
- [ ] Naukri API (India)
- [ ] Glassdoor API

### 7.2 Auto-Create Job from Requisition
- [ ] Approved requisition → Job listing
- [ ] Inherit title, description, salary, location
- [ ] Status synchronization

### 7.3 Posting Analytics
- [ ] Views, clicks, applications per channel
- [ ] Cost per hire by source
- [ ] Time-to-fill metrics

---

## Phase 8: Testing & Deployment (Weeks 19-20)

### 8.1 Testing
- [ ] Unit tests for all services
- [ ] E2E tests for critical flows
- [ ] Performance testing
- [ ] Security audit

### 8.2 Deployment Configuration
- [ ] Docker containerization
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Multi-tenant deployment scripts

### 8.3 White-Label Features
- [ ] Tenant-specific branding
- [ ] Custom domain support
- [ ] Logo and theme configuration
- [ ] Email template customization

---

## User Roles & Permissions

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| HIRING_MANAGER | Own requisitions | Create, Edit, Submit, View own |
| RECRUITER | Assigned reqs | Update, View all, Manage postings |
| HRBP | Business Unit | Approve L1, Policy validation |
| FINANCE_APPROVER | All | Approve L2, Budget validation |
| DEPT_HEAD | Department | Approve L3, Final authority |
| EXECUTIVE | All | Approve L4, Executive override |
| SYSTEM_ADMIN | System | Full configuration access |
| AUDITOR | Read-only | View all data and logs |

---

## Approval Rules Matrix

| Rule ID | Condition | Action | Level |
|---------|-----------|--------|-------|
| R001 | ALL requisitions | Add HRBP approval | 1 |
| R002 | salary_max > grade_max * 0.75 | Add Finance approval | 2 |
| R003 | requisition_type = NEW_HEADCOUNT | Add Finance approval | 2 |
| R004 | ALL requisitions | Add Dept Head approval | 3 |
| R005 | grade_level >= L7 | Add Executive approval | 4 |
| R006 | headcount >= 5 | Add Executive approval | 4 |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Navigation items | 15 | 9 |
| Search filter options | 4 | 20+ |
| Search relevance (top 10) | ~50% | 85%+ |
| Auth security bypasses | Multiple | 0 |
| Manual approval tracking | 100% | 0% |
| Policy compliance | Unknown | 100% |

---

## Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: NestJS, TypeORM, PostgreSQL
- **AI/ML**: Google Gemini, Pinecone Vector DB
- **Infrastructure**: Docker, Kubernetes
- **Cloud**: Azure/AWS/GCP compatible

---

*Document Version: 1.0*
*Last Updated: December 21, 2025*
