'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bot, Search, Zap, CheckCircle2, Globe, Shield, BarChart3, Upload, Users, Award, Star } from 'lucide-react';
import AnimatedGridPattern from '@/components/reactbits/AnimatedGridPattern';
import ShinyText from '@/components/reactbits/ShinyText';
import GradientText from '@/components/reactbits/GradientText';
import TiltedCard from '@/components/reactbits/TiltedCard';
import BlurText from '@/components/reactbits/BlurText';
import { GlassCard } from '@/components/ui/glass-card';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Pattern */}
      <AnimatedGridPattern
        numSquares={50}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
        className="text-primary opacity-50"
      />

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
             <Image
               src="/images/brand/Workera_logo_icon.png"
               alt="Workera"
               width={32}
               height={32}
               className="h-8 w-8 object-contain"
             />
             <span className="text-xl font-bold tracking-tight text-gray-900">Workera</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary">
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 text-center">
          <GlassCard className="mx-auto max-w-4xl p-12 hover:shadow-2xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              The Future of Hiring is <br />
              <GradientText colors={["#25b876", "#10b981", "#059669", "#25b876"]}>
                Intelligent & Automated
              </GradientText>
            </h1>

            <div className="mb-10 flex justify-center">
              <BlurText
                text="Streamline your recruitment process with AI-driven insights. From candidate sourcing to final offer, Workera empowers your team to hire the best talent, faster."
                className="max-w-2xl text-lg text-gray-600"
                delay={0.05}
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-emerald-600 hover:shadow-primary/30"
              >
                Start Hiring Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/demo"
                className="rounded-full border border-gray-200 bg-white px-8 py-3 text-lg font-semibold text-gray-700 transition-all hover:border-primary/50 hover:text-primary"
              >
                View Demo
              </Link>
            </div>
          </GlassCard>
        </section>

        {/* Features Grid */}
        <section className="mx-auto mt-24 max-w-7xl px-6">
          <div className="mb-12 text-center">
             <h2 className="text-3xl font-bold text-gray-900">Enterprise-Grade Features</h2>
             <p className="mt-4 text-gray-500">Everything you need to scale your hiring process.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">AI Resume Parsing</h3>
                <p className="text-gray-600">
                  Automatically extract skills, education, and experience from resumes. Our parser understands context, not just keywords.
                </p>
              </GlassCard>
            </TiltedCard>

            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Semantic Search</h3>
                <p className="text-gray-600">
                  Find candidates using natural language. Search for "Senior React Developer with Fintech experience" and get accurate results.
                </p>
              </GlassCard>
            </TiltedCard>

            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Smart Matching</h3>
                <p className="text-gray-600">
                  Instantly rank candidates against job descriptions with AI-generated compatibility scores and gap analysis.
                </p>
              </GlassCard>
            </TiltedCard>

             <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Multi-Channel Posting</h3>
                <p className="text-gray-600">
                  Post to 20+ job boards including LinkedIn, Indeed, and Naukri with a single click. Manage all applicants in one place.
                </p>
              </GlassCard>
            </TiltedCard>

            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">GDPR Compliant</h3>
                <p className="text-gray-600">
                  Built-in data privacy, audit logging, and secure role-based access control. Enterprise security out of the box.
                </p>
              </GlassCard>
            </TiltedCard>

            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Real-time Analytics</h3>
                <p className="text-gray-600">
                   Track time-to-hire, source quality, and pipeline velocity. Make data-driven decisions to optimize your recruiting.
                </p>
              </GlassCard>
            </TiltedCard>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-16 text-center">
             <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
             <p className="mt-4 text-gray-500">Streamline your hiring process in three simple steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
               <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <Upload className="h-8 w-8" />
               </div>
               <h3 className="mb-2 text-xl font-bold text-gray-900">1. Post or Import</h3>
               <p className="text-gray-600">Create a job post or import descriptions. Our AI helps optimize requirements for better matches.</p>
            </div>
             <div className="relative">
               <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <Users className="h-8 w-8" />
               </div>
               <h3 className="mb-2 text-xl font-bold text-gray-900">2. Source & Screen</h3>
               <p className="text-gray-600">Candidates are automatically parsed and screened. AI ranks them by relevance to the role.</p>
            </div>
             <div className="relative">
               <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <Award className="h-8 w-8" />
               </div>
               <h3 className="mb-2 text-xl font-bold text-gray-900">3. Interview & Hire</h3>
               <p className="text-gray-600">Schedule interviews and collaborate with your team. Send offers and onboard the best talent.</p>
            </div>
          </div>
        </section>

        {/* Testimonials/Trust Section */}
        <section className="mx-auto mt-32 max-w-7xl px-6 pb-20">
          <GlassCard className="border border-white/50 bg-gradient-to-br from-white/80 to-emerald-50/50 p-12 text-center">
            <div className="mx-auto mb-8 flex max-w-2xl justify-center gap-2 text-amber-400">
               <Star className="h-6 w-6 fill-current" />
               <Star className="h-6 w-6 fill-current" />
               <Star className="h-6 w-6 fill-current" />
               <Star className="h-6 w-6 fill-current" />
               <Star className="h-6 w-6 fill-current" />
            </div>
            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              "Workera cut our hiring time by 50%. The AI matching is incredibly accurate."
            </h2>
            <div className="flex items-center justify-center gap-4">
               <div className="h-12 w-12 rounded-full bg-gray-200" />
               <div className="text-left">
                  <div className="font-bold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">VP of HR, TechFlow Inc.</div>
               </div>
            </div>
          </GlassCard>
        </section>

        {/* Footer Snippet */}
        <footer className="border-t border-gray-200 bg-white/50 py-12 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/images/brand/Workera_logo_icon.png"
                alt="Workera"
                width={24}
                height={24}
                className="h-6 w-6 object-contain grayscale opacity-50"
              />
              <span className="font-semibold text-gray-500">Workera</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Workera. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
