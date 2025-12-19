'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Filter,
  Phone,
  Users,
  MessageSquare,
  Star,
  RefreshCw,
  X,
  ChevronDown
} from 'lucide-react';
import { interviewsService, Interview, InterviewStatus, InterviewType } from '@/lib/services/interviews';

const STATUS_CONFIG: Record<InterviewStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Calendar },
  CONFIRMED: { label: 'Confirmed', color: 'text-emerald-700', bgColor: 'bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: XCircle },
  RESCHEDULED: { label: 'Rescheduled', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: RefreshCw },
  NO_SHOW: { label: 'No Show', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: AlertCircle }
};

const TYPE_CONFIG: Record<InterviewType, { label: string; icon: React.ElementType; color: string }> = {
  PHONE_SCREEN: { label: 'Phone Screen', icon: Phone, color: 'bg-blue-50 text-blue-600' },
  TECHNICAL: { label: 'Technical', icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
  BEHAVIORAL: { label: 'Behavioral', icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
  CULTURE_FIT: { label: 'Culture Fit', icon: Users, color: 'bg-orange-50 text-orange-600' },
  FINAL: { label: 'Final Round', icon: Star, color: 'bg-amber-50 text-amber-600' },
  PANEL: { label: 'Panel Interview', icon: Users, color: 'bg-indigo-50 text-indigo-600' }
};

type ViewMode = 'upcoming' | 'all' | 'completed';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, [viewMode]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      let data: Interview[];
      if (viewMode === 'upcoming') {
        data = await interviewsService.getUpcoming();
      } else {
        data = await interviewsService.getAll();
        if (viewMode === 'completed') {
          data = data.filter(i => i.status === 'COMPLETED');
        }
      }
      setInterviews(data);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntil = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) return 'Past';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `In ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  };

  const todayCount = interviews.filter(i => {
    const date = new Date(i.scheduledAt);
    const today = new Date();
    return date.toDateString() === today.toDateString() &&
      ['SCHEDULED', 'CONFIRMED'].includes(i.status);
  }).length;

  const upcomingCount = interviews.filter(i =>
    ['SCHEDULED', 'CONFIRMED'].includes(i.status) && new Date(i.scheduledAt) > new Date()
  ).length;

  const completedCount = interviews.filter(i => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews & Tests</h1>
          <p className="text-gray-500 mt-1">Schedule and manage candidate interviews</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Schedule Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Today's Interviews", value: todayCount, icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'Upcoming This Week', value: upcomingCount, icon: Clock, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
          { label: 'Completed This Month', value: completedCount, icon: CheckCircle2, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`rounded-xl ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'all', label: 'All Interviews' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as ViewMode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading interviews...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && interviews.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <Calendar className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No interviews found</p>
          <p className="text-sm text-gray-500 mb-4">
            {viewMode === 'upcoming'
              ? "You don't have any upcoming interviews scheduled."
              : "No interviews match the current filter."}
          </p>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Schedule Interview
          </button>
        </div>
      )}

      {/* Interview List */}
      {!loading && interviews.length > 0 && (
        <div className="space-y-4">
          {interviews.map((interview, index) => {
            const status = STATUS_CONFIG[interview.status];
            const type = TYPE_CONFIG[interview.type];
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;
            const isPast = new Date(interview.scheduledAt) < new Date();
            const candidateName = interview.application
              ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
              : 'Unknown Candidate';

            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                onClick={() => setSelectedInterview(interview)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Candidate & Job Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold">
                        {candidateName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-white ${status.bgColor.split(' ')[0]}`}>
                        <StatusIcon className={`h-3 w-3 ${status.color}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{candidateName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {interview.application?.job.title || 'Position'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${type.color}`}>
                          <TypeIcon className="h-3 w-3" />
                          {type.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Date, Time & Actions */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatDate(interview.scheduledAt)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(interview.scheduledAt)}
                      </p>
                      {!isPast && interview.status !== 'CANCELLED' && (
                        <p className="text-xs text-primary font-semibold mt-1">
                          {getTimeUntil(interview.scheduledAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {interview.meetingLink && interview.status !== 'CANCELLED' && !isPast && (
                        <button
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(interview.meetingLink, '_blank');
                          }}
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </button>
                      )}
                      {interview.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="max-w-[100px] truncate">{interview.location}</span>
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Feedback Preview for Completed Interviews */}
                {interview.status === 'COMPLETED' && interview.feedback && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-amber-100 p-2">
                        <Star className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">Feedback</span>
                          {interview.feedback.rating && (
                            <span className="text-sm font-bold text-amber-600">
                              {interview.feedback.rating}/5
                            </span>
                          )}
                        </div>
                        {interview.feedback.recommendation && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {interview.feedback.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Interview Detail Modal */}
      <AnimatePresence>
        {selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedInterview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                    {selectedInterview.application
                      ? `${selectedInterview.application.candidate.firstName[0]}${selectedInterview.application.candidate.lastName[0]}`
                      : 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedInterview.application
                        ? `${selectedInterview.application.candidate.firstName} ${selectedInterview.application.candidate.lastName}`
                        : 'Unknown Candidate'}
                    </h2>
                    <p className="text-gray-500">
                      {selectedInterview.application?.job.title || 'Position'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedInterview.scheduledAt)} at {formatTime(selectedInterview.scheduledAt)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">{selectedInterview.durationMinutes} minutes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                    <p className="font-semibold text-gray-900">{TYPE_CONFIG[selectedInterview.type].label}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border ${STATUS_CONFIG[selectedInterview.status].bgColor} ${STATUS_CONFIG[selectedInterview.status].color}`}>
                      {STATUS_CONFIG[selectedInterview.status].label}
                    </span>
                  </div>
                </div>

                {selectedInterview.meetingLink && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Meeting Link</p>
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-medium hover:underline break-all"
                    >
                      {selectedInterview.meetingLink}
                    </a>
                  </div>
                )}

                {selectedInterview.location && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="font-medium text-gray-900">{selectedInterview.location}</p>
                  </div>
                )}

                {selectedInterview.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-gray-700">{selectedInterview.notes}</p>
                  </div>
                )}

                {selectedInterview.feedback && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs text-amber-600 uppercase tracking-wide mb-2">Interview Feedback</p>
                    {selectedInterview.feedback.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= selectedInterview.feedback!.rating!
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                              }`}
                          />
                        ))}
                        <span className="ml-2 font-semibold text-gray-900">
                          {selectedInterview.feedback.rating}/5
                        </span>
                      </div>
                    )}
                    {selectedInterview.feedback.strengths && selectedInterview.feedback.strengths.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Strengths:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedInterview.feedback.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedInterview.feedback.concerns && selectedInterview.feedback.concerns.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Concerns:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedInterview.feedback.concerns.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedInterview.feedback.recommendation && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                        <p className="text-sm text-gray-600">{selectedInterview.feedback.recommendation}</p>
                      </div>
                    )}
                    {selectedInterview.feedback.comments && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Comments:</p>
                        <p className="text-sm text-gray-600">{selectedInterview.feedback.comments}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedInterview.status === 'SCHEDULED' && (
                  <>
                    <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Reschedule
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                      Confirm Interview
                    </button>
                  </>
                )}
                {selectedInterview.status === 'COMPLETED' && !selectedInterview.feedback && (
                  <button className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                    Add Feedback
                  </button>
                )}
                {selectedInterview.meetingLink && ['SCHEDULED', 'CONFIRMED'].includes(selectedInterview.status) && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    onClick={() => window.open(selectedInterview.meetingLink, '_blank')}
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
