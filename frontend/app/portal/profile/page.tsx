'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Link as LinkIcon
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
  linkedin: 'linkedin.com/in/johndoe',
  github: 'github.com/johndoe',
  portfolio: 'johndoe.dev'
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(demoProfile);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const tenantId = getTenantId();

  // Modal states
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newExperience, setNewExperience] = useState({ company: '', position: '', duration: '', description: '' });
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', year: '' });
  const [newCertification, setNewCertification] = useState('');

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
      // Keep demo data on error
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <a href={`https://${profile.linkedin}`} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <LinkIcon className="h-5 w-5" />
              </a>
              <a href={`https://${profile.github}`} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <FileText className="h-5 w-5" />
              </a>
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
    </div>
  );
}
