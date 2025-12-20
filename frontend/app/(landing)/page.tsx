'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Lottie from 'lottie-react';
import {
  ArrowRight,
  Search,
  Zap,
  CheckCircle2,
  Globe,
  Shield,
  BarChart3,
  Users,
  Star,
  Sparkles,
  Play,
  ChevronRight,
  FileText,
  UserCheck,
  Calendar,
  Check,
  X,
  Menu
} from 'lucide-react';
import AnimatedGridPattern from '@/components/reactbits/AnimatedGridPattern';

// Lottie animation data for hero
const heroAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 120, w: 500, h: 500, nm: "Hiring Flow", ddd: 0, assets: [],
  layers: [
    { ddd: 0, ind: 1, ty: 4, nm: "Outer Ring", sr: 1,
      ks: { o: { a: 0, k: 30 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [360] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [400, 400] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, d: [{ n: "d", nm: "dash", v: { a: 0, k: 10 } }, { n: "g", nm: "gap", v: { a: 0, k: 10 } }] }]
    },
    { ddd: 0, ind: 2, ty: 4, nm: "Middle Ring", sr: 1,
      ks: { o: { a: 0, k: 50 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [-360] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [300, 300] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2 }]
    },
    { ddd: 0, ind: 3, ty: 4, nm: "Inner Ring", sr: 1,
      ks: { o: { a: 0, k: 80 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [360] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 60, s: [105, 105, 100] }, { t: 120, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [200, 200] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 }, lc: 2 }]
    },
    { ddd: 0, ind: 4, ty: 4, nm: "Center Pulse", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [100] }, { t: 60, s: [60] }, { t: 120, s: [100] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 60, s: [90, 90, 100] }, { t: 120, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [100, 100] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 5, ty: 4, nm: "Dot 1", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 1, k: [{ t: 0, s: [150, 150, 0] }, { t: 30, s: [350, 150, 0] }, { t: 60, s: [350, 350, 0] }, { t: 90, s: [150, 350, 0] }, { t: 120, s: [150, 150, 0] }] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 6, ty: 4, nm: "Dot 2", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 1, k: [{ t: 0, s: [350, 350, 0] }, { t: 30, s: [150, 350, 0] }, { t: 60, s: [150, 150, 0] }, { t: 90, s: [350, 150, 0] }, { t: 120, s: [350, 350, 0] }] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [16, 16] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 } }]
    }
  ]
};

// Workflow animation
const workflowAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 400, h: 100, nm: "Workflow",
  layers: [
    { ddd: 0, ind: 1, ty: 4, nm: "Step1", sr: 1, ks: { o: { a: 1, k: [{ t: 0, s: [0] }, { t: 15, s: [100] }] }, p: { a: 0, k: [50, 50, 0] }, s: { a: 1, k: [{ t: 0, s: [0, 0, 100] }, { t: 15, s: [100, 100, 100] }] } }, shapes: [{ ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } }] },
    { ddd: 0, ind: 2, ty: 4, nm: "Line1", sr: 1, ks: { o: { a: 1, k: [{ t: 15, s: [0] }, { t: 30, s: [100] }] }, p: { a: 0, k: [125, 50, 0] } }, shapes: [{ ty: "rc", s: { a: 1, k: [{ t: 15, s: [0, 4] }, { t: 30, s: [90, 4] }] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 50 } }] },
    { ddd: 0, ind: 3, ty: 4, nm: "Step2", sr: 1, ks: { o: { a: 1, k: [{ t: 30, s: [0] }, { t: 45, s: [100] }] }, p: { a: 0, k: [200, 50, 0] }, s: { a: 1, k: [{ t: 30, s: [0, 0, 100] }, { t: 45, s: [100, 100, 100] }] } }, shapes: [{ ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 100 } }] },
    { ddd: 0, ind: 4, ty: 4, nm: "Line2", sr: 1, ks: { o: { a: 1, k: [{ t: 45, s: [0] }, { t: 60, s: [100] }] }, p: { a: 0, k: [275, 50, 0] } }, shapes: [{ ty: "rc", s: { a: 1, k: [{ t: 45, s: [0, 4] }, { t: 60, s: [90, 4] }] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 50 } }] },
    { ddd: 0, ind: 5, ty: 4, nm: "Step3", sr: 1, ks: { o: { a: 1, k: [{ t: 60, s: [0] }, { t: 75, s: [100] }] }, p: { a: 0, k: [350, 50, 0] }, s: { a: 1, k: [{ t: 60, s: [0, 0, 100] }, { t: 75, s: [100, 100, 100] }] } }, shapes: [{ ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 } }] }
  ]
};

