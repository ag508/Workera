'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Target,
  Eye,
  FileText,
  Star,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';

const statusColors: Record<string, string> = {
  'Interviewing': 'bg-purple-100 text-purple-700 border-purple-200',
  'Applied': 'bg-blue-100 text-blue-700 border-blue-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
  'Offer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function CandidateDashboard() {
  // Mock data for demo/preview
  const applications = [
    { id: 1, role: 'Senior Frontend Engineer', company: 'Workera', status: 'Interviewing', date: '2023-10-24', location: 'Remote', logo: 'W', matchScore: 95 },
    { id: 2, role: 'Product Designer', company: 'TechFlow', status: 'Applied', date: '2023-10-22', location: 'New York, NY', logo: 'T', matchScore: 88 },
    { id: 3, role: 'Backend Developer', company: 'StartUp Inc', status: 'Rejected', date: '2023-10-15', location: 'San Francisco, CA', logo: 'S', matchScore: 72 },
    { id: 4, role: 'Full Stack Engineer', company: 'DataCorp', status: 'Applied', date: '2023-10-20', location: 'Austin, TX', logo: 'D', matchScore: 91 },
  ];

  const recommendedJobs = [
    { id: 1, role: 'React Developer', company: 'InnoTech', location: 'Remote', salary: '$120k-$150k', matchScore: 94 },
    { id: 2, role: 'UI Engineer', company: 'DesignCo', location: 'Seattle, WA', salary: '$130k-$160k', matchScore: 89 },
    { id: 3, role: 'Frontend Lead', company: 'GrowthLabs', location: 'Boston, MA', salary: '$150k-$180k', matchScore: 86 },
  ];

  const upcomingInterviews = [
    { id: 1, role: 'Senior Frontend Engineer', company: 'Workera', date: 'Tomorrow, 2:00 PM', type: 'Technical Round' },
    { id: 2, role: 'Product Designer', company: 'TechFlow', date: 'Dec 22, 10:00 AM', type: 'Culture Fit' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your job search</p>
        </div>
        <Link
          href="/portal/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
        >
          <Briefcase className="h-4 w-4" />
          Browse Jobs
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Applications', value: 12, icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100', trend: '+3 this week' },
          { label: 'Interviews Pending', value: 4, icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100', trend: '2 this week' },
          { label: 'Offers Received', value: 1, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100', trend: 'Review now' },
          { label: 'Profile Views', value: 48, icon: Eye, color: 'text-orange-600', bgColor: 'bg-orange-100', trend: '+12 this week' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`h-11 w-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <p className="text-sm text-gray-500">Track your application progress</p>
              </div>
              <Link href="/portal/applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {app.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.role}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{app.company}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {app.location}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Applied {app.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" />
                            {app.matchScore}% match
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                            View Details
                          </button>
                          {app.status === 'Interviewing' && (
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
                              Prepare
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
              <p className="text-sm text-gray-500">Don't miss your scheduled interviews</p>
            </div>
            <div className="p-5 space-y-4">
              {upcomingInterviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100"
                >
                  <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{interview.role}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{interview.company}</span>
                      <span className="text-purple-600 font-medium">{interview.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{interview.date}</div>
                    <button className="text-xs text-primary font-medium hover:underline mt-1">
                      Join Meeting
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Profile Strength</h3>
              <span className="text-2xl font-bold">75%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
              <div className="h-full w-3/4 bg-white rounded-full" />
            </div>
            <p className="text-sm text-white/80 mb-4">
              Complete your profile to increase visibility to recruiters
            </p>
            <Link
              href="/portal/profile"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Complete Profile
            </Link>
          </div>

          {/* Recommended Jobs */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Recommended for You
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{job.role}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        <Star className="h-3 w-3" />
                        {job.matchScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium text-gray-700">{job.salary}</span>
                    <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                      Apply <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <Link
                href="/portal/jobs"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                View All Jobs
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" />
              Pro Tip
            </h3>
            <p className="text-sm text-amber-800">
              Candidates with a complete profile are 3x more likely to get interview calls. Add your skills and portfolio to stand out!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
