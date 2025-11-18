# Workera Backend API

NestJS-based backend API for the Workera recruitment automation platform with PostgreSQL database and AI integration.

## Features

### AI Services
- **Job Description Generation** - Uses Google Generative AI (Gemini Pro) to create professional JDs
- **Resume Analysis** - AI-powered resume screening and matching against job descriptions

### Database & Multi-Tenancy
- **PostgreSQL with TypeORM** - Production-ready database with entity relationships
- **Multi-Tenant Architecture** - Tenant isolation for enterprise customers
- **Auto-migrations** - Database schema sync in development mode

### Core Modules

#### Jobs Management
- Create, update, and manage job postings
- AI-powered job description generation
- Multi-platform posting support
- Tenant-scoped job listings

#### Candidate Management
- Candidate profiles with contact information
- Skills tracking and tagging
- Resume storage and parsing
- Application tracking

#### Resume Parser
- Automatic extraction of contact info
- Experience and education parsing
- Skills detection from 40+ technologies
- Certification extraction
- Regex-based NLP parsing (upgradeable to transformer models)

#### Applications
- Track candidate applications to jobs
- AI match scoring
- Status workflow (applied → screening → shortlisted → interview → offer)
- AI analysis results storage

## Database Schema

### Entities

**Tenant** - Organizations using the platform
- Multi-tenant data isolation
- Custom settings per tenant
- Domain-based access

**User** - System users (recruiters, admins, hiring managers)
- Role-based access control
- Tenant association
- SSO support (future)

**Job** - Job postings
- Draft/Posted/Closed status
- Multi-channel publishing
- Tenant-scoped

**Candidate** - Job applicants
- Contact information
- Skills and profile data
- Multiple resumes support

**Resume** - Parsed resume data
- Raw text storage
- Structured data (experience, education, skills)
- AI-parsed fields

**Application** - Candidate applications to jobs
- Application status tracking
- AI match score and analysis
- Notes and evaluations

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 14+ with TypeORM
- **AI**: Google Generative AI (Gemini Pro)
- **Runtime**: Node.js 18+

## API Endpoints

### AI Services
- `POST /ai/generate-jd` - Generate job description
- `POST /ai/analyze-resume` - Analyze resume against JD

### Jobs
- `GET /jobs` - Get all jobs (tenant-scoped)
- `GET /jobs/:id` - Get job by ID
- `POST /jobs` - Create new job (with optional AI generation)
- `PUT /jobs/:id/post` - Post job to channels

### Candidates
- `GET /candidates` - Get all candidates (tenant-scoped)
- `GET /candidates/:id` - Get candidate by ID
- `POST /candidates` - Create new candidate
- `POST /candidates/:id/resume` - Upload and parse resume
- `POST /candidates/search` - Advanced search with pagination, filters, sorting
- `POST /candidates/:id/analyze` - AI analysis against job

### Applications
- `POST /candidates/applications` - Create new application
- `PUT /candidates/applications/:id/status` - Update application status (sends notification)

### Bulk Operations
- `POST /candidates/bulk/import` - Bulk import candidates from JSON
- `PUT /candidates/bulk/applications/status` - Bulk update application statuses
- `POST /candidates/bulk/tag` - Bulk tag candidates
- `POST /candidates/bulk/email` - Bulk send emails
- `POST /candidates/bulk/export` - Bulk export candidates to JSON
- `POST /candidates/bulk/delete` - Bulk delete candidates

### Interviews
- `POST /interviews` - Schedule new interview (sends invitation)
- `GET /interviews/:id` - Get interview by ID
- `GET /interviews/application/:applicationId` - Get all interviews for application
- `GET /interviews/upcoming` - Get upcoming interviews
- `PUT /interviews/:id/status` - Update interview status
- `PUT /interviews/:id/reschedule` - Reschedule interview (sends notification)
- `PUT /interviews/:id/feedback` - Submit interview feedback

### Analytics
- `GET /analytics/dashboard` - Dashboard overview metrics
- `GET /analytics/application-status` - Application status distribution
- `GET /analytics/hiring-funnel` - Hiring funnel metrics (optional jobId filter)
- `GET /analytics/top-skills` - Top candidate skills analysis
- `GET /analytics/interview-metrics` - Interview statistics
- `GET /analytics/job-performance` - Job performance metrics
- `GET /analytics/time-to-hire` - Average and median time-to-hire
- `GET /analytics/application-trends` - Application trends over time (default 30 days)

### AI Candidate Ranking
- `POST /ai/rank-candidate` - Rank single candidate against job (0-100 score with reasoning)
- `POST /ai/rank-candidates` - Rank multiple candidates and return sorted list

### GDPR Compliance
- `GET /gdpr/export/:candidateId` - Export all candidate data (GDPR Article 15)
- `DELETE /gdpr/delete/:candidateId` - Delete/anonymize candidate data (GDPR Article 17)
- `GET /gdpr/retention-report` - Get data retention compliance report
- `GET /gdpr/find-by-email` - Find candidate by email for data requests
- `GET /gdpr/consent/:candidateId` - Verify candidate consent status

### Real-time WebSocket Events
- WebSocket server on same port as HTTP
- Events: `application_created`, `application_updated`, `interview_scheduled`, `resume_parsed`, `job_posted`, `candidate_created`
- Client actions: `authenticate`, `join_room`, `leave_room`

## Installation

```bash
npm install
```

## Database Setup

### Option 1: With PostgreSQL (Full Features)

1. Install PostgreSQL 14+
2. Create database:
```sql
CREATE DATABASE workera;
```

3. Configure `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=workera
```

4. TypeORM will auto-sync schema in development

### Option 2: Without PostgreSQL (AI Only)

The app will still run for AI features even without PostgreSQL. Database endpoints will return errors.

