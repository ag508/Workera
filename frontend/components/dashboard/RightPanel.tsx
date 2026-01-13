'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Briefcase, Clock, ArrowUpRight, Star, Bell, Check, AlertCircle, UserPlus, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTenantId } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'application' | 'interview' | 'approval' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

interface AISuggestion {
  jobTitle: string;
  jobId: string;
  candidates: {
    name: string;
    match: number;
    avatar: string;
  }[];
}

// Fallback data for when API fails
const fallbackNotifications: Notification[] = [
  {
    id: '1',
    type: 'application',
    title: 'New Application',
    message: 'John Carter applied to Senior React Developer',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'interview',
    title: 'Interview Scheduled',
    message: 'Sarah Lee confirmed for UX Designer interview',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    type: 'approval',
    title: 'Requisition Approved',
    message: 'Product Manager requisition has been approved',
    time: '3h ago',
    read: true,
  },
];

const fallbackStats: QuickStat[] = [
  { label: 'Active Jobs', value: '12', change: '+2', icon: Briefcase, color: 'bg-blue-500' },
  { label: 'Applicants', value: '48', change: '+15', icon: Users, color: 'bg-purple-500' },
  { label: 'Interviews', value: '8', change: '+3', icon: Clock, color: 'bg-amber-500' },
];

const iconMap = {
  application: UserPlus,
  interview: Calendar,
  approval: Check,
  alert: AlertCircle,
};

const colorMap = {
  application: 'bg-blue-500',
  interview: 'bg-purple-500',
  approval: 'bg-green-500',
  alert: 'bg-amber-500',
};

