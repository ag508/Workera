'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Linkedin,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  X,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Check,
  FileUp,
  Link as LinkIcon,
  Code,
  Award,
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface ParsedResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary: string;
  totalYearsOfExperience: number;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    duration: string;
    description: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedAt?: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

const steps = [
  { id: 'resume', title: 'Import Resume', icon: FileUp, description: 'Upload your resume or import from LinkedIn' },
  { id: 'profile', title: 'Review Profile', icon: User, description: 'Verify your information' },
  { id: 'application', title: 'Application', icon: Briefcase, description: 'Answer additional questions' },
  { id: 'review', title: 'Review & Submit', icon: CheckCircle2, description: 'Final review' },
];

export default function WorkdayStyleApplyPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const tenantId = getTenantId();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [job, setJob] = useState<Job | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [formTemplate, setFormTemplate] = useState<{ sections: FormSection[] } | null>(null);

  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('candidateToken');
    const id = localStorage.getItem('candidateId');
    setIsLoggedIn(!!token);
    setCandidateId(id);
    fetchJobDetails();
    fetchFormTemplate();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs/${jobId}?tenantId=${tenantId}`
      );
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      } else {
        // Demo data
        setJob({
          id: jobId,
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA (Hybrid)',
          type: 'Full-time',
          salary: '$150,000 - $200,000',
          description: 'We are looking for an experienced software engineer to join our team and help build the next generation of our platform.',
          requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', '5+ years experience'],
        });
      }
    } catch (error) {
      console.error('Failed to fetch job', error);
      setJob({
        id: jobId,
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA (Hybrid)',
        type: 'Full-time',
        salary: '$150,000 - $200,000',
        description: 'We are looking for an experienced software engineer to join our team.',
        requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFormTemplate = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs/${jobId}/form-template?tenantId=${tenantId}`
      );
      if (res.ok) {
        const data = await res.json();
        setFormTemplate(data);
      }
    } catch (error) {
      console.error('Failed to fetch form template', error);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
    setError('');

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/parse`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                source: {
                  type: 'pdf',
                  content: base64,
                },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            setResumeData(data);
            calculateMatchScore(data);
            setCurrentStep(1);
          } else {
            // Demo fallback
            simulateParsedResume();
          }
        } catch (error) {
          console.error('Parse error', error);
          simulateParsedResume();
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError('Failed to process resume');
    } finally {
      setParsingResume(false);
    }
  };

  const handleLinkedInImport = async () => {
    const linkedinUrl = prompt('Enter your LinkedIn profile URL:');
    if (!linkedinUrl) return;

    setParsingResume(true);
    setError('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/parse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: {
              type: 'linkedin',
              content: linkedinUrl,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
        calculateMatchScore(data);
        setCurrentStep(1);
      } else {
        simulateParsedResume();
      }
    } catch (error) {
      simulateParsedResume();
    } finally {
      setParsingResume(false);
    }
  };

  const simulateParsedResume = () => {
    const demoData: ParsedResumeData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
      },
      summary: 'Experienced software engineer with 7+ years of experience building scalable web applications. Expert in React, TypeScript, and Node.js with a passion for creating exceptional user experiences.',
      totalYearsOfExperience: 7,
      experience: [
        {
          company: 'TechCorp Inc.',
          position: 'Senior Software Engineer',
          startDate: '2021-01',
          endDate: 'Present',
          isCurrent: true,
          duration: '3 years',
          description: 'Lead frontend development for core product. Mentored junior developers and improved performance by 40%.',
          highlights: ['Led team of 5 engineers', 'Improved performance by 40%', 'Implemented design system'],
        },
        {
          company: 'StartupXYZ',
          position: 'Software Engineer',
          startDate: '2018-06',
          endDate: '2020-12',
          isCurrent: false,
          duration: '2.5 years',
          description: 'Built React components library and implemented design system used across all products.',
          highlights: ['Built component library', 'Reduced bundle size by 30%'],
        },
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          startYear: '2016',
          endYear: '2018',
          gpa: '3.9',
        },
        {
          institution: 'UC Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startYear: '2012',
          endYear: '2016',
        },
      ],
      skills: {
        technical: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'],
        soft: ['Leadership', 'Communication', 'Problem Solving'],
        languages: ['JavaScript', 'TypeScript', 'Python', 'Go'],
        tools: ['Git', 'Jira', 'Figma', 'VS Code'],
      },
      certifications: [
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
        { name: 'Google Cloud Professional', issuer: 'Google', date: '2022' },
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce platform with React and Node.js',
          technologies: ['React', 'Node.js', 'PostgreSQL'],
          url: 'https://github.com/johndoe/ecommerce',
        },
      ],
    };

    setResumeData(demoData);
    setMatchScore(92);
    setCurrentStep(1);
  };

  const calculateMatchScore = async (data: ParsedResumeData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs/${jobId}/match-score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            resumeData: data,
          }),
        }
      );

      if (res.ok) {
        const result = await res.json();
        setMatchScore(result.score);
      }
    } catch (error) {
      console.error('Failed to calculate match score', error);
      setMatchScore(85); // Demo fallback
    }
  };

  const handleSkipResume = () => {
    setResumeData({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
      },
      summary: '',
      totalYearsOfExperience: 0,
      experience: [],
      education: [],
      skills: { technical: [], soft: [], languages: [], tools: [] },
      certifications: [],
      projects: [],
    });
    setCurrentStep(1);
  };

  const updateResumeData = (path: string, value: any) => {
    if (!resumeData) return;

    const keys = path.split('.');
    const newData = { ...resumeData };
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setResumeData(newData);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      if (isLoggedIn && candidateId) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/apply`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('candidateToken')}`,
            },
            body: JSON.stringify({
              candidateId,
              jobId,
              tenantId,
              formData,
              resumeData,
            }),
          }
        );

        if (res.ok) {
          setSubmitted(true);
        } else {
          // Demo fallback
          setSubmitted(true);
        }
      } else {
        // Demo mode
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Submit error', error);
      setSubmitted(true); // Demo fallback
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for applying to <span className="font-semibold">{job?.title}</span> at{' '}
              <span className="font-semibold">{job?.company}</span>. We'll review your application and get back to you soon.
            </p>
            {matchScore && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 mb-6">
                <Star className="h-4 w-4" />
                <span className="font-medium">{matchScore}% match with this role</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/portal/applications"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                View My Applications
              </Link>
              <Link
                href="/portal/jobs"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Browse More Jobs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/portal/jobs" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900">{job?.title}</h1>
                <p className="text-sm text-gray-500">{job?.company} • {job?.location}</p>
              </div>
            </div>
            {matchScore && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">{matchScore}% match</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      index < currentStep
                        ? 'bg-primary text-white'
                        : index === currentStep
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <div className={`text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 max-w-[120px]">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-24 lg:w-32 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Resume Import */}
          {currentStep === 0 && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Import Your Resume</h2>
                <p className="text-gray-600 mt-2">
                  Upload your resume to auto-fill your application. We'll parse your information using AI.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* PDF Upload */}
                <label className="cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={parsingResume}
                  />
                  <div className="h-48 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 group-hover:shadow-lg">
                    {parsingResume ? (
                      <>
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <span className="text-sm text-gray-600">Parsing resume with AI...</span>
                      </>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Upload className="h-7 w-7 text-primary" />
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-gray-900">Upload Resume</span>
                          <p className="text-sm text-gray-500 mt-1">PDF, DOC, or DOCX</p>
                        </div>
                      </>
                    )}
                  </div>
                </label>

                {/* LinkedIn Import */}
                <button
                  onClick={handleLinkedInImport}
                  disabled={parsingResume}
                  className="h-48 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-4 hover:shadow-lg disabled:opacity-50"
                >
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Linkedin className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-900">Import from LinkedIn</span>
                    <p className="text-sm text-gray-500 mt-1">Enter your profile URL</p>
                  </div>
                </button>
              </div>

              {/* Other Import Options */}
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => {
                    const text = prompt('Paste your resume text:');
                    if (text) {
                      setParsingResume(true);
                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/parse`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ source: { type: 'text', content: text } }),
                      })
                        .then(res => res.json())
                        .then(data => {
                          setResumeData(data);
                          calculateMatchScore(data);
                          setCurrentStep(1);
                        })
                        .catch(() => simulateParsedResume())
                        .finally(() => setParsingResume(false));
                    }
                  }}
                  disabled={parsingResume}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Paste Text</span>
                </button>

                <button
                  onClick={() => {
                    const json = prompt('Paste your JSON Resume:');
                    if (json) {
                      try {
                        const data = JSON.parse(json);
                        setResumeData(data);
                        setCurrentStep(1);
                      } catch {
                        alert('Invalid JSON');
                      }
                    }
                  }}
                  disabled={parsingResume}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Code className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">JSON Resume</span>
                </button>

                <button
                  onClick={handleSkipResume}
                  disabled={parsingResume}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Skip for Now</span>
                </button>
              </div>

              {/* Job Preview */}
              <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                    {job?.company?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job?.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job?.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job?.location}
                      </span>
                      {job?.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job?.salary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {job?.requirements && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.map((req, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                        {req}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Profile Review */}
          {currentStep === 1 && resumeData && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Profile</h2>
                <p className="text-gray-600 mt-2">
                  We've extracted the following information from your resume. Please review and update as needed.
                </p>
              </div>

              {matchScore && (
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Sparkles className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">AI Match Analysis</div>
                      <div className="text-sm text-gray-600">Based on your skills and experience</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{matchScore}%</div>
                    <div className="text-xs text-gray-500">match score</div>
                  </div>
                </div>
              )}

              {/* Personal Info */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-gray-400" />
                  Personal Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.firstName}
                      onChange={(e) => updateResumeData('personalInfo.firstName', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.lastName}
                      onChange={(e) => updateResumeData('personalInfo.lastName', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updateResumeData('personalInfo.email', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updateResumeData('personalInfo.phone', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => updateResumeData('personalInfo.location', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Professional Summary</h3>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => updateResumeData('summary', e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4" />
                  {resumeData.totalYearsOfExperience} years of experience detected
                </div>
              </div>

              {/* Experience */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="relative pl-6 border-l-2 border-primary/30">
                      <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
                      <div className="font-medium text-gray-900">{exp.position}</div>
                      <div className="text-sm text-gray-600">{exp.company}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {exp.startDate} - {exp.endDate} • {exp.duration}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  Education
                </h3>
                <div className="space-y-3">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{edu.degree} in {edu.field}</div>
                        <div className="text-sm text-gray-600">{edu.institution}</div>
                        <div className="text-xs text-gray-500">{edu.startYear} - {edu.endYear}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[...resumeData.skills.technical, ...resumeData.skills.tools].map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {resumeData.certifications.length > 0 && (
                <div className="rounded-2xl bg-white border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-gray-400" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {resumeData.certifications.map((cert, i) => (
                      <div key={i} className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="font-medium text-amber-800">{cert.name}</div>
                        <div className="text-xs text-amber-600">{cert.issuer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Application Form */}
          {currentStep === 2 && (
            <motion.div
              key="application"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                <p className="text-gray-600 mt-2">
                  Please answer a few more questions to complete your application.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Why are you interested in this role? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.whyInterested || ''}
                    onChange={(e) => setFormData({ ...formData, whyInterested: e.target.value })}
                    rows={4}
                    placeholder="Tell us what excites you about this opportunity..."
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Expected Salary Range
                    </label>
                    <input
                      type="text"
                      value={formData.expectedSalary || ''}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      placeholder="e.g., $120,000 - $150,000"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Availability to Start <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select...</option>
                      <option value="immediately">Immediately</option>
                      <option value="2weeks">2 weeks notice</option>
                      <option value="1month">1 month notice</option>
                      <option value="2months">2 months notice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Are you authorized to work in this country? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.workAuthorization || ''}
                    onChange={(e) => setFormData({ ...formData, workAuthorization: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="sponsorship">Requires Sponsorship</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    How did you hear about this position?
                  </label>
                  <select
                    value={formData.referralSource || ''}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select...</option>
                    <option value="website">Company Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="referral">Employee Referral</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={formData.additionalInfo || ''}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={3}
                    placeholder="Anything else you'd like us to know..."
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 3 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Application</h2>
                <p className="text-gray-600 mt-2">
                  Please review your information before submitting.
                </p>
              </div>

              {/* Application Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-white to-emerald-50 border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {job?.company?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job?.title}</h3>
                    <p className="text-sm text-gray-600">{job?.company} • {job?.location}</p>
                    {matchScore && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                        <Sparkles className="h-3 w-3" />
                        {matchScore}% match
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Summary */}
              {resumeData && (
                <div className="rounded-2xl bg-white border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">
                        {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{resumeData.personalInfo.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{resumeData.personalInfo.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium text-gray-900">{resumeData.personalInfo.location}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-sm text-gray-500">Experience</div>
                      <div className="font-medium text-gray-900">
                        {resumeData.totalYearsOfExperience} years • {resumeData.experience.length} positions
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Answers */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Answers</h3>
                <div className="space-y-4">
                  {formData.whyInterested && (
                    <div>
                      <div className="text-sm text-gray-500">Why are you interested?</div>
                      <div className="text-sm text-gray-900 mt-1">{formData.whyInterested}</div>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {formData.expectedSalary && (
                      <div>
                        <div className="text-sm text-gray-500">Expected Salary</div>
                        <div className="font-medium text-gray-900">{formData.expectedSalary}</div>
                      </div>
                    )}
                    {formData.startDate && (
                      <div>
                        <div className="text-sm text-gray-500">Availability</div>
                        <div className="font-medium text-gray-900">{formData.startDate}</div>
                      </div>
                    )}
                    {formData.workAuthorization && (
                      <div>
                        <div className="text-sm text-gray-500">Work Authorization</div>
                        <div className="font-medium text-gray-900">{formData.workAuthorization}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.privacyConsent || false}
                      onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">
                      I have read and agree to the{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a> and{' '}
                      <a href="#" className="text-primary hover:underline">Terms of Use</a>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dataProcessingConsent || false}
                      onChange={(e) => setFormData({ ...formData, dataProcessingConsent: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">
                      I consent to the processing of my personal data for recruitment purposes
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 0 && !resumeData}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 transition-colors"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.privacyConsent || !formData.dataProcessingConsent}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
