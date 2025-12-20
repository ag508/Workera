'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-gray max-w-none">
            <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed">
                  We collect information you provide directly to us, including your name, email address, phone number,
                  resume data, and any other information you choose to provide. We also automatically collect certain
                  information when you use our Services, including your IP address, browser type, and usage data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our Services, to process
                  applications and match candidates with job opportunities, to communicate with you about our Services,
                  and to comply with legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell your personal information. We may share your information with employers when you apply
                  for jobs, with service providers who assist in our operations, and when required by law or to protect
                  our rights and the rights of others.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. This includes encryption,
                  secure server infrastructure, and regular security assessments.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed">
                  You have the right to access, correct, or delete your personal information. You may also request
                  data portability or object to certain processing activities. To exercise these rights, please
                  contact us at privacy@workera.ai.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Email:</strong> privacy@workera.ai<br />
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
