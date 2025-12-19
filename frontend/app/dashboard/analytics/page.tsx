'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Clock,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  MapPin,
  Globe,
  Zap,
  CheckCircle2,
  XCircle,
  UserCheck,
  FileText
} from 'lucide-react';

// Demo data for analytics
const statsCards = [
  {
    title: 'Total Applications',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    title: 'Active Jobs',
    value: '24',
    change: '+4',
    trend: 'up',
    icon: Briefcase,
    color: 'bg-emerald-500'
  },
  {
    title: 'Time to Hire',
    value: '18 days',
    change: '-3 days',
    trend: 'up',
    icon: Clock,
    color: 'bg-purple-500'
  },
  {
    title: 'Offer Acceptance',
    value: '87%',
    change: '+5.2%',
    trend: 'up',
    icon: Target,
    color: 'bg-amber-500'
  }
];

const pipelineData = [
  { stage: 'Applied', count: 847, color: 'bg-blue-500' },
  { stage: 'Screening', count: 423, color: 'bg-indigo-500' },
  { stage: 'Interview', count: 156, color: 'bg-purple-500' },
  { stage: 'Technical', count: 89, color: 'bg-pink-500' },
  { stage: 'Offer', count: 34, color: 'bg-emerald-500' },
  { stage: 'Hired', count: 28, color: 'bg-green-500' }
];

const sourceData = [
  { source: 'LinkedIn', applications: 892, hires: 12, color: 'bg-blue-600' },
  { source: 'Indeed', applications: 645, hires: 8, color: 'bg-indigo-500' },
  { source: 'Company Website', applications: 534, hires: 6, color: 'bg-emerald-500' },
  { source: 'Referrals', applications: 312, hires: 5, color: 'bg-amber-500' },
  { source: 'Naukri', applications: 278, hires: 4, color: 'bg-rose-500' },
  { source: 'Other', applications: 186, hires: 2, color: 'bg-gray-500' }
];

const weeklyData = [
  { day: 'Mon', applications: 45, interviews: 12 },
  { day: 'Tue', applications: 62, interviews: 18 },
  { day: 'Wed', applications: 78, interviews: 22 },
  { day: 'Thu', applications: 56, interviews: 15 },
  { day: 'Fri', applications: 89, interviews: 24 },
  { day: 'Sat', applications: 23, interviews: 5 },
  { day: 'Sun', applications: 18, interviews: 3 }
];

const topJobs = [
  { title: 'Senior React Developer', applications: 234, status: 'Active', daysOpen: 12 },
  { title: 'Product Manager', applications: 189, status: 'Active', daysOpen: 8 },
  { title: 'UX Designer', applications: 156, status: 'Active', daysOpen: 15 },
  { title: 'Data Scientist', applications: 134, status: 'Active', daysOpen: 20 },
  { title: 'DevOps Engineer', applications: 98, status: 'Paused', daysOpen: 25 }
];

const recentActivity = [
  { action: 'New application', candidate: 'John Smith', job: 'Senior React Developer', time: '5 min ago', type: 'application' },
  { action: 'Interview scheduled', candidate: 'Sarah Johnson', job: 'Product Manager', time: '1 hour ago', type: 'interview' },
  { action: 'Offer accepted', candidate: 'Mike Chen', job: 'UX Designer', time: '2 hours ago', type: 'offer' },
  { action: 'Candidate rejected', candidate: 'Emily Davis', job: 'Data Scientist', time: '3 hours ago', type: 'rejected' },
  { action: 'New application', candidate: 'Alex Wilson', job: 'DevOps Engineer', time: '4 hours ago', type: 'application' }
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('This Month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const maxApplications = Math.max(...weeklyData.map(d => d.applications));
  const maxPipeline = Math.max(...pipelineData.map(d => d.count));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-gray-600">Track your recruitment performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Calendar className="h-4 w-4 text-gray-500" />
              {dateRange}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Applications Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-500">Applications vs Interviews</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <span className="text-gray-600">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-gray-600">Interviews</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-4 h-48">
            {weeklyData.map((day, i) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end gap-1 h-40">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.applications / maxApplications) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-primary/80 rounded-t-lg hover:bg-primary transition-colors cursor-pointer"
                    title={`${day.applications} applications`}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.interviews / maxApplications) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                    className="flex-1 bg-purple-500/80 rounded-t-lg hover:bg-purple-500 transition-colors cursor-pointer"
                    title={`${day.interviews} interviews`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hiring Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hiring Pipeline</h3>
              <p className="text-sm text-gray-500">Candidates at each stage</p>
            </div>
          </div>
          <div className="space-y-4">
            {pipelineData.map((stage, i) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className={`h-full ${stage.color} rounded-full group-hover:opacity-80 transition-opacity`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Source Performance & Top Jobs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Source Performance</h3>
              <p className="text-sm text-gray-500">Applications and hires by source</p>
            </div>
          </div>
          <div className="space-y-4">
            {sourceData.map((source, i) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`h-10 w-10 rounded-lg ${source.color} flex items-center justify-center`}>
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{source.source}</p>
                  <p className="text-xs text-gray-500">{source.applications} applications</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">{source.hires} hires</p>
                  <p className="text-xs text-gray-500">
                    {((source.hires / source.applications) * 100).toFixed(1)}% rate
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Performing Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h3>
              <p className="text-sm text-gray-500">Jobs with most applications</p>
            </div>
          </div>
          <div className="space-y-4">
            {topJobs.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.daysOpen} days open</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{job.applications}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    job.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest recruitment actions</p>
          </div>
          <button className="text-sm font-medium text-primary hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.map((activity, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'application' ? 'bg-blue-100' :
                        activity.type === 'interview' ? 'bg-purple-100' :
                        activity.type === 'offer' ? 'bg-emerald-100' :
                        'bg-red-100'
                      }`}>
                        {activity.type === 'application' && <FileText className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'interview' && <UserCheck className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'offer' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        {activity.type === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">{activity.candidate}</td>
                  <td className="py-4 text-sm text-gray-600">{activity.job}</td>
                  <td className="py-4 text-sm text-gray-500">{activity.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
