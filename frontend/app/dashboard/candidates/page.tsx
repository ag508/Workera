'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin, FileText, X, Loader2, Star, ChevronDown, Grid, List, Users, SlidersHorizontal, Send } from 'lucide-react';
import { candidatesService, Candidate } from '@/lib/services/candidates';
import { MOCK_RESUME_TEXT } from '@/lib/demo-data';
import { getTenantId } from '@/lib/utils';

const statusColors: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700 border-blue-200',
  'Screening': 'bg-purple-100 text-purple-700 border-purple-200',
  'Interview': 'bg-amber-100 text-amber-700 border-amber-200',
  'Offer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Hired': 'bg-green-100 text-green-700 border-green-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageCandidate, setMessageCandidate] = useState<any>(null);
  const [messageData, setMessageData] = useState({ subject: '', content: '' });
  const [sendingMessage, setSendingMessage] = useState(false);
  const tenantId = getTenantId();

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const data = await candidatesService.getAll();
        setCandidates(data);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openMessageModal = (candidate: any, fullName: string) => {
    setMessageCandidate({ ...candidate, fullName });
    setMessageData({ subject: '', content: '' });
    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!messageCandidate || !messageData.subject || !messageData.content) return;
    setSendingMessage(true);

    // Get current user from localStorage
    const userStr = localStorage.getItem('recruiter_user');
    const user = userStr ? JSON.parse(userStr) : { firstName: 'Recruiter', email: 'recruiter@workera.ai' };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: messageCandidate.email,
          toName: messageCandidate.fullName,
          subject: messageData.subject,
          content: messageData.content,
          senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Recruiter',
          senderEmail: user.email || 'recruiter@workera.ai',
          candidateId: messageCandidate.id,
          sendEmailNotification: true,
          tenantId,
        }),
      });

      if (res.ok) {
        setShowMessageModal(false);
        setMessageCandidate(null);
        setMessageData({ subject: '', content: '' });
        alert('Message sent successfully!');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">Manage and track your candidate pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors">
            <Users className="h-4 w-4" />
            Import Candidates
          </button>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates by name, skills, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: candidates.length, color: 'text-gray-900' },
          { label: 'In Review', value: Math.floor(candidates.length * 0.4), color: 'text-blue-600' },
          { label: 'Interviewing', value: Math.floor(candidates.length * 0.25), color: 'text-amber-600' },
          { label: 'Shortlisted', value: Math.floor(candidates.length * 0.15), color: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl bg-white p-4 border border-gray-100">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading candidates...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && candidates.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No candidates found</p>
          <p className="text-sm text-gray-500 mb-4">Import candidates or wait for applications</p>
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Import Candidates
          </button>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate, index) => {
          const fullName = `${candidate.firstName} ${candidate.lastName}`;
          const avatarUrl = `https://i.pravatar.cc/100?u=${candidate.id}`;
          const score = candidate.matchScore || Math.min(95, 60 + (candidate.skills?.length || 0) * 5);
          const status = candidate.status || 'Screening';

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  {score >= 90 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{fullName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location || 'Remote'}
                        </span>
                        {score >= 80 && (
                          <span className="font-semibold text-primary">{score}% Match</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[status] || statusColors['Screening']}`}>
                        {status}
                      </span>
                      <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(candidate.skills || ['React', 'TypeScript', 'Node.js']).slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCandidate({ ...candidate, fullName, avatarUrl }); }}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" /> View Resume
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openMessageModal(candidate, fullName); }}
                        className="p-2 rounded-lg hover:bg-primary/10 transition-colors group/btn"
                        title="Send Message"
                      >
                        <Mail className="h-4 w-4 text-gray-400 group-hover/btn:text-primary" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Phone className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resume Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-center">
                <img
                  src={selectedCandidate.avatarUrl}
                  alt={selectedCandidate.fullName}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCandidate.fullName}</h2>
                  <p className="text-gray-500">{selectedCandidate.location || 'Remote'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap border border-gray-100 text-gray-700">
                {selectedCandidate.resumeText || MOCK_RESUME_TEXT.replace('ALICE SMITH', selectedCandidate.fullName.toUpperCase())}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setSelectedCandidate(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors">
                Close
              </button>
              <button className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25 transition-all">
                Schedule Interview
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Message Compose Modal */}
      {showMessageModal && messageCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {messageCandidate.fullName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Message {messageCandidate.fullName}</h3>
                  <p className="text-sm text-gray-500">{messageCandidate.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="e.g., Regarding your application for Software Engineer"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={messageData.content}
                  onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                  placeholder="Write your message here..."
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={sendingMessage || !messageData.subject || !messageData.content}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
