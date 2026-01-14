'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Briefcase, User, ArrowRight, Building2, Users, Sparkles } from 'lucide-react';

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-12"
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
          <Image
            src="/images/brand/Workera_Text_logo.png"
            alt="Workera"
            width={140}
            height={40}
            className="object-contain"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How would you like to get started?</h1>
          <p className="text-lg text-gray-600">Choose the option that best describes you</p>
        </motion.div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recruiter Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard"
              className="group block rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">I'm a Recruiter</h2>
                  <p className="text-sm text-gray-500">Hire top talent for your company</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  'Post unlimited job listings',
                  'AI-powered candidate matching',
                  'Resume parsing & screening',
                  'Interview scheduling',
                  'Analytics dashboard'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Start recruiting</span>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Candidate Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/portal/register"
              className="group block rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">I'm a Candidate</h2>
                  <p className="text-sm text-gray-500">Find your dream job</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  'Browse thousands of jobs',
                  'AI-matched opportunities',
                  'Track your applications',
                  'Interview preparation',
                  'Career resources'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">Find jobs</span>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <ArrowRight className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
