'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  MoreHorizontal,
  Star,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react';
import { MOCK_ACTIVITIES } from '@/lib/demo-data';
import Link from 'next/link';

const stats = [
  { label: 'Active Jobs', value: '24', change: '+12%', trend: 'up', icon: Briefcase, color: 'from-blue-500 to-blue-600' },
  { label: 'Total Candidates', value: '1,248', change: '+8%', trend: 'up', icon: Users, color: 'from-purple-500 to-purple-600' },
  { label: 'Interviews Today', value: '6', change: '+2', trend: 'up', icon: Calendar, color: 'from-amber-500 to-amber-600' },
  { label: 'Time to Hire', value: '18d', change: '-3d', trend: 'up', icon: Clock, color: 'from-emerald-500 to-emerald-600' },
];

const pipelineData = [
  { stage: 'Applied', count: 156, color: 'bg-blue-500' },
  { stage: 'Screening', count: 89, color: 'bg-purple-500' },
  { stage: 'Interview', count: 34, color: 'bg-amber-500' },
  { stage: 'Offer', count: 12, color: 'bg-emerald-500' },
  { stage: 'Hired', count: 8, color: 'bg-primary' },
];

const upcomingInterviews = [
  { name: 'John Carter', role: 'Senior React Developer', time: '10:00 AM', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: 'Sarah Lee', role: 'Product Designer', time: '2:00 PM', avatar: 'https://i.pravatar.cc/100?img=5' },
  { name: 'Mike Chen', role: 'Backend Engineer', time: '4:30 PM', avatar: 'https://i.pravatar.cc/100?img=12' },
];

const topJobs = [
  { title: 'Senior Frontend Developer', applicants: 48, views: 234, status: 'Active' },
  { title: 'Product Manager', applicants: 35, views: 189, status: 'Active' },
  { title: 'UX Designer', applicants: 29, views: 156, status: 'Active' },
];

export default function DashboardPage() {
  const [activities] = useState(MOCK_ACTIVITIES);

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
              <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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
                    animate={{ width: `${(stage.count / 156) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className={`h-full ${stage.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Conversion Stats */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">57%</div>
              <div className="text-xs text-gray-500">Screen Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">38%</div>
              <div className="text-xs text-gray-500">Interview Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24%</div>
              <div className="text-xs text-gray-500">Offer Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Interviews</h2>
            <span className="badge badge-primary">{upcomingInterviews.length} scheduled</span>
          </div>

          <div className="space-y-4">
            {upcomingInterviews.map((interview, i) => (
              <motion.div
                key={i}
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

          <Link
            href="/dashboard/calendar"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            View Full Calendar
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
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h2>
            <Link href="/dashboard/jobs" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {topJobs.map((job, i) => (
              <div
                key={i}
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

          <div className="space-y-4">
            {activities.slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {item.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{item.user}</span> {item.action}{' '}
                    <span className="font-semibold text-primary">{item.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
