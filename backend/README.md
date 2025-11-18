# Workera Backend API

NestJS-based backend API for the Workera recruitment automation platform.

## Features

- **AI Job Description Generation** - Uses Google Generative AI (Gemini Pro) to create professional job descriptions
- **Resume Analysis** - AI-powered resume screening and matching against job descriptions  
- **Jobs Management** - Create, update, and post jobs to multiple platforms
- **RESTful API** - Clean, documented endpoints for frontend integration

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript
- **AI**: Google Generative AI (Gemini Pro)
- **Runtime**: Node.js 18+

## API Endpoints

### AI Services
- `POST /ai/generate-jd` - Generate job description
- `POST /ai/analyze-resume` - Analyze resume against job description

### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/:id` - Get job by ID
- `POST /jobs` - Create new job
- `PUT /jobs/:id/post` - Post job to channels

## Installation

```bash
npm install
```

## Running the API

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Environment Variables

Create a `.env` file:

```
GOOGLE_AI_API_KEY=your_google_ai_api_key
PORT=3001
```

## API runs on

```
http://localhost:3001
```

## Future Enhancements (Phase 3)

- PostgreSQL integration
- Multi-tenant support
- SSO authentication (SAML, OIDC)
- Resume parser with NLP
- RAG pipeline for semantic search
- Candidate management
