# Workera

**Enterprise-Grade Recruitment Automation Platform**

Workera is an AI-powered recruitment platform that automates end-to-end hiring workflows with advanced LLM/RAG pipelines for resume parsing, semantic candidate search, and intelligent matching.

## 🚀 Features

- **AI Job Description Generator** - Generate polished JDs with AI; post across LinkedIn, Workday, Indeed
- **Smart Resume Parser** - Auto-extract skills, experience, education into structured profiles
- **Fine-Tune Candidate Search** - Chat-based filtering by skill, experience, location (LLM-driven)
- **Top Candidate Selection** - Shortlist top matches, send interviews, auto-score candidates

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
