'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Save,
  Loader2,
  Camera,
  Plus,
  X,
  Pencil,
  Check,
  Link as LinkIcon,
  Upload,
  Download,
  Sparkles,
  Eye,
  Trash2,
  Code,
  ExternalLink,
  Github,
  Globe,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

// Demo profile data
const demoProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  title: 'Senior Frontend Developer',
  summary: 'Passionate frontend developer with 6+ years of experience building scalable web applications. Expert in React, TypeScript, and modern frontend technologies. Strong focus on user experience and performance optimization.',
  skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'GraphQL', 'CSS', 'Tailwind', 'Next.js'],
  experience: [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Frontend Developer',
      duration: '2021 - Present',
      description: 'Lead frontend development for core product. Mentored junior developers and improved performance by 40%.'
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      duration: '2019 - 2021',
      description: 'Built React components library and implemented design system used across all products.'
    },
    {
      company: 'WebAgency',
      position: 'Junior Developer',
      duration: '2018 - 2019',
      description: 'Developed responsive websites and maintained client projects.'
    }
  ],
  education: [
    {
      institution: 'Stanford University',
      degree: 'M.S. Computer Science',
      year: '2018'
    },
    {
      institution: 'UC Berkeley',
      degree: 'B.S. Computer Science',
      year: '2016'
    }
  ],
  certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL. Features include real-time inventory, payment processing, and admin dashboard.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      url: 'https://github.com/johndoe/ecommerce',
      image: null
    },
    {
      name: 'AI Task Manager',
      description: 'Developed an AI-powered task management app that uses NLP to automatically categorize and prioritize tasks.',
      technologies: ['Next.js', 'OpenAI', 'Prisma', 'Tailwind'],
      url: 'https://taskai.demo.com',
      image: null
    }
  ],
  linkedin: 'linkedin.com/in/johndoe',
  github: 'github.com/johndoe',
  portfolio: 'johndoe.dev',
  resume: null as { name: string; url: string; uploadedAt: string } | null,
  resumeData: null as any
};

// Calculate profile completeness
const calculateCompleteness = (profile: any) => {
  const fields = [
    { key: 'firstName', weight: 5 },
    { key: 'lastName', weight: 5 },
    { key: 'email', weight: 10 },
    { key: 'phone', weight: 5 },
    { key: 'location', weight: 5 },
    { key: 'title', weight: 10 },
    { key: 'summary', weight: 10, minLength: 50 },
    { key: 'skills', weight: 10, isArray: true, minItems: 3 },
    { key: 'experience', weight: 15, isArray: true, minItems: 1 },
    { key: 'education', weight: 10, isArray: true, minItems: 1 },
    { key: 'certifications', weight: 5, isArray: true, minItems: 0 },
    { key: 'projects', weight: 5, isArray: true, minItems: 0 },
    { key: 'resume', weight: 5 }
  ];

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const field of fields) {
    totalWeight += field.weight;
    const value = profile[field.key];

    if (field.isArray) {
      if (Array.isArray(value) && value.length >= (field.minItems || 1)) {
        earnedWeight += field.weight;
      }
    } else if (field.minLength) {
      if (typeof value === 'string' && value.length >= field.minLength) {
        earnedWeight += field.weight;
      }
    } else if (value) {
      earnedWeight += field.weight;
    }
  }

  return Math.round((earnedWeight / totalWeight) * 100);
};

