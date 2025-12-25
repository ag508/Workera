'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  Download,
  Eye,
  Filter,
  Upload,
  Loader2,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Grid,
  List,
  Mail,
  Phone
} from 'lucide-react';
import { candidatesService, Candidate } from '@/lib/services/candidates';
import { MOCK_RESUME_TEXT } from '@/lib/demo-data';

interface ParsedResume {
  id: string;
  candidateId: string;
  candidateName: string;
  email: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  experience?: string;
  skills: string[];
  education?: string;
  resumeText: string;
  matchScore?: number;
  parsedAt: string;
  status: 'parsed' | 'pending' | 'failed';
}

// Generate mock parsed resumes from candidates
const generateMockResumes = (candidates: Candidate[]): ParsedResume[] => {
  const roles = ['Software Engineer', 'Product Designer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer'];
  const experiences = ['2 years', '3 years', '5 years', '7 years', '10+ years'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX', 'Seattle, WA'];

  return candidates.map((candidate, index) => ({
    id: `resume-${candidate.id}`,
    candidateId: candidate.id,
    candidateName: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone || '+1 (555) 000-0000',
    location: candidate.location || locations[index % locations.length],
    currentRole: roles[index % roles.length],
    experience: experiences[index % experiences.length],
    skills: candidate.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'].slice(0, 3 + (index % 3)),
    education: 'B.S. Computer Science',
    resumeText: candidate.resumeText || MOCK_RESUME_TEXT.replace('ALICE SMITH', `${candidate.firstName} ${candidate.lastName}`.toUpperCase()),
    matchScore: candidate.matchScore || Math.min(95, 60 + (candidate.skills?.length || 0) * 5),
    parsedAt: candidate.updatedAt || candidate.createdAt || new Date().toISOString(),
    status: 'parsed' as const
  }));
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedResume, setSelectedResume] = useState<ParsedResume | null>(null);
  const [filterSkill, setFilterSkill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchResumes() {
      try {
        const candidates = await candidatesService.getAll();
        const parsedResumes = generateMockResumes(candidates);
        setResumes(parsedResumes);
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  // Get all unique skills for filter
  const allSkills = [...new Set(resumes.flatMap(r => r.skills))];

  // Filter and sort resumes
  const filteredResumes = resumes
    .filter(resume => {
      const matchesSearch = search === '' ||
        resume.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        resume.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        resume.currentRole?.toLowerCase().includes(search.toLowerCase());

      const matchesSkill = !filterSkill || resume.skills.includes(filterSkill);

      return matchesSearch && matchesSkill;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return new Date(b.parsedAt).getTime() - new Date(a.parsedAt).getTime();
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const highMatchCount = resumes.filter(r => (r.matchScore || 0) >= 80).length;
  const todayCount = resumes.filter(r => {
    const parsed = new Date(r.parsedAt);
    const today = new Date();
    return parsed.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Database</h1>
          <p className="text-gray-500 mt-1">Browse and manage all parsed resumes</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" />
          Upload Resumes
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Resumes', value: resumes.length, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'AI Parsed', value: resumes.filter(r => r.status === 'parsed').length, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
          { label: 'High Match (80%+)', value: highMatchCount, icon: Star, color: 'text-amber-600', bgColor: 'bg-amber-100' },
          { label: 'Parsed Today', value: todayCount, icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl ${stat.bgColor} p-2.5`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search by name, skills, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="h-11 appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={filterSkill || ''}
              onChange={e => setFilterSkill(e.target.value || null)}
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="h-11 appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'score')}
            >
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading resumes...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredResumes.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No resumes found</p>
          <p className="text-sm text-gray-500 mb-4">
            {search || filterSkill ? 'Try adjusting your filters' : 'Upload resumes to get started'}
          </p>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            <Upload className="h-4 w-4" />
            Upload Resumes
          </button>
        </div>
      )}

      {/* Resume Grid */}
      {!loading && filteredResumes.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => setSelectedResume(resume)}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold">
                    {resume.candidateName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 border-2 border-white">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{resume.candidateName}</h3>
                      <p className="text-sm text-gray-500">{resume.currentRole}</p>
                    </div>
                    {resume.matchScore && (
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${resume.matchScore >= 80
                          ? 'bg-emerald-100 text-emerald-700'
                          : resume.matchScore >= 60
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {resume.matchScore}%
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {resume.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {resume.experience}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {resume.skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 4 && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        +{resume.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Parsed {formatDate(resume.parsedAt)}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setSelectedResume(resume); }}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resume List View */}
      {!loading && filteredResumes.length > 0 && viewMode === 'list' && (
        <div className="space-y-4">
          {filteredResumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => setSelectedResume(resume)}
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                    {resume.candidateName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 border-2 border-white">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {resume.candidateName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{resume.currentRole}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {resume.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {resume.experience}
                        </span>
                      </div>
                    </div>

                    {resume.matchScore && (
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${resume.matchScore >= 80
                          ? 'bg-emerald-100 text-emerald-700'
                          : resume.matchScore >= 60
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {resume.matchScore}% Match
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resume.skills.slice(0, 6).map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.skills.length > 6 && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          +{resume.skills.length - 6}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(resume.parsedAt)}
                      </span>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resume Detail Modal */}
      <AnimatePresence>
        {selectedResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedResume(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                    {selectedResume.candidateName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedResume.candidateName}</h2>
                    <p className="text-gray-500">{selectedResume.currentRole} • {selectedResume.experience}</p>
                    <p className="text-sm text-gray-400">{selectedResume.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedResume.matchScore && (
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${selectedResume.matchScore >= 80
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                      {selectedResume.matchScore}% Match
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedResume(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                    </p>
                    <p className="font-medium text-gray-900 text-sm">{selectedResume.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Experience
                    </p>
                    <p className="font-medium text-gray-900 text-sm">{selectedResume.experience}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-medium text-gray-900 text-sm">{selectedResume.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Education</p>
                    <p className="font-medium text-gray-900 text-sm">{selectedResume.education}</p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Analysis Badge */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">AI-Parsed Resume</span>
                  </div>
                  <p className="text-sm text-emerald-600">
                    This resume was automatically parsed using Gemini AI. Key information including skills,
                    experience, and qualifications have been extracted and indexed for semantic search.
                  </p>
                </div>

                {/* Full Resume Text */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Resume Content</h3>
                  <div className="bg-gray-50 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap border border-gray-100 text-gray-700 max-h-[300px] overflow-y-auto">
                    {selectedResume.resumeText}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Parsed on {formatDate(selectedResume.parsedAt)}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedResume(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                    Schedule Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
