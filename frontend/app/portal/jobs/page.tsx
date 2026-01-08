'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Building2,
  Star,
  ChevronDown,
  Bookmark,
  ArrowUpRight,
  Sparkles,
  Users,
  Calendar,
  Loader2,
  Wand2,
  Lightbulb,
  Target,
  TrendingUp,
  X,
  Send,
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

// Demo jobs data
const demoJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    experience: 'Senior Level',
    salary: '$140k - $180k',
    description: 'We are looking for an experienced React developer to join our frontend team. You will be responsible for building scalable web applications using React, TypeScript, and modern frontend technologies.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    postedAt: '2 days ago',
    applicants: 45,
    matchScore: 95,
    featured: true
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'Full-time',
    experience: 'Mid Level',
    salary: '$130k - $160k',
    description: 'Join our product team to drive the development of innovative solutions. You will work closely with engineering and design teams to define product strategy and roadmap.',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
    postedAt: '3 days ago',
    applicants: 78,
    matchScore: 88
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'InnovateCo',
    location: 'New York, NY',
    type: 'Full-time',
    experience: 'Mid Level',
    salary: '$120k - $150k',
    description: 'Looking for a versatile full stack engineer to work on our core platform. Experience with both frontend and backend development is required.',
    skills: ['React', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes'],
    postedAt: '1 week ago',
    applicants: 56,
    matchScore: 82
  },
  {
    id: '4',
    title: 'UX/UI Designer',
    company: 'DesignHub',
    location: 'Austin, TX',
    type: 'Full-time',
    experience: 'Mid Level',
    salary: '$100k - $130k',
    description: 'We need a talented designer to create beautiful and intuitive user experiences. You will work on both mobile and web applications.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    postedAt: '4 days ago',
    applicants: 34,
    matchScore: 75
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Remote',
    type: 'Full-time',
    experience: 'Senior Level',
    salary: '$150k - $190k',
    description: 'Join our infrastructure team to build and maintain our cloud infrastructure. Experience with AWS, Kubernetes, and CI/CD pipelines is required.',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Python'],
    postedAt: '5 days ago',
    applicants: 23,
    matchScore: 70,
    featured: true
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'DataDriven',
    location: 'Seattle, WA',
    type: 'Full-time',
    experience: 'Senior Level',
    salary: '$145k - $175k',
    description: 'We are looking for a data scientist to help us build machine learning models and extract insights from large datasets.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    postedAt: '1 week ago',
    applicants: 67,
    matchScore: 68
  }
];

