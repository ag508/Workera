'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Clock,
  Calendar,
  ArrowRight,
  MoreHorizontal,
  Star,
  Zap,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/services/api-client';

interface DashboardMetrics {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  totalApplications: number;
  upcomingInterviews: number;
}

interface HiringFunnel {
  applied: number;
  screening: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

interface Activity {
  id: string;
  actorName: string;
  description: string;
  entityName: string;
  createdAt: string;
  activityType: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  applications?: { id: string }[];
}

interface Interview {
  id: string;
  scheduledAt: string;
  type: string;
  application?: {
    candidate?: {
      firstName: string;
      lastName: string;
    };
    job?: {
      title: string;
    };
  };
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnel, setFunnel] = useState<HiringFunnel | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [metricsRes, funnelRes, activitiesRes, jobsRes, interviewsRes] = await Promise.all([
        apiClient.get<DashboardMetrics>('/analytics/dashboard'),
        apiClient.get<HiringFunnel>('/analytics/hiring-funnel'),
        apiClient.get<{ activities: Activity[] }>('/activity-feed', { limit: '5' }),
        apiClient.get<Job[]>('/jobs'),
        apiClient.get<Interview[]>('/interviews'),
      ]);

      setMetrics(metricsRes);
      setFunnel(funnelRes);
      setActivities(activitiesRes.activities || []);
      setJobs(jobsRes || []);
      setInterviews(interviewsRes || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from metrics
  const stats = metrics ? [
    {
      label: 'Active Jobs',
      value: metrics.activeJobs.toString(),
      change: `${metrics.totalJobs} total`,
      trend: 'up',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Candidates',
      value: metrics.totalCandidates.toString(),
      change: 'in database',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Applications',
      value: metrics.totalApplications.toString(),
      change: 'received',
      trend: 'up',
      icon: Calendar,
      color: 'from-amber-500 to-amber-600'
    },
    {
      label: 'Interviews',
      value: metrics.upcomingInterviews.toString(),
      change: 'upcoming',
      trend: 'up',
      icon: Clock,
      color: 'from-emerald-500 to-emerald-600'
    },
  ] : [];

  // Calculate pipeline data from funnel
  const maxCount = funnel ? Math.max(funnel.applied, 1) : 1;
  const pipelineData = funnel ? [
    { stage: 'Applied', count: funnel.applied, color: 'bg-blue-500' },
    { stage: 'Screening', count: funnel.screening, color: 'bg-purple-500' },
    { stage: 'Interview', count: funnel.interview, color: 'bg-amber-500' },
    { stage: 'Offer', count: funnel.offer, color: 'bg-emerald-500' },
    { stage: 'Hired', count: funnel.hired, color: 'bg-primary' },
  ] : [];

  // Get top jobs with most applications
  const topJobs = jobs
    .filter(job => job.status === 'posted')
    .slice(0, 3)
    .map(job => ({
      id: job.id,
      title: job.title,
      applicants: job.applications?.length || 0,
      views: job.viewCount || (job.applications?.length || 0) * 8 + 50, // Estimate based on applications
      status: 'Active',
    }));

  // Format interviews for display
  const upcomingInterviews = interviews
    .filter(i => new Date(i.scheduledAt) > new Date())
    .slice(0, 3)
    .map(interview => ({
      id: interview.id,
      name: interview.application?.candidate
        ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
        : 'Unknown',
      role: interview.application?.job?.title || 'Unknown Position',
      time: new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      avatar: `https://i.pravatar.cc/100?u=${interview.id}`,
    }));

  // Format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900"
          >
            Good morning, Sarah!
          </motion.h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your recruitment pipeline today.</p>
        </div>
        <Link
          href="/dashboard/jobs/create"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
        >
          <Zap className="h-4 w-4" />
          Quick Post Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <span className="text-xs font-semibold text-green-600">
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Pipeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Hiring Pipeline</h2>
            <Link href="/dashboard/analytics" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View Details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Pipeline Visualization */}
          <div className="space-y-4">
            {pipelineData.map((stage, i) => (
              <div key={i} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className={`h-full ${stage.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Conversion Stats */}
          {funnel && funnel.applied > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((funnel.screening / funnel.applied) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Screen Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((funnel.interview / Math.max(funnel.screening, 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Interview Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((funnel.offer / Math.max(funnel.interview, 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Offer Rate</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
            <span className="badge badge-primary">{upcomingInterviews.length} scheduled</span>
          </div>

          {upcomingInterviews.length > 0 ? (
            <div className="space-y-4">
              {upcomingInterviews.map((interview, i) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <img
                    src={interview.avatar}
                    alt={interview.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{interview.name}</p>
                    <p className="text-sm text-gray-500 truncate">{interview.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{interview.time}</div>
                    <button className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      Join
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No upcoming interviews</p>
            </div>
          )}

          <Link
            href="/dashboard/interviews"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            View All Interviews
          </Link>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Performing Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
            <Link href="/dashboard/jobs" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          {topJobs.length > 0 ? (
            <div className="space-y-4">
              {topJobs.map((job, i) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      i === 0 ? 'bg-amber-100 text-amber-600' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.applicants} applicants</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views} views</span>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">{job.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No active jobs</p>
              <Link href="/dashboard/jobs/create" className="text-primary text-sm hover:underline">
                Create your first job
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm font-medium text-primary hover:underline">View all</button>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                    {(item.actorName || 'S').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{item.actorName || 'System'}</span>{' '}
                      {item.description}
                      {item.entityName && (
                        <span className="font-semibold text-primary"> {item.entityName}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(item.createdAt)}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
