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
- `POST /candidates/search` - Search candidates by skills/location
- `POST /candidates/:id/analyze` - AI analysis against job

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

## Future Enhancements (Phase 4)

- SSO authentication (SAML 2.0, OIDC)
- Advanced NLP with transformer models (spaCy, Hugging Face)
- RAG pipeline for semantic search (FAISS + embeddings)
- Vector database for resume embeddings
- Bulk operations and batch processing
- Email notifications
- Interview scheduling
- Analytics and reporting

## API runs on

```
http://localhost:3001
```

## Architecture

```
backend/
├── src/
│   ├── ai/              # Google AI integration
│   ├── candidates/      # Candidate & resume management
│   ├── database/        # TypeORM entities & config
│   │   └── entities/    # Database models
│   ├── jobs/            # Job management
│   └── main.ts          # App entry point
├── .env                 # Environment variables
└── tsconfig.json        # TypeScript config
```
