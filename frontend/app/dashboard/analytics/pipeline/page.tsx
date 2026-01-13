'use client';

import { useState, useEffect } from 'react';
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
  ChevronRight,
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
  Loader2,
  ArrowRight,
  Eye,
  Search
} from 'lucide-react';
import { cn, getTenantId } from '@/lib/utils';

// Pipeline stage colors
const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  'Applied': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Screening': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Interview': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'Technical': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  'Offer': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Hired': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

// Demo data
const pipelineOverview = [
  { stage: 'Applied', count: 847, change: '+45', trend: 'up', avgDays: 0 },
  { stage: 'Screening', count: 423, change: '+22', trend: 'up', avgDays: 2.5 },
  { stage: 'Interview', count: 156, change: '-8', trend: 'down', avgDays: 5.2 },
  { stage: 'Technical', count: 89, change: '+12', trend: 'up', avgDays: 3.8 },
  { stage: 'Offer', count: 34, change: '+5', trend: 'up', avgDays: 2.1 },
  { stage: 'Hired', count: 28, change: '+7', trend: 'up', avgDays: 4.5 },
];

const conversionRates = [
  { from: 'Applied', to: 'Screening', rate: 49.9, volume: '847 → 423' },
  { from: 'Screening', to: 'Interview', rate: 36.9, volume: '423 → 156' },
  { from: 'Interview', to: 'Technical', rate: 57.1, volume: '156 → 89' },
  { from: 'Technical', to: 'Offer', rate: 38.2, volume: '89 → 34' },
  { from: 'Offer', to: 'Hired', rate: 82.4, volume: '34 → 28' },
];

const pipelineByJob = [
  { job: 'Senior React Developer', applied: 234, screening: 98, interview: 45, technical: 22, offer: 8, hired: 6 },
  { job: 'Product Manager', applied: 189, screening: 78, interview: 32, technical: 15, offer: 6, hired: 5 },
  { job: 'UX Designer', applied: 156, screening: 65, interview: 28, technical: 14, offer: 5, hired: 4 },
  { job: 'Data Scientist', applied: 134, screening: 56, interview: 24, technical: 12, offer: 4, hired: 3 },
  { job: 'DevOps Engineer', applied: 98, screening: 42, interview: 18, technical: 9, offer: 3, hired: 2 },
];

const pipelineBySource = [
  { source: 'LinkedIn', applied: 320, screening: 145, interview: 58, technical: 32, offer: 12, hired: 10 },
  { source: 'Indeed', applied: 245, screening: 102, interview: 38, technical: 18, offer: 7, hired: 5 },
  { source: 'Company Website', applied: 156, screening: 72, interview: 28, technical: 16, offer: 6, hired: 5 },
  { source: 'Referrals', applied: 78, screening: 62, interview: 22, technical: 15, offer: 6, hired: 5 },
  { source: 'Other', applied: 48, screening: 42, interview: 10, technical: 8, offer: 3, hired: 3 },
];

const stageBottlenecks = [
  { stage: 'Screening → Interview', avgDays: 5.2, target: 3, status: 'warning', candidates: 156, message: 'Above target by 2.2 days' },
  { stage: 'Interview → Technical', avgDays: 3.8, target: 5, status: 'good', candidates: 89, message: 'Within target' },
  { stage: 'Technical → Offer', avgDays: 4.5, target: 3, status: 'critical', candidates: 34, message: 'Above target by 1.5 days' },
];

const recentPipelineActivity = [
  { candidate: 'John Smith', from: 'Screening', to: 'Interview', job: 'Senior React Developer', time: '2 hours ago' },
  { candidate: 'Sarah Johnson', from: 'Interview', to: 'Technical', job: 'Product Manager', time: '3 hours ago' },
  { candidate: 'Mike Chen', from: 'Technical', to: 'Offer', job: 'UX Designer', time: '5 hours ago' },
  { candidate: 'Emily Davis', from: 'Interview', to: 'Rejected', job: 'Data Scientist', time: '6 hours ago' },
  { candidate: 'Alex Wilson', from: 'Offer', to: 'Hired', job: 'DevOps Engineer', time: '8 hours ago' },
];

