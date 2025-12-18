'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bot, Search, Zap, CheckCircle2, Globe, Shield, BarChart3, Upload, Users, Award, Star, TrendingUp, Cpu, Layout, MessageSquare } from 'lucide-react';
import AnimatedGridPattern from '@/components/reactbits/AnimatedGridPattern';
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
               src="/images/brand/Workera_Full_Icon.png"
               alt="Workera"
               width={120}
               height={32}
               className="h-8 w-auto object-contain"
             />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hidden text-sm font-medium text-gray-600 hover:text-primary sm:block">
              Product
            </Link>
            <Link href="/dashboard" className="hidden text-sm font-medium text-gray-600 hover:text-primary sm:block">
              Solutions
            </Link>
             <Link href="/dashboard" className="hidden text-sm font-medium text-gray-600 hover:text-primary sm:block">
              Pricing
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
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

      <main className="relative pt-32">

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                 <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                New: AI-Powered Candidate Matching 2.0
              </div>
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Recruit <br />
                <GradientText colors={["#25b876", "#10b981", "#059669", "#25b876"]}>
                  Intelligently.
                </GradientText>
              </h1>
              <BlurText
                text="The complete hiring operating system for modern teams. Automate sourcing, screening, and scheduling with enterprise-grade AI that understands human potential."
                className="mb-8 text-xl text-gray-600 lg:max-w-xl"
                delay={0.05}
              />
              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/dashboard"
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-emerald-600 sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/demo"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-primary/50 hover:bg-gray-50 hover:text-primary sm:w-auto"
                >
                  View Interactive Demo
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500 lg:justify-start">
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="h-full w-full rounded-full object-cover" />
                     </div>
                   ))}
                </div>
                <div className="font-medium">Trusted by 2,000+ recruiters</div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
               <div className="relative rounded-2xl border border-gray-200 bg-white/80 p-2 shadow-2xl backdrop-blur-sm lg:-mr-16">
                  <Image
                    src="/images/brand/Workera_logo_icon.png"
                    alt="Dashboard Preview"
                    width={800}
                    height={600}
                    className="w-full rounded-xl object-cover shadow-inner bg-gray-50 aspect-[4/3]"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=2000)', backgroundSize: 'cover' }}
                  />

                  {/* Floating Cards */}
                  <div className="absolute -bottom-8 -left-8 animate-bounce-slow">
                     <GlassCard className="flex items-center gap-4 p-4 shadow-xl">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                           <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-gray-900">Top Candidate Found</div>
                           <div className="text-xs text-gray-500">98% Match Score</div>
                        </div>
                     </GlassCard>
                  </div>
                   <div className="absolute -right-4 top-20 animate-pulse-slow">
                     <GlassCard className="flex items-center gap-3 p-3 shadow-lg">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-gray-700">Live Interview</span>
                     </GlassCard>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="border-y border-gray-100 bg-gray-50 py-12">
           <div className="mx-auto max-w-7xl px-6 text-center">
              <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-gray-500">Powering the world's best hiring teams</p>
              <div className="grid grid-cols-2 gap-8 opacity-60 md:grid-cols-5">
                 {['Acme Corp', 'GlobalBank', 'TechStart', 'FutureFlow', 'Innovate'].map((name) => (
                    <div key={name} className="flex items-center justify-center text-xl font-bold text-gray-400">
                       {name}
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Feature Deep Dive 1: AI */}
        <section className="mx-auto max-w-7xl px-6 py-32">
           <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                 <div className="grid gap-6 sm:grid-cols-2">
                    <TiltedCard className="col-span-2">
                       <GlassCard className="p-6">
                          <Bot className="mb-4 h-8 w-8 text-primary" />
                          <h3 className="mb-2 text-lg font-semibold text-gray-900">Semantic Analysis</h3>
                          <p className="text-sm text-gray-600">Our engine understands the nuance of "Java" vs "JavaScript" and "PM" vs "Project Manager".</p>
                       </GlassCard>
                    </TiltedCard>
                     <GlassCard className="p-6">
                        <BarChart3 className="mb-4 h-8 w-8 text-blue-500" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Bias Elimination</h3>
                        <p className="text-sm text-gray-600">Blind screening capabilities.</p>
                     </GlassCard>
                     <GlassCard className="p-6">
                        <Zap className="mb-4 h-8 w-8 text-amber-500" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Instant Ranking</h3>
                        <p className="text-sm text-gray-600">Sort 1000s of resumes in seconds.</p>
                     </GlassCard>
                 </div>
              </div>
              <div className="order-1 lg:order-2">
                 <h2 className="mb-4 text-3xl font-bold text-gray-900">AI that actually understands talent.</h2>
                 <p className="mb-8 text-lg text-gray-600">Stop keyword matching. Start matching potential. Workera's deep learning models analyze career trajectories, skills adjacency, and cultural fit markers to surface candidates who are truly the best fit.</p>
                 <ul className="space-y-4">
                    {['Parses 50+ resume formats', 'Detects soft skills from context', 'Predicts candidate retention'].map((item) => (
                       <li key={item} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </section>

         {/* Feature Deep Dive 2: Workflow */}
        <section className="bg-gray-900 py-32 text-white">
           <div className="mx-auto max-w-7xl px-6">
              <div className="mb-20 text-center">
                 <h2 className="text-3xl font-bold">A Unified Workspace for Recruiters</h2>
                 <p className="mt-4 text-gray-400">Everything you need, from first touch to signed offer.</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                 <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
                    <Layout className="mb-6 h-10 w-10 text-primary" />
                    <h3 className="mb-4 text-xl font-bold">Kanban Pipeline</h3>
                    <p className="text-gray-400">Drag-and-drop candidates through custom hiring stages. Visualize your entire funnel at a glance.</p>
                 </div>
                 <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
                    <MessageSquare className="mb-6 h-10 w-10 text-blue-400" />
                    <h3 className="mb-4 text-xl font-bold">Integrated Messaging</h3>
                    <p className="text-gray-400">Email and SMS automation built-in. Keep candidates warm without leaving the platform.</p>
                 </div>
                 <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
                    <TrendingUp className="mb-6 h-10 w-10 text-purple-400" />
                    <h3 className="mb-4 text-xl font-bold">Predictive Hiring</h3>
                    <p className="text-gray-400">Forecast hiring needs based on attrition data and business growth metrics.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Benefits Grid (The "Everything" Section) */}
        <section className="mx-auto mt-24 max-w-7xl px-6 pb-24">
          <div className="mb-12 text-center">
             <h2 className="text-3xl font-bold text-gray-900">Why Market Leaders Choose Workera</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-primary">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Automated Screening</h3>
                <p className="text-gray-600">
                  Let AI handle the initial phone screen. Our voice bots can conduct preliminary interviews 24/7.
                </p>
              </GlassCard>
            </TiltedCard>

            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Deep Search</h3>
                <p className="text-gray-600">
                  Search across your internal database and external job boards simultaneously with unified queries.
                </p>
              </GlassCard>
            </TiltedCard>

            <TiltedCard className="h-full">
              <GlassCard hoverEffect className="h-full border border-white/50 bg-white/60">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Global Compliance</h3>
                <p className="text-gray-600">
                  Hire anywhere. We handle the complexity of local labor laws and data privacy regulations.
                </p>
              </GlassCard>
            </TiltedCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-primary py-24">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <div className="relative mx-auto max-w-4xl px-6 text-center text-white">
              <h2 className="mb-6 text-4xl font-bold">Ready to transform your hiring?</h2>
              <p className="mb-10 text-xl text-emerald-50">Join 10,000+ recruiters who are hiring better candidates, faster, with Workera.</p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                 <Link href="/dashboard" className="w-full rounded-full bg-white px-8 py-4 text-lg font-bold text-primary transition-transform hover:scale-105 sm:w-auto">
                    Get Started for Free
                 </Link>
                 <Link href="/demo" className="w-full rounded-full border border-emerald-200 bg-transparent px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-emerald-800/30 sm:w-auto">
                    Contact Sales
                 </Link>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 pt-16 pb-12">
          <div className="mx-auto max-w-7xl px-6">
             <div className="grid gap-12 md:grid-cols-4">
                <div className="col-span-1 md:col-span-1">
                   <div className="mb-4 flex items-center gap-2">
                     <Image
                        src="/images/brand/Workera_Full_Icon.png"
                        alt="Workera"
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain grayscale opacity-80"
                     />
                   </div>
                   <p className="text-sm text-gray-500">The intelligent hiring platform for modern teams.</p>
                </div>

                <div>
                   <h4 className="mb-4 font-bold text-gray-900">Product</h4>
                   <ul className="space-y-2 text-sm text-gray-600">
                      <li><a href="#" className="hover:text-primary">Features</a></li>
                      <li><a href="#" className="hover:text-primary">Pricing</a></li>
                      <li><a href="#" className="hover:text-primary">Integrations</a></li>
                      <li><a href="#" className="hover:text-primary">Enterprise</a></li>
                   </ul>
                </div>

                <div>
                   <h4 className="mb-4 font-bold text-gray-900">Resources</h4>
                   <ul className="space-y-2 text-sm text-gray-600">
                      <li><a href="#" className="hover:text-primary">Blog</a></li>
                      <li><a href="#" className="hover:text-primary">Case Studies</a></li>
                      <li><a href="#" className="hover:text-primary">Help Center</a></li>
                      <li><a href="#" className="hover:text-primary">API Docs</a></li>
                   </ul>
                </div>

                <div>
                   <h4 className="mb-4 font-bold text-gray-900">Company</h4>
                   <ul className="space-y-2 text-sm text-gray-600">
                      <li><a href="#" className="hover:text-primary">About Us</a></li>
                      <li><a href="#" className="hover:text-primary">Careers</a></li>
                      <li><a href="#" className="hover:text-primary">Legal</a></li>
                      <li><a href="#" className="hover:text-primary">Contact</a></li>
                   </ul>
                </div>
             </div>

             <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
                <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Workera Inc. All rights reserved.</p>
                <div className="flex gap-6">
                   <Globe className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                   <Shield className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </div>
             </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
