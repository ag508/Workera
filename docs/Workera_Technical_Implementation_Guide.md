# Workera Platform Enhancement - Technical Implementation Guide

## Overview

This guide provides detailed implementation instructions for enhancing the Workera platform, addressing gaps, and integrating the Job Requisition Management System.

---

## Table of Contents

1. [Critical Fixes](#1-critical-fixes)
2. [Navigation Restructuring](#2-navigation-restructuring)
3. [Enhanced Search System](#3-enhanced-search-system)
4. [Job Requisition Integration](#4-job-requisition-integration)
5. [Database Migrations](#5-database-migrations)
6. [API Specifications](#6-api-specifications)

---

## 1. Critical Fixes

### 1.1 Authentication Guard Implementation

**File: `backend/src/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

**File: `backend/src/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Apply globally in `main.ts`:**

```typescript
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### 1.2 Rate Limiting

**Install:**
```bash
npm install @nestjs/throttler
```

**File: `backend/src/app.module.ts`**

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,      // 1 second
        limit: 10,      // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,     // 10 seconds
        limit: 50,      // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,     // 1 minute
        limit: 200,     // 200 requests per minute
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 1.3 Environment Configuration

**File: `backend/.env.production`**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/workera
DB_SSL=true
DB_POOL_SIZE=20

# Authentication
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-chars
JWT_EXPIRY=8h
JWT_REFRESH_EXPIRY=7d

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX=workera-candidates

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=workera-uploads
AWS_S3_REGION=us-east-1

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@workera.com

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://app.workera.com,https://workera.com
```

### 1.4 Remove Demo Bypass

Search and remove all instances of demo bypass code:

```typescript
// REMOVE patterns like:
if (process.env.NODE_ENV === 'development' || !user) {
  return mockUser; // REMOVE THIS
}

// REPLACE with:
if (!user) {
  throw new UnauthorizedException();
}
```

---

## 2. Navigation Restructuring

### 2.1 Updated Sidebar Component

**File: `frontend/components/dashboard/Sidebar.tsx`**

```typescript
import { 
  LayoutDashboard, 
  FileText,        // Requisitions
  Briefcase,       // Jobs
  Users,           // Talent Pool
  Calendar,        // Interviews
  Inbox,           // Inbox
  BarChart3,       // Analytics
  Settings 
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Requisitions',
    href: '/dashboard/requisitions',
    icon: FileText,
    badge: 'pendingApprovals', // Show pending approval count
    children: [
      { name: 'All Requisitions', href: '/dashboard/requisitions' },
      { name: 'Create Requisition', href: '/dashboard/requisitions/create' },
      { name: 'My Approvals', href: '/dashboard/requisitions/approvals' },
      { name: 'Budget', href: '/dashboard/requisitions/budget' },
    ],
  },
  {
    name: 'Jobs',
    href: '/dashboard/jobs',
    icon: Briefcase,
    children: [
      { name: 'Active Jobs', href: '/dashboard/jobs' },
      { name: 'Create Job', href: '/dashboard/jobs/create' },
      { name: 'Application Forms', href: '/dashboard/jobs/forms' },
      { name: 'Job Postings', href: '/dashboard/jobs/postings' },
    ],
  },
  {
    name: 'Talent Pool',
    href: '/dashboard/talent',
    icon: Users,
    children: [
      { name: 'All Candidates', href: '/dashboard/talent' },
      { name: 'Resume Bank', href: '/dashboard/talent/resumes' },
      { name: 'Shortlists', href: '/dashboard/talent/shortlists' },
      { name: 'Talent Pipelines', href: '/dashboard/talent/pipelines' },
    ],
  },
  {
    name: 'Interviews',
    href: '/dashboard/interviews',
    icon: Calendar,
    children: [
      { name: 'Scheduled', href: '/dashboard/interviews' },
      { name: 'Calendar View', href: '/dashboard/interviews/calendar' },
      { name: 'Feedback', href: '/dashboard/interviews/feedback' },
    ],
  },
  {
    name: 'Inbox',
    href: '/dashboard/inbox',
    icon: Inbox,
    badge: 'unreadCount',
    children: [
      { name: 'Messages', href: '/dashboard/inbox' },
      { name: 'Notifications', href: '/dashboard/inbox/notifications' },
      { name: 'Email Templates', href: '/dashboard/inbox/templates' },
    ],
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/dashboard/analytics' },
      { name: 'Pipeline Reports', href: '/dashboard/analytics/pipeline' },
      { name: 'Source Analysis', href: '/dashboard/analytics/sources' },
      { name: 'Requisition Metrics', href: '/dashboard/analytics/requisitions' },
    ],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    children: [
      { name: 'Profile', href: '/dashboard/settings' },
      { name: 'Team', href: '/dashboard/settings/team' },
      { name: 'Integrations', href: '/dashboard/settings/integrations' },
      { name: 'Billing', href: '/dashboard/settings/billing' },
    ],
  },
];

export default function Sidebar() {
  // Component implementation
}
```

### 2.2 Global Search Header

**File: `frontend/components/dashboard/GlobalSearch.tsx`**

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SearchResult {
  type: 'candidate' | 'job' | 'requisition' | 'application';
  id: string;
  title: string;
  subtitle: string;
  matchScore?: number;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cmd+K or Ctrl+K to open
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setOpen(true);
  });

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/search/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded">
          <Command className="w-3 h-3 inline" />K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <div className="flex items-center border-b px-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates, jobs, requisitions..."
              className="flex-1 px-4 py-4 text-lg outline-none"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-gray-500">No results found</div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Try searching for candidates, jobs, or requisitions
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 3. Enhanced Search System

### 3.1 Pinecone Integration

**Install:**
```bash
npm install @pinecone-database/pinecone
```

**File: `backend/src/vector-search/pinecone.service.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PineconeService implements OnModuleInit {
  private pinecone: Pinecone;
  private index: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.pinecone = new Pinecone({
      apiKey: this.configService.get('PINECONE_API_KEY'),
    });
    
    this.index = this.pinecone.index(
      this.configService.get('PINECONE_INDEX')
    );
  }

  async upsertCandidate(
    candidateId: string,
    embedding: number[],
    metadata: CandidateMetadata,
    tenantId: string
  ) {
    await this.index.namespace(tenantId).upsert([
      {
        id: candidateId,
        values: embedding,
        metadata: {
          ...metadata,
          tenantId,
        },
      },
    ]);
  }

  async searchCandidates(
    queryEmbedding: number[],
    filters: SearchFilters,
    tenantId: string,
    topK: number = 20
  ): Promise<SearchResult[]> {
    const filterConditions: any = {};

    // Build metadata filters
    if (filters.experienceMin !== undefined) {
      filterConditions.yearsExperience = { $gte: filters.experienceMin };
    }
    if (filters.experienceMax !== undefined) {
      filterConditions.yearsExperience = { 
        ...filterConditions.yearsExperience,
        $lte: filters.experienceMax 
      };
    }
    if (filters.skills?.length) {
      filterConditions.skills = { $in: filters.skills };
    }
    if (filters.location) {
      filterConditions.location = { $eq: filters.location };
    }
    if (filters.workModel) {
      filterConditions.workModel = { $eq: filters.workModel };
    }
    if (filters.noticePeriod) {
      filterConditions.noticePeriod = { $eq: filters.noticePeriod };
    }

    const results = await this.index.namespace(tenantId).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined,
    });

    return results.matches.map((match: any) => ({
      candidateId: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  }

  async deleteCandidate(candidateId: string, tenantId: string) {
    await this.index.namespace(tenantId).deleteOne(candidateId);
  }
}

interface CandidateMetadata {
  name: string;
  email: string;
  skills: string[];
  yearsExperience: number;
  location: string;
  workModel: string;
  noticePeriod: string;
  currentTitle: string;
  currentCompany: string;
  expectedSalary?: number;
}

interface SearchFilters {
  experienceMin?: number;
  experienceMax?: number;
  skills?: string[];
  location?: string;
  workModel?: string;
  noticePeriod?: string;
  salaryMin?: number;
  salaryMax?: number;
}

interface SearchResult {
  candidateId: string;
  score: number;
  metadata: CandidateMetadata;
}
```

### 3.2 Enhanced Search Service

**File: `backend/src/semantic-search/enhanced-search.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PineconeService } from '../vector-search/pinecone.service';
import { EmbeddingService } from '../embeddings/embedding.service';
import { NLPService } from '../nlp/nlp.service';
import { CandidatesService } from '../candidates/candidates.service';

@Injectable()
export class EnhancedSearchService {
  constructor(
    private pineconeService: PineconeService,
    private embeddingService: EmbeddingService,
    private nlpService: NLPService,
    private candidatesService: CandidatesService,
  ) {}

  async searchWithNaturalLanguage(
    query: string,
    tenantId: string,
    options: SearchOptions = {}
  ): Promise<EnhancedSearchResult> {
    // Parse natural language query
    const parsedQuery = await this.nlpService.parseSearchQuery(query);
    
    // Generate embedding for semantic search
    const queryEmbedding = await this.embeddingService.generateEmbedding(
      parsedQuery.semanticQuery
    );

    // Execute vector search with filters
    const vectorResults = await this.pineconeService.searchCandidates(
      queryEmbedding,
      parsedQuery.filters,
      tenantId,
      options.limit || 20
    );

    // Enrich results with full candidate data
    const candidateIds = vectorResults.map(r => r.candidateId);
    const candidates = await this.candidatesService.findByIds(candidateIds, tenantId);

    // Generate AI explanations for top matches
    const enrichedResults = await Promise.all(
      vectorResults.slice(0, 10).map(async (result, index) => {
        const candidate = candidates.find(c => c.id === result.candidateId);
        const explanation = await this.generateMatchExplanation(
          query,
          candidate,
          result.score
        );
        
        return {
          rank: index + 1,
          candidate,
          score: result.score,
          explanation,
        };
      })
    );

    // Generate facets for filter counts
    const facets = await this.generateFacets(vectorResults, tenantId);

    return {
      results: enrichedResults,
      total: vectorResults.length,
      query: {
        original: query,
        parsed: parsedQuery,
      },
      facets,
    };
  }

  private async generateMatchExplanation(
    query: string,
    candidate: any,
    score: number
  ): Promise<string> {
    // Use AI to generate human-readable explanation
    const prompt = `
      Explain in 1-2 sentences why this candidate matches the search query.
      
      Query: ${query}
      
      Candidate:
      - Name: ${candidate.firstName} ${candidate.lastName}
      - Title: ${candidate.currentTitle}
      - Skills: ${candidate.skills?.join(', ')}
      - Experience: ${candidate.yearsExperience} years
      - Location: ${candidate.location}
      
      Match Score: ${(score * 100).toFixed(0)}%
    `;

    return this.nlpService.generateText(prompt);
  }

  private async generateFacets(
    results: any[],
    tenantId: string
  ): Promise<SearchFacets> {
    // Aggregate facet counts from results
    const facets: SearchFacets = {
      skills: {},
      locations: {},
      experienceLevels: {},
      workModels: {},
      noticePeriods: {},
    };

    for (const result of results) {
      const metadata = result.metadata;
      
      // Skills
      for (const skill of metadata.skills || []) {
        facets.skills[skill] = (facets.skills[skill] || 0) + 1;
      }
      
      // Location
      if (metadata.location) {
        facets.locations[metadata.location] = 
          (facets.locations[metadata.location] || 0) + 1;
      }
      
      // Experience level
      const level = this.categorizeExperience(metadata.yearsExperience);
      facets.experienceLevels[level] = 
        (facets.experienceLevels[level] || 0) + 1;
      
      // Work model
      if (metadata.workModel) {
        facets.workModels[metadata.workModel] = 
          (facets.workModels[metadata.workModel] || 0) + 1;
      }
      
      // Notice period
      if (metadata.noticePeriod) {
        facets.noticePeriods[metadata.noticePeriod] = 
          (facets.noticePeriods[metadata.noticePeriod] || 0) + 1;
      }
    }

    return facets;
  }

  private categorizeExperience(years: number): string {
    if (years < 2) return 'Entry Level (0-2)';
    if (years < 5) return 'Mid Level (2-5)';
    if (years < 10) return 'Senior (5-10)';
    return 'Expert (10+)';
  }
}

interface SearchOptions {
  limit?: number;
  includeExplanations?: boolean;
}

interface EnhancedSearchResult {
  results: Array<{
    rank: number;
    candidate: any;
    score: number;
    explanation: string;
  }>;
  total: number;
  query: {
    original: string;
    parsed: any;
  };
  facets: SearchFacets;
}

interface SearchFacets {
  skills: Record<string, number>;
  locations: Record<string, number>;
  experienceLevels: Record<string, number>;
  workModels: Record<string, number>;
  noticePeriods: Record<string, number>;
}
```

### 3.3 Advanced Filter Component

**File: `frontend/components/search/AdvancedFilters.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface FilterState {
  experienceRange: [number, number];
  skills: string[];
  skillLogic: 'AND' | 'OR';
  locations: string[];
  workModels: string[];
  noticePeriods: string[];
  salaryRange: [number, number];
  educationLevels: string[];
  certifications: string[];
  sourceChannels: string[];
  applicationStatus: string[];
  matchScoreRange: [number, number];
  customTags: string[];
}

const defaultFilters: FilterState = {
  experienceRange: [0, 30],
  skills: [],
  skillLogic: 'AND',
  locations: [],
  workModels: [],
  noticePeriods: [],
  salaryRange: [0, 500000],
  educationLevels: [],
  certifications: [],
  sourceChannels: [],
  applicationStatus: [],
  matchScoreRange: [0, 100],
  customTags: [],
};

const workModelOptions = ['Onsite', 'Hybrid', 'Remote'];
const noticePeriodOptions = ['Immediate', '2 Weeks', '1 Month', '2 Months', '3+ Months'];
const educationOptions = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD'];
const statusOptions = ['New', 'Contacted', 'Screening', 'Interviewing', 'Offered', 'Hired', 'Rejected'];

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  facets?: Record<string, Record<string, number>>;
}

export function AdvancedFilters({ onFilterChange, facets }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [expandedSections, setExpandedSections] = useState<string[]>(['experience', 'skills']);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value) && key !== 'experienceRange' && key !== 'salaryRange' && key !== 'matchScoreRange') {
      return value.length > 0;
    }
    if (key === 'experienceRange') return value[0] !== 0 || value[1] !== 30;
    if (key === 'salaryRange') return value[0] !== 0 || value[1] !== 500000;
    if (key === 'matchScoreRange') return value[0] !== 0 || value[1] !== 100;
    return false;
  }).length;

  return (
    <div className="w-80 bg-white border-r overflow-y-auto h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Experience Section */}
        <FilterSection
          title="Experience"
          isExpanded={expandedSections.includes('experience')}
          onToggle={() => toggleSection('experience')}
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.experienceRange[0]} years</span>
              <span>{filters.experienceRange[1]}+ years</span>
            </div>
            <Slider
              value={filters.experienceRange}
              min={0}
              max={30}
              step={1}
              onValueChange={(value) => updateFilter('experienceRange', value as [number, number])}
            />
          </div>
        </FilterSection>

        {/* Skills Section */}
        <FilterSection
          title="Skills"
          isExpanded={expandedSections.includes('skills')}
          onToggle={() => toggleSection('skills')}
        >
          <div className="space-y-3">
            <SkillInput
              skills={filters.skills}
              onChange={(skills) => updateFilter('skills', skills)}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Match:</span>
              <select
                value={filters.skillLogic}
                onChange={(e) => updateFilter('skillLogic', e.target.value as 'AND' | 'OR')}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="AND">All skills (AND)</option>
                <option value="OR">Any skill (OR)</option>
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Work Model Section */}
        <FilterSection
          title="Work Model"
          isExpanded={expandedSections.includes('workModel')}
          onToggle={() => toggleSection('workModel')}
        >
          <CheckboxGroup
            options={workModelOptions}
            selected={filters.workModels}
            onChange={(values) => updateFilter('workModels', values)}
            facets={facets?.workModels}
          />
        </FilterSection>

        {/* Notice Period Section */}
        <FilterSection
          title="Notice Period"
          isExpanded={expandedSections.includes('noticePeriod')}
          onToggle={() => toggleSection('noticePeriod')}
        >
          <CheckboxGroup
            options={noticePeriodOptions}
            selected={filters.noticePeriods}
            onChange={(values) => updateFilter('noticePeriods', values)}
            facets={facets?.noticePeriods}
          />
        </FilterSection>

        {/* Salary Range Section */}
        <FilterSection
          title="Expected Salary"
          isExpanded={expandedSections.includes('salary')}
          onToggle={() => toggleSection('salary')}
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>${(filters.salaryRange[0] / 1000).toFixed(0)}K</span>
              <span>${(filters.salaryRange[1] / 1000).toFixed(0)}K+</span>
            </div>
            <Slider
              value={filters.salaryRange}
              min={0}
              max={500000}
              step={10000}
              onValueChange={(value) => updateFilter('salaryRange', value as [number, number])}
            />
          </div>
        </FilterSection>

        {/* Education Section */}
        <FilterSection
          title="Education"
          isExpanded={expandedSections.includes('education')}
          onToggle={() => toggleSection('education')}
        >
          <CheckboxGroup
            options={educationOptions}
            selected={filters.educationLevels}
            onChange={(values) => updateFilter('educationLevels', values)}
            facets={facets?.educationLevels}
          />
        </FilterSection>

        {/* Application Status Section */}
        <FilterSection
          title="Application Status"
          isExpanded={expandedSections.includes('status')}
          onToggle={() => toggleSection('status')}
        >
          <CheckboxGroup
            options={statusOptions}
            selected={filters.applicationStatus}
            onChange={(values) => updateFilter('applicationStatus', values)}
            facets={facets?.applicationStatus}
          />
        </FilterSection>

        {/* Match Score Section */}
        <FilterSection
          title="AI Match Score"
          isExpanded={expandedSections.includes('matchScore')}
          onToggle={() => toggleSection('matchScore')}
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.matchScoreRange[0]}%</span>
              <span>{filters.matchScoreRange[1]}%</span>
            </div>
            <Slider
              value={filters.matchScoreRange}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => updateFilter('matchScoreRange', value as [number, number])}
            />
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

// Helper components...
function FilterSection({ title, isExpanded, onToggle, children }: any) {
  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-700">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function CheckboxGroup({ options, selected, onChange, facets }: any) {
  return (
    <div className="space-y-2">
      {options.map((option: string) => (
        <label key={option} className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={selected.includes(option)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selected, option]);
              } else {
                onChange(selected.filter((s: string) => s !== option));
              }
            }}
          />
          <span className="text-sm text-gray-700">{option}</span>
          {facets?.[option] !== undefined && (
            <span className="text-xs text-gray-400">({facets[option]})</span>
          )}
        </label>
      ))}
    </div>
  );
}

function SkillInput({ skills, onChange }: any) {
  const [input, setInput] = useState('');

  const addSkill = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      onChange([...skills, input.trim()]);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          placeholder="Add skill..."
          className="flex-1 px-3 py-1 text-sm border rounded"
        />
        <Button size="sm" onClick={addSkill}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.map((skill: string) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
            >
              {skill}
              <button onClick={() => onChange(skills.filter((s: string) => s !== skill))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Job Requisition Integration

### 4.1 Requisition Module Structure

```
backend/src/
├── requisition/
│   ├── requisition.module.ts
│   ├── requisition.controller.ts
│   ├── requisition.service.ts
│   ├── dto/
│   │   ├── create-requisition.dto.ts
│   │   ├── update-requisition.dto.ts
│   │   └── submit-requisition.dto.ts
│   ├── entities/
│   │   ├── requisition.entity.ts
│   │   └── approval-transaction.entity.ts
│   └── workflows/
│       ├── workflow.engine.ts
│       ├── approval.rules.ts
│       └── sla.service.ts
```

### 4.2 Requisition Entity

**File: `backend/src/requisition/entities/requisition.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn, JoinColumn, Index
} from 'typeorm';
import { Tenant } from '../../database/entities/tenant.entity';
import { User } from '../../database/entities/user.entity';
import { Department } from '../../database/entities/department.entity';
import { Job } from '../../database/entities/job.entity';
import { ApprovalTransaction } from './approval-transaction.entity';

export enum RequisitionType {
  POSITION_BASED = 'POSITION_BASED',
  NON_POSITION = 'NON_POSITION',
  REPLACEMENT = 'REPLACEMENT',
  NEW_HEADCOUNT = 'NEW_HEADCOUNT',
  EVERGREEN = 'EVERGREEN',
  PIPELINE = 'PIPELINE',
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
  CLOSED = 'CLOSED',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('job_requisitions')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'departmentId'])
@Index(['tenantId', 'hiringManagerId'])
export class JobRequisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requisitionNumber: string;

  @Column('uuid')
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'enum', enum: RequisitionType })
  requisitionType: RequisitionType;

  @Column({ type: 'enum', enum: RequisitionStatus, default: RequisitionStatus.DRAFT })
  status: RequisitionStatus;

  @Column('uuid')
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column('uuid')
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column('uuid')
  locationId: string;

  @Column()
  workModel: string;

  @Column()
  employmentType: string;

  @Column({ type: 'int' })
  headcount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  salaryMax: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column('uuid')
  costCenterId: string;

  @Column({ type: 'date' })
  targetStartDate: Date;

  @Column({ type: 'text', nullable: true })
  jobDescription: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.NORMAL })
  priority: Priority;

  @Column('uuid')
  hiringManagerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hiringManagerId' })
  hiringManager: User;

  @Column('uuid', { nullable: true })
  recruiterId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recruiterId' })
  recruiter: User;

  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column('uuid')
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @OneToMany(() => ApprovalTransaction, (approval) => approval.requisition)
  approvals: ApprovalTransaction[];
}
```

### 4.3 Workflow Engine

**File: `backend/src/requisition/workflows/workflow.engine.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRule } from '../entities/approval-rule.entity';
import { ApprovalTransaction, ApprovalStatus, ApproverRole } from '../entities/approval-transaction.entity';
import { JobRequisition } from '../entities/requisition.entity';
import { SlaService } from './sla.service';

