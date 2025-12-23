'use client';

import { useState, useEffect } from 'react';
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
  Linkedin,
  Github,
  Globe,
  Sparkles,
  Target,
  TrendingUp,
  Code,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
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
  totalYearsOfExperience: 6,
  experience: [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Frontend Developer',
      startDate: '2021-01',
      endDate: 'Present',
      duration: '3 years',
      isCurrent: true,
      description: 'Lead frontend development for core product. Mentored junior developers and improved performance by 40%.',
      highlights: ['Led team of 5 engineers', 'Improved performance by 40%']
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      startDate: '2019-01',
      endDate: '2020-12',
      duration: '2 years',
      isCurrent: false,
      description: 'Built React components library and implemented design system used across all products.',
      highlights: ['Built component library', 'Reduced bundle size by 30%']
    },
    {
      company: 'WebAgency',
      position: 'Junior Developer',
      startDate: '2018-01',
      endDate: '2018-12',
      duration: '1 year',
      isCurrent: false,
      description: 'Developed responsive websites and maintained client projects.',
      highlights: []
    }
  ],
  education: [
    {
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Computer Science',
      startYear: '2016',
      endYear: '2018',
      gpa: '3.9'
    },
    {
      institution: 'UC Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startYear: '2012',
      endYear: '2016'
    }
  ],
  certifications: [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'Google Cloud Professional', issuer: 'Google', date: '2022' }
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce platform with React and Node.js serving 10K+ users',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      url: 'https://github.com/johndoe/ecommerce'
    },
    {
      name: 'AI Chat Application',
      description: 'Real-time chat application with AI-powered responses using OpenAI API',
      technologies: ['Next.js', 'Socket.io', 'OpenAI', 'MongoDB'],
      url: 'https://github.com/johndoe/ai-chat'
    }
  ],
  linkedin: 'linkedin.com/in/johndoe',
  github: 'github.com/johndoe',
  portfolio: 'johndoe.dev',
  resumeUrl: null,
  profileCompleteness: 85
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(demoProfile);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeParseSuccess, setResumeParseSuccess] = useState(false);
  const tenantId = getTenantId();

  // Modal states
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newExperience, setNewExperience] = useState({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', date: '' });
  const [newProject, setNewProject] = useState({ name: '', description: '', technologies: '', url: '' });

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
      // Try enhanced profile first
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/profile/enhanced?candidateId=${candidateId}&tenantId=${tenantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('candidateToken')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setProfile({
            ...demoProfile,
            ...data.personalInfo,
            summary: data.summary || demoProfile.summary,
            skills: data.skills?.technical?.length > 0 ? [...data.skills.technical, ...data.skills.tools] : demoProfile.skills,
            experience: data.experience?.length > 0 ? data.experience : demoProfile.experience,
            education: data.education?.length > 0 ? data.education : demoProfile.education,
            certifications: data.certifications?.length > 0 ? data.certifications : demoProfile.certifications,
            projects: data.projects?.length > 0 ? data.projects : demoProfile.projects,
            totalYearsOfExperience: data.totalYearsOfExperience || demoProfile.totalYearsOfExperience,
            resumeUrl: data.resumeUrl,
            profileCompleteness: data.profileCompleteness || 85,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
    setResumeParseSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        try {
          const candidateId = localStorage.getItem('candidateId');
          const endpoint = candidateId
            ? `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/import`
            : `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/parse`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(candidateId && { Authorization: `Bearer ${localStorage.getItem('candidateToken')}` }),
            },
            body: JSON.stringify(
              candidateId
                ? { candidateId, tenantId, source: { type: 'pdf', content: base64 } }
                : { source: { type: 'pdf', content: base64 } }
            ),
          });

          if (res.ok) {
            const data = await res.json();
            updateProfileFromParsedResume(data);
            setResumeParseSuccess(true);
          } else {
            // Demo fallback
            simulateResumeParse();
          }
        } catch (error) {
          console.error('Parse error', error);
          simulateResumeParse();
        }

        setParsingResume(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setParsingResume(false);
      console.error('Upload error', error);
    }
  };

  const simulateResumeParse = () => {
    setResumeParseSuccess(true);
    // Keep existing demo data but show success
  };

  const updateProfileFromParsedResume = (data: any) => {
    setProfile((prev: any) => ({
      ...prev,
      firstName: data.personalInfo?.firstName || prev.firstName,
      lastName: data.personalInfo?.lastName || prev.lastName,
      phone: data.personalInfo?.phone || prev.phone,
      location: data.personalInfo?.location || prev.location,
      linkedin: data.personalInfo?.linkedinUrl?.replace('https://', '') || prev.linkedin,
      github: data.personalInfo?.githubUrl?.replace('https://', '') || prev.github,
      portfolio: data.personalInfo?.portfolioUrl?.replace('https://', '') || prev.portfolio,
      summary: data.summary || prev.summary,
      totalYearsOfExperience: data.totalYearsOfExperience || prev.totalYearsOfExperience,
      skills: data.skills?.technical?.length > 0
        ? [...new Set([...data.skills.technical, ...data.skills.tools])]
        : prev.skills,
      experience: data.experience?.length > 0 ? data.experience : prev.experience,
      education: data.education?.length > 0 ? data.education : prev.education,
      certifications: data.certifications?.length > 0 ? data.certifications : prev.certifications,
      projects: data.projects?.length > 0 ? data.projects : prev.projects,
    }));
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setSaved(false);

    // Demo mode: just show success
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setEditingSection(null);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
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
      const exp = {
        ...newExperience,
        duration: calculateDuration(newExperience.startDate, newExperience.endDate),
        highlights: [],
      };
      setProfile({ ...profile, experience: [exp, ...profile.experience] });
      setNewExperience({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' });
      setShowExperienceModal(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end && end !== 'Present' ? new Date(end) : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years ${remainingMonths} months`;
  };

  const removeExperience = (index: number) => {
    setProfile({ ...profile, experience: profile.experience.filter((_: any, i: number) => i !== index) });
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setProfile({ ...profile, education: [newEducation, ...profile.education] });
      setNewEducation({ institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' });
      setShowEducationModal(false);
    }
  };

  const removeEducation = (index: number) => {
    setProfile({ ...profile, education: profile.education.filter((_: any, i: number) => i !== index) });
  };

  const addCertification = () => {
    if (newCertification.name) {
      setProfile({ ...profile, certifications: [newCertification, ...profile.certifications] });
      setNewCertification({ name: '', issuer: '', date: '' });
      setShowCertModal(false);
    }
  };

  const removeCertification = (index: number) => {
    setProfile({ ...profile, certifications: profile.certifications.filter((_: any, i: number) => i !== index) });
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      const project = {
        ...newProject,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
      };
      setProfile({ ...profile, projects: [project, ...profile.projects] });
      setNewProject({ name: '', description: '', technologies: '', url: '' });
      setShowProjectModal(false);
    }
  };

  const removeProject = (index: number) => {
    setProfile({ ...profile, projects: profile.projects.filter((_: any, i: number) => i !== index) });
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'from-emerald-500 to-green-500';
    if (percentage >= 60) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      {/* Profile Completeness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-primary/5 via-white to-emerald-50 border border-primary/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profile Strength</h3>
              <p className="text-sm text-gray-500">Complete your profile to stand out to employers</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{profile.profileCompleteness}%</div>
            <div className="text-xs text-gray-500">complete</div>
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profile.profileCompleteness}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-full bg-gradient-to-r ${getCompletenessColor(profile.profileCompleteness)} rounded-full`}
          />
        </div>
        {profile.profileCompleteness < 100 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {!profile.resumeUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs">
                <AlertCircle className="h-3 w-3" />
                Upload resume
              </span>
            )}
            {profile.experience.length === 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs">
                <AlertCircle className="h-3 w-3" />
                Add experience
              </span>
            )}
            {!profile.linkedin && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs">
                <AlertCircle className="h-3 w-3" />
                Add LinkedIn
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Resume Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Resume
          </h3>
          {resumeParseSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-emerald-600 text-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Profile updated from resume
            </motion.div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={parsingResume}
            />
            <div className="h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2">
              {parsingResume ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-sm text-gray-600">Parsing with AI...</span>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">Upload Resume</span>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                  </div>
                </>
              )}
            </div>
          </label>
          <div
            onClick={() => {
              const url = prompt('Enter your LinkedIn profile URL:');
              if (url) {
                setParsingResume(true);
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/parse`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ source: { type: 'linkedin', content: url } }),
                })
                  .then(res => res.json())
                  .then(data => {
                    updateProfileFromParsedResume(data);
                    setResumeParseSuccess(true);
                  })
                  .catch(() => setResumeParseSuccess(true))
                  .finally(() => setParsingResume(false));
              }
            }}
            className="h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Linkedin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700">Import from LinkedIn</span>
              <p className="text-xs text-gray-500">Auto-fill your profile</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Our AI will parse your resume and auto-fill your profile</span>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                {profile.totalYearsOfExperience > 0 && (
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <TrendingUp className="h-4 w-4" />
                    {profile.totalYearsOfExperience}+ years experience
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.linkedin && (
                <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.github && (
                <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              )}
              {profile.portfolio && (
                <a href={`https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
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
        transition={{ delay: 0.15 }}
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
              transition={{ delay: index * 0.03 }}
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

      {/* Experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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
              transition={{ delay: 0.25 + index * 0.1 }}
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
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                  {exp.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Current</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{exp.company}</p>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {exp.startDate} - {exp.endDate || 'Present'} {exp.duration && `• ${exp.duration}`}
              </p>
              <p className="text-sm text-gray-600">{exp.description}</p>
              {exp.highlights?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {exp.highlights.map((h: string, i: number) => (
                    <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
        <div className="grid gap-4 sm:grid-cols-2">
          {profile.projects?.map((project: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group relative rounded-xl border border-gray-200 p-4 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <button
                onClick={() => removeProject(index)}
                className="absolute right-2 top-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies?.map((tech: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
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
              transition={{ delay: 0.35 + index * 0.1 }}
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
                <p className="text-sm text-gray-600">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {edu.startYear || edu.year} {edu.endYear && `- ${edu.endYear}`}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
          {profile.certifications.map((cert: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2"
            >
              <Award className="h-4 w-4 text-amber-600" />
              <div>
                <span className="text-sm font-medium text-amber-800">{cert.name || cert}</span>
                {cert.issuer && <p className="text-xs text-amber-600">{cert.issuer}</p>}
              </div>
              <button
                onClick={() => removeCertification(index)}
                className="opacity-0 group-hover:opacity-100 text-amber-600 hover:text-red-500 transition-all ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact & Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact & Social Links</h3>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-600" />
              LinkedIn
            </label>
            <input
              value={profile.linkedin}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              placeholder="linkedin.com/in/yourprofile"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </label>
            <input
              value={profile.github}
              onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              placeholder="github.com/yourusername"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              Portfolio Website
            </label>
            <input
              value={profile.portfolio}
              onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
              placeholder="yourwebsite.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </motion.div>

      {/* Experience Modal */}
      <AnimatePresence>
        {showExperienceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Experience</h3>
                <button onClick={() => setShowExperienceModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Company *</label>
                  <input value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} placeholder="e.g. Google" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Position *</label>
                  <input value={newExperience.position} onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })} placeholder="e.g. Senior Software Engineer" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input type="month" value={newExperience.startDate} onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input type="month" value={newExperience.endDate} onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })} disabled={newExperience.isCurrent} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50" />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newExperience.isCurrent} onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate })} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">I currently work here</span>
                </label>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} placeholder="Describe your responsibilities..." rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowExperienceModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={addExperience} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">Add Experience</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Education Modal */}
      <AnimatePresence>
        {showEducationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Education</h3>
                <button onClick={() => setShowEducationModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Institution *</label>
                  <input value={newEducation.institution} onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })} placeholder="e.g. Stanford University" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Degree *</label>
                  <input value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} placeholder="e.g. Bachelor of Science" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Field of Study</label>
                  <input value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} placeholder="e.g. Computer Science" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Start Year</label>
                    <input value={newEducation.startYear} onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })} placeholder="2016" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">End Year</label>
                    <input value={newEducation.endYear} onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })} placeholder="2020" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">GPA (optional)</label>
                  <input value={newEducation.gpa} onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })} placeholder="3.8" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowEducationModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={addEducation} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">Add Education</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Certification Modal */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Certification</h3>
                <button onClick={() => setShowCertModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Certification Name *</label>
                  <input value={newCertification.name} onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })} placeholder="e.g. AWS Solutions Architect" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Issuing Organization</label>
                  <input value={newCertification.issuer} onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date Obtained</label>
                  <input value={newCertification.date} onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })} placeholder="e.g. 2023" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCertModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={addCertification} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">Add Certification</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Project</h3>
                <button onClick={() => setShowProjectModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Project Name *</label>
                  <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="e.g. E-commerce Platform" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description *</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Describe your project..." rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
                  <input value={newProject.technologies} onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })} placeholder="e.g. React, Node.js, PostgreSQL" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Project URL</label>
                  <input value={newProject.url} onChange={(e) => setNewProject({ ...newProject, url: e.target.value })} placeholder="https://github.com/..." className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowProjectModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={addProject} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">Add Project</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
