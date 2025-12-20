'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { getTenantId } from '@/lib/utils';

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tenantId = getTenantId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tenantId })
      });

      if (res.ok) {
        router.push('/portal/login');
      } else {
        // Mock fallback
        if (formData.email.includes('demo')) {
          router.push('/portal/login');
          return;
        }
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      // Mock fallback
      if (formData.email.includes('demo')) {
        router.push('/portal/login');
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
            Join Our<br />Talent Network
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Create your account to explore exciting opportunities and connect with top employers.
          </p>

          {/* Feature List */}
          <div className="space-y-4 pt-4">
            {[
              'Access exclusive job opportunities',
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
              <p className="text-gray-600 mt-2 text-base">Join our talent network today</p>
            </div>

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
                    Create Account
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
                <Link href="/portal/login" className="text-base font-semibold text-primary hover:underline">
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
