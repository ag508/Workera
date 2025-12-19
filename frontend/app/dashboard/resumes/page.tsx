'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
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
  Clock
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
    phone: '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
    location: candidate.location || locations[index % locations.length],
    currentRole: roles[index % roles.length],
    experience: experiences[index % experiences.length],
    skills: candidate.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'].slice(0, 3 + (index % 3)),
    education: 'B.S. Computer Science',
    resumeText: candidate.resumeText || MOCK_RESUME_TEXT.replace('ALICE SMITH', `${candidate.firstName} ${candidate.lastName}`.toUpperCase()),
    matchScore: candidate.matchScore || Math.floor(60 + Math.random() * 35),
    parsedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Database</h2>
          <p className="text-gray-500">Browse and manage all parsed resumes</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-emerald-600 shadow-lg shadow-primary/25">
          <Upload className="h-4 w-4" /> Upload Resumes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
              <p className="text-xs text-gray-500">Total Resumes</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resumes.filter(r => r.status === 'parsed').length}
              </p>
              <p className="text-xs text-gray-500">AI Parsed</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resumes.filter(r => (r.matchScore || 0) >= 80).length}
              </p>
              <p className="text-xs text-gray-500">High Match (80%+)</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resumes.filter(r => {
                  const parsed = new Date(r.parsedAt);
                  const today = new Date();
                  return parsed.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-xs text-gray-500">Parsed Today</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="h-10 w-full rounded-full border-none bg-white pl-10 pr-4 text-sm shadow-sm ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
            placeholder="Search by name, skills, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="h-10 appearance-none rounded-full border-none bg-white pl-4 pr-10 text-sm shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-primary cursor-pointer"
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
              className="h-10 appearance-none rounded-full border-none bg-white pl-4 pr-10 text-sm shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-primary cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'score')}
            >
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredResumes.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900">No resumes found</p>
          <p className="text-sm text-gray-500 mb-4">
            {search || filterSkill ? 'Try adjusting your filters' : 'Upload resumes to get started'}
          </p>
          <Button className="gap-2 bg-primary hover:bg-emerald-600">
            <Upload className="h-4 w-4" /> Upload Resumes
          </Button>
        </div>
      )}

      {/* Resume Grid */}
      {!loading && filteredResumes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume) => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(resume.candidateName)}&background=random`;

            return (
              <GlassCard
                key={resume.id}
                className="p-5 transition-all hover:shadow-lg cursor-pointer group"
                onClick={() => setSelectedResume(resume)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={resume.candidateName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 truncate">{resume.candidateName}</h3>
                        <p className="text-sm text-gray-500">{resume.currentRole}</p>
                      </div>
                      {resume.matchScore && (
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${resume.matchScore >= 80
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
                      className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelectedResume(resume); }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Resume Detail Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100">
              <div className="flex gap-4 items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedResume.candidateName)}&background=random`}
                  alt={selectedResume.candidateName}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedResume.candidateName}</h2>
                  <p className="text-gray-500">{selectedResume.currentRole} • {selectedResume.experience}</p>
                  <p className="text-sm text-gray-400">{selectedResume.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedResume.matchScore && (
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${selectedResume.matchScore >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {selectedResume.matchScore}% Match
                  </div>
                )}
                <button
                  onClick={() => setSelectedResume(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedResume.location}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedResume.experience}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedResume.phone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Education</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedResume.education}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Analysis Badge */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Resume Content</h3>
                <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap border border-gray-100 shadow-inner text-gray-700 max-h-[300px] overflow-y-auto">
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
                <Button variant="outline" onClick={() => setSelectedResume(null)}>
                  Close
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button className="gap-2 bg-primary hover:bg-emerald-600">
                  Schedule Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
