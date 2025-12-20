'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-gray max-w-none">
            <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using Workera's services, you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  Workera provides an AI-powered recruitment platform that connects employers with job seekers.
                  Our services include job posting, candidate matching, resume parsing, and applicant tracking.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-600 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all
                  activities that occur under your account. You must provide accurate and complete information
                  when creating an account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree not to use our services for any unlawful purpose, to post false or misleading content,
                  to discriminate against any candidate or employer, or to interfere with the proper functioning
                  of our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  All content and materials on Workera, including text, graphics, logos, and software, are the
                  property of Workera or its licensors and are protected by intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  Workera shall not be liable for any indirect, incidental, special, consequential, or punitive
                  damages arising out of or relating to your use of our services. Our total liability shall not
                  exceed the amount you paid for our services in the past twelve months.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may terminate or suspend your account at any time for any reason, including breach of these
                  Terms. Upon termination, your right to use our services will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Email:</strong> legal@workera.ai<br />
                  <strong>Address:</strong> Workera Inc., 123 Tech Street, San Francisco, CA 94105
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
