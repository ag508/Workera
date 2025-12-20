'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
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
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          </div>

          <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-gray max-w-none">
            <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. What Are Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit our website.
                  They help us recognize your device and remember your preferences, making your experience
                  on our platform more personalized and efficient.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                    <p className="text-gray-600 text-sm">
                      Required for the website to function properly. They enable core features like security,
                      session management, and accessibility options.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-gray-600 text-sm">
                      Help us understand how visitors interact with our website by collecting and reporting
                      information anonymously.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                    <p className="text-gray-600 text-sm">
                      Remember your preferences and settings to provide a more personalized experience.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                    <p className="text-gray-600 text-sm">
                      Used to track visitors across websites and display relevant advertisements.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Managing Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  You can control and manage cookies in your browser settings. Please note that removing or
                  blocking cookies may impact your user experience and some features may not function properly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  Some cookies are placed by third-party services that appear on our pages. We do not control
                  the use of these cookies and you should refer to the respective privacy policies for more
                  information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Updates to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Cookie Policy from time to time. We will notify you of any changes by
                  posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about our use of cookies, please contact us at:
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