// Animation variants
const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) { setCount(value); clearInterval(timer); }
        else { setCount(Math.floor(start)); }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function FeatureCard({ icon: Icon, title, description, color, delay = 0 }: { icon: React.ElementType; title: string; description: string; color: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, role, company, image, delay = 0 }: { quote: string; author: string; role: string; company: string; image: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      <div className="absolute -top-3 left-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"><Star className="h-4 w-4 fill-current" /></div>
      </div>
      <div className="mb-6 flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}</div>
      <p className="mb-6 text-lg text-gray-700 leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-4">
        <img src={image} alt={author} className="h-12 w-12 rounded-full object-cover" />
        <div><div className="font-semibold text-gray-900">{author}</div><div className="text-sm text-gray-500">{role} at {company}</div></div>
      </div>
    </motion.div>
  );
}

function PricingCard({ name, price, description, features, popular = false, delay = 0 }: { name: string; price: string; description: string; features: string[]; popular?: boolean; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
      className={`relative rounded-2xl p-8 ${popular ? 'bg-gray-900 text-white shadow-2xl scale-105 z-10' : 'bg-white border border-gray-200'}`}>
      {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">Most Popular</span></div>}
      <div className="mb-6"><h3 className={`text-xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>{name}</h3><p className={`mt-2 text-sm ${popular ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p></div>
      <div className="mb-6"><span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>{price}</span>{price !== 'Custom' && <span className={popular ? 'text-gray-300' : 'text-gray-500'}>/month</span>}</div>
      <ul className="mb-8 space-y-3">{features.map((feature, i) => <li key={i} className="flex items-center gap-3"><Check className={`h-5 w-5 ${popular ? 'text-primary' : 'text-primary'}`} /><span className={popular ? 'text-gray-200' : 'text-gray-600'}>{feature}</span></li>)}</ul>
      <Link href="/get-started" className={`block w-full rounded-full py-3 text-center font-semibold transition-all ${popular ? 'bg-primary text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>Get Started</Link>
    </motion.div>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Bot, title: 'AI Resume Parsing', description: 'Extract skills, experience, and qualifications automatically with 99% accuracy using advanced NLP.', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Search, title: 'Semantic Search', description: 'Find candidates using natural language. Search "React developer with fintech experience" and get precise results.', color: 'bg-blue-100 text-blue-600' },
    { icon: Zap, title: 'Smart Matching', description: 'AI-powered candidate ranking with explainable scores showing why each candidate is a good fit.', color: 'bg-purple-100 text-purple-600' },
    { icon: Globe, title: 'Multi-Channel Posting', description: 'Post to 20+ job boards including LinkedIn, Indeed, and Naukri with one click.', color: 'bg-amber-100 text-amber-600' },
    { icon: Shield, title: 'GDPR Compliant', description: 'Enterprise-grade security with role-based access, audit logs, and data privacy built-in.', color: 'bg-rose-100 text-rose-600' },
    { icon: BarChart3, title: 'Real-time Analytics', description: 'Track time-to-hire, source effectiveness, and pipeline health with live dashboards.', color: 'bg-cyan-100 text-cyan-600' },
  ];

  const stats = [
    { value: 10000, suffix: '+', label: 'Companies Trust Us' },
    { value: 2, suffix: 'M+', label: 'Candidates Processed' },
    { value: 50, suffix: '%', label: 'Faster Hiring' },
    { value: 99, suffix: '%', label: 'Customer Satisfaction' },
  ];

  const howItWorks = [
    { step: '01', title: 'Post or Import', description: 'Create job posts or import existing descriptions. Our AI optimizes them for better candidate matches.', icon: FileText },
    { step: '02', title: 'Source & Screen', description: 'Candidates flow in from multiple channels. AI automatically parses, ranks, and surfaces top talent.', icon: UserCheck },
    { step: '03', title: 'Interview & Hire', description: 'Schedule interviews, collaborate with your team, and extend offers - all in one platform.', icon: Calendar },
  ];

  const testimonials = [
    { quote: 'Workera cut our time-to-hire by 60%. The AI matching is incredibly accurate.', author: 'Sarah Chen', role: 'VP of People', company: 'TechCorp', image: 'https://i.pravatar.cc/150?img=1' },
    { quote: 'Finally, an ATS that actually helps us find better candidates, not just manage applications.', author: 'Michael Roberts', role: 'Head of Talent', company: 'ScaleUp', image: 'https://i.pravatar.cc/150?img=3' },
    { quote: 'The semantic search alone has transformed how we recruit. No more keyword matching nightmares.', author: 'Emma Watson', role: 'Recruiting Lead', company: 'InnovateCo', image: 'https://i.pravatar.cc/150?img=5' },
  ];

  const logos = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Airbnb'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="fixed inset-0 -z-10">
        <AnimatedGridPattern numSquares={40} maxOpacity={0.08} duration={4} repeatDelay={1} className="text-primary" />
        <div className="absolute inset-0 bg-gradient-radial" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'glass-nav shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Workera
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Testimonials</Link>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/portal/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Sign In</Link>
            <Link href="/get-started" className="btn-primary text-sm">Start Free Trial</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-4">
              <Link href="#features" className="block text-gray-600 hover:text-primary">Features</Link>
              <Link href="#how-it-works" className="block text-gray-600 hover:text-primary">How it Works</Link>
              <Link href="#pricing" className="block text-gray-600 hover:text-primary">Pricing</Link>
              <Link href="/portal/login" className="block text-gray-600 hover:text-primary">Sign In</Link>
              <Link href="/get-started" className="btn-primary block text-center">Start Free Trial</Link>
            </div>
          </motion.div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
          <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center lg:text-left">
                <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
                  Powered by Advanced AI
                </motion.div>
                <motion.h1 variants={fadeInUp} className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                  Hire Smarter.<br /><span className="gradient-text">Hire Faster.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="mb-8 text-xl text-gray-600 lg:max-w-xl">
                  The AI-powered recruitment platform that transforms how you source, screen, and hire top talent. From resume parsing to candidate matching - all automated.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Link href="/get-started" className="group btn-primary flex items-center gap-2 text-lg">Start Free Trial<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></Link>
                  <Link href="/demo" className="btn-secondary flex items-center gap-2 text-lg"><Play className="h-5 w-5" />Watch Demo</Link>
                </motion.div>
                <motion.div variants={fadeInUp} className="mt-10 flex items-center justify-center gap-6 lg:justify-start">
                  <div className="flex -space-x-3">{[11, 12, 13, 14, 15].map((i) => <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} alt="User" className="h-10 w-10 rounded-full border-2 border-white object-cover" />)}</div>
                  <div className="text-left">
                    <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <div className="text-sm text-gray-600">Trusted by 10,000+ recruiters</div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
                <div className="relative">
                  <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-blob" />
                  <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl animate-blob animation-delay-2000" />
                  <div className="relative z-10 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/60 p-8 shadow-2xl">
                    <Lottie animationData={heroAnimation} loop className="w-full h-auto" />
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -left-8 top-20 glass-card rounded-xl p-4 shadow-xl">
                      <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><div className="text-sm font-semibold text-gray-900">Match Found!</div><div className="text-xs text-gray-500">98% compatibility</div></div></div>
                    </motion.div>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-6 bottom-24 glass-card rounded-xl p-4 shadow-xl">
                      <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Users className="h-5 w-5 text-blue-600" /></div><div><div className="text-sm font-semibold text-gray-900">47 Candidates</div><div className="text-xs text-gray-500">AI ranked today</div></div></div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-gray-400"><span className="text-sm">Scroll to explore</span><ChevronRight className="h-5 w-5 rotate-90" /></div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => <motion.div key={i} variants={fadeInUp} className="text-center"><div className="text-5xl font-bold text-gray-900 mb-2"><AnimatedNumber value={stat.value} suffix={stat.suffix} /></div><div className="text-gray-600">{stat.label}</div></motion.div>)}
            </motion.div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="py-16 border-y border-gray-100 bg-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-10">Trusted by industry leaders</p>
            <div className="relative">
              <div className="flex animate-marquee gap-12 items-center">
                {[...logos, ...logos].map((name, i) => (
                  <div key={i} className="flex-shrink-0 px-6 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent hover:from-primary hover:to-emerald-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <span className="badge badge-primary mb-4">Features</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Hire Better</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">From AI-powered resume parsing to intelligent candidate matching, Workera gives you the tools to build world-class teams.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{features.map((feature, i) => <FeatureCard key={i} {...feature} delay={i * 0.1} />)}</div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <span className="badge badge-primary mb-4">Process</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How Workera Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in minutes. Our streamlined process takes you from posting to hiring faster than ever.</p>
            </motion.div>
            <div className="mb-16"><Lottie animationData={workflowAnimation} loop className="max-w-md mx-auto" /></div>
            <div className="grid gap-8 md:grid-cols-3">
              {howItWorks.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.2 }} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/30"><item.icon className="h-10 w-10" /></div>
                  <div className="text-sm font-bold text-primary mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  {i < howItWorks.length - 1 && <div className="hidden md:block absolute top-10 left-full w-full -translate-x-1/2"><ArrowRight className="mx-auto h-6 w-6 text-gray-300" /></div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Feature Highlight */}
        <section className="py-24 bg-gray-900 text-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-emerald-400 mb-6"><Sparkles className="h-4 w-4" />AI-Powered</motion.span>
                <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-6">Intelligence That Understands Talent</motion.h2>
                <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-8">Our AI doesn't just match keywords - it understands context, career trajectories, and cultural fit to surface candidates who truly excel.</motion.p>
                <motion.ul variants={staggerContainer} className="space-y-4">
                  {['Parses 50+ resume formats with 99% accuracy', 'Understands skill adjacency and transferable skills', 'Predicts candidate success and retention', 'Explains every match score transparently'].map((item, i) => (
                    <motion.li key={i} variants={fadeInUp} className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-emerald-400" /><span className="text-gray-200">{item}</span></motion.li>
                  ))}
                </motion.ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
                <div className="relative rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div><div className="text-sm text-gray-400">AI Analysis</div><div className="font-semibold">Finding best matches...</div></div>
                    </div>
                    {['Senior React Developer - 95% Match', 'Full Stack Engineer - 89% Match', 'Frontend Lead - 87% Match'].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.2 }} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <span>{item.split(' - ')[0]}</span><span className="text-emerald-400 font-semibold">{item.split(' - ')[1]}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <span className="badge badge-primary mb-4">Testimonials</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Recruiters Worldwide</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">See why thousands of teams trust Workera to find their best candidates.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">{testimonials.map((testimonial, i) => <TestimonialCard key={i} {...testimonial} delay={i * 0.1} />)}</div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <span className="badge badge-primary mb-4">Pricing</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your team. All plans include a 14-day free trial.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3 items-center">
              <PricingCard name="Starter" price="$49" description="Perfect for small teams" features={['Up to 5 job postings', '100 candidates/month', 'AI resume parsing', 'Email support']} delay={0} />
              <PricingCard name="Professional" price="$149" description="For growing companies" features={['Unlimited job postings', '1,000 candidates/month', 'Advanced AI matching', 'Priority support', 'Custom workflows']} popular delay={0.1} />
              <PricingCard name="Enterprise" price="Custom" description="For large organizations" features={['Everything in Pro', 'Unlimited candidates', 'SSO & SCIM', 'Dedicated success manager', 'Custom integrations']} delay={0.2} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative mx-auto max-w-4xl px-6 text-center text-white">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-6 sm:text-5xl">Ready to Transform Your Hiring?</motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-emerald-100 mb-10">Join 10,000+ recruiters who hire better candidates, faster with Workera.</motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/get-started" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-lg font-bold text-primary shadow-xl transition-all hover:scale-105 hover:shadow-2xl">Start Free Trial</Link>
                <Link href="/demo" className="w-full sm:w-auto rounded-full border-2 border-white/30 bg-white/10 backdrop-blur px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/20">Schedule Demo</Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-16">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">W</span>
                  </div>
                  <span className="text-2xl font-bold text-white">Workera</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-sm">The intelligent recruitment platform that helps you find, engage, and hire top talent faster.</p>
                <div className="flex gap-4">{['LinkedIn', 'Twitter', 'GitHub'].map((social) => <a key={social} href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><Globe className="h-5 w-5" /></a>)}</div>
              </div>
              <div><h4 className="font-semibold text-white mb-4">Product</h4><ul className="space-y-3">{['Features', 'Pricing', 'Integrations', 'API', 'Security'].map((item) => <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>)}</ul></div>
              <div><h4 className="font-semibold text-white mb-4">Resources</h4><ul className="space-y-3">{['Blog', 'Case Studies', 'Webinars', 'Help Center', 'Documentation'].map((item) => <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>)}</ul></div>
              <div><h4 className="font-semibold text-white mb-4">Company</h4><ul className="space-y-3">{['About', 'Careers', 'Press', 'Contact', 'Partners'].map((item) => <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>)}</ul></div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Workera Inc. All rights reserved.</p>
              <div className="flex gap-6 text-sm">
                <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="text-gray-500 hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
