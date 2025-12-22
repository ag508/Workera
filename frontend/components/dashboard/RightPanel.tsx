'use client';

import Link from 'next/link';
import { TrendingUp, Users, Briefcase, Clock, ArrowUpRight, Star, Bell, Check, AlertCircle, UserPlus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const notifications = [
  {
    id: 1,
    type: 'application',
    title: 'New Application',
    message: 'John Carter applied to Senior React Developer',
    time: '2m ago',
    read: false,
    icon: UserPlus,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    type: 'interview',
    title: 'Interview Scheduled',
    message: 'Sarah Lee confirmed for UX Designer interview',
    time: '1h ago',
    read: false,
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    id: 3,
    type: 'approval',
    title: 'Requisition Approved',
    message: 'Product Manager requisition has been approved',
    time: '3h ago',
    read: true,
    icon: Check,
    color: 'bg-green-500'
  },
  {
    id: 4,
    type: 'alert',
    title: 'Action Required',
    message: 'DevOps Engineer requisition pending your approval',
    time: '5h ago',
    read: false,
    icon: AlertCircle,
    color: 'bg-amber-500'
  },
];

const aiSuggestions = [
  {
    jobTitle: 'Senior React Developer',
    jobId: 'job-1',
    candidates: [
      { name: 'Alice Smith', match: 98, avatar: 'https://i.pravatar.cc/100?img=9' },
      { name: 'Michael Chen', match: 94, avatar: 'https://i.pravatar.cc/100?img=12' },
    ]
  },
  {
    jobTitle: 'Product Manager',
    jobId: 'job-2',
    candidates: [
      { name: 'Emily Davis', match: 91, avatar: 'https://i.pravatar.cc/100?img=16' },
      { name: 'James Wilson', match: 88, avatar: 'https://i.pravatar.cc/100?img=7' },
    ]
  },
];

const quickStats = [
  { label: 'Active Jobs', value: '12', change: '+2', icon: Briefcase, color: 'bg-blue-500' },
  { label: 'Applicants', value: '48', change: '+15', icon: Users, color: 'bg-purple-500' },
  { label: 'Interviews', value: '8', change: '+3', icon: Clock, color: 'bg-amber-500' },
];

export function RightPanel() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-y-0 right-0 hidden w-[360px] flex-col border-l border-gray-100 bg-gray-50/50 xl:flex overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-white p-3 border border-gray-100 shadow-sm text-center"
              >
                <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <Link href="/dashboard/notifications" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3 max-h-[240px] overflow-y-auto">
            {notifications.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`flex gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                  notification.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-primary/5 hover:bg-primary/10'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg ${notification.color} flex items-center justify-center flex-shrink-0`}>
                  <notification.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Suggested Candidates for Posted Jobs */}
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">AI Suggestions</h3>
            </div>
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">For Posted Jobs</span>
          </div>
          <div className="space-y-4">
            {aiSuggestions.map((job, jobIdx) => (
              <div key={jobIdx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">{job.jobTitle}</span>
                </div>
                <div className="space-y-2 pl-5">
                  {job.candidates.map((candidate, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + jobIdx * 0.1 + i * 0.05 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <img src={candidate.avatar} alt={candidate.name} className="h-8 w-8 rounded-full object-cover" />
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                            <span className="text-[8px] font-bold text-primary">{candidate.match}%</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{candidate.name}</span>
                      </div>
                      <Link
                        href={`/dashboard/jobs/${job.jobId}/applicants`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white hover:bg-gray-800"
                      >
                        View
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Insights */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Hiring Insights</h3>
          </div>
          <p className="text-sm text-emerald-100 mb-4">Your hiring pipeline is performing 23% better than last month.</p>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-1 text-sm font-medium text-white hover:underline"
          >
            View Analytics <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
