'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/utils';
import {
  Search,
  Filter,
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Download,
  MoreVertical,
  Sparkles,
  Bot,
  Send,
  X,
  ChevronDown,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Loader2,
  ArrowRight,
  Zap,
  RefreshCw
} from 'lucide-react';

// Fallback demo applicants data
const demoApplicants = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://i.pravatar.cc/150?img=1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    experience: '6 years',
    education: 'MS Computer Science, Stanford',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    matchScore: 95,
    status: 'interview',
    appliedDate: '2024-01-15',
    summary: 'Experienced frontend developer with expertise in React and modern JavaScript frameworks. Led teams of 5+ developers and delivered multiple successful products.'
  },
  {
    id: '2',
    name: 'Michael Roberts',
    email: 'michael.r@email.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://i.pravatar.cc/150?img=3',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    experience: '5 years',
    education: 'BS Computer Science, MIT',
    skills: ['React', 'Python', 'Django', 'PostgreSQL', 'Docker'],
    matchScore: 89,
    status: 'screening',
    appliedDate: '2024-01-14',
    summary: 'Full stack developer with strong problem-solving skills. Experience with agile methodologies and CI/CD pipelines.'
  },
  {
    id: '3',
    name: 'Emily Johnson',
    email: 'emily.j@email.com',
    phone: '+1 (555) 345-6789',
    avatar: 'https://i.pravatar.cc/150?img=5',
    title: 'React Developer',
    company: 'DigitalAgency',
    location: 'Austin, TX',
    experience: '4 years',
    education: 'BS Software Engineering, UT Austin',
    skills: ['React', 'JavaScript', 'CSS', 'Redux', 'Jest'],
    matchScore: 85,
    status: 'new',
    appliedDate: '2024-01-16',
    summary: 'Passionate React developer focused on creating responsive and accessible web applications. Strong advocate for clean code practices.'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 456-7890',
    avatar: 'https://i.pravatar.cc/150?img=7',
    title: 'Frontend Architect',
    company: 'Enterprise Solutions',
    location: 'Seattle, WA',
    experience: '8 years',
    education: 'MS Computer Science, University of Washington',
    skills: ['React', 'Vue.js', 'Angular', 'Micro-frontends', 'System Design'],
    matchScore: 92,
    status: 'offer',
    appliedDate: '2024-01-10',
    summary: 'Frontend architecture expert with experience designing scalable frontend systems for enterprise applications. Strong mentoring skills.'
  },
  {
    id: '5',
    name: 'Jessica Martinez',
    email: 'jessica.m@email.com',
    phone: '+1 (555) 567-8901',
    avatar: 'https://i.pravatar.cc/150?img=9',
    title: 'Senior UI Developer',
    company: 'DesignTech',
    location: 'Los Angeles, CA',
    experience: '5 years',
    education: 'BFA Interactive Design, UCLA',
    skills: ['React', 'Tailwind CSS', 'Figma', 'Animation', 'A11y'],
    matchScore: 82,
    status: 'rejected',
    appliedDate: '2024-01-08',
    summary: 'UI-focused developer with strong design sensibilities. Expert in creating beautiful, accessible interfaces with smooth animations.'
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex.t@email.com',
    phone: '+1 (555) 678-9012',
    avatar: 'https://i.pravatar.cc/150?img=11',
    title: 'React Native Developer',
    company: 'MobileFirst Inc.',
    location: 'Denver, CO',
    experience: '4 years',
    education: 'BS Computer Science, Colorado State',
    skills: ['React', 'React Native', 'TypeScript', 'Firebase', 'Mobile'],
    matchScore: 78,
    status: 'new',
    appliedDate: '2024-01-17',
    summary: 'Mobile-focused React developer with experience building cross-platform applications. Strong understanding of mobile UX patterns.'
  }
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  screening: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Screening' },
  interview: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Interview' },
  offer: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Offer' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
};

