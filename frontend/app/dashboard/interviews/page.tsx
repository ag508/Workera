'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
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
  RefreshCw
} from 'lucide-react';
import { interviewsService, Interview, InterviewStatus, InterviewType } from '@/lib/services/interviews';

const STATUS_CONFIG: Record<InterviewStatus, { label: string; color: string; icon: React.ElementType }> = {
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  RESCHEDULED: { label: 'Rescheduled', color: 'bg-amber-100 text-amber-700', icon: RefreshCw },
  NO_SHOW: { label: 'No Show', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

const TYPE_CONFIG: Record<InterviewType, { label: string; icon: React.ElementType }> = {
  PHONE_SCREEN: { label: 'Phone Screen', icon: Phone },
  TECHNICAL: { label: 'Technical', icon: Briefcase },
  BEHAVIORAL: { label: 'Behavioral', icon: MessageSquare },
  CULTURE_FIT: { label: 'Culture Fit', icon: Users },
  FINAL: { label: 'Final Round', icon: Star },
  PANEL: { label: 'Panel Interview', icon: Users }
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

  const upcomingCount = interviews.filter(i =>
    ['SCHEDULED', 'CONFIRMED'].includes(i.status) && new Date(i.scheduledAt) > new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interviews & Tests</h2>
          <p className="text-gray-500">Schedule and manage candidate interviews</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-emerald-600 shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Interviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => {
                  const date = new Date(i.scheduledAt);
                  const today = new Date();
                  return date.toDateString() === today.toDateString() &&
                    ['SCHEDULED', 'CONFIRMED'].includes(i.status);
                }).length}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming This Week</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </GlassCard>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && interviews.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900">No interviews found</p>
          <p className="text-sm text-gray-500 mb-4">
            {viewMode === 'upcoming'
              ? "You don't have any upcoming interviews scheduled."
              : "No interviews match the current filter."}
          </p>
          <Button className="gap-2 bg-primary hover:bg-emerald-600">
            <Plus className="h-4 w-4" /> Schedule Interview
          </Button>
        </div>
      )}

      {/* Interview List */}
      {!loading && interviews.length > 0 && (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const status = STATUS_CONFIG[interview.status];
            const type = TYPE_CONFIG[interview.type];
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;
            const isPast = new Date(interview.scheduledAt) < new Date();
            const candidateName = interview.application
              ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
              : 'Unknown Candidate';
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=random`;

            return (
              <GlassCard
                key={interview.id}
                className="p-5 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedInterview(interview)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Candidate & Job Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt={candidateName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${status.color.split(' ')[0]}`}>
                        <StatusIcon className="h-3 w-3" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{candidateName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {interview.application?.job.title || 'Position'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
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
                        <p className="text-xs text-primary font-medium mt-1">
                          {getTimeUntil(interview.scheduledAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {interview.meetingLink && interview.status !== 'CANCELLED' && !isPast && (
                        <Button
                          size="sm"
                          className="gap-1 bg-primary hover:bg-emerald-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(interview.meetingLink, '_blank');
                          }}
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </Button>
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
                      <div className="rounded-full bg-amber-100 p-2">
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
                          <p className="text-sm text-gray-600">
                            {interview.feedback.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedInterview.application
                      ? `${selectedInterview.application.candidate.firstName} ${selectedInterview.application.candidate.lastName}`
                      : 'Unknown'
                  )}&background=random`}
                  alt="Candidate"
                  className="h-14 w-14 rounded-full object-cover"
                />
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedInterview.scheduledAt)} at {formatTime(selectedInterview.scheduledAt)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">{selectedInterview.durationMinutes} minutes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                  <p className="font-semibold text-gray-900">{TYPE_CONFIG[selectedInterview.type].label}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[selectedInterview.status].color}`}>
                    {STATUS_CONFIG[selectedInterview.status].label}
                  </span>
                </div>
              </div>

              {selectedInterview.meetingLink && (
                <div className="bg-blue-50 rounded-lg p-4">
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedInterview.location}</p>
                </div>
              )}

              {selectedInterview.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-gray-700">{selectedInterview.notes}</p>
                </div>
              )}

              {selectedInterview.feedback && (
                <div className="bg-amber-50 rounded-lg p-4">
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

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setSelectedInterview(null)}>
                Close
              </Button>
              {selectedInterview.status === 'SCHEDULED' && (
                <>
                  <Button variant="outline">Reschedule</Button>
                  <Button className="bg-primary hover:bg-emerald-600">Confirm Interview</Button>
                </>
              )}
              {selectedInterview.status === 'COMPLETED' && !selectedInterview.feedback && (
                <Button className="bg-primary hover:bg-emerald-600">Add Feedback</Button>
              )}
              {selectedInterview.meetingLink && ['SCHEDULED', 'CONFIRMED'].includes(selectedInterview.status) && (
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(selectedInterview.meetingLink, '_blank')}
                >
                  <Video className="h-4 w-4" /> Join Meeting
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