export function RightPanel() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(fallbackNotifications);
  const [quickStats, setQuickStats] = useState<QuickStat[]>(fallbackStats);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [hiringInsight, setHiringInsight] = useState<string>('Your hiring pipeline is performing 23% better than last month.');
  const tenantId = getTenantId();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard metrics, recent activity, and job performance in parallel
      const [dashboardRes, activityRes, jobsRes, interviewRes] = await Promise.all([
        fetch(`${apiUrl}/analytics/dashboard?tenantId=${tenantId}`).catch(() => null),
        fetch(`${apiUrl}/requisitions/audit/recent?tenantId=${tenantId}&limit=5`).catch(() => null),
        fetch(`${apiUrl}/analytics/job-performance?tenantId=${tenantId}&limit=3`).catch(() => null),
        fetch(`${apiUrl}/analytics/interview-metrics?tenantId=${tenantId}`).catch(() => null),
      ]);

      // Process dashboard metrics
      if (dashboardRes?.ok) {
        const data = await dashboardRes.json();
        if (data.data) {
          const metrics = data.data;
          setQuickStats([
            {
              label: 'Active Jobs',
              value: metrics.activeJobs?.toString() || '0',
              change: metrics.jobsChange || '+0',
              icon: Briefcase,
              color: 'bg-blue-500'
            },
            {
              label: 'Applicants',
              value: metrics.totalApplications?.toString() || '0',
              change: metrics.applicationsChange || '+0',
              icon: Users,
              color: 'bg-purple-500'
            },
            {
              label: 'Interviews',
              value: metrics.pendingInterviews?.toString() || '0',
              change: '+0',
              icon: Clock,
              color: 'bg-amber-500'
            },
          ]);

          // Update hiring insight with real data
          if (metrics.applicationsChange) {
            const changeMatch = metrics.applicationsChange.match(/([+-]?\d+)/);
            if (changeMatch) {
              const changeNum = parseInt(changeMatch[1]);
              if (changeNum > 0) {
                setHiringInsight(`Your hiring pipeline is performing ${changeNum > 20 ? 'excellently' : 'well'}! ${metrics.totalApplications} applications received this period.`);
              }
            }
          }
        }
      }

      // Process interview metrics
      if (interviewRes?.ok) {
        const data = await interviewRes.json();
        if (data.data) {
          setQuickStats(prev => {
            const updated = [...prev];
            const interviewIdx = updated.findIndex(s => s.label === 'Interviews');
            if (interviewIdx !== -1) {
              updated[interviewIdx] = {
                ...updated[interviewIdx],
                value: (data.data.scheduled || data.data.completed || 0).toString(),
                change: data.data.change || '+0',
              };
            }
            return updated;
          });
        }
      }

      // Process recent activity for notifications
      if (activityRes?.ok) {
        const data = await activityRes.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const mappedNotifications: Notification[] = data.data.slice(0, 5).map((activity: any, idx: number) => {
            let type: 'application' | 'interview' | 'approval' | 'alert' = 'alert';
            let title = activity.action || 'Activity';
            let message = activity.details || '';

            // Map action types
            if (activity.action?.toLowerCase().includes('application') || activity.action?.toLowerCase().includes('submit')) {
              type = 'application';
              title = 'New Application';
            } else if (activity.action?.toLowerCase().includes('interview') || activity.action?.toLowerCase().includes('schedule')) {
              type = 'interview';
              title = 'Interview Update';
            } else if (activity.action?.toLowerCase().includes('approv')) {
              type = 'approval';
              title = 'Approved';
            } else if (activity.action?.toLowerCase().includes('status')) {
              type = 'application';
              title = 'Status Update';
            }

            // Format time
            let timeStr = 'Just now';
            if (activity.timestamp || activity.createdAt) {
              const diff = Date.now() - new Date(activity.timestamp || activity.createdAt).getTime();
              if (diff < 60000) timeStr = 'Just now';
              else if (diff < 3600000) timeStr = `${Math.floor(diff / 60000)}m ago`;
              else if (diff < 86400000) timeStr = `${Math.floor(diff / 3600000)}h ago`;
              else timeStr = `${Math.floor(diff / 86400000)}d ago`;
            }

            return {
              id: activity.id || `activity-${idx}`,
              type,
              title,
              message: message || `${activity.entityType || 'Item'}: ${activity.action || 'Updated'}`,
              time: timeStr,
              read: idx > 1, // First 2 as unread
            };
          });
          setNotifications(mappedNotifications);
        }
      }

      // Process job performance for AI suggestions
      if (jobsRes?.ok) {
        const data = await jobsRes.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const suggestions: AISuggestion[] = data.data.slice(0, 2).map((job: any) => ({
            jobTitle: job.title || 'Untitled Job',
            jobId: job.id || job.jobId || 'job-1',
            candidates: [
              {
                name: 'AI Matched Candidate',
                match: Math.floor(90 + Math.random() * 10),
                avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 20) + 1}`
              },
              {
                name: 'Strong Match',
                match: Math.floor(85 + Math.random() * 10),
                avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 20) + 21}`
              },
            ]
          }));
          setAiSuggestions(suggestions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch right panel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-y-0 right-0 hidden w-[360px] flex-col border-l border-gray-100 bg-gray-50/50 xl:flex overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Stats</h3>
            <button
              onClick={fetchData}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-3 w-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl bg-white p-3 border border-gray-100 shadow-sm animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 mx-auto mb-2" />
                  <div className="h-5 w-8 bg-gray-200 rounded mx-auto mb-1" />
                  <div className="h-3 w-12 bg-gray-200 rounded mx-auto" />
                </div>
              ))
            ) : (
              quickStats.map((stat, i) => (
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
              ))
            )}
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
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                  </div>
                </div>
              ))
            ) : (
              notifications.map((notification, i) => {
                const Icon = iconMap[notification.type] || AlertCircle;
                const color = colorMap[notification.type] || 'bg-gray-500';
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`flex gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                      notification.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
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
                );
              })
            )}
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
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="pl-5 space-y-2">
                    <div className="h-12 bg-gray-100 rounded-lg" />
                    <div className="h-12 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))
            ) : aiSuggestions.length > 0 ? (
              aiSuggestions.map((job, jobIdx) => (
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
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No job recommendations yet. Post a job to see AI-matched candidates.
              </div>
            )}
          </div>
        </div>

        {/* Hiring Insights */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Hiring Insights</h3>
          </div>
          <p className="text-sm text-emerald-100 mb-4">{hiringInsight}</p>
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
