# Workera

<div align="center">
  <img src="frontend/public/images/brand/Workera_Full_logo.png" alt="Workera Logo" width="300"/>

  <p><strong>Enterprise-Grade AI-Powered Recruitment Automation Platform</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#local-installation">Local Setup</a> •
    <a href="#gcp-deployment">GCP Deployment</a> •
    <a href="#api-documentation">API Docs</a>
  </p>
</div>

---

## Overview

Workera automates end-to-end hiring workflows with advanced AI/NLP technology. From resume parsing to intelligent candidate matching, Workera streamlines recruitment for modern teams.

### Key Capabilities

- **AI Resume Parser** - Extract skills, experience, education automatically
- **Semantic Search** - Find candidates using natural language queries
- **Smart Matching** - RAG-powered candidate-job matching with explanations
- **Email Campaigns** - Targeted outreach with personalization
- **Real-time Dashboard** - Live activity feed and analytics
- **GDPR Compliant** - Built-in data privacy and audit logging

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Mobile-first** responsive design

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** (multi-tenant)
- **Google Generative AI** (Gemini Pro)
- **Vector Embeddings** (FAISS-like in-memory store)
- **WebSocket** (Socket.IO) for real-time updates

---

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd Workera

# Install dependencies
npm install

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start development servers
npm run dev:backend   # Backend on port 3001
npm run dev:frontend  # Frontend on port 3000
```

Visit http://localhost:3000 to see the app!

---

## Local Installation

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Google AI API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Step 1: Database Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb workera

# Verify connection
psql workera
```

<details>
<summary>Ubuntu/Debian Setup</summary>

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb workera
```
</details>

<details>
<summary>Windows Setup</summary>

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer and set password
3. Use pgAdmin or psql to create database `workera`
</details>

### Step 2: Backend Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=workera

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Server
PORT=3001
NODE_ENV=development
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 4: Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Step 5: Verify Installation

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## GCP Deployment

Deploy Workera to Google Cloud Platform with Cloud Run and Cloud SQL.

### Prerequisites

- **GCP Account** with billing enabled
- **gcloud CLI** installed ([Install guide](https://cloud.google.com/sdk/docs/install))
- **Docker** installed

### Architecture

```
┌─────────────────┐      ┌─────────────────┐
│   Cloud Run     │      │   Cloud Run     │
│   (Frontend)    │─────▶│   (Backend)     │
└─────────────────┘      └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   Cloud SQL     │
                         │  (PostgreSQL)   │
                         └─────────────────┘
```

### Step 1: Set Up GCP Project

```bash
# Login to GCP
gcloud auth login

# Create new project
gcloud projects create workera-prod --name="Workera Production"

# Set project
gcloud config set project workera-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 2: Create Cloud SQL Database

```bash
# Create PostgreSQL instance
gcloud sql instances create workera-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD

# Create database
gcloud sql databases create workera --instance=workera-db

# Get connection name (save this)
gcloud sql instances describe workera-db --format="value(connectionName)"
```

### Step 3: Store Secrets

```bash
# Store database password
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Store Google AI API key
echo -n "YOUR_GOOGLE_AI_KEY" | gcloud secrets create google-ai-key --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe workera-prod --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-ai-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 4: Deploy Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/main"]
```

Update `backend/src/main.ts` to use port from environment:

```typescript
const port = process.env.PORT || 3001;
await app.listen(port, '0.0.0.0');
```

Deploy to Cloud Run:

```bash
cd backend

# Build and deploy
gcloud run deploy workera-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets DB_PASSWORD=db-password:latest,GOOGLE_AI_API_KEY=google-ai-key:latest \
  --set-env-vars DB_HOST=/cloudsql/YOUR_CONNECTION_NAME \
  --set-env-vars DB_PORT=5432 \
  --set-env-vars DB_USERNAME=postgres \
  --set-env-vars DB_NAME=workera \
  --add-cloudsql-instances YOUR_CONNECTION_NAME

# Get backend URL
gcloud run services describe workera-backend --region us-central1 --format="value(status.url)"
```

### Step 5: Deploy Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["npm", "start", "--", "-p", "8080"]
```

Update `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
```

Deploy:

```bash
cd frontend

# Build and deploy
gcloud run deploy workera-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL

# Get frontend URL
gcloud run services describe workera-frontend --region us-central1 --format="value(status.url)"
```

### Step 6: Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service workera-frontend \
  --domain workera.yourdomain.com \
  --region us-central1

# Follow DNS instructions provided by GCP
```

