# Workera Implementation Plan

## Phase 1: Landing Page Fixes

### 1.1 Hero Section
- [ ] Remove "Powered by Advanced AI" badge
- [ ] Add stock image in hero section placeholder (replace Lottie animation with appropriate image)
- [ ] Change "Watch Demo" button to "Schedule Demo" and link to /book-demo
- [ ] Remove demo modal/code associated with Watch Demo button

### 1.2 Logo Carousel Section
- [ ] Replace text logos with actual company logo images
- [ ] Apply green gradient styling consistent with button gradients

### 1.3 How Workera Works Section
- [ ] Fix invisible Lottie animation (white space issue) - replace with visible static/animated elements

### 1.4 Features Section
- [ ] Change Bot icon to a different icon for AI Resume Parsing feature

### 1.5 AI-Powered Section
- [ ] Add "Explore AI Job Search" button similar to "Explore Requisition Management"

### 1.6 Job Requisition Section
- [ ] Update description to remove Oracle HCM reference - write as "better than the competition"

### 1.7 New Candidate Portal Section
- [ ] Add section showcasing candidate portal functionality
- [ ] Highlight: Job application portal, Workday-like experience, AI resume parsing

### 1.8 CTA Section
- [ ] Fix "Schedule Demo" button to redirect to /book-demo

### 1.9 Footer
- [ ] Replace generic social icons with actual branded icons (LinkedIn, YouTube, Facebook)
- [ ] Apply green gradient tint to social logos
- [ ] Keep redirect links empty for now

---

## Phase 2: Recruitment Dashboard Overhaul

### 2.1 Right Sidebar Fixes
- [ ] Remove search (already in left nav)
- [ ] Recent Activity → Notifications (functional)
- [ ] AI Suggestions → Show AI candidate suggestions for posted jobs
- [ ] Fix "View Analytics" button routing
- [ ] Redesign top 3 stats (Active Jobs, New Applicants, Interviews) for alignment

### 2.2 Requisition to Job Flow
- [ ] When requisition approved → appears in Create Jobs
- [ ] Hiring manager can add form/template and post to platforms
- [ ] Job link → Candidate Portal for applications
- [ ] Company templates with job-specific customization

### 2.3 Active Jobs Enhancement
- [ ] View all applicants from all platforms in one view
- [ ] Remove candidate profile images from cards
- [ ] Add enhanced AI search with all filters
- [ ] Show JD alongside search

### 2.4 Candidate Processing Pipeline
- [ ] NLP pre-filter: 1000 applicants → 100-150 shortlist based on JD criteria
- [ ] RAG pipeline for shortlisted candidates
- [ ] AI semantic search on RAG for top N candidates
- [ ] Send interview invites from dashboard
- [ ] Message via portal/LinkedIn/email
- [ ] View candidate profiles on external platforms

### 2.5 Talent Pool
- [ ] Remove section
- [ ] Keep Shortlists/Bookmarks functionality

### 2.6 Interviews Section
- [ ] Make functional (currently static)
- [ ] All buttons working
- [ ] Send invites via company video platform (Teams/Zoom/Webex)
- [ ] Calendar integration

### 2.7 Inbox
- [ ] Make functional
- [ ] Email notifications to candidates when recruiter messages

### 2.8 Analytics
- [ ] Meaningful metrics and pipeline reports
- [ ] Reference Oracle HCM analytics patterns

### 2.9 Settings - Integrations
- [ ] Job boards section with test connection
- [ ] Video/Calendar integrations (Teams, Zoom, Webex)
- [ ] Separated sections by integration type

### 2.10 Header
- [ ] Make notification button functional
- [ ] Remove profile button (exists in nav bar)

---

## Phase 3: Candidate Portal Overhaul

### 3.1 Application Flow
- [ ] Company job postings link to candidate portal
- [ ] Login/Register with job context

### 3.2 Profile Creation
- [ ] Resume import: LinkedIn, other job portals, PDF
- [ ] AI parsing for smart field population
- [ ] Infer experience years even if not explicit
- [ ] Auto-fill sections from parsed data

### 3.3 Application Form
- [ ] Company-defined form templates
- [ ] Position-specific additional fields
- [ ] Form validation and submission

### 3.4 Candidate Dashboard
- [ ] View open positions at company
- [ ] Track application status
- [ ] Update profile
- [ ] AI search for suitable positions based on resume

---

## Implementation Priority

1. **Immediate**: Landing page fixes (Phase 1) - cosmetic and UX
2. **Short-term**: Dashboard right sidebar and navigation fixes
3. **Medium-term**: Requisition → Job posting flow
4. **Long-term**: Full candidate portal overhaul, NLP pipeline, RAG integration

---

## Technical Dependencies

- Stock images for hero and logo carousel
- Company logo assets with green gradient variants
- Social media icons (LinkedIn, YouTube, Facebook)
- Video conferencing API integrations (Teams, Zoom, Webex)
- NLP service for candidate filtering
- RAG pipeline infrastructure
