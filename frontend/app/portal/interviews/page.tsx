'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  User,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Lightbulb,
  Target,
  MessageSquare,
  ExternalLink,
  Bell,
  Loader2,
  BookOpen,
  Briefcase,
  Star,
  RefreshCw
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  notes?: string;
  application?: {
    job?: {
      id: string;
      title: string;
      company: string;
      location: string;
    };
    candidate?: {
      firstName: string;
      lastName: string;
    };
  };
  interviewer?: {
    name: string;
    title?: string;
  };
}

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
  'SCHEDULED': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Calendar, label: 'Scheduled' },
  'IN_PROGRESS': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: Video, label: 'In Progress' },
  'COMPLETED': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Completed' },
  'CANCELLED': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Cancelled' },
  'NO_SHOW': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: 'No Show' },
};

const typeLabels: Record<string, string> = {
  'PHONE_SCREEN': 'Phone Screen',
  'TECHNICAL': 'Technical Interview',
  'BEHAVIORAL': 'Behavioral Interview',
  'ONSITE': 'On-site Interview',
  'FINAL': 'Final Interview',
  'CULTURE_FIT': 'Culture Fit',
  'PANEL': 'Panel Interview',
};

const preparationTips = [
  {
    icon: FileText,
    title: 'Research the Company',
    description: 'Review the company website, recent news, and their mission statement.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Target,
    title: 'Review Job Requirements',
    description: 'Go through the job description and prepare examples that match each requirement.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    icon: MessageSquare,
    title: 'Prepare STAR Stories',
    description: 'Have 5-7 stories ready using the Situation, Task, Action, Result format.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Lightbulb,
    title: 'Prepare Questions',
    description: 'Prepare 3-5 thoughtful questions to ask your interviewer about the role and team.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
];

export default function CandidateInterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const tenantId = getTenantId();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        const interviewList = Array.isArray(data) ? data : (data.data || []);
        // Filter interviews for the current candidate
        const candidateId = localStorage.getItem('candidateId');
        const filtered = interviewList.filter((i: Interview) => {
          // In a real app, you'd filter by candidateId on the backend
          // For now, we'll show all interviews
          return true;
        });
        setInterviews(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      // Demo data fallback
      setInterviews([
        {
          id: '1',
          type: 'TECHNICAL',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          durationMinutes: 60,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          application: {
            job: {
              id: '1',
              title: 'Senior Frontend Engineer',
              company: 'Workera',
              location: 'Remote',
            },
          },
          interviewer: {
            name: 'Sarah Chen',
            title: 'Engineering Manager',
          },
        },
        {
          id: '2',
          type: 'CULTURE_FIT',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          durationMinutes: 45,
          meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
          application: {
            job: {
              id: '2',
              title: 'Product Designer',
              company: 'TechFlow',
              location: 'New York, NY',
            },
          },
          interviewer: {
            name: 'Mike Johnson',
            title: 'Head of People',
          },
        },
        {
          id: '3',
          type: 'PHONE_SCREEN',
          status: 'COMPLETED',
          scheduledAt: new Date(Date.now() - 604800000).toISOString(), // Week ago
          durationMinutes: 30,
          application: {
            job: {
              id: '1',
              title: 'Senior Frontend Engineer',
              company: 'Workera',
              location: 'Remote',
            },
          },
          interviewer: {
            name: 'Alex Brown',
            title: 'Recruiter',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (i) => new Date(i.scheduledAt) > new Date() && i.status !== 'CANCELLED'
  );
  const pastInterviews = interviews.filter(
    (i) => new Date(i.scheduledAt) <= new Date() || i.status === 'CANCELLED'
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 0 && diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusStyle = (status: string) => {
    return statusConfig[status] || statusConfig['SCHEDULED'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading interviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
          <p className="text-gray-500 mt-1">Track and prepare for your upcoming interviews</p>
        </div>
        <button
          onClick={fetchInterviews}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{upcomingInterviews.length}</div>
              <div className="text-blue-100 mt-1">Upcoming Interviews</div>
            </div>
            <Calendar className="h-10 w-10 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {pastInterviews.filter((i) => i.status === 'COMPLETED').length}
              </div>
              <div className="text-emerald-100 mt-1">Completed</div>
            </div>
            <CheckCircle2 className="h-10 w-10 text-emerald-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{interviews.length}</div>
              <div className="text-purple-100 mt-1">Total Interviews</div>
            </div>
            <Briefcase className="h-10 w-10 text-purple-200" />
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Interviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({upcomingInterviews.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past ({pastInterviews.length})
            </button>
          </div>

          {/* Interview Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {(activeTab === 'upcoming' ? upcomingInterviews : pastInterviews).length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-white border border-gray-200 p-8 text-center"
                >
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'upcoming' ? 'No Upcoming Interviews' : 'No Past Interviews'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === 'upcoming'
                      ? 'Apply to jobs to get interview invitations'
                      : 'Your past interviews will appear here'}
                  </p>
                  {activeTab === 'upcoming' && (
                    <Link
                      href="/portal/jobs"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <Briefcase className="h-4 w-4" />
                      Browse Jobs
                    </Link>
                  )}
                </motion.div>
              ) : (
                (activeTab === 'upcoming' ? upcomingInterviews : pastInterviews).map(
                  (interview, index) => (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${
                        activeTab === 'upcoming' ? 'border-primary/20' : 'border-gray-200'
                      }`}
                    >
                      {/* Header Strip */}
                      {activeTab === 'upcoming' && (
                        <div className="h-1 bg-gradient-to-r from-primary to-emerald-500" />
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                              {interview.application?.job?.company?.charAt(0) || 'I'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {interview.application?.job?.title || 'Interview'}
                              </h3>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {interview.application?.job?.company || 'Company'}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(interview.scheduledAt)} at {formatTime(interview.scheduledAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Video className="h-3.5 w-3.5" />
                                  {typeLabels[interview.type] || interview.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          {(() => {
                            const style = getStatusStyle(interview.status);
                            const StatusIcon = style.icon;
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
                              >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {style.label}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Interview Details */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {interview.interviewer && (
                              <span className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {interview.interviewer.name}
                                {interview.interviewer.title && (
                                  <span className="text-gray-400">
                                    ({interview.interviewer.title})
                                  </span>
                                )}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {interview.durationMinutes} min
                            </span>
                          </div>

                          {activeTab === 'upcoming' && interview.meetingLink && (
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                            >
                              <Video className="h-4 w-4" />
                              Join Meeting
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Notes */}
                        {interview.notes && (
                          <div className="mt-4 p-3 rounded-xl bg-gray-50 text-sm text-gray-600">
                            <span className="font-medium">Notes: </span>
                            {interview.notes}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar - Preparation Tips */}
        <div className="space-y-6">
          {/* Next Interview Card */}
          {upcomingInterviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-5 text-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-5 w-5" />
                <span className="font-semibold">Next Interview</span>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {upcomingInterviews[0].application?.job?.title}
              </h3>
              <p className="text-white/80 text-sm mb-3">
                {upcomingInterviews[0].application?.job?.company}
              </p>
              <div className="flex items-center gap-2 text-sm text-white/90 mb-4">
                <Calendar className="h-4 w-4" />
                {formatDate(upcomingInterviews[0].scheduledAt)} at{' '}
                {formatTime(upcomingInterviews[0].scheduledAt)}
              </div>
              {upcomingInterviews[0].meetingLink && (
                <a
                  href={upcomingInterviews[0].meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/20 text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Join Meeting
                </a>
              )}
            </motion.div>
          )}

          {/* Preparation Tips */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-400" />
                Interview Prep Tips
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {preparationTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`h-9 w-9 rounded-lg ${tip.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <tip.icon className={`h-4 w-4 ${tip.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
              <Star className="h-4 w-4" />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-amber-600" />
                Test your camera and microphone 15 min before
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-amber-600" />
                Keep a copy of your resume handy
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-amber-600" />
                Have a glass of water nearby
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-amber-600" />
                Find a quiet, well-lit space
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
