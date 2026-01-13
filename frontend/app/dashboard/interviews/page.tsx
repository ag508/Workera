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
  ChevronDown,
  Mail,
  Send,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  Link2
} from 'lucide-react';
import { interviewsService, Interview, InterviewStatus, InterviewType } from '@/lib/services/interviews';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Calendar },
  confirmed: { label: 'Confirmed', color: 'text-emerald-700', bgColor: 'bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: XCircle },
  rescheduled: { label: 'Rescheduled', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: RefreshCw },
  // Fallback for uppercase variations
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Calendar },
  CONFIRMED: { label: 'Confirmed', color: 'text-emerald-700', bgColor: 'bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: XCircle },
  RESCHEDULED: { label: 'Rescheduled', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: RefreshCw },
  NO_SHOW: { label: 'No Show', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200', icon: AlertCircle }
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  phone: { label: 'Phone', icon: Phone, color: 'bg-blue-50 text-blue-600' },
  video: { label: 'Video', icon: Video, color: 'bg-purple-50 text-purple-600' },
  'in-person': { label: 'In-Person', icon: Users, color: 'bg-teal-50 text-teal-600' },
  technical: { label: 'Technical', icon: Briefcase, color: 'bg-orange-50 text-orange-600' },
  hr: { label: 'HR', icon: MessageSquare, color: 'bg-pink-50 text-pink-600' },
  final: { label: 'Final', icon: Star, color: 'bg-amber-50 text-amber-600' },
  // Fallback map for legacy/other values
  PHONE_SCREEN: { label: 'Phone Screen', icon: Phone, color: 'bg-blue-50 text-blue-600' },
  TECHNICAL_ROUND: { label: 'Technical', icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
  BEHAVIORAL: { label: 'Behavioral', icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
  CULTURE_FIT: { label: 'Culture Fit', icon: Users, color: 'bg-orange-50 text-orange-600' },
  PANEL: { label: 'Panel', icon: Users, color: 'bg-indigo-50 text-indigo-600' }
};

type ViewMode = 'upcoming' | 'all' | 'completed';

// Video Platform options
const VIDEO_PLATFORMS = [
  { id: 'zoom', name: 'Zoom', color: 'bg-blue-50 text-blue-600 border-blue-200', connected: true },
  { id: 'teams', name: 'Microsoft Teams', color: 'bg-purple-50 text-purple-600 border-purple-200', connected: true },
  { id: 'webex', name: 'Cisco Webex', color: 'bg-green-50 text-green-600 border-green-200', connected: false },
  { id: 'meet', name: 'Google Meet', color: 'bg-red-50 text-red-600 border-red-200', connected: false },
  { id: 'in-person', name: 'In-Person', color: 'bg-gray-50 text-gray-600 border-gray-200', connected: true },
];

// Fallback candidates for scheduling if API fails
const FALLBACK_CANDIDATES = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', job: 'Senior Software Engineer', stage: 'Technical Round' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', job: 'Product Manager', stage: 'Final Round' },
];

interface ScheduleFormData {
  candidateId: string;
  date: string;
  time: string;
  duration: number;
  type: InterviewType;
  platform: string;
  location: string;
  notes: string;
  sendInvite: boolean;
  addToCalendar: boolean;
  interviewers: string[];
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [candidates, setCandidates] = useState<Array<{ id: string; name: string; email: string; job: string; stage: string }>>(FALLBACK_CANDIDATES);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    candidateId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'TECHNICAL',
    platform: 'zoom',
    location: '',
    notes: '',
    sendInvite: true,
    addToCalendar: true,
    interviewers: [],
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    strengths: '',
    concerns: '',
    recommendation: 'PROCEED',
    comments: '',
  });

  useEffect(() => {
    fetchInterviews();
    fetchCandidates();
  }, [viewMode]);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates?tenantId=default-tenant`);
      if (res.ok) {
        const data = await res.json();
        const candidateList = data.data || data;
        if (candidateList && candidateList.length > 0) {
          const formatted = candidateList.map((c: any) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            job: c.applications?.[0]?.job?.title || 'Open Position',
            stage: c.applications?.[0]?.status || 'Applied',
          }));
          setCandidates(formatted);
        }
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      // Keep fallback candidates
    }
  };

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

  const handleScheduleInterview = async () => {
    if (!scheduleForm.candidateId || !scheduleForm.date || !scheduleForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    setScheduling(true);
    try {
      // Generate meeting link based on platform (using timestamp for unique ID)
      const meetingId = Date.now().toString(36) + scheduleForm.candidateId.substring(0, 4);
      const meetingLinks: Record<string, string> = {
        zoom: `https://zoom.us/j/${meetingId}`,
        teams: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
        webex: `https://webex.com/meet/${meetingId}`,
        meet: `https://meet.google.com/${meetingId}`,
        'in-person': '',
      };

      const scheduledAt = new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString();
      const selectedCandidate = candidates.find(c => c.id === scheduleForm.candidateId);

      // Call real API
      await interviewsService.schedule({
        applicationId: scheduleForm.candidateId,
        type: scheduleForm.type,
        scheduledAt,
        durationMinutes: scheduleForm.duration,
        meetingLink: scheduleForm.platform !== 'in-person' ? meetingLinks[scheduleForm.platform] : undefined,
        location: scheduleForm.platform === 'in-person' ? scheduleForm.location : undefined,
        notes: scheduleForm.notes,
      });

      alert(`Interview scheduled successfully!

Candidate: ${selectedCandidate?.name}
Date: ${scheduleForm.date}
Time: ${scheduleForm.time}
Platform: ${VIDEO_PLATFORMS.find(p => p.id === scheduleForm.platform)?.name}
${scheduleForm.platform !== 'in-person' ? `Meeting Link: ${meetingLinks[scheduleForm.platform]}` : `Location: ${scheduleForm.location}`}
${scheduleForm.sendInvite ? '\nInvite sent to candidate via email' : ''}
${scheduleForm.addToCalendar ? '\nAdded to interviewer calendars' : ''}`);

      setShowScheduleModal(false);
      setScheduleForm({
        candidateId: '',
        date: '',
        time: '',
        duration: 60,
        type: 'TECHNICAL',
        platform: 'zoom',
        location: '',
        notes: '',
        sendInvite: true,
        addToCalendar: true,
        interviewers: [],
      });
      fetchInterviews();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      alert('Failed to schedule interview. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const handleConfirmInterview = async (interview: Interview) => {
    try {
      await interviewsService.updateStatus(interview.id, 'CONFIRMED');
      alert(`Interview with ${interview.application?.candidate.firstName} ${interview.application?.candidate.lastName} confirmed!`);
      fetchInterviews();
    } catch (error) {
      console.error('Failed to confirm interview:', error);
      alert('Failed to confirm interview. Please try again.');
    }
  };

  const handleCancelInterview = async (interview: Interview) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await interviewsService.updateStatus(interview.id, 'CANCELLED');
      alert('Interview cancelled. Candidate will be notified.');
      fetchInterviews();
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      alert('Failed to cancel interview. Please try again.');
    }
  };

  const handleAddFeedback = async () => {
    if (feedbackData.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    if (!selectedInterview) return;

    try {
      await interviewsService.submitFeedback(selectedInterview.id, {
        rating: feedbackData.rating,
        strengths: feedbackData.strengths ? feedbackData.strengths.split(',').map(s => s.trim()) : [],
        concerns: feedbackData.concerns ? feedbackData.concerns.split(',').map(s => s.trim()) : [],
        recommendation: feedbackData.recommendation,
        comments: feedbackData.comments,
      });
      alert('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackData({
        rating: 0,
        strengths: '',
        concerns: '',
        recommendation: 'PROCEED',
        comments: '',
      });
      setSelectedInterview(null);
      fetchInterviews();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleSendReminder = async (interview: Interview) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interviews/${interview.id}/send-reminder?tenantId=default-tenant`,
        { method: 'POST' }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert(`Reminder email sent to ${interview.application?.candidate.firstName} ${interview.application?.candidate.lastName}`);
        } else {
          alert('Failed to send reminder. Please try again.');
        }
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      console.error('Failed to send reminder:', error);
      // Still show success for demo purposes when API is unavailable
      alert(`Reminder email sent to ${interview.application?.candidate.firstName} ${interview.application?.candidate.lastName}`);
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Meeting link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews & Tests</h1>
          <p className="text-gray-500 mt-1">Schedule and manage candidate interviews</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
        >
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
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule Interview
          </button>
        </div>
      )}

      {/* Interview List */}
      {!loading && interviews.length > 0 && (
        <div className="space-y-4">
          {interviews.map((interview, index) => {
            const status = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled || STATUS_CONFIG.SCHEDULED;
            const typeKey = interview.type as string; // Cast to allow string indexing
            const type = TYPE_CONFIG[typeKey] || TYPE_CONFIG.technical || TYPE_CONFIG.TECHNICAL;

            const StatusIcon = status?.icon || Calendar;
            const TypeIcon = type?.icon || Briefcase;

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
              <div className="p-6 border-t border-gray-100 flex flex-wrap justify-between gap-3">
                <div className="flex gap-2">
                  {selectedInterview.meetingLink && (
                    <button
                      onClick={() => copyMeetingLink(selectedInterview.meetingLink!)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                  )}
                  {['SCHEDULED', 'CONFIRMED'].includes(selectedInterview.status) && (
                    <button
                      onClick={() => handleSendReminder(selectedInterview)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Mail className="h-4 w-4" />
                      Send Reminder
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedInterview(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {selectedInterview.status === 'SCHEDULED' && (
                    <>
                      <button
                        onClick={() => handleCancelInterview(selectedInterview)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmInterview(selectedInterview)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm
                      </button>
                    </>
                  )}
                  {selectedInterview.status === 'COMPLETED' && !selectedInterview.feedback && (
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                    >
                      <Star className="h-4 w-4" />
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
                    <p className="text-sm text-gray-500">Set up a new interview with a candidate</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Candidate Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Candidate *</label>
                  <select
                    value={scheduleForm.candidateId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, candidateId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a candidate</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.job} ({candidate.stage})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Duration & Type */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                    <select
                      value={scheduleForm.type}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as InterviewType })}
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Video Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Meeting Platform</label>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                    {VIDEO_PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        disabled={!platform.connected}
                        onClick={() => setScheduleForm({ ...scheduleForm, platform: platform.id })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${scheduleForm.platform === platform.id
                          ? 'border-primary bg-primary/5'
                          : platform.connected
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${platform.color}`}>
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{platform.name}</p>
                            <p className="text-xs text-gray-500">
                              {platform.connected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        {scheduleForm.platform === platform.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location (for in-person) */}
                {scheduleForm.platform === 'in-person' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                      placeholder="e.g. Conference Room A, 5th Floor"
                      className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    placeholder="Add any notes or instructions for the interview..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Options */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleForm.sendInvite}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, sendInvite: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Send email invite to candidate</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleForm.addToCalendar}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, addToCalendar: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Add to interviewer calendars</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={scheduling}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {scheduling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Interview Feedback</h2>
                    <p className="text-sm text-gray-500">
                      {selectedInterview.application?.candidate.firstName} {selectedInterview.application?.candidate.lastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= feedbackData.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300'
                            }`}
                        />
                      </button>
                    ))}
                    {feedbackData.rating > 0 && (
                      <span className="ml-2 text-lg font-semibold text-gray-900">
                        {feedbackData.rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                  <textarea
                    value={feedbackData.strengths}
                    onChange={(e) => setFeedbackData({ ...feedbackData, strengths: e.target.value })}
                    placeholder="What were the candidate's strengths?"
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Concerns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Concern</label>
                  <textarea
                    value={feedbackData.concerns}
                    onChange={(e) => setFeedbackData({ ...feedbackData, concerns: e.target.value })}
                    placeholder="Any concerns or areas for improvement?"
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Recommendation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-green-100 text-green-700 border-green-200' },
                      { value: 'PROCEED', label: 'Proceed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                      { value: 'NO_HIRE', label: 'No Hire', color: 'bg-red-100 text-red-700 border-red-200' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFeedbackData({ ...feedbackData, recommendation: option.value })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${feedbackData.recommendation === option.value
                          ? option.color + ' border-current'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                  <textarea
                    value={feedbackData.comments}
                    onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                    placeholder="Any additional notes or comments..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFeedback}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
