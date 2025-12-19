'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  Calendar
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

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<any[]>(demoJobs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const tenantId = getTenantId();

  useEffect(() => {
    fetchJobs();
  }, []);

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
      // Keep demo data on error
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' ||
      (locationFilter === 'remote' && job.location?.toLowerCase().includes('remote')) ||
      (locationFilter === 'onsite' && !job.location?.toLowerCase().includes('remote'));
    const matchesType = typeFilter === 'all' || job.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesLocation && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

      {/* Search and Filters */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company, or keywords..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Jobs */}
      {filteredJobs.filter(j => j.featured).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
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
                      href={`/apply/${job.id}`}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Positions</h2>
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
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredJobs.filter(j => !j.featured).map((job, index) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                        {job.company?.charAt(0) || 'W'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Building2 className="h-3.5 w-3.5" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills?.slice(0, 4).map((skill: string) => (
                            <span key={skill} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{job.salary}</p>
                        <p className="text-xs text-gray-500 mt-1">{job.postedAt}</p>
                        {job.matchScore && (
                          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                            <Star className="h-3 w-3" />
                            {job.matchScore}% match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
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
                        <Link
                          href={`/apply/${job.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
