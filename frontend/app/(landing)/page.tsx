'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Search, Zap, CheckCircle2, Globe, Shield, BarChart3 } from 'lucide-react';
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
             <div className="h-8 w-8 rounded bg-primary" />
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
            <div className="mb-6 flex justify-center">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                New: Gemini 3 Pro Powered RAG
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Recruitment Automation with <br />
              <GradientText colors={["#25b876", "#10b981", "#059669", "#25b876"]}>
                Artificial Intelligence
              </GradientText>
            </h1>

            <div className="mb-10 flex justify-center">
              <BlurText
                text="Automate end-to-end hiring workflows from resume parsing to intelligent candidate matching. Find top talent 10x faster."
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
                  Extract skills, experience, and education automatically with Gemini 3 Pro. No more manual data entry.
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
                  Find candidates using natural language queries powered by RAG and advanced vector embeddings.
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
                  Instantly match candidates to jobs with AI-generated explanations and scoring.
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
                  Post to 20+ job boards including LinkedIn, Indeed, and Naukri with a single click.
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
                  Built-in data privacy, audit logging, and secure role-based access control.
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
                  Live dashboard with activity feeds and conversion metrics to track hiring performance.
                </p>
              </GlassCard>
            </TiltedCard>
          </div>
        </section>

        {/* Footer Snippet */}
        <footer className="mt-32 border-t border-gray-200 bg-white/50 py-12 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Workera. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