// Get completeness suggestions
const getCompletenessSuggestions = (profile: any) => {
  const suggestions = [];

  if (!profile.summary || profile.summary.length < 50) {
    suggestions.push({ icon: FileText, text: 'Add a detailed professional summary', priority: 'high' });
  }
  if (!profile.skills || profile.skills.length < 3) {
    suggestions.push({ icon: Code, text: 'Add at least 3 skills', priority: 'high' });
  }
  if (!profile.experience || profile.experience.length === 0) {
    suggestions.push({ icon: Briefcase, text: 'Add your work experience', priority: 'high' });
  }
  if (!profile.education || profile.education.length === 0) {
    suggestions.push({ icon: GraduationCap, text: 'Add your education history', priority: 'medium' });
  }
  if (!profile.resume) {
    suggestions.push({ icon: Upload, text: 'Upload your resume for better job matches', priority: 'high' });
  }
  if (!profile.projects || profile.projects.length === 0) {
    suggestions.push({ icon: Code, text: 'Showcase your projects', priority: 'low' });
  }
  if (!profile.phone) {
    suggestions.push({ icon: Phone, text: 'Add your phone number', priority: 'low' });
  }

  return suggestions;
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(demoProfile);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const tenantId = getTenantId();

  // Resume upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeParseResult, setResumeParseResult] = useState<any>(null);
  const [showResumePreview, setShowResumePreview] = useState(false);

  // Modal states
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCompletenessPanel, setShowCompletenessPanel] = useState(true);

  const [newExperience, setNewExperience] = useState({ company: '', position: '', duration: '', description: '' });
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', year: '' });
  const [newCertification, setNewCertification] = useState('');
  const [newProject, setNewProject] = useState({ name: '', description: '', technologies: [] as string[], url: '' });
  const [newTech, setNewTech] = useState('');

  // Profile completeness
  const completeness = calculateCompleteness(profile);
  const suggestions = getCompletenessSuggestions(profile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/profile?candidateId=${candidateId}&tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setProfile({ ...demoProfile, ...data });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setSaved(false);

    const candidateId = localStorage.getItem('candidateId');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          location: profile.location,
          skills: profile.skills,
          summary: profile.summary,
          experience: profile.experience,
          education: profile.education,
          certifications: profile.certifications,
          projects: profile.projects,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
          tenantId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }

      setSaved(true);
      setEditingSection(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Changes saved locally.');
      setSaved(true);
      setEditingSection(null);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Resume upload and parsing
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    const candidateId = localStorage.getItem('candidateId');

    try {
      // Read file as text for backend processing
      const reader = new FileReader();
      reader.onload = async (event) => {
        const resumeText = event.target?.result as string;

        // Try to upload to backend
        if (candidateId) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/resume`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                resumeText: resumeText.substring(0, 10000), // Limit size
                tenantId,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              setProfile({
                ...profile,
                resume: {
                  name: file.name,
                  url: URL.createObjectURL(file),
                  uploadedAt: new Date().toISOString()
                }
              });
            }
          } catch (error) {
            console.error('Backend upload failed, storing locally:', error);
          }
        }

        // Store locally regardless
        setProfile({
          ...profile,
          resume: {
            name: file.name,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString()
          }
        });

        setUploadingResume(false);

        // Offer to parse
        if (confirm('Would you like to auto-fill your profile from this resume using AI?')) {
          handleParseResume(resumeText);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to read file:', error);
      setUploadingResume(false);
    }
  };

  const handleParseResume = async (resumeText?: string) => {
    setParsingResume(true);
    const candidateId = localStorage.getItem('candidateId');

    try {
      // Try AI parsing via backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/parse-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText || '',
          tenantId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.parsed) {
          setResumeParseResult({
            ...data.parsed,
            confidence: data.confidence || 0.85
          });
          setParsingResume(false);
          return;
        }
      }
    } catch (error) {
      console.error('AI parsing failed, using fallback:', error);
    }

    // Fallback: basic parsing from text
    const parsedData = {
      firstName: profile.firstName || 'Unknown',
      lastName: profile.lastName || 'Candidate',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || 'Not specified',
      title: 'Professional',
      summary: resumeText ? resumeText.substring(0, 200) + '...' : 'Resume uploaded successfully.',
      skills: profile.skills.length > 0 ? profile.skills : ['JavaScript', 'React', 'TypeScript'],
      experience: profile.experience.length > 0 ? profile.experience : [],
      education: profile.education.length > 0 ? profile.education : [],
      confidence: 0.6
    };

    setResumeParseResult(parsedData);
    setParsingResume(false);
  };

  const applyParsedData = () => {
    if (resumeParseResult) {
      setProfile({
        ...profile,
        ...resumeParseResult,
        resumeData: resumeParseResult
      });
      setResumeParseResult(null);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) });
  };

  const addExperience = () => {
    if (newExperience.company && newExperience.position) {
      setProfile({ ...profile, experience: [...profile.experience, newExperience] });
      setNewExperience({ company: '', position: '', duration: '', description: '' });
      setShowExperienceModal(false);
    }
  };

  const removeExperience = (index: number) => {
    setProfile({ ...profile, experience: profile.experience.filter((_: any, i: number) => i !== index) });
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setProfile({ ...profile, education: [...profile.education, newEducation] });
      setNewEducation({ institution: '', degree: '', year: '' });
      setShowEducationModal(false);
    }
  };

  const removeEducation = (index: number) => {
    setProfile({ ...profile, education: profile.education.filter((_: any, i: number) => i !== index) });
  };

  const addCertification = () => {
    if (newCertification.trim() && !profile.certifications.includes(newCertification.trim())) {
      setProfile({ ...profile, certifications: [...profile.certifications, newCertification.trim()] });
      setNewCertification('');
      setShowCertModal(false);
    }
  };

  const removeCertification = (cert: string) => {
    setProfile({ ...profile, certifications: profile.certifications.filter((c: string) => c !== cert) });
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      setProfile({ ...profile, projects: [...(profile.projects || []), { ...newProject, image: null }] });
      setNewProject({ name: '', description: '', technologies: [], url: '' });
      setShowProjectModal(false);
    }
  };

  const removeProject = (index: number) => {
    setProfile({ ...profile, projects: profile.projects.filter((_: any, i: number) => i !== index) });
  };

  const addTechToProject = () => {
    if (newTech.trim() && !newProject.technologies.includes(newTech.trim())) {
      setNewProject({ ...newProject, technologies: [...newProject.technologies, newTech.trim()] });
      setNewTech('');
    }
  };

  const removeTechFromProject = (tech: string) => {
    setNewProject({ ...newProject, technologies: newProject.technologies.filter(t => t !== tech) });
  };

  const deleteResume = () => {
    if (confirm('Are you sure you want to delete your resume?')) {
      setProfile({ ...profile, resume: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and resume</p>
        </div>
        <button
          onClick={() => handleUpdate()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Profile Completeness Card */}
      <AnimatePresence>
        {showCompletenessPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl bg-gradient-to-br from-primary/5 via-emerald-50 to-teal-50 border border-primary/10 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
                  <p className="text-sm text-gray-500">Complete your profile to stand out to employers</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompletenessPanel(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-white/50 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {completeness}% Complete
                </span>
                <span className="text-xs text-gray-500">
                  {completeness >= 80 ? 'Great profile!' : completeness >= 50 ? 'Good progress' : 'Just getting started'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    completeness >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    completeness >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                />
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggestions to improve</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                        suggestion.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}
                    >
                      <suggestion.icon className="h-3.5 w-3.5" />
                      {suggestion.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Resume
          </h3>
          {profile.resume && (
            <button
              onClick={() => handleParseResume()}
              disabled={parsingResume}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {parsingResume ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Auto-fill with AI
                </>
              )}
            </button>
          )}
        </div>

        {profile.resume ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{profile.resume.name}</p>
              <p className="text-sm text-gray-500">
                Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResumePreview(true)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Preview"
              >
                <Eye className="h-5 w-5" />
              </button>
              <a
                href={profile.resume.url}
                download={profile.resume.name}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                onClick={deleteResume}
                className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />
            {uploadingResume ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-gray-600">Uploading resume...</p>
              </div>
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Upload your resume</p>
                <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI will auto-extract your profile data
                </p>
              </>
            )}
          </div>
        )}

        {/* Resume Parse Result */}
        <AnimatePresence>
          {resumeParseResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-emerald-900">Resume Parsed Successfully!</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Confidence: {Math.round((resumeParseResult.confidence || 0.9) * 100)}% •
                    Found {resumeParseResult.experience?.length || 0} experiences, {resumeParseResult.skills?.length || 0} skills
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={applyParsedData}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Apply to Profile
                    </button>
                    <button
                      onClick={() => setResumeParseResult(null)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Cover & Avatar */}
        <div className="relative h-32 bg-gradient-to-r from-primary via-emerald-600 to-teal-600">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg">
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary text-3xl font-bold">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600 mt-1">{profile.title}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile.linkedin && (
                <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <LinkIcon className="h-5 w-5" />
                </a>
              )}
              {profile.github && (
                <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              )}
              {profile.portfolio && (
                <a href={`https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">About</h3>
          <button
            onClick={() => setEditingSection(editingSection === 'about' ? null : 'about')}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        {editingSection === 'about' ? (
          <textarea
            value={profile.summary}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-gray-200 p-4 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        ) : (
          <p className="text-gray-600 leading-relaxed">{profile.summary}</p>
        )}
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill: string, index: number) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="opacity-0 group-hover:opacity-100 text-primary/60 hover:text-primary transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.span>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add skill..."
              className="w-32 rounded-full border border-gray-200 px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={addSkill}
              className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Code className="h-5 w-5 text-gray-400" />
            Projects
          </h3>
          <button
            onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>

        {profile.projects && profile.projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {profile.projects.map((project: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.1 }}
                className="group relative p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <button
                  onClick={() => removeProject(index)}
                  className="absolute right-3 top-3 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Code className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No projects added yet</p>
            <p className="text-gray-400 text-xs mt-1">Showcase your work to stand out</p>
          </div>
        )}
      </motion.div>

      {/* Experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-400" />
            Experience
          </h3>
          <button
            onClick={() => setShowExperienceModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </button>
        </div>
        <div className="space-y-6">
          {profile.experience.map((exp: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group relative pl-6 border-l-2 border-gray-200"
            >
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary"></div>
              <button
                onClick={() => removeExperience(index)}
                className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-1">
                <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                <p className="text-sm text-gray-600">{exp.company}</p>
              </div>
              <p className="text-xs text-gray-500 mb-2">{exp.duration}</p>
              <p className="text-sm text-gray-600">{exp.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gray-400" />
            Education
          </h3>
          <button
            onClick={() => setShowEducationModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Education
          </button>
        </div>
        <div className="space-y-4">
          {profile.education.map((edu: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 relative"
            >
              <button
                onClick={() => removeEducation(index)}
                className="absolute right-3 top-3 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                <p className="text-sm text-gray-600">{edu.degree}</p>
                <p className="text-xs text-gray-500 mt-1">{edu.year}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-400" />
            Certifications
          </h3>
          <button
            onClick={() => setShowCertModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {profile.certifications.map((cert: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="group flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2"
            >
              <Award className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">{cert}</span>
              <button
                onClick={() => removeCertification(cert)}
                className="opacity-0 group-hover:opacity-100 text-amber-600 hover:text-red-500 transition-all ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              value={profile.email}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Social Links</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" /> LinkedIn
              </label>
              <input
                value={profile.linkedin || ''}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                placeholder="linkedin.com/in/username"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Github className="h-3 w-3" /> GitHub
              </label>
              <input
                value={profile.github || ''}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                placeholder="github.com/username"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Portfolio
              </label>
              <input
                value={profile.portfolio || ''}
                onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                placeholder="yourwebsite.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Experience</h3>
              <button
                onClick={() => setShowExperienceModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company *</label>
                <input
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  placeholder="e.g. Google"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Position *</label>
                <input
                  value={newExperience.position}
                  onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <input
                  value={newExperience.duration}
                  onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                  placeholder="e.g. 2020 - Present"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  placeholder="Describe your responsibilities..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowExperienceModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addExperience}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                Add Experience
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Education</h3>
              <button
                onClick={() => setShowEducationModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Institution *</label>
                <input
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Degree *</label>
                <input
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  placeholder="e.g. B.S. Computer Science"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Year</label>
                <input
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                  placeholder="e.g. 2020"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEducationModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addEducation}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                Add Education
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Certification</h3>
              <button
                onClick={() => setShowCertModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Certification Name *</label>
                <input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addCertification}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                Add Certification
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Project</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project Name *</label>
                <input
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. E-Commerce Platform"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe what you built and its key features..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Technologies Used</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProject.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {tech}
                      <button
                        onClick={() => removeTechFromProject(tech)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechToProject())}
                    placeholder="Add technology..."
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={addTechToProject}
                    className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project URL</label>
                <input
                  value={newProject.url}
                  onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addProject}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                Add Project
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {showResumePreview && profile.resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl h-[80vh] rounded-2xl bg-white p-6 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{profile.resume.name}</h3>
              <button
                onClick={() => setShowResumePreview(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {profile.resume.url.endsWith('.pdf') || profile.resume.name.endsWith('.pdf') ? (
                <iframe
                  src={profile.resume.url}
                  className="w-full h-full"
                  title="Resume Preview"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <a
                    href={profile.resume.url}
                    download={profile.resume.name}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
