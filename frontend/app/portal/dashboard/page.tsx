'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Building2,
  Upload,
  User,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

// Standardized status config - matches applications page
const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'APPLIED': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Applied' },
  'SCREENING': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Screening' },
  'INTERVIEW': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Interview' },
  'INTERVIEWING': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Interviewing' },
  'OFFER': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Offer' },
  'ACCEPTED': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Accepted' },
  'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
  'PENDING': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
};

// Helper to get status styling
const getStatusStyle = (status: string) => {
  const upperStatus = status.toUpperCase();
  return statusConfig[upperStatus] || statusConfig['PENDING'];
};

// Onboarding steps component
function OnboardingSection({ onDismiss }: { onDismiss: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Load completed steps from localStorage
    const saved = localStorage.getItem('onboarding_completed');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const markComplete = (step: number) => {
    const newCompleted = [...completedSteps, step];
    setCompletedSteps(newCompleted);
    localStorage.setItem('onboarding_completed', JSON.stringify(newCompleted));
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Add your skills, experience, and education to improve job matches',
      icon: User,
      action: '/portal/profile',
      actionText: 'Edit Profile',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 2,
      title: 'Upload Your Resume',
      description: 'Our AI will analyze your resume and find the best matching jobs',
      icon: Upload,
      action: '/portal/profile',
      actionText: 'Upload Resume',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 3,
      title: 'Browse Open Positions',
      description: 'Discover jobs that match your skills and experience',
      icon: Search,
      action: '/portal/jobs',
      actionText: 'Find Jobs',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-white mb-8 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Get Started with Workera
            </h2>
            <p className="text-gray-300 mt-1 text-sm">Complete these steps to maximize your job search success</p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">{progress}% Complete</span>
            <span className="text-gray-400">{completedSteps.length}/{steps.length} steps</span>
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`relative rounded-xl p-4 transition-all ${
                  isCompleted
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {isCompleted && (
                  <div className="absolute -top-2 -right-2">
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-3`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                {!isCompleted ? (
                  <Link
                    href={step.action}
                    onClick={() => markComplete(step.id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-emerald-400 transition-colors"
                  >
                    {step.actionText}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="text-sm text-green-400 font-medium">Completed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Demo data fallbacks
const demoApplications = [
  { id: 1, role: 'Senior Frontend Engineer', company: 'Workera', status: 'Interviewing', date: '2023-10-24', location: 'Remote', logo: 'W', matchScore: 95 },
  { id: 2, role: 'Product Designer', company: 'TechFlow', status: 'Applied', date: '2023-10-22', location: 'New York, NY', logo: 'T', matchScore: 88 },
  { id: 3, role: 'Backend Developer', company: 'StartUp Inc', status: 'Rejected', date: '2023-10-15', location: 'San Francisco, CA', logo: 'S', matchScore: 72 },
  { id: 4, role: 'Full Stack Engineer', company: 'DataCorp', status: 'Applied', date: '2023-10-20', location: 'Austin, TX', logo: 'D', matchScore: 91 },
];

const demoRecommendedJobs = [
  { id: 1, role: 'React Developer', company: 'InnoTech', location: 'Remote', salary: '$120k-$150k', matchScore: 94 },
  { id: 2, role: 'UI Engineer', company: 'DesignCo', location: 'Seattle, WA', salary: '$130k-$160k', matchScore: 89 },
  { id: 3, role: 'Frontend Lead', company: 'GrowthLabs', location: 'Boston, MA', salary: '$150k-$180k', matchScore: 86 },
];

const demoUpcomingInterviews = [
  { id: 1, role: 'Senior Frontend Engineer', company: 'Workera', date: 'Tomorrow, 2:00 PM', type: 'Technical Round' },
  { id: 2, role: 'Product Designer', company: 'TechFlow', date: 'Dec 22, 10:00 AM', type: 'Culture Fit' },
];

export default function CandidateDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>(demoApplications);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>(demoRecommendedJobs);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>(demoUpcomingInterviews);
  const [stats, setStats] = useState({
    activeApplications: 12,
    pendingInterviews: 4,
    offersReceived: 1,
    profileViews: 48
  });
  const tenantId = getTenantId();

  useEffect(() => {
    // Check if user dismissed onboarding
    const dismissed = localStorage.getItem('onboarding_dismissed');
    if (dismissed === 'true') {
      setShowOnboarding(false);
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const candidateId = localStorage.getItem('candidateId');

    try {
      // Fetch applications
      if (candidateId) {
        const appsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/applications?candidateId=${candidateId}&tenantId=${tenantId}`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (appsData && appsData.length > 0) {
            const formattedApps = appsData.slice(0, 4).map((app: any) => ({
              id: app.id,
              role: app.application?.job?.title || 'Unknown Position',
              company: app.application?.job?.company || 'Unknown Company',
              status: app.status || 'APPLIED',
              date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '',
              location: app.application?.job?.location || 'Remote',
              logo: (app.application?.job?.company || 'U').charAt(0),
              matchScore: app.matchScore || Math.floor(Math.random() * 20) + 80,
            }));
            setApplications(formattedApps);

            // Calculate stats from real data
            const activeCount = appsData.filter((a: any) =>
              ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(a.status)
            ).length;
            const interviewCount = appsData.filter((a: any) => a.status === 'INTERVIEW').length;
            const offerCount = appsData.filter((a: any) => a.status === 'OFFER').length;

            setStats(prev => ({
              ...prev,
              activeApplications: activeCount || prev.activeApplications,
              pendingInterviews: interviewCount || prev.pendingInterviews,
              offersReceived: offerCount || prev.offersReceived,
            }));
          }
        }
      }

      // Fetch jobs for recommendations
      const jobsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?tenantId=${tenantId}`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const jobs = jobsData.data || jobsData;
        if (jobs && jobs.length > 0) {
          const formattedJobs = jobs.slice(0, 3).map((job: any) => ({
            id: job.id,
            role: job.title,
            company: job.company || 'Company',
            location: job.location || 'Remote',
            salary: job.salary || 'Competitive',
            matchScore: Math.floor(Math.random() * 15) + 85,
          }));
          setRecommendedJobs(formattedJobs);
        }
      }

      // Fetch upcoming interviews
      const interviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews?tenantId=${tenantId}`);
      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();
        if (interviewsData && interviewsData.length > 0) {
          const upcoming = interviewsData
            .filter((i: any) => new Date(i.scheduledAt) > new Date() && i.status !== 'CANCELLED')
            .slice(0, 2)
            .map((interview: any) => ({
              id: interview.id,
              role: interview.application?.job?.title || 'Interview',
              company: interview.application?.job?.company || 'Company',
              date: new Date(interview.scheduledAt).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
              type: interview.type || 'Interview',
            }));
          if (upcoming.length > 0) {
            setUpcomingInterviews(upcoming);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Keep demo data on error
    } finally {
      setLoading(false);
    }
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_dismissed', 'true');
  };

  return (
    <div className="space-y-8">
      {/* Onboarding Section */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingSection onDismiss={dismissOnboarding} />
        )}
      </AnimatePresence>

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
          { label: 'Active Applications', value: stats.activeApplications, icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100', trend: '+3 this week' },
          { label: 'Interviews Pending', value: stats.pendingInterviews, icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100', trend: '2 this week' },
          { label: 'Offers Received', value: stats.offersReceived, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100', trend: 'Review now' },
          { label: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'text-orange-600', bgColor: 'bg-orange-100', trend: '+12 this week' },
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
                        {(() => {
                          const style = getStatusStyle(app.status);
                          return (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                              {style.label}
                            </span>
                          );
                        })()}
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
