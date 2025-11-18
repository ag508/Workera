# Workera

**Enterprise-Grade Recruitment Automation Platform**

Workera is an AI-powered recruitment platform that automates end-to-end hiring workflows with advanced LLM/RAG pipelines for resume parsing, semantic candidate search, and intelligent matching.

## 🚀 Features

### Core Recruitment Features
- **AI Job Description Generator** - Generate polished JDs with AI; post across LinkedIn, Workday, Indeed
- **Smart Resume Parser** - Auto-extract skills, experience, education into structured profiles
- **Fine-Tune Candidate Search** - Chat-based filtering by skill, experience, location (LLM-driven)
- **Top Candidate Selection** - Shortlist top matches, send interviews, auto-score candidates

### Advanced Features
- **Email Campaigns** - Send targeted campaigns with rate limiting (10 emails/sec) and personalization
- **Activity Feed** - Real-time timeline tracking all platform activities with WebSocket support
- **Real-time Notifications** - WebSocket-based live updates for applications, interviews, and more
- **GDPR Compliance** - Right of Access (Article 15) and Right to Erasure (Article 17)
- **AI-Powered Ranking** - Intelligent candidate ranking using Google Gemini Pro
- **Comprehensive Audit Logs** - Immutable audit trail with before/after snapshots
- **Bulk Operations** - Import/export candidates, interviews, applications at scale
- **Analytics Dashboard** - Advanced insights on hiring pipeline performance

### Advanced NLP & AI Features
- **Transformer-Based NLP** - Advanced text analysis with Google Generative AI (Gemini Pro)
- **Semantic Search** - RAG pipeline for context-aware candidate/job matching
- **Vector Embeddings** - In-memory FAISS-like vector store for similarity search
- **Intent Recognition** - Natural language query understanding and entity extraction
- **Explainable AI** - Match explanations with strengths/weaknesses analysis
- **Batch Indexing** - Automatic vector indexing for candidates and jobs

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend** (`/frontend`) - Next.js 14+ with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend** (`/backend`) - NestJS with PostgreSQL, AI services, and RAG pipeline

## 🛠️ Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)

### Backend
- NestJS
- PostgreSQL (multi-tenant)
- Vector DB (FAISS/Pinecone)
- LLM Integration (OpenAI/Claude)
- SSO (SAML 2.0, OIDC)

### Infrastructure
- Docker & Kubernetes
- GCP (Cloud Run, Cloud SQL)
- CI/CD with GitHub Actions

## 📦 Installation

```bash
# Install dependencies
npm install

# Run frontend development server
npm run dev:frontend

# Run backend development server
npm run dev:backend
```

## 🎨 Brand Identity

