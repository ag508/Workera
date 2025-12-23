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
  FileText,
  DollarSign,
  AlertTriangle,
  Award,
  BarChart2,
  PieChart,
  Activity,
  Percent,
  Timer,
  Building2,
  UserPlus,
  TrendingDown as TrendDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Oracle-style Enterprise Metrics
const recruiterMetrics = [
  { name: 'Sarah Johnson', hires: 12, interviews: 45, avgTimeToHire: 16, openReqs: 8, rating: 4.8 },
  { name: 'Mike Brown', hires: 9, interviews: 38, avgTimeToHire: 19, openReqs: 6, rating: 4.5 },
  { name: 'Emily Chen', hires: 8, interviews: 32, avgTimeToHire: 21, openReqs: 5, rating: 4.3 },
  { name: 'David Kim', hires: 7, interviews: 28, avgTimeToHire: 18, openReqs: 4, rating: 4.6 },
];

const departmentMetrics = [
  { department: 'Engineering', openReqs: 12, filled: 28, avgTimeToFill: 22, targetDays: 30, budget: 450000, spent: 380000 },
  { department: 'Product', openReqs: 5, filled: 12, avgTimeToFill: 18, targetDays: 25, budget: 180000, spent: 145000 },
  { department: 'Design', openReqs: 4, filled: 8, avgTimeToFill: 15, targetDays: 20, budget: 120000, spent: 95000 },
  { department: 'Marketing', openReqs: 3, filled: 6, avgTimeToFill: 12, targetDays: 20, budget: 90000, spent: 72000 },
  { department: 'Sales', openReqs: 6, filled: 15, avgTimeToFill: 14, targetDays: 21, budget: 200000, spent: 175000 },
];

const requisitionAgingData = [
  { range: '0-7 days', count: 8, color: 'bg-green-500' },
  { range: '8-14 days', count: 12, color: 'bg-blue-500' },
  { range: '15-21 days', count: 6, color: 'bg-amber-500' },
  { range: '22-30 days', count: 4, color: 'bg-orange-500' },
  { range: '30+ days', count: 2, color: 'bg-red-500' },
];

const conversionMetrics = [
  { stage: 'Apply → Screen', rate: 49.9, applications: 847, passed: 423 },
  { stage: 'Screen → Interview', rate: 36.9, applications: 423, passed: 156 },
  { stage: 'Interview → Technical', rate: 57.1, applications: 156, passed: 89 },
  { stage: 'Technical → Offer', rate: 38.2, applications: 89, passed: 34 },
  { stage: 'Offer → Hire', rate: 82.4, applications: 34, passed: 28 },
];

const offerDeclineReasons = [
  { reason: 'Compensation', count: 12, percentage: 40 },
  { reason: 'Accepted Other Offer', count: 8, percentage: 27 },
  { reason: 'Remote Work Policy', count: 5, percentage: 17 },
  { reason: 'Role Expectations', count: 3, percentage: 10 },
  { reason: 'Other', count: 2, percentage: 6 },
];

const slaMetrics = {
  requisitionApproval: { target: '48 hours', actual: '36 hours', compliance: 92 },
  resumeReview: { target: '3 days', actual: '2.5 days', compliance: 88 },
  interviewScheduling: { target: '5 days', actual: '4 days', compliance: 85 },
  offerGeneration: { target: '2 days', actual: '1.5 days', compliance: 95 },
  backgroundCheck: { target: '7 days', actual: '6 days', compliance: 90 },
};

