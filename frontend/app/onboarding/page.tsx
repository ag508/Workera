'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Phone,
  Briefcase,
  Globe,
  Users,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  SkipForward,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const COMPANY_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Media & Entertainment',
  'Real Estate',
  'Other',
];

type Step = 'profile' | 'company' | 'complete';

interface OnboardingStatus {
  step: string;
  completed: boolean;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
  };
  company: {
    companyName?: string;
    companyWebsite?: string;
    companySize?: string;
    industry?: string;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    jobTitle: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
  });

  // Fetch onboarding status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('recruiter_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/onboarding/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch status');
        }

        const status: OnboardingStatus = await response.json();

        // If already completed, redirect to dashboard
        if (status.completed) {
          router.push('/dashboard');
          return;
        }

        // Pre-fill data
        setProfileData({
          firstName: status.profile.firstName || '',
          lastName: status.profile.lastName || '',
          phone: status.profile.phone || '',
          jobTitle: status.profile.jobTitle || '',
        });

        setCompanyData({
          companyName: status.company.companyName || '',
          companyWebsite: status.company.companyWebsite || '',
          companySize: status.company.companySize || '',
          industry: status.company.industry || '',
        });

        // Set current step based on status
        if (status.step === 'company_info' || status.step === 'preferences') {
          setCurrentStep('company');
        } else if (status.step === 'completed') {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Failed to fetch onboarding status:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchStatus();
  }, [router]);

  const getToken = () => localStorage.getItem('recruiter_token');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/onboarding/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save profile');
      }

      // Update local storage with new user data
      const userData = await response.json();
      localStorage.setItem('recruiter_user', JSON.stringify(userData));

      setCurrentStep('company');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Save company info
      const companyResponse = await fetch(`${API_BASE_URL}/users/onboarding/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(companyData),
      });

      if (!companyResponse.ok) {
        const data = await companyResponse.json();
        throw new Error(data.message || 'Failed to save company info');
      }

      // Complete onboarding
      const completeResponse = await fetch(`${API_BASE_URL}/users/onboarding/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!completeResponse.ok) {
        const data = await completeResponse.json();
        throw new Error(data.message || 'Failed to complete onboarding');
      }

      // Update local storage
      const userData = await completeResponse.json();
      localStorage.setItem('recruiter_user', JSON.stringify(userData));

      setCurrentStep('complete');

      // Redirect after showing success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/onboarding/skip`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to skip onboarding');
      }

      // Update local storage
      const userData = await response.json();
      localStorage.setItem('recruiter_user', JSON.stringify(userData));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to skip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const steps = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'company', label: 'Company', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25 p-2">
            <Image
              src="/images/brand/Workera_logo_icon.png"
              alt="Workera"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Workera
          </span>
        </motion.div>

        {/* Progress Steps */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.key === currentStep;
              const isCompleted =
                (step.key === 'profile' && currentStep === 'company');

              return (
                <div key={step.key} className="flex items-center gap-4">
                  {index > 0 && (
                    <div
                      className={`h-0.5 w-12 ${
                        isCompleted ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : isCompleted
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    <span className="font-medium text-sm">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Profile Step */}
          {currentStep === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell us about yourself
                </h1>
                <p className="text-gray-600">
                  This helps us personalize your experience
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.jobTitle}
                      onChange={(e) =>
                        setProfileData({ ...profileData, jobTitle: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="HR Manager, Recruiter, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <SkipForward className="h-5 w-5" />
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Company Step */}
          {currentStep === 'company' && (
            <motion.div
              key="company"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tell us about your company
                </h1>
                <p className="text-gray-600">
                  Help us tailor our features to your needs
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCompanySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={companyData.companyName}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, companyName: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Acme Inc."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website (optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={companyData.companyWebsite}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, companyWebsite: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="https://www.company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={companyData.companySize}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, companySize: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Select company size</option>
                      {COMPANY_SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={companyData.industry}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, industry: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('profile')}
                    disabled={isLoading}
                    className="py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <Sparkles className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center"
            >
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                You're all set!
              </h1>
              <p className="text-gray-600 mb-6">
                Your recruiter profile is ready. Let's start hiring top talent!
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirecting to dashboard...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