- **Primary Colors**: Deep Emerald Green (#10B981), Soft Mint (#6EE7B7)
- **Accent**: Gold (#F1C40F)
- **Typography**: Inter, IBM Plex Sans, Source Sans Pro
- **Design System**: Enterprise UI with glassmorphism effects

## 📄 License

Proprietary - Powered by Kauzway

## 🔐 Security

- Multi-tenant data isolation
- SSO support (SAML, OIDC)
- End-to-end encryption
- RBAC (Role-Based Access Control)
- Comprehensive audit logging
- GDPR compliance tools

## 📚 API Documentation

### Email Campaigns API
Campaign management with rate limiting and recipient targeting:

```bash
# Create campaign
POST /campaigns
{
  "name": "Senior Developer Outreach",
  "type": "one_time",
  "subject": "Exciting opportunity at {{company}}",
  "htmlContent": "<p>Hi {{firstName}},...</p>",
  "recipientCriteria": {
    "skills": ["JavaScript", "React"],
    "location": "San Francisco"
  }
}

# Send campaign
POST /campaigns/:id/send

# Get campaign stats
GET /campaigns/stats?tenantId=xxx
```

### Activity Feed API
Real-time activity tracking and timeline:

```bash
# Get activity feed
GET /activity-feed?tenantId=xxx&limit=50&offset=0

# Get entity timeline
GET /activity-feed/entity/:entityType/:entityId?tenantId=xxx

# Get important activities
GET /activity-feed/important?tenantId=xxx&limit=10

# Search activities
GET /activity-feed/search?tenantId=xxx&q=candidate

# Get activity statistics
GET /activity-feed/stats?tenantId=xxx
```

### Real-time WebSocket Events
Connect to receive live updates:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Authenticate
socket.emit('authenticate', { tenantId: 'your-tenant-id' });

// Listen for events
socket.on('event', (event) => {
  console.log(event.type); // 'activity_created', 'application_created', etc.
  console.log(event.data);
});

// Join specific room
socket.emit('join_room', { room: 'tenant:your-tenant-id' });
```

### GDPR Compliance API
Data access and deletion:

```bash
# Export all user data (Article 15)
POST /gdpr/export-data
{
  "tenantId": "xxx",
  "email": "user@example.com"
}

# Delete user data (Article 17)
POST /gdpr/delete-user
{
  "tenantId": "xxx",
  "email": "user@example.com",
  "hardDelete": true  // or false for anonymization
}
```

### Audit Logs API
Immutable audit trail:

```bash
# Get audit logs
GET /audit?tenantId=xxx&entityType=candidate&limit=100

# Get logs for specific entity
GET /audit/entity/:entityType/:entityId?tenantId=xxx
```

### NLP & Semantic Search API
Advanced NLP and RAG-powered search:

```bash
# Analyze text with NLP
POST /nlp/analyze
{
  "text": "Senior Software Engineer with 5+ years experience in React..."
}

# Generate embeddings
POST /nlp/embed
{
  "text": "Python developer with machine learning expertise"
}

# Extract skills from text
POST /nlp/skills
{
  "text": "Experience with JavaScript, React, Node.js, AWS, Docker..."
}

# Calculate semantic similarity
POST /nlp/similarity
{
  "text1": "Candidate profile...",
  "text2": "Job description..."
}

# Semantic search with RAG
POST /semantic-search
{
  "query": "Find senior React developers in San Francisco",
  "tenantId": "xxx",
  "entityType": "candidate",
  "topK": 20,
  "useRAG": true
}

# Find best candidates for job (RAG-powered)
POST /semantic-search/candidates-for-job
{
  "jobDescription": "Senior Full Stack Engineer...",
  "tenantId": "xxx",
  "topK": 20
}

# Answer questions using RAG
POST /semantic-search/answer
{
  "question": "Who are the top Python developers?",
  "context": "candidates",
  "tenantId": "xxx"
}

# Explain match between candidate and job
POST /semantic-search/explain-match
{
  "candidateText": "Candidate profile...",
  "jobText": "Job description..."
}

# Batch index candidates/jobs for semantic search
POST /semantic-search/batch-index
{
  "entityType": "candidate",
  "tenantId": "xxx"
}

# Vector embeddings operations
POST /embeddings/add
{
  "id": "candidate-123",
  "text": "Candidate profile...",
  "entityType": "candidate",
  "metadata": {"name": "John Doe"}
}

POST /embeddings/search
{
  "query": "React developer",
  "entityType": "candidate",
  "topK": 10
}

GET /embeddings/stats
# Returns vector store statistics
```

## 🏗️ Implementation Roadmap

### Phase 1-3: Foundation ✅
- Frontend with Next.js 14, landing page, dashboard
- Backend API with NestJS, PostgreSQL
- Google AI integration (Gemini Pro)
- Multi-tenant database architecture

### Phase 4: Core Features ✅
- Job management with AI-powered JD generation
- Candidate management with resume parsing
- Application tracking system
- Interview scheduling and management

### Phase 5: Advanced AI & Compliance ✅
- Real-time notifications (WebSocket with Socket.IO)
- GDPR compliance tools (Articles 15 & 17)
- AI-powered candidate ranking
- Analytics and reporting

### Phase 6: Enterprise Features ✅
- Comprehensive audit logging system
- Email campaign infrastructure
- Bulk import/export operations
- Data retention policies

### Phase 7: Campaign & Activity Systems ✅
- **Campaign Sending Engine** - Rate-limited email campaigns (10/sec) with batch processing
- **Activity Feed** - Real-time timeline with 17+ activity types
- **Content Personalization** - Template system with {{firstName}}, {{lastName}}, {{email}}
- **Advanced Filtering** - Recipient targeting by skills, location, application status, job IDs

### Phase 8: Advanced NLP & RAG ✅
- **Transformer-Based NLP** - Google Generative AI (Gemini Pro & embedding-001)
- **RAG Pipeline** - Retrieval-Augmented Generation for context-aware search
- **Vector Embeddings** - In-memory FAISS-like vector store with cosine similarity
- **Semantic Search** - Natural language query understanding and matching
- **Explainable AI** - Match reasoning with strengths/weaknesses analysis
- **Batch Indexing** - Automatic vector indexing for candidates and jobs

### Phase 9: Mobile-Friendly UI ✅
- **Responsive Design** - Mobile-first approach with Tailwind breakpoints
- **Mobile Navigation** - Hamburger menu and touch-friendly UI
- **Adaptive Layouts** - Responsive grids and typography across all screen sizes
- **Dashboard Optimization** - Mobile-optimized KPIs, charts, and activity feeds

### Phase 10: Mobile Platform (Planned)
- React Native mobile app
- iOS and Android support
- Push notifications
- Offline-first architecture

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=workera

# Google AI
GOOGLE_AI_API_KEY=your-api-key-here

# Server
PORT=3001
NODE_ENV=development
```

## 🚦 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd Workera
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
createdb workera
```

4. **Configure environment variables**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

5. **Run the application**
```bash
# Start backend (port 3001)
npm run dev:backend

# Start frontend (port 3000)
npm run dev:frontend
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health
