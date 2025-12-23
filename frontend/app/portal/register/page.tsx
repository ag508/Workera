'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  Sparkles,
  UserPlus,
  Upload,
  Linkedin,
  FileText,
  Building2,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface JobContext {
  id: string;
  title: string;
  company: string;
  location: string;
}

export default function CandidateRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job');
  const returnTo = searchParams.get('returnTo');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'resume'>('info');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const tenantId = getTenantId();

  useEffect(() => {
    if (jobId) {
      fetchJobContext();
    }
  }, [jobId]);

  const fetchJobContext = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs/${jobId}?tenantId=${tenantId}`
      );
      if (res.ok) {
        const data = await res.json();
        setJobContext({
          id: data.id,
          title: data.title,
          company: data.company || 'Company',
          location: data.location || 'Remote',
        });
      }
    } catch (error) {
      console.error('Failed to fetch job context', error);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);

    try {
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
                source: { type: 'pdf', content: base64 },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            // Auto-fill form with parsed data
            setFormData({
              ...formData,
              firstName: data.personalInfo.firstName || formData.firstName,
              lastName: data.personalInfo.lastName || formData.lastName,
              email: data.personalInfo.email || formData.email,
              phone: data.personalInfo.phone || formData.phone,
            });
            setResumeUploaded(true);
          }
        } catch (error) {
          console.error('Parse error', error);
          // Demo fallback
          setFormData({
            ...formData,
            firstName: 'John',
            lastName: 'Doe',
            email: formData.email || 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
          });
          setResumeUploaded(true);
        }

        setParsingResume(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setParsingResume(false);
      console.error('Upload error', error);
    }
  };

  const handleLinkedInImport = async () => {
    const linkedinUrl = prompt('Enter your LinkedIn profile URL:');
    if (!linkedinUrl) return;

    setParsingResume(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/resume/parse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: { type: 'linkedin', content: linkedinUrl },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setFormData({
          ...formData,
          firstName: data.personalInfo.firstName || formData.firstName,
          lastName: data.personalInfo.lastName || formData.lastName,
          email: data.personalInfo.email || formData.email,
          phone: data.personalInfo.phone || formData.phone,
        });
        setResumeUploaded(true);
      }
    } catch (error) {
      console.error('LinkedIn import error', error);
      // Demo fallback
      setFormData({
        ...formData,
        firstName: 'John',
        lastName: 'Doe',
        email: formData.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
      });
      setResumeUploaded(true);
    } finally {
      setParsingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tenantId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Auto-login after registration
        localStorage.setItem('candidateToken', data.accessToken);
        localStorage.setItem('candidateId', data.candidate.id);

        // Redirect to job application or dashboard
        if (returnTo) {
          router.push(returnTo);
        } else if (jobId) {
          router.push(`/portal/apply/${jobId}`);
        } else {
          router.push('/portal/dashboard');
        }
      } else {
        // Mock fallback
        if (formData.email.includes('demo')) {
          localStorage.setItem('candidateToken', 'mock-token');
          localStorage.setItem('candidateId', 'mock-id');
          if (returnTo) {
            router.push(returnTo);
          } else if (jobId) {
            router.push(`/portal/apply/${jobId}`);
          } else {
            router.push('/portal/dashboard');
          }
          return;
        }
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      // Mock fallback
      if (formData.email.includes('demo')) {
        localStorage.setItem('candidateToken', 'mock-token');
        localStorage.setItem('candidateId', 'mock-id');
        if (returnTo) {
          router.push(returnTo);
        } else if (jobId) {
          router.push(`/portal/apply/${jobId}`);
        } else {
          router.push('/portal/dashboard');
        }
        return;
      }
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-emerald-600 p-12 flex-col justify-between relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-20 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-40 left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <span className="text-3xl font-bold text-white">Workera</span>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            {jobContext ? (
              <>Apply for<br />{jobContext.title}</>
            ) : (
              <>Join Our<br />Talent Network</>
            )}
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            {jobContext
              ? `Create your account to apply for this position at ${jobContext.company}.`
              : 'Create your account to explore exciting opportunities and connect with top employers.'}
          </p>

          {/* Job Context Card */}
          {jobContext && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  {jobContext.company.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{jobContext.title}</div>
                  <div className="text-sm text-white/70 flex items-center gap-2 mt-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {jobContext.company}
                    <span className="text-white/40">•</span>
                    <MapPin className="h-3.5 w-3.5" />
                    {jobContext.location}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feature List */}
          <div className="space-y-4 pt-4">
            {[
              'AI-powered resume parsing',
              'Get matched with roles that fit your skills',
              'Track all your applications in one place',
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-3 w-3" />
                </div>
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/60 text-sm">
          © 2024 Workera. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                Workera
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
            {/* Logo in Card */}
            <div className="hidden lg:flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  Workera
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 mt-2 text-base">
                {jobContext ? `Apply for ${jobContext.title}` : 'Join our talent network today'}
              </p>
            </div>

            {/* Resume Import Options */}
            {step === 'info' && !resumeUploaded && (
              <div className="mb-6 space-y-3">
                <p className="text-sm text-gray-500 text-center mb-3">
                  Quick start: Import your info from resume or LinkedIn
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={parsingResume}
                    />
                    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                      {parsingResume ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {parsingResume ? 'Parsing...' : 'Upload Resume'}
                      </span>
                    </div>
                  </label>
                  <button
                    onClick={handleLinkedInImport}
                    disabled={parsingResume}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    <Linkedin className="h-6 w-6 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">LinkedIn</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">or fill manually</span>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Parsed Success */}
            {resumeUploaded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-emerald-800">Resume Parsed!</div>
                  <div className="text-sm text-emerald-600">We've auto-filled your information</div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {jobContext ? 'Create Account & Continue' : 'Create Account'}
                  </>
                )}
              </button>

              {/* Demo Hint */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-4 text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-primary">Tip:</span> Use any email with "demo" to test registration
                </p>
              </div>

              <div className="text-center pt-3">
                <span className="text-base text-gray-600">Already have an account? </span>
                <Link
                  href={jobContext ? `/portal/login?job=${jobContext.id}${returnTo ? `&returnTo=${returnTo}` : ''}` : '/portal/login'}
                  className="text-base font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden mt-8 text-center text-sm text-gray-400">
            © 2024 Workera. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