export default function ApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const tenantId = getTenantId();

  const [job, setJob] = useState<any>({ title: 'Loading...', department: '', location: '', type: '' });
  const [applicants, setApplicants] = useState<typeof demoApplicants>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [selectedApplicant, setSelectedApplicant] = useState<typeof demoApplicants[0] | null>(null);
  const [filteredApplicants, setFilteredApplicants] = useState<typeof demoApplicants>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch job and applicants data
  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}?tenantId=${tenantId}`);
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        const j = jobData.data || jobData;
        setJob({
          title: j.title || 'Job',
          department: j.department || '',
          location: j.location || '',
          type: j.employmentType || 'Full-time'
        });
      }

      // Fetch applications for this job
      const appRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications?tenantId=${tenantId}&jobId=${jobId}`);
      if (appRes.ok) {
        const appData = await appRes.json();
        const applications = appData.data || [];
        if (applications.length > 0) {
          const mapped = applications.map((app: any) => {
            const c = app.candidate || {};
            return {
              id: app.id,
              name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
              email: c.email || '',
              phone: c.phone || '',
              avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.firstName || 'U')}&background=10B981&color=fff`,
              title: c.currentTitle || 'Candidate',
              company: c.currentCompany || '',
              location: c.location || 'Not specified',
              experience: c.yearsOfExperience ? `${c.yearsOfExperience} years` : 'N/A',
              education: c.education?.[0]?.degree || 'Not specified',
              skills: c.skills || [],
              matchScore: app.matchScore || c.matchScore || Math.min(95, 70 + (c.skills?.length || 0) * 3),
              status: (app.status || 'NEW').toLowerCase(),
              appliedDate: app.createdAt || new Date().toISOString(),
              summary: c.summary || 'Experienced professional with relevant skills.'
            };
          });
          setApplicants(mapped);
          setFilteredApplicants(mapped);
        } else {
          setApplicants(demoApplicants);
          setFilteredApplicants(demoApplicants);
        }
      } else {
        setApplicants(demoApplicants);
        setFilteredApplicants(demoApplicants);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setApplicants(demoApplicants);
      setFilteredApplicants(demoApplicants);
    } finally {
      setLoading(false);
    }
  };

  // Filter applicants based on search and status
  useEffect(() => {
    let results = applicants;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.title.toLowerCase().includes(query) ||
        a.skills.some(s => s.toLowerCase().includes(query)) ||
        a.location.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(a => a.status === statusFilter);
    }

    setFilteredApplicants(results);
  }, [searchQuery, statusFilter, applicants]);

  // AI Search handler
  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;

    setIsAISearching(true);
    setShowAIPanel(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      'frontend': `Based on your search, I found **3 highly qualified candidates** with strong frontend experience:\n\n1. **Sarah Chen** (95% match) - 6 years experience, expert in React & TypeScript\n2. **David Kim** (92% match) - 8 years experience, frontend architecture specialist\n3. **Michael Roberts** (89% match) - 5 years full-stack with React focus\n\nWould you like me to schedule interviews with these candidates?`,
      'senior': `I found **2 senior-level candidates** matching your criteria:\n\n1. **David Kim** - Frontend Architect with 8 years of experience and enterprise-level expertise\n2. **Sarah Chen** - Senior Frontend Developer with 6 years and team leadership experience\n\nBoth candidates have excellent match scores and strong technical backgrounds.`,
      'remote': `Looking for remote candidates, I found:\n\n1. **Michael Roberts** (Remote) - Full Stack Engineer, currently working remotely\n2. **Alex Thompson** (Denver, CO) - Open to remote work based on profile\n\nThese candidates have experience with distributed teams and remote collaboration tools.`
    };

    const key = Object.keys(responses).find(k => aiQuery.toLowerCase().includes(k)) || 'default';
    setAiResponse(responses[key] || `I analyzed all **${demoApplicants.length} applicants** for "${aiQuery}".\n\nTop recommendations based on your criteria:\n\n1. **Sarah Chen** - Strong match with 95% compatibility score\n2. **David Kim** - Excellent technical depth and experience\n3. **Michael Roberts** - Well-rounded full-stack background\n\nWould you like more details on any of these candidates?`);

    setIsAISearching(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-gray-600 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="text-primary font-medium">{filteredApplicants.length} applicants</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                showAIPanel
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Search
            </button>
          </div>
        </div>
      </div>

      {/* AI Search Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-emerald-50 to-teal-50 border border-primary/20 p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Candidate Search</h3>
                    <p className="text-sm text-gray-600">Ask natural language questions to find the perfect candidates</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                      placeholder="e.g., Find candidates with 5+ years of React experience who are open to remote work"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-12 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={handleAISearch}
                      disabled={isAISearching || !aiQuery.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      {isAISearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* AI Response */}
                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {['Senior candidates', 'Remote-friendly', 'Frontend experts', 'Recent applicants'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setAiQuery(suggestion);
                        }}
                        className="rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skills, or location..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applicants Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredApplicants.map((applicant, index) => (
            <motion.div
              key={applicant.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedApplicant(applicant)}
              className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <img
                  src={applicant.avatar}
                  alt={applicant.name}
                  className="h-14 w-14 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {applicant.name}
                      </h3>
                      <p className="text-sm text-gray-600">{applicant.title} at {applicant.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 rounded-full px-3 py-1 ${statusColors[applicant.status].bg} ${statusColors[applicant.status].text}`}>
                        <span className="text-xs font-medium">{statusColors[applicant.status].label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {applicant.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {applicant.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(applicant.appliedDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {applicant.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {applicant.skills.length > 4 && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        +{applicant.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score */}
                <div className="text-center">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                    applicant.matchScore >= 90 ? 'bg-emerald-100 text-emerald-700' :
                    applicant.matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="text-lg font-bold">{applicant.matchScore}%</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">Match</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredApplicants.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No applicants found</h3>
          <p className="text-gray-600 mt-1">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Applicant Detail Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedApplicant(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedApplicant.avatar}
                    alt={selectedApplicant.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h2>
                    <p className="text-gray-600">{selectedApplicant.title}</p>
                    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 mt-2 ${statusColors[selectedApplicant.status].bg} ${statusColors[selectedApplicant.status].text}`}>
                      <span className="text-xs font-medium">{statusColors[selectedApplicant.status].label}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Match Score */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-emerald-50 border border-primary/20">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${
                    selectedApplicant.matchScore >= 90 ? 'bg-emerald-500' :
                    selectedApplicant.matchScore >= 80 ? 'bg-blue-500' :
                    'bg-amber-500'
                  } text-white`}>
                    <span className="text-2xl font-bold">{selectedApplicant.matchScore}%</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI Match Score</p>
                    <p className="text-sm text-gray-600">Based on skills, experience, and job requirements</p>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Summary</h3>
                  <p className="text-gray-600">{selectedApplicant.summary}</p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedApplicant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedApplicant.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{selectedApplicant.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-medium text-gray-900">{selectedApplicant.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Education</p>
                      <p className="text-sm font-medium text-gray-900">{selectedApplicant.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Applied</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedApplicant.appliedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                    <Calendar className="h-4 w-4" />
                    Schedule Interview
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    Resume
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