@Injectable()
export class WorkflowEngine {
  constructor(
    @InjectRepository(ApprovalRule)
    private rulesRepository: Repository<ApprovalRule>,
    @InjectRepository(ApprovalTransaction)
    private approvalsRepository: Repository<ApprovalTransaction>,
    private slaService: SlaService,
  ) {}

  async generateWorkflow(requisition: JobRequisition): Promise<ApprovalTransaction[]> {
    // Get all active rules for tenant, ordered by priority
    const rules = await this.rulesRepository.find({
      where: { tenantId: requisition.tenantId, isActive: true },
      order: { priority: 'DESC', approvalLevel: 'ASC' },
    });

    const applicableApprovers: Map<number, ApproverRole[]> = new Map();

    for (const rule of rules) {
      if (this.evaluateRule(rule, requisition)) {
        const level = rule.approvalLevel;
        if (!applicableApprovers.has(level)) {
          applicableApprovers.set(level, []);
        }
        if (!applicableApprovers.get(level)!.includes(rule.approverRole)) {
          applicableApprovers.get(level)!.push(rule.approverRole);
        }
      }
    }

    // Create approval transactions
    const approvals: ApprovalTransaction[] = [];
    const sortedLevels = Array.from(applicableApprovers.keys()).sort((a, b) => a - b);

    for (const level of sortedLevels) {
      const roles = applicableApprovers.get(level)!;
      for (let order = 0; order < roles.length; order++) {
        const dueDate = this.slaService.calculateDueDate(requisition.priority);
        const approver = await this.findApprover(roles[order], requisition);

        const approval = this.approvalsRepository.create({
          requisitionId: requisition.id,
          approvalLevel: level,
          approvalOrder: order,
          approverRole: roles[order],
          approverUserId: approver.id,
          status: level === 1 && order === 0 ? ApprovalStatus.PENDING : ApprovalStatus.WAITING,
          dueDate,
        });

        approvals.push(approval);
      }
    }

    return this.approvalsRepository.save(approvals);
  }

