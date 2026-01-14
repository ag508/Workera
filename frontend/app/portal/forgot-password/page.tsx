'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { getTenantId } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const tenantId = getTenantId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenantId })
      });

      // Always show success to prevent email enumeration
      setSubmitted(true);
    } catch (err) {
      // Still show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm p-2">
              <Image
                src="/images/brand/Workera_logo_icon.png"
                alt="Workera"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-3xl font-bold text-white">Workera</span>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Check Your<br />Email
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              We've sent password reset instructions to your email address if an account exists.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-white/60 text-sm">
            © 2024 Workera. All rights reserved.
          </div>
        </div>

        {/* Right Panel - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center p-1.5">
                  <Image
                    src="/images/brand/Workera_logo_icon.png"
                    alt="Workera"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  Workera
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                If an account exists for <span className="font-semibold">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Didn't receive an email? Check your spam folder or try again with a different email address.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Try Different Email
                </button>
                <Link
                  href="/portal/login"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  Back to Sign In
                </Link>
              </div>
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
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm p-2">
            <Image
              src="/images/brand/Workera_logo_icon.png"
              alt="Workera"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="text-3xl font-bold text-white">Workera</span>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Reset Your<br />Password
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            No worries! We'll send you reset instructions to get back into your account.
          </p>

          {/* Feature List */}
          <div className="space-y-4 pt-4">
            {[
              'Secure password reset process',
              'Instructions sent to your email',
              'Link expires after 1 hour',
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

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center p-1.5">
                <Image
                  src="/images/brand/Workera_logo_icon.png"
                  alt="Workera"
                  width={32}
                  height={32}
                  className="object-contain"
                />
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
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
              <p className="text-gray-600 mt-2 text-base">Enter your email and we'll send you reset instructions</p>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>

              <div className="text-center pt-3">
                <Link
                  href="/portal/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
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