const searchSuggestions = [
  'React developer with 5+ years experience',
  'Remote frontend jobs',
  'Senior Python engineer in New York',
  'Machine learning roles at startups',
  'Full stack positions with good salary',
  'DevOps jobs with Kubernetes',
];

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<any[]>(demoJobs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const tenantId = getTenantId();

  useEffect(() => {
    const token = localStorage.getItem('candidateToken');
    const id = localStorage.getItem('candidateId');
    setIsLoggedIn(!!token);
    setCandidateId(id);

    // Load saved jobs from localStorage
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }

    fetchJobs();
    if (token && id) {
      fetchRecommendations(id);
      fetchSavedJobs(id);
    }
  }, []);

  const fetchSavedJobs = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/saved-jobs?candidateId=${id}&tenantId=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('candidateToken')}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.savedJobs) {
          const savedIds = data.savedJobs.map((j: any) => j.id);
          setSavedJobs(savedIds);
          localStorage.setItem('savedJobs', JSON.stringify(savedIds));
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs?tenantId=${tenantId}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (candidateId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs/recommended?candidateId=${candidateId}&tenantId=${tenantId}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('candidateToken')}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setIsAISearch(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs/search`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            query: searchQuery,
            candidateId: candidateId || undefined,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setAiSuggestions(data.suggestions || []);
      } else {
        // Demo fallback - filter demo jobs based on query
        const filtered = demoJobs.filter(job => {
          const queryLower = searchQuery.toLowerCase();
          return (
            job.title.toLowerCase().includes(queryLower) ||
            job.company.toLowerCase().includes(queryLower) ||
            job.skills.some(s => s.toLowerCase().includes(queryLower)) ||
            job.location.toLowerCase().includes(queryLower)
          );
        });
        setJobs(filtered.length > 0 ? filtered : demoJobs);
        setAiSuggestions(['Try broader search terms', 'Remove location filters']);
      }
    } catch (error) {
      console.error('AI search failed', error);
      // Demo fallback
      setJobs(demoJobs);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAISearch();
      setShowSuggestions(false);
    }
  };

  const clearAISearch = () => {
    setIsAISearch(false);
    setSearchQuery('');
    setAiSuggestions([]);
    setJobs(demoJobs);
    fetchJobs();
  };

  const toggleSaveJob = async (jobId: string) => {
    const isSaved = savedJobs.includes(jobId);
    const newSavedJobs = isSaved
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];

    // Update local state immediately for responsive UI
    setSavedJobs(newSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));

    // Sync with backend if logged in
    if (isLoggedIn && candidateId) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/saved-jobs`,
          {
            method: isSaved ? 'DELETE' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('candidateToken')}`,
            },
            body: JSON.stringify({
              candidateId,
              jobId,
              tenantId,
            }),
          }
        );
      } catch (error) {
        console.error('Failed to sync saved job:', error);
        // Keep localStorage version as source of truth
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesLocation = locationFilter === 'all' ||
      (locationFilter === 'remote' && job.location?.toLowerCase().includes('remote')) ||
      (locationFilter === 'onsite' && !job.location?.toLowerCase().includes('remote'));
    const matchesType = typeFilter === 'all' || job.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesLocation && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
          <p className="text-gray-500 mt-1">Find your next great opportunity</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{filteredJobs.length} jobs found</span>
        </div>
      </div>

      {/* AI-Powered Search */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/5 via-white to-emerald-50 border border-primary/20 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI-Powered Job Search</h2>
            <p className="text-xs text-gray-500">Describe your ideal job in natural language</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Try: 'Senior React developer in San Francisco with 5+ years experience' or 'Remote Python jobs'"
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-24 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleAISearch}
            disabled={searching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Search
              </>
            )}
          </button>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && searchQuery.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-20"
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Try these searches
                  </p>
                </div>
                <div className="p-2">
                  {searchSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active AI Search Banner */}
        {isAISearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 px-4 py-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-gray-700">
                AI search results for: <span className="font-medium text-gray-900">"{searchQuery}"</span>
              </span>
            </div>
            <button
              onClick={clearAISearch}
              className="p-1 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </motion.div>
        )}

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(suggestion)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 hover:border-primary hover:text-primary transition-colors"
              >
                <Lightbulb className="h-3 w-3" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      {/* AI Recommendations (for logged in users) */}
      {isLoggedIn && recommendations.length > 0 && !isAISearch && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Recommended For You</h2>
              <p className="text-xs text-gray-500">Based on your profile and skills</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((rec: any, index) => (
              <motion.div
                key={rec.job?.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl bg-white p-4 border border-emerald-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {rec.job?.company?.charAt(0) || 'W'}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {rec.matchScore}%
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{rec.job?.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{rec.job?.company}</p>
                <p className="text-xs text-emerald-600 mt-2 line-clamp-1">{rec.recommendation}</p>
                <Link
                  href={`/portal/apply/${rec.job?.id}`}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  Apply Now
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Jobs */}
      {filteredJobs.filter(j => j.featured).length > 0 && !isAISearch && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Featured Positions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.filter(j => j.featured).map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-primary/5 via-white to-emerald-50 border-2 border-primary/20 p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {job.company?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.company}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedJobs.includes(job.id)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {job.salary}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.skills?.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.postedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {job.applicants} applicants
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {job.matchScore && (
                      <span className="text-xs font-medium text-emerald-600">
                        {job.matchScore}% match
                      </span>
                    )}
                    <Link
                      href={`/portal/apply/${job.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                    >
                      Apply
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Jobs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isAISearch ? 'Search Results' : 'All Positions'}
        </h2>
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            {isAISearch && (
              <button
                onClick={clearAISearch}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredJobs.filter(j => isAISearch ? true : !j.featured).map((job, index) => {
                const colors = [
                  'from-blue-500 to-indigo-600',
                  'from-purple-500 to-pink-600',
                  'from-emerald-500 to-teal-600',
                  'from-orange-500 to-red-600',
                  'from-cyan-500 to-blue-600',
                  'from-rose-500 to-pink-600'
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Header with gradient */}
                    <div className={`h-2 bg-gradient-to-r ${colorClass}`} />

                    <div className="p-5">
                      {/* Company & Save */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {job.company?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{job.company}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className={`p-2 rounded-lg transition-all ${
                            savedJobs.includes(job.id)
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-gray-100 text-gray-400 group-hover:text-gray-600'
                          }`}
                        >
                          <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>

                      {/* Match reason for AI search */}
                      {job.relevanceReason && (
                        <p className="text-xs text-emerald-600 mb-3 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {job.relevanceReason}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
                          <Briefcase className="h-3 w-3" />
                          {job.type}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
                          <Clock className="h-3 w-3" />
                          {job.postedAt}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
                          <Users className="h-3 w-3" />
                          {job.applicants}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.skills?.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="rounded-full bg-primary/5 border border-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {skill}
                          </span>
                        ))}
                        {job.skills?.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{job.salary}</p>
                          {job.matchScore && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                                  style={{ width: `${job.matchScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-emerald-600">{job.matchScore}%</span>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/portal/apply/${job.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary transition-colors shadow-sm"
                        >
                          Apply
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