### Step 7: Set Up CI/CD with Cloud Build

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/workera-backend', './backend']

  # Deploy backend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'workera-backend'
      - '--image=gcr.io/$PROJECT_ID/workera-backend'
      - '--region=us-central1'
      - '--platform=managed'

  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/workera-frontend', './frontend']

  # Deploy frontend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'workera-frontend'
      - '--image=gcr.io/$PROJECT_ID/workera-frontend'
      - '--region=us-central1'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/workera-backend'
  - 'gcr.io/$PROJECT_ID/workera-frontend'
```

### Monitoring & Logs

```bash
# View backend logs
gcloud run logs read workera-backend --region us-central1

# View frontend logs
gcloud run logs read workera-frontend --region us-central1

# Monitor database
gcloud sql operations list --instance=workera-db
```

### Cost Optimization

- **Cloud Run**: Pay only for requests (free tier: 2M requests/month)
- **Cloud SQL**: Use `db-f1-micro` for dev ($7/month) or `db-g1-small` for production
- **Storage**: Enable automatic backups and set retention policy
- **Scaling**: Configure min/max instances based on traffic

---

## API Documentation

### Authentication

All API endpoints require `tenantId` in query parameters or request body.

### Core Endpoints

**Jobs**
```bash
GET    /jobs?tenantId=xxx           # List jobs
POST   /jobs                        # Create job
GET    /jobs/:id?tenantId=xxx       # Get job
PUT    /jobs/:id                    # Update job
DELETE /jobs/:id?tenantId=xxx       # Delete job
```

**Candidates**
```bash
GET    /candidates?tenantId=xxx     # List candidates
POST   /candidates                  # Create candidate
GET    /candidates/:id?tenantId=xxx # Get candidate
POST   /candidates/bulk-import      # Import CSV
```

**Semantic Search**
```bash
POST   /semantic-search             # Natural language search
POST   /semantic-search/candidates-for-job  # Find matches
POST   /semantic-search/answer      # Ask questions
POST   /semantic-search/explain-match      # Explain match
```

**NLP**
```bash
POST   /nlp/analyze                 # Analyze text
POST   /nlp/skills                  # Extract skills
POST   /nlp/similarity              # Calculate similarity
```

**Campaigns**
```bash
POST   /campaigns                   # Create campaign
POST   /campaigns/:id/send          # Send campaign
GET    /campaigns/stats?tenantId=xxx # Get statistics
```

**Activity Feed**
```bash
GET    /activity-feed?tenantId=xxx  # Get activities
GET    /activity-feed/important?tenantId=xxx # Important activities
POST   /activity-feed               # Log activity
```

### Example: Semantic Search

```javascript
const response = await fetch('http://localhost:3001/semantic-search/candidates-for-job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobDescription: 'Senior React developer with AWS experience',
    tenantId: 'your-tenant-id',
    topK: 10
  })
});

const { results, ragAnswer } = await response.json();
console.log('Top matches:', results);
console.log('AI explanation:', ragAnswer.answer);
```

---

## Features by Phase

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1-3** | Frontend, Backend, Database | ✅ Complete |
| **Phase 4** | Jobs, Candidates, Applications | ✅ Complete |
| **Phase 5** | WebSocket, GDPR, AI Ranking | ✅ Complete |
| **Phase 6** | Audit Logs, Campaign Infrastructure | ✅ Complete |
| **Phase 7** | Campaign Engine, Activity Feed | ✅ Complete |
| **Phase 8** | NLP, RAG, Semantic Search | ✅ Complete |
| **Phase 9** | Mobile-Friendly UI | ✅ Complete |

---

## Environment Variables Reference

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=workera

# Google AI
GOOGLE_AI_API_KEY=your_api_key

# Server
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Reset database
dropdb workera
createdb workera

# Check connection
psql -h localhost -U postgres -d workera
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Google AI API Errors

- Verify API key is correct
- Check quota at https://console.cloud.google.com/apis/dashboard
- Enable Generative Language API

---

## Development

### Project Structure

```
Workera/
├── frontend/          # Next.js app
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── public/       # Static assets
│
├── backend/          # NestJS API
│   └── src/
│       ├── ai/              # AI services
│       ├── nlp/             # NLP & transformers
│       ├── embeddings/      # Vector store
│       ├── semantic-search/ # RAG pipeline
│       ├── campaigns/       # Email campaigns
│       ├── activity-feed/   # Activity tracking
│       └── database/        # Entities & migrations
│
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

---

## License

Proprietary - Powered by Kauzway

---

## Support

- **Documentation**: See `/docs` folder
- **Issues**: Create issue in repository
- **Email**: support@workera.com

---

<div align="center">
  <p>Made with ❤️ for modern recruitment teams</p>
  <p>
    <a href="#overview">Back to Top</a>
  </p>
</div>