const quarterlyTrends = [
  { quarter: 'Q1 2024', applications: 1850, hires: 45, costPerHire: 4200 },
  { quarter: 'Q2 2024', applications: 2120, hires: 52, costPerHire: 3950 },
  { quarter: 'Q3 2024', applications: 2450, hires: 61, costPerHire: 3800 },
  { quarter: 'Q4 2024', applications: 2847, hires: 68, costPerHire: 3650 },
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

      {/* Enterprise Analytics Section */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Enterprise Analytics</h2>
        <p className="text-gray-500 mb-6">Oracle-style comprehensive recruitment metrics and reports</p>
      </div>

      {/* Pipeline Conversion & SLA Compliance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Conversion Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Conversion Rates</h3>
              <p className="text-sm text-gray-500">Stage-to-stage conversion analysis</p>
            </div>
          </div>
          <div className="space-y-4">
            {conversionMetrics.map((metric, i) => (
              <motion.div
                key={metric.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.stage}</span>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-sm font-bold",
                    metric.rate >= 50 ? "bg-green-100 text-green-700" :
                    metric.rate >= 30 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {metric.rate}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{metric.applications} entered</span>
                  <span>→</span>
                  <span>{metric.passed} passed</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.rate}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      metric.rate >= 50 ? "bg-green-500" :
                      metric.rate >= 30 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SLA Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SLA Compliance</h3>
              <p className="text-sm text-gray-500">Process timing performance</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(slaMetrics).map(([key, metric], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="p-4 rounded-xl bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      metric.compliance >= 90 ? "bg-green-500" :
                      metric.compliance >= 80 ? "bg-amber-500" :
                      "bg-red-500"
                    )} />
                    <span className="text-sm font-bold text-gray-900">{metric.compliance}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Target: {metric.target}</span>
                  <span>Actual: {metric.actual}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.compliance}%` }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      metric.compliance >= 90 ? "bg-green-500" :
                      metric.compliance >= 80 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department Metrics & Requisition Aging */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Hiring Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
              <p className="text-sm text-gray-500">Hiring metrics by department</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 font-medium text-gray-500">Department</th>
                  <th className="text-center py-3 font-medium text-gray-500">Open</th>
                  <th className="text-center py-3 font-medium text-gray-500">Filled</th>
                  <th className="text-center py-3 font-medium text-gray-500">Avg Days</th>
                  <th className="text-right py-3 font-medium text-gray-500">Budget Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {departmentMetrics.map((dept, i) => (
                  <motion.tr
                    key={dept.department}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-3 font-medium text-gray-900">{dept.department}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium">
                        {dept.openReqs}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 font-medium">
                        {dept.filled}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded-lg font-medium",
                        dept.avgTimeToFill <= dept.targetDays ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {dept.avgTimeToFill}d
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              (dept.spent / dept.budget) <= 0.8 ? "bg-green-500" :
                              (dept.spent / dept.budget) <= 0.95 ? "bg-amber-500" :
                              "bg-red-500"
                            )}
                            style={{ width: `${(dept.spent / dept.budget) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-600 text-xs">
                          {Math.round((dept.spent / dept.budget) * 100)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Requisition Aging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Requisition Aging Report</h3>
              <p className="text-sm text-gray-500">Open requisitions by age</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {requisitionAgingData.map((item, i) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + i * 0.1 }}
                className="text-center"
              >
                <div className={cn(
                  "h-20 rounded-xl flex items-center justify-center mb-2",
                  item.color
                )}>
                  <span className="text-2xl font-bold text-white">{item.count}</span>
                </div>
                <span className="text-xs font-medium text-gray-600">{item.range}</span>
              </motion.div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total Open Requisitions</span>
              <span className="text-lg font-bold text-gray-900">32</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Avg age: 14 days</span>
              <span className="text-amber-600 font-medium">6 at risk (30+ days)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recruiter Productivity & Offer Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recruiter Productivity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recruiter Productivity</h3>
              <p className="text-sm text-gray-500">Individual performance metrics</p>
            </div>
          </div>
          <div className="space-y-4">
            {recruiterMetrics.map((recruiter, i) => (
              <motion.div
                key={recruiter.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold">
                  {recruiter.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{recruiter.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{recruiter.hires} hires</span>
                    <span>•</span>
                    <span>{recruiter.interviews} interviews</span>
                    <span>•</span>
                    <span>{recruiter.avgTimeToHire}d avg</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-bold text-gray-900">{recruiter.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">{recruiter.openReqs} open</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Offer Decline Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Offer Decline Analysis</h3>
              <p className="text-sm text-gray-500">Reasons candidates decline offers</p>
            </div>
          </div>
          <div className="space-y-4">
            {offerDeclineReasons.map((reason, i) => (
              <motion.div
                key={reason.reason}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{reason.reason}</span>
                  <span className="text-sm text-gray-500">{reason.count} ({reason.percentage}%)</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reason.percentage}%` }}
                    transition={{ delay: 1.3 + i * 0.1, duration: 0.5 }}
                    className="h-full bg-red-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-700">30 offers declined this quarter</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Compensation is the #1 reason. Consider reviewing salary bands.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quarterly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quarterly Hiring Trends</h3>
              <p className="text-sm text-gray-500">Year-over-year comparison</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {quarterlyTrends.map((quarter, i) => (
            <motion.div
              key={quarter.quarter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-medium text-gray-500 mb-3">{quarter.quarter}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Applications</span>
                  <span className="text-sm font-bold text-gray-900">{quarter.applications.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Hires</span>
                  <span className="text-sm font-bold text-emerald-600">{quarter.hires}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Cost/Hire</span>
                  <span className="text-sm font-bold text-blue-600">${quarter.costPerHire.toLocaleString()}</span>
                </div>
              </div>
              {i > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-600">
                      {Math.round(((quarter.hires - quarterlyTrends[i - 1].hires) / quarterlyTrends[i - 1].hires) * 100)}% vs prev
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