  private evaluateRule(rule: ApprovalRule, requisition: JobRequisition): boolean {
    const { conditionField, conditionOperator, conditionValue } = rule;
    const fieldValue = this.getFieldValue(requisition, conditionField);

    switch (conditionOperator) {
      case 'EQ':
        return fieldValue === conditionValue;
      case 'NEQ':
        return fieldValue !== conditionValue;
      case 'GT':
        return Number(fieldValue) > Number(conditionValue);
      case 'GTE':
        return Number(fieldValue) >= Number(conditionValue);
      case 'LT':
        return Number(fieldValue) < Number(conditionValue);
      case 'LTE':
        return Number(fieldValue) <= Number(conditionValue);
      case 'IN':
        const values = conditionValue.split(',').map(v => v.trim());
        return values.includes(String(fieldValue));
      case 'ALL':
        return true;
      default:
        return false;
    }
  }

  private getFieldValue(requisition: JobRequisition, field: string): any {
    const fieldMap: Record<string, any> = {
      'requisitionType': requisition.requisitionType,
      'salaryMax': requisition.salaryMax,
      'headcount': requisition.headcount,
      'priority': requisition.priority,
      'departmentId': requisition.departmentId,
    };
    return fieldMap[field];
  }

  private async findApprover(role: ApproverRole, requisition: JobRequisition): Promise<{ id: string }> {
    // Implementation to find the appropriate approver based on role and requisition context
    // This would query the users table for users with the appropriate role in the relevant scope
    throw new Error('Implement approver lookup logic');
  }

