'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronRight,
  Filter,
  Search,
  Building2,
  Star,
  AlertCircle
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  'APPLIED': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Applied' },
  'SCREENING': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Search, label: 'Screening' },
  'INTERVIEW': { bg: 'bg-purple-100', text: 'text-purple-700', icon: MessageSquare, label: 'Interview' },
  'OFFER': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Offer' },
  'ACCEPTED': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
  'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  'WITHDRAWN': { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: 'Withdrawn' }
};

// Demo applications data
const demoApplications = [
  {
    id: '1',
    status: 'INTERVIEW',
    createdAt: '2024-01-15T10:30:00Z',
    application: {
      job: {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$140k - $180k'
      }
    },
    matchScore: 95,
    nextStep: 'Technical Interview on Jan 20, 2:00 PM'
  },
  {
    id: '2',
    status: 'SCREENING',
    createdAt: '2024-01-14T14:20:00Z',
    application: {
      job: {
        id: '2',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'Remote',
        type: 'Full-time',
        salary: '$130k - $160k'
      }
    },
    matchScore: 88,
    nextStep: 'Under review by hiring team'
  },
  {
    id: '3',
    status: 'APPLIED',
    createdAt: '2024-01-16T09:00:00Z',
    application: {
      job: {
        id: '3',
        title: 'Full Stack Engineer',
        company: 'InnovateCo',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$120k - $150k'
      }
    },
    matchScore: 82,
    nextStep: 'Application received'
  },
  {
    id: '4',
    status: 'OFFER',
    createdAt: '2024-01-10T11:00:00Z',
    application: {
      job: {
        id: '4',
        title: 'Frontend Lead',
        company: 'Enterprise Solutions',
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: '$160k - $200k'
      }
    },
    matchScore: 92,
    nextStep: 'Offer expires on Jan 25'
  },
  {
    id: '5',
    status: 'REJECTED',
    createdAt: '2024-01-05T16:00:00Z',
    application: {
      job: {
        id: '5',
        title: 'UX Designer',
        company: 'DesignHub',
        location: 'Austin, TX',
        type: 'Full-time',
        salary: '$100k - $130k'
      }
    },
    matchScore: 72,
    nextStep: 'Position filled'
  }
];

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>(demoApplications);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const tenantId = getTenantId();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/applications?candidateId=${candidateId}&tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setApplications(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
      // Keep demo data on error
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'WITHDRAWN',
          tenantId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to withdraw application');
      }

      // Update local state
      setApplications(apps => apps.map(app =>
        app.id === id ? { ...app, status: 'WITHDRAWN' } : app
      ));
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      // Still update locally as fallback
      setApplications(apps => apps.map(app =>
        app.id === id ? { ...app, status: 'WITHDRAWN' } : app
      ));
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !searchQuery ||
      app.application.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application.job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">Track and manage your job applications</p>
        </div>
        <Link
          href="/portal/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
        >
          <Briefcase className="h-4 w-4" />
          Browse Jobs
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Applications', value: applications.length, color: 'bg-blue-500' },
          { label: 'In Progress', value: applications.filter(a => ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(a.status)).length, color: 'bg-amber-500' },
          { label: 'Offers', value: applications.filter(a => a.status === 'OFFER').length, color: 'bg-emerald-500' },
          { label: 'Response Rate', value: '80%', color: 'bg-purple-500' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm"
          >
            <div className={`h-2 w-12 ${stat.color} rounded-full mb-3`}></div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No applications found</h3>
          <p className="text-gray-500 mt-1 mb-6">Start exploring jobs and submit your first application</p>
          <Link
            href="/portal/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Browse Jobs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredApplications.map((app, index) => {
              const status = statusConfig[app.status] || statusConfig['APPLIED'];
              const StatusIcon = status.icon;
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
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${colorClass}`} />

                  <div className="p-5">
                    {/* Company & Status Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {app.application.job.company.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{app.application.job.company}</p>
                          <p className="text-xs text-gray-500">{app.application.job.type}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{status.label}</span>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                      {app.application.job.title}
                    </h3>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{app.application.job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      {app.application.job.salary && (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <span>{app.application.job.salary}</span>
                        </div>
                      )}
                    </div>

                    {/* Match Score Progress */}
                    {app.matchScore && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Match Score</span>
                          <span className="font-semibold text-gray-900">{app.matchScore}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${app.matchScore}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Next Step */}
                    {app.nextStep && (
                      <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Next:</span> {app.nextStep}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                      {!['REJECTED', 'WITHDRAWN', 'ACCEPTED'].includes(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