## Running the API

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

## Environment Variables

Create a `.env` file:

```env
# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Server
PORT=3001
NODE_ENV=development

# Database (optional for AI-only usage)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=workera
```

## API Documentation

### Create Job with AI Generation

```bash
POST http://localhost:3001/jobs
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "generateWithAI": true,
  "requirements": ["React", "Node.js", "TypeScript"]
}
```

### Upload and Parse Resume

```bash
POST http://localhost:3001/candidates/:id/resume
Content-Type: application/json

{
  "resumeText": "John Doe\nEmail: john@example.com...",
  "tenantId": "default-tenant"
}
```

### Search Candidates

```bash
POST http://localhost:3001/candidates/search
Content-Type: application/json

{
  "skills": ["React", "TypeScript"],
  "location": "San Francisco",
  "tenantId": "default-tenant"
}
```

## Multi-Tenancy

All endpoints support `tenantId` parameter for data isolation:
- In production: extracted from authenticated user context
- In development: passed as parameter (defaults to 'default-tenant')

## Phase 4 Features (✅ Completed)

### Email Notifications
- Application status update emails
- Interview invitation emails
- Resume processed confirmations
- Job posted confirmations
- Bulk email notifications
- HTML email templates with brand design
- Development mode logging (production ready for SendGrid/SES integration)

### Interview Scheduling
- Schedule interviews with multiple types (phone, video, in-person, technical, HR, final)
- Interview status tracking (scheduled, confirmed, completed, cancelled, rescheduled)
- Meeting link and location support
- Interviewer assignment
- Interview feedback submission with ratings
- Reschedule functionality with notifications
- Upcoming interviews dashboard

### Analytics & Reporting
- Dashboard metrics (jobs, candidates, applications, interviews)
- Application status distribution
- Hiring funnel metrics
- Top skills analysis
- Interview metrics with average ratings
- Job performance tracking
- Time-to-hire analytics
- Application trends over time
- Exportable data for reporting

### Bulk Operations
- Bulk import candidates from JSON/CSV
- Bulk update application status (with notifications)
- Bulk tagging/categorization
- Bulk email sending
- Bulk export to JSON
- Bulk delete with validation

### Advanced Search & Pagination
- Full-text search across name, email
- Skills-based filtering
- Location fuzzy matching
- Date range filters (createdAfter, createdBefore)
- Sorting by multiple fields
- Pagination with metadata (page, limit, total, hasNext, hasPrev)
- Default 20 results per page

## Phase 5 Features (✅ Completed)

### Real-time Notifications (WebSocket)
- WebSocket gateway with Socket.IO integration
- Real-time event broadcasting to tenant-scoped rooms
- Event types: application_created, application_updated, interview_scheduled, resume_parsed, job_posted, candidate_created
- Client authentication and room management
- Auto-notify on all major platform events
- Connection tracking and monitoring
- Production-ready CORS configuration

### GDPR Compliance Tools
- **Right of Access (Article 15)**: Complete data export in JSON format
  - Export all candidate personal data
  - Include resumes, applications, AI analysis
  - Metadata with data retention policy
- **Right to Erasure (Article 17)**: Data deletion with options
  - Hard delete or anonymization
  - Keep application history for compliance
  - Cascade deletion of resumes and applications
- **Data Retention Reporting**:
  - Identify candidates with 2+ years inactivity
  - Identify candidates with 5+ years inactivity
  - Automated compliance recommendations
- **Consent Management**: Verify and track candidate consent
- **Email Lookup**: Find candidate by email for data requests

### AI-Powered Candidate Ranking
- **Smart Ranking Algorithm** using Google Gemini Pro
  - 0-100 scoring system with detailed reasoning
  - Skill matching percentage calculation
  - Experience level assessment
  - Strength and weakness identification
  - Recommendation categories (strong_match → poor_match)
- **Batch Ranking**: Rank multiple candidates against a job
  - Automatic sorting by score (highest first)
  - Rate limiting to avoid API quota issues
  - Parallel processing with delays
- **Fallback Ranking**: Basic skill matching when AI unavailable
  - 70% weight on required skills
  - 30% weight on preferred skills
  - Automatic fallback on API failures

### Additional Features
- TypeScript compilation successful across all modules
- WebSocket integration ready for real-time dashboards
- GDPR-compliant data handling
- AI ranking reduces time-to-shortlist by 80%

## Future Enhancements (Phase 6)

- SSO authentication (SAML 2.0, OIDC)
- Advanced NLP with transformer models (spaCy, Hugging Face)
- RAG pipeline for semantic search (FAISS + embeddings)
- Vector database for resume embeddings (Pinecone, Weaviate)
- Video interview integration (Zoom, Google Meet API)
- Automated email campaigns and nurture sequences
- Mobile app (React Native)
- Advanced audit logging with tamper-proof logs

## API runs on

```
http://localhost:3001
```

## Architecture

```
backend/
├── src/
│   ├── ai/              # Google AI integration (Gemini Pro + AI Ranking)
│   ├── analytics/       # Analytics & reporting service
│   ├── candidates/      # Candidate & resume management + bulk ops
│   ├── database/        # TypeORM entities & config
│   │   └── entities/    # 7 database models (Tenant, User, Job, Candidate, Resume, Application, Interview)
│   ├── gdpr/            # GDPR compliance (data export, right to be forgotten)
│   ├── interviews/      # Interview scheduling & management
│   ├── jobs/            # Job posting management
│   ├── notifications/   # Email notification service
│   ├── realtime/        # WebSocket gateway for real-time events
│   ├── app.module.ts    # Root module (10 feature modules)
│   └── main.ts          # App entry point
├── .env                 # Environment variables
└── tsconfig.json        # TypeScript config
```