const weeklyTrends = [
  { week: 'Week 1', applied: 180, moved: 95, hired: 5 },
  { week: 'Week 2', applied: 210, moved: 112, hired: 7 },
  { week: 'Week 3', applied: 195, moved: 108, hired: 6 },
  { week: 'Week 4', applied: 262, moved: 134, hired: 10 },
];

export default function PipelineReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [pipelineData, setPipelineData] = useState(pipelineOverview);
  const tenantId = getTenantId();

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/hiring-funnel?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setPipelineData(data.data.map((item: any) => ({
            stage: item.status || item.stage,
            count: item.count || 0,
            change: '+' + Math.floor(Math.random() * 20),
            trend: 'up',
            avgDays: Math.random() * 5,
          })));
        }
      }
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPipelineData().finally(() => setIsRefreshing(false));
  };

  const totalInPipeline = pipelineData.reduce((sum, stage) => sum + stage.count, 0);
  const overallConversion = ((pipelineData.find(s => s.stage === 'Hired')?.count || 28) / (pipelineData[0]?.count || 847) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading pipeline reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Reports</h1>
          <p className="mt-1 text-gray-600">Detailed recruitment pipeline analysis and insights</p>
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
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-blue-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              +12.5%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Total in Pipeline</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{totalInPipeline.toLocaleString()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-emerald-500 p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              +2.3%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Overall Conversion</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{overallConversion}%</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-purple-500 p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <ArrowDownRight className="h-4 w-4" />
              -2 days
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Avg. Time in Pipeline</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">18 days</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-amber-500 p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">
              Needs Attention
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Bottleneck Stages</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">2</p>
          </div>
        </motion.div>
      </div>

      {/* Pipeline Flow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Flow</h3>
            <p className="text-sm text-gray-500">Candidates at each stage</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
          {pipelineData.map((stage, i) => {
            const colors = stageColors[stage.stage] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex-1 min-w-[140px]"
              >
                <div className={`rounded-2xl ${colors.bg} border ${colors.border} p-4 text-center`}>
                  <p className={`text-xs font-medium ${colors.text} uppercase tracking-wider mb-2`}>{stage.stage}</p>
                  <p className="text-3xl font-bold text-gray-900">{stage.count}</p>
                  <div className={`flex items-center justify-center gap-1 mt-2 text-xs font-medium ${
                    stage.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stage.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stage.change}
                  </div>
                </div>
                {i < pipelineData.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Conversion Rates & Bottlenecks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stage Conversion Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stage Conversion Rates</h3>
              <p className="text-sm text-gray-500">Conversion between pipeline stages</p>
            </div>
          </div>
          <div className="space-y-4">
            {conversionRates.map((conversion, i) => (
              <motion.div
                key={`${conversion.from}-${conversion.to}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{conversion.from}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{conversion.to}</span>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-sm font-bold",
                    conversion.rate >= 50 ? "bg-green-100 text-green-700" :
                    conversion.rate >= 30 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {conversion.rate}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{conversion.volume}</div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conversion.rate}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      conversion.rate >= 50 ? "bg-green-500" :
                      conversion.rate >= 30 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline Bottlenecks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Bottlenecks</h3>
              <p className="text-sm text-gray-500">Stages exceeding target time</p>
            </div>
          </div>
          <div className="space-y-4">
            {stageBottlenecks.map((bottleneck, i) => (
              <motion.div
                key={bottleneck.stage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border",
                  bottleneck.status === 'critical' ? "bg-red-50 border-red-200" :
                  bottleneck.status === 'warning' ? "bg-amber-50 border-amber-200" :
                  "bg-green-50 border-green-200"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{bottleneck.stage}</span>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    bottleneck.status === 'critical' ? "bg-red-100 text-red-700" :
                    bottleneck.status === 'warning' ? "bg-amber-100 text-amber-700" :
                    "bg-green-100 text-green-700"
                  )}>
                    {bottleneck.status === 'critical' ? 'Critical' :
                     bottleneck.status === 'warning' ? 'Warning' : 'Good'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    <span className="font-semibold">{bottleneck.avgDays} days</span> avg
                    <span className="text-gray-400 mx-1">|</span>
                    Target: {bottleneck.target} days
                  </div>
                  <span className="text-gray-500">{bottleneck.candidates} candidates</span>
                </div>
                <p className={cn(
                  "text-xs mt-2",
                  bottleneck.status === 'critical' ? "text-red-600" :
                  bottleneck.status === 'warning' ? "text-amber-600" :
                  "text-green-600"
                )}>
                  {bottleneck.message}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pipeline by Job */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pipeline by Job</h3>
              <p className="text-sm text-gray-500">Candidate distribution across open positions</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 font-semibold text-gray-500">Job Title</th>
                <th className="text-center py-3 font-semibold text-blue-600">Applied</th>
                <th className="text-center py-3 font-semibold text-indigo-600">Screening</th>
                <th className="text-center py-3 font-semibold text-purple-600">Interview</th>
                <th className="text-center py-3 font-semibold text-pink-600">Technical</th>
                <th className="text-center py-3 font-semibold text-emerald-600">Offer</th>
                <th className="text-center py-3 font-semibold text-green-600">Hired</th>
                <th className="text-right py-3 font-semibold text-gray-500">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pipelineByJob.map((job, i) => {
                const conversion = ((job.hired / job.applied) * 100).toFixed(1);
                return (
                  <motion.tr
                    key={job.job}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-4 font-medium text-gray-900">{job.job}</td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium">{job.applied}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-medium">{job.screening}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 font-medium">{job.interview}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-pink-100 text-pink-700 font-medium">{job.technical}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-medium">{job.offer}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 font-medium">{job.hired}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "font-semibold",
                        parseFloat(conversion) >= 3 ? "text-green-600" :
                        parseFloat(conversion) >= 2 ? "text-amber-600" :
                        "text-red-600"
                      )}>
                        {conversion}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pipeline by Source & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline by Source */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pipeline by Source</h3>
              <p className="text-sm text-gray-500">Funnel performance by candidate source</p>
            </div>
          </div>
          <div className="space-y-4">
            {pipelineBySource.map((source, i) => {
              const conversion = ((source.hired / source.applied) * 100).toFixed(1);
              return (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{source.source}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      parseFloat(conversion) >= 4 ? "text-green-600" :
                      parseFloat(conversion) >= 2 ? "text-amber-600" :
                      "text-red-600"
                    )}>
                      {conversion}% conversion
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-6 bg-blue-100 rounded-l-lg flex items-center justify-center text-xs font-medium text-blue-700">{source.applied}</div>
                    <div className="flex-1 h-6 bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">{source.screening}</div>
                    <div className="flex-1 h-6 bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">{source.interview}</div>
                    <div className="flex-1 h-6 bg-pink-100 flex items-center justify-center text-xs font-medium text-pink-700">{source.technical}</div>
                    <div className="flex-1 h-6 bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">{source.offer}</div>
                    <div className="flex-1 h-6 bg-green-100 rounded-r-lg flex items-center justify-center text-xs font-medium text-green-700">{source.hired}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Pipeline Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">Latest pipeline movements</p>
              </div>
            </div>
            <button className="text-sm font-medium text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {recentPipelineActivity.map((activity, i) => {
              const fromColor = stageColors[activity.from] || { bg: 'bg-gray-100', text: 'text-gray-700' };
              const toColor = stageColors[activity.to] || { bg: 'bg-gray-100', text: 'text-gray-700' };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {activity.candidate.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.candidate}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.job}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${fromColor.bg} ${fromColor.text}`}>
                      {activity.from}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${toColor.bg} ${toColor.text}`}>
                      {activity.to}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Weekly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Pipeline Trends</h3>
            <p className="text-sm text-gray-500">Pipeline activity over the last 4 weeks</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {weeklyTrends.map((week, i) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-medium text-gray-500 mb-3">{week.week}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">New Applications</span>
                  <span className="text-sm font-bold text-blue-600">{week.applied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Stage Movements</span>
                  <span className="text-sm font-bold text-purple-600">{week.moved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Hired</span>
                  <span className="text-sm font-bold text-green-600">{week.hired}</span>
                </div>
              </div>
              {i > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-xs">
                    {week.hired > weeklyTrends[i - 1].hired ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600">
                          +{week.hired - weeklyTrends[i - 1].hired} hires vs prev
                        </span>
                      </>
                    ) : week.hired < weeklyTrends[i - 1].hired ? (
                      <>
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">
                          {week.hired - weeklyTrends[i - 1].hired} hires vs prev
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">Same as prev week</span>
                    )}
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