  async processApprovalAction(
    approvalId: string,
    action: 'APPROVE' | 'REJECT' | 'SEND_BACK',
    userId: string,
    comments?: string
  ): Promise<void> {
    const approval = await this.approvalsRepository.findOne({
      where: { id: approvalId },
      relations: ['requisition'],
    });

    if (!approval || approval.approverUserId !== userId) {
      throw new Error('Unauthorized or approval not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error('Approval is not in pending status');
    }

    approval.status = action === 'APPROVE' 
      ? ApprovalStatus.APPROVED 
      : action === 'REJECT' 
        ? ApprovalStatus.REJECTED 
        : ApprovalStatus.SENT_BACK;
    approval.decision = action;
    approval.comments = comments;
    approval.actionDate = new Date();

    await this.approvalsRepository.save(approval);

    // Handle workflow progression
    if (action === 'APPROVE') {
      await this.advanceWorkflow(approval.requisitionId);
    } else if (action === 'REJECT') {
      await this.rejectWorkflow(approval.requisitionId);
    } else {
      await this.sendBackWorkflow(approval.requisitionId);
    }
  }

  private async advanceWorkflow(requisitionId: string): Promise<void> {
    // Find next pending approval and activate it
    // If no more approvals, mark requisition as APPROVED
  }

  private async rejectWorkflow(requisitionId: string): Promise<void> {
    // Cancel all pending approvals
    // Mark requisition as REJECTED
    // Release budget reservation
  }

  private async sendBackWorkflow(requisitionId: string): Promise<void> {
    // Reset workflow
    // Mark requisition as DRAFT
    // Notify hiring manager
  }
}
```

### 4.4 Integration with Jobs Module

**File: `backend/src/jobs/jobs.service.ts` (additions)**

```typescript
// Add to existing JobsService

async createFromRequisition(
  requisitionId: string,
  tenantId: string,
  userId: string
): Promise<Job> {
  const requisition = await this.requisitionService.findOne(requisitionId, tenantId);
  
  if (!requisition) {
    throw new NotFoundException('Requisition not found');
  }
  
  if (requisition.status !== RequisitionStatus.APPROVED) {
    throw new BadRequestException('Can only create jobs from approved requisitions');
  }

  const job = this.jobsRepository.create({
    tenantId,
    requisitionId: requisition.id,
    title: requisition.job.title,
    description: requisition.jobDescription || requisition.job.description,
    departmentId: requisition.departmentId,
    locationId: requisition.locationId,
    workModel: requisition.workModel,
    employmentType: requisition.employmentType,
    salaryMin: requisition.salaryMin,
    salaryMax: requisition.salaryMax,
    currency: requisition.currency,
    headcount: requisition.headcount,
    headcountFilled: 0,
    status: 'DRAFT',
    createdBy: userId,
    updatedBy: userId,
  });

  const savedJob = await this.jobsRepository.save(job);

  // Update requisition status
  await this.requisitionService.updateStatus(
    requisitionId,
    RequisitionStatus.POSTED,
    tenantId,
    userId
  );

  // Log activity
  await this.activityFeedService.logActivity({
    tenantId,
    userId,
    action: 'JOB_CREATED_FROM_REQUISITION',
    entityType: 'JOB',
    entityId: savedJob.id,
    metadata: {
      requisitionNumber: requisition.requisitionNumber,
      jobTitle: savedJob.title,
    },
  });

  return savedJob;
}

async updateHeadcountFilled(
  jobId: string,
  tenantId: string,
  increment: number = 1
): Promise<void> {
  const job = await this.jobsRepository.findOne({
    where: { id: jobId, tenantId },
    relations: ['requisition'],
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  job.headcountFilled += increment;
  
  // Check if all positions filled
  if (job.headcountFilled >= job.headcount) {
    job.status = 'FILLED';
    
    // Update requisition if linked
    if (job.requisitionId) {
      await this.requisitionService.updateStatus(
        job.requisitionId,
        RequisitionStatus.FILLED,
        tenantId,
        'SYSTEM'
      );
    }
  }

  await this.jobsRepository.save(job);
}
```

---

## 5. Database Migrations

### 5.1 Requisition Tables Migration

**File: `backend/src/migrations/AddRequisitionTables.ts`**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequisitionTables1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cost Centers
    await queryRunner.query(`
      CREATE TABLE cost_centers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
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
    `);

    // Job Grades
    await queryRunner.query(`
      CREATE TABLE job_grades (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
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
    `);

    // Job Requisitions
    await queryRunner.query(`
      CREATE TABLE job_requisitions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requisition_number VARCHAR(50) NOT NULL UNIQUE,
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        requisition_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        department_id UUID NOT NULL,
        job_id UUID NOT NULL REFERENCES jobs(id),
        grade_id UUID REFERENCES job_grades(id),
        location_id UUID NOT NULL,
        work_model VARCHAR(20) NOT NULL,
        employment_type VARCHAR(30) NOT NULL,
        headcount INTEGER NOT NULL CHECK (headcount > 0),
        replacement_flag BOOLEAN NOT NULL DEFAULT FALSE,
        replacement_employee_id UUID,
        salary_min DECIMAL(15,2) NOT NULL,
        salary_max DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        cost_center_id UUID NOT NULL REFERENCES cost_centers(id),
        budget_validated BOOLEAN NOT NULL DEFAULT FALSE,
        budget_reserved_amount DECIMAL(15,2),
        target_start_date DATE NOT NULL,
        job_description TEXT,
        justification TEXT,
        internal_notes TEXT,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        hiring_manager_id UUID NOT NULL REFERENCES users(id),
        recruiter_id UUID REFERENCES users(id),
        required_skills JSONB DEFAULT '[]',
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_by UUID NOT NULL REFERENCES users(id),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        submitted_at TIMESTAMP WITH TIME ZONE,
        approved_at TIMESTAMP WITH TIME ZONE,
        closed_at TIMESTAMP WITH TIME ZONE,
        close_reason TEXT,
        CONSTRAINT chk_salary_range CHECK (salary_max >= salary_min)
      );

      CREATE INDEX idx_req_tenant ON job_requisitions(tenant_id);
      CREATE INDEX idx_req_status ON job_requisitions(status);
      CREATE INDEX idx_req_department ON job_requisitions(department_id);
      CREATE INDEX idx_req_hiring_manager ON job_requisitions(hiring_manager_id);
      CREATE INDEX idx_req_created_at ON job_requisitions(created_at DESC);
    `);

    // Approval Transactions
    await queryRunner.query(`
      CREATE TABLE approval_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requisition_id UUID NOT NULL REFERENCES job_requisitions(id) ON DELETE CASCADE,
        approval_level INTEGER NOT NULL,
        approval_order INTEGER NOT NULL,
        approver_role VARCHAR(50) NOT NULL,
        approver_user_id UUID NOT NULL REFERENCES users(id),
        delegated_from UUID REFERENCES users(id),
        status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
        decision VARCHAR(30),
        comments TEXT,
        action_date TIMESTAMP WITH TIME ZONE,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
        reminder_sent_at TIMESTAMP WITH TIME ZONE,
        escalated BOOLEAN NOT NULL DEFAULT FALSE,
        escalated_at TIMESTAMP WITH TIME ZONE,
        escalated_to UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_approval_req ON approval_transactions(requisition_id);
      CREATE INDEX idx_approval_approver ON approval_transactions(approver_user_id);
      CREATE INDEX idx_approval_status ON approval_transactions(status);
      CREATE INDEX idx_approval_due ON approval_transactions(due_date);
      CREATE UNIQUE INDEX idx_approval_unique ON approval_transactions(requisition_id, approval_level, approval_order);
    `);

    // Approval Rules
    await queryRunner.query(`
      CREATE TABLE approval_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        rule_type VARCHAR(50) NOT NULL,
        condition_field VARCHAR(100) NOT NULL,
        condition_operator VARCHAR(20) NOT NULL,
        condition_value TEXT NOT NULL,
        approver_role VARCHAR(50) NOT NULL,
        approval_level INTEGER NOT NULL,
        is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        priority INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Requisition Audit Log (Immutable)
    await queryRunner.query(`
      CREATE TABLE requisition_audit_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        requisition_id UUID NOT NULL REFERENCES job_requisitions(id),
        action VARCHAR(50) NOT NULL,
        field_name VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        changed_by UUID NOT NULL REFERENCES users(id),
        changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        request_id UUID
      );

      CREATE INDEX idx_audit_req ON requisition_audit_log(requisition_id);
      CREATE INDEX idx_audit_changed_at ON requisition_audit_log(changed_at DESC);

      -- Prevent modifications
      CREATE RULE prevent_audit_update AS ON UPDATE TO requisition_audit_log DO INSTEAD NOTHING;
      CREATE RULE prevent_audit_delete AS ON DELETE TO requisition_audit_log DO INSTEAD NOTHING;
    `);

    // Add requisition_id to jobs table
    await queryRunner.query(`
      ALTER TABLE jobs 
      ADD COLUMN requisition_id UUID REFERENCES job_requisitions(id),
      ADD COLUMN headcount_filled INTEGER NOT NULL DEFAULT 0;
    `);

    // Requisition number sequence
    await queryRunner.query(`
      CREATE SEQUENCE requisition_number_seq START 1;

      CREATE OR REPLACE FUNCTION generate_requisition_number()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.requisition_number := 'REQ-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                                  LPAD(nextval('requisition_number_seq')::TEXT, 6, '0');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_requisition_number
        BEFORE INSERT ON job_requisitions
        FOR EACH ROW
        WHEN (NEW.requisition_number IS NULL)
        EXECUTE FUNCTION generate_requisition_number();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS requisition_audit_log CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS approval_transactions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS approval_rules CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_requisitions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_grades CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS cost_centers CASCADE`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS requisition_number_seq`);
    await queryRunner.query(`ALTER TABLE jobs DROP COLUMN IF EXISTS requisition_id`);
    await queryRunner.query(`ALTER TABLE jobs DROP COLUMN IF EXISTS headcount_filled`);
  }
}
```

---

## 6. API Specifications

### 6.1 Requisition API

```yaml
# Requisition Endpoints

POST /api/v1/requisitions
  Request:
    - requisitionType: string (required)
    - departmentId: string (required)
    - jobId: string (required)
    - locationId: string (required)
    - workModel: string (required)
    - employmentType: string (required)
    - headcount: number (required)
    - salaryMin: number (required)
    - salaryMax: number (required)
    - costCenterId: string (required)
    - targetStartDate: string (required)
    - hiringManagerId: string (required)
    - recruiterId: string (optional)
    - justification: string (conditional)
  Response: 201 Created
    - id, requisitionNumber, status: DRAFT

GET /api/v1/requisitions
  Query:
    - status: string[] (optional)
    - departmentId: string (optional)
    - hiringManagerId: string (optional)
    - priority: string (optional)
    - page: number (default: 1)
    - limit: number (default: 20)
  Response: 200 OK
    - data: Requisition[]
    - pagination: { total, page, limit, totalPages }

GET /api/v1/requisitions/:id
  Response: 200 OK
    - Full requisition with relations

PUT /api/v1/requisitions/:id
  Condition: status = DRAFT
  Response: 200 OK

POST /api/v1/requisitions/:id/submit
  Response: 200 OK
    - status: SUBMITTED
    - workflow: { approvers, estimatedCompletion }

GET /api/v1/approvals/queue
  Response: 200 OK
    - data: PendingApproval[]
    - summary: { overdue, dueToday, upcoming }

POST /api/v1/approvals/:id/action
  Request:
    - action: APPROVE | REJECT | SEND_BACK | DELEGATE
    - comments: string (optional/required based on action)
    - delegateTo: string (for DELEGATE action)
  Response: 200 OK

POST /api/v1/requisitions/:id/create-job
  Condition: status = APPROVED
  Response: 201 Created
    - jobId: string
    - requisitionStatus: POSTED
```

---

## Summary

This technical implementation guide provides:

1. **Critical Fixes**: Authentication guards, rate limiting, environment configuration
2. **Navigation Restructuring**: Updated sidebar with 9 streamlined items
3. **Enhanced Search**: Pinecone integration, 20+ filter dimensions, NL query processing
4. **Job Requisition Integration**: Complete module with workflow engine
5. **Database Migrations**: Full schema for requisition management
6. **API Specifications**: RESTful endpoints for all operations

Follow the phased implementation roadmap in the BRD for proper sequencing of these changes.
