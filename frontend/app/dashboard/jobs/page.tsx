'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  MapPin,
  Users,
  Clock,
  MoreHorizontal,
  Loader2,
  Briefcase,
  ChevronRight,
  Filter,
  Grid,
  List,
  DollarSign,
  Eye,
  TrendingUp,
  Calendar,
  Building2,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Edit3,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { jobsService, Job } from '@/lib/services/jobs';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  'POSTED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Draft': 'bg-gray-100 text-gray-600 border-gray-200',
  'Paused': 'bg-amber-100 text-amber-700 border-amber-200',
  'Closed': 'bg-red-100 text-red-700 border-red-200',
};

const typeColors: Record<string, string> = {
  'Full-time': 'bg-blue-50 text-blue-600',
  'Part-time': 'bg-purple-50 text-purple-600',
  'Contract': 'bg-orange-50 text-orange-600',
  'Remote': 'bg-teal-50 text-teal-600',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await jobsService.getAll();
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.location && j.location.toLowerCase().includes(search.toLowerCase())) ||
    (j.company && j.company.toLowerCase().includes(search.toLowerCase()))
  );

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">Manage your open positions and track applicants</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className="h-4 w-4" />
          </button>
          <Link
            href="/dashboard/jobs/create"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, location, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'text-gray-900', bgColor: 'bg-gray-100' },
          { label: 'Active', value: jobs.filter(j => j.status === 'POSTED' || j.status === 'Active').length, icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
          { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'Avg. per Job', value: jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0, icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white p-4 border border-gray-100 flex items-center gap-4"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading jobs...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No active jobs found</p>
          <p className="text-sm text-gray-500 mb-4">Create your first job posting to start hiring</p>
          <Link
            href="/dashboard/jobs/create"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Post New Job
          </Link>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all relative"
            >
              {/* Background Gradient */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[job.status] || statusColors['Draft']}`}>
                  {job.status}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === job.id ? null : job.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {showDropdown === job.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-10"
                      >
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Edit3 className="h-4 w-4" /> Edit Job
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Copy className="h-4 w-4" /> Duplicate
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" /> View Listing
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Title & Company */}
              <div className="mb-4 relative">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company || 'Engineering Team'}
                </p>
              </div>

              {/* Metadata Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-100">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {job.location || 'Remote'}
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border border-transparent ${typeColors[job.type || 'Full-time'] || typeColors['Full-time']}`}>
                  <Clock className="h-3 w-3" />
                  {job.type || 'Full-time'}
                </div>
                {job.salary && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-600">
                    <DollarSign className="h-3 w-3" />
                    {job.salary}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                {job.description
                  ? job.description.replace(/[#*]/g, '').substring(0, 120) + '...'
                  : 'We are looking for an experienced professional to join our team and help drive innovation. This role offers great benefits...'}
              </p>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img
                        src={`https://i.pravatar.cc/100?u=${job.id}${i}`}
                        alt="Applicant"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {(job.applicantCount || 0) > 3 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600">
                      +{(job.applicantCount || 0) - 3}
                    </div>
                  )}
                </div>
                <Link
                  href={`/dashboard/jobs/${job.id}/applicants`}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {job.applicantCount || 0} Applicants
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-4">
          {filtered.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-6">
                {/* Icon */}
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company || 'Engineering Team'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {job.type || 'Full-time'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[job.status] || statusColors['Draft']}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{job.applicantCount || 0}</span>
                        <span className="text-gray-500">applicants</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 200) + 50}</span>
                        <span className="text-gray-500">views</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">Posted 3 days ago</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/jobs/${job.id}/applicants`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                      >
                        View Applicants
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}
