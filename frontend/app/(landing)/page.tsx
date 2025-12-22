'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Lottie from 'lottie-react';
import {
  ArrowRight,
  Brain,
  Search,
  Zap,
  CheckCircle2,
  Globe,
  Shield,
  BarChart3,
  Users,
  Star,
  Sparkles,
  ChevronRight,
  FileText,
  UserCheck,
  Calendar,
  Check,
  X,
  Menu,
  ClipboardList,
  Workflow,
  Building2,
  DollarSign,
  Clock,
  Layers,
  Briefcase,
  UserPlus,
  Upload,
  Eye
} from 'lucide-react';
import AnimatedGridPattern from '@/components/reactbits/AnimatedGridPattern';

// Lottie animation data for hero
const heroAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 120, w: 500, h: 500, nm: "Hiring Flow", ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: "Outer Ring", sr: 1,
      ks: { o: { a: 0, k: 30 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [360] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [400, 400] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, d: [{ n: "d", nm: "dash", v: { a: 0, k: 10 } }, { n: "g", nm: "gap", v: { a: 0, k: 10 } }] }]
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: "Middle Ring", sr: 1,
      ks: { o: { a: 0, k: 50 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [-360] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [300, 300] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2 }]
    },
    {
      ddd: 0, ind: 3, ty: 4, nm: "Inner Ring", sr: 1,
      ks: { o: { a: 0, k: 80 }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [360] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 60, s: [105, 105, 100] }, { t: 120, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [200, 200] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 }, lc: 2 }]
    },
    {
      ddd: 0, ind: 4, ty: 4, nm: "Center Pulse", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [100] }, { t: 60, s: [60] }, { t: 120, s: [100] }] }, p: { a: 0, k: [250, 250, 0] }, s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 60, s: [90, 90, 100] }, { t: 120, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [100, 100] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } }]
    },
    {
      ddd: 0, ind: 5, ty: 4, nm: "Dot 1", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 1, k: [{ t: 0, s: [150, 150, 0] }, { t: 30, s: [350, 150, 0] }, { t: 60, s: [350, 350, 0] }, { t: 90, s: [150, 350, 0] }, { t: 120, s: [150, 150, 0] }] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 100 } }]
    },
    {
      ddd: 0, ind: 6, ty: 4, nm: "Dot 2", sr: 1,
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

// Step 1: Post Job Animation - Document with checkmark appearing
const postJobAnimation = {
  v: "5.7.4", fr: 60, ip: 0, op: 180, w: 200, h: 200, nm: "PostJob",
  layers: [
    // Document shadow
    { ddd: 0, ind: 1, ty: 4, nm: "Shadow", sr: 1,
      ks: { o: { a: 0, k: 20 }, p: { a: 0, k: [105, 108, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [100, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } }, { ty: "fl", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 } }]
    },
    // Document body
    { ddd: 0, ind: 2, ty: 4, nm: "Document", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 1, k: [{ t: 0, s: [100, 120, 0] }, { t: 30, s: [100, 100, 0] }] }, s: { a: 1, k: [{ t: 0, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [100, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }, { ty: "st", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } }]
    },
    // Line 1
    { ddd: 0, ind: 3, ty: 4, nm: "Line1", sr: 1,
      ks: { o: { a: 1, k: [{ t: 30, s: [0] }, { t: 50, s: [100] }] }, p: { a: 0, k: [100, 70, 0] } },
      shapes: [{ ty: "rc", s: { a: 1, k: [{ t: 30, s: [0, 8] }, { t: 50, s: [60, 8] }] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 40 } }]
    },
    // Line 2
    { ddd: 0, ind: 4, ty: 4, nm: "Line2", sr: 1,
      ks: { o: { a: 1, k: [{ t: 40, s: [0] }, { t: 60, s: [100] }] }, p: { a: 0, k: [100, 88, 0] } },
      shapes: [{ ty: "rc", s: { a: 1, k: [{ t: 40, s: [0, 8] }, { t: 60, s: [50, 8] }] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 30 } }]
    },
    // Line 3
    { ddd: 0, ind: 5, ty: 4, nm: "Line3", sr: 1,
      ks: { o: { a: 1, k: [{ t: 50, s: [0] }, { t: 70, s: [100] }] }, p: { a: 0, k: [100, 106, 0] } },
      shapes: [{ ty: "rc", s: { a: 1, k: [{ t: 50, s: [0, 8] }, { t: 70, s: [40, 8] }] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 25 } }]
    },
    // Checkmark circle
    { ddd: 0, ind: 6, ty: 4, nm: "CheckCircle", sr: 1,
      ks: { o: { a: 1, k: [{ t: 80, s: [0] }, { t: 100, s: [100] }] }, p: { a: 0, k: [140, 140, 0] }, s: { a: 1, k: [{ t: 80, s: [0, 0, 100] }, { t: 100, s: [100, 100, 100] }, { t: 110, s: [110, 110, 100] }, { t: 120, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [50, 50] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } }]
    },
    // Checkmark
    { ddd: 0, ind: 7, ty: 4, nm: "Check", sr: 1,
      ks: { o: { a: 1, k: [{ t: 100, s: [0] }, { t: 120, s: [100] }] }, p: { a: 0, k: [140, 140, 0] } },
      shapes: [{ ty: "sh", ks: { a: 0, k: { i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-10, 0], [-3, 8], [12, -8]], c: false } } }, { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 }, lc: 2, lj: 2 }]
    }
  ]
};

// Step 2: AI Screen Animation - Brain with scanning rays
const aiScreenAnimation = {
  v: "5.7.4", fr: 60, ip: 0, op: 180, w: 200, h: 200, nm: "AIScreen",
  layers: [
    // Outer scan ring
    { ddd: 0, ind: 1, ty: 4, nm: "ScanRing", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [0] }, { t: 30, s: [60] }, { t: 90, s: [0] }, { t: 120, s: [60] }, { t: 180, s: [0] }] }, r: { a: 1, k: [{ t: 0, s: [0] }, { t: 180, s: [360] }] }, p: { a: 0, k: [100, 100, 0] }, s: { a: 1, k: [{ t: 0, s: [80, 80, 100] }, { t: 90, s: [110, 110, 100] }, { t: 180, s: [80, 80, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [140, 140] }, p: { a: 0, k: [0, 0] } }, { ty: "st", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, d: [{ n: "d", nm: "dash", v: { a: 0, k: 15 } }, { n: "g", nm: "gap", v: { a: 0, k: 15 } }] }]
    },
    // Inner pulse ring
    { ddd: 0, ind: 2, ty: 4, nm: "PulseRing", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [80] }, { t: 45, s: [40] }, { t: 90, s: [80] }, { t: 135, s: [40] }, { t: 180, s: [80] }] }, p: { a: 0, k: [100, 100, 0] }, s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 45, s: [95, 95, 100] }, { t: 90, s: [100, 100, 100] }, { t: 135, s: [95, 95, 100] }, { t: 180, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [100, 100] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 15 } }]
    },
    // Brain center
    { ddd: 0, ind: 3, ty: 4, nm: "BrainCenter", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [100, 100, 0] }, s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 30, s: [105, 105, 100] }, { t: 60, s: [100, 100, 100] }, { t: 90, s: [105, 105, 100] }, { t: 120, s: [100, 100, 100] }, { t: 150, s: [105, 105, 100] }, { t: 180, s: [100, 100, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [70, 70] }, p: { a: 0, k: [0, 0] } }, { ty: "gf", t: 1, s: { a: 0, k: [0, -35] }, e: { a: 0, k: [0, 35] }, g: { p: 2, k: { a: 0, k: [0, 0.231, 0.51, 0.965, 1, 0.063, 0.725, 0.506] } } }]
    },
    // Neural node 1
    { ddd: 0, ind: 4, ty: 4, nm: "Node1", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [40] }, { t: 60, s: [100] }, { t: 90, s: [40] }, { t: 120, s: [100] }, { t: 150, s: [40] }, { t: 180, s: [100] }] }, p: { a: 0, k: [100, 75, 0] } },
      shapes: [{ ty: "el", s: { a: 0, k: [12, 12] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }]
    },
    // Neural node 2
    { ddd: 0, ind: 5, ty: 4, nm: "Node2", sr: 1,
      ks: { o: { a: 1, k: [{ t: 15, s: [100] }, { t: 45, s: [40] }, { t: 75, s: [100] }, { t: 105, s: [40] }, { t: 135, s: [100] }, { t: 165, s: [40] }] }, p: { a: 0, k: [78, 90, 0] } },
      shapes: [{ ty: "el", s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }]
    },
    // Neural node 3
    { ddd: 0, ind: 6, ty: 4, nm: "Node3", sr: 1,
      ks: { o: { a: 1, k: [{ t: 30, s: [100] }, { t: 60, s: [40] }, { t: 90, s: [100] }, { t: 120, s: [40] }, { t: 150, s: [100] }, { t: 180, s: [40] }] }, p: { a: 0, k: [122, 90, 0] } },
      shapes: [{ ty: "el", s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }]
    },
    // Neural node 4
    { ddd: 0, ind: 7, ty: 4, nm: "Node4", sr: 1,
      ks: { o: { a: 1, k: [{ t: 45, s: [100] }, { t: 75, s: [40] }, { t: 105, s: [100] }, { t: 135, s: [40] }, { t: 165, s: [100] }] }, p: { a: 0, k: [85, 115, 0] } },
      shapes: [{ ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }]
    },
    // Neural node 5
    { ddd: 0, ind: 8, ty: 4, nm: "Node5", sr: 1,
      ks: { o: { a: 1, k: [{ t: 60, s: [100] }, { t: 90, s: [40] }, { t: 120, s: [100] }, { t: 150, s: [40] }, { t: 180, s: [100] }] }, p: { a: 0, k: [115, 115, 0] } },
      shapes: [{ ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }]
    },
    // Scan line
    { ddd: 0, ind: 9, ty: 4, nm: "ScanLine", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [0] }, { t: 20, s: [80] }, { t: 90, s: [0] }, { t: 110, s: [80] }, { t: 180, s: [0] }] }, p: { a: 1, k: [{ t: 0, s: [100, 50, 0] }, { t: 90, s: [100, 150, 0] }, { t: 180, s: [100, 50, 0] }] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [120, 3] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } }, { ty: "gf", t: 1, s: { a: 0, k: [-60, 0] }, e: { a: 0, k: [60, 0] }, g: { p: 3, k: { a: 0, k: [0, 0.231, 0.51, 0.965, 0.5, 0.231, 0.51, 0.965, 1, 0.231, 0.51, 0.965, 0, 0, 0.5, 1, 1, 0] } } }]
    }
  ]
};

// Step 3: Interview & Hire Animation - Calendar with people connecting
const interviewHireAnimation = {
  v: "5.7.4", fr: 60, ip: 0, op: 180, w: 200, h: 200, nm: "InterviewHire",
  layers: [
    // Calendar background
    { ddd: 0, ind: 1, ty: 4, nm: "CalendarBg", sr: 1,
      ks: { o: { a: 0, k: 100 }, p: { a: 1, k: [{ t: 0, s: [100, 120, 0] }, { t: 30, s: [100, 100, 0] }] }, s: { a: 1, k: [{ t: 0, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [110, 100] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 10 } }, { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }, { ty: "st", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } }]
    },
    // Calendar header
    { ddd: 0, ind: 2, ty: 4, nm: "CalendarHeader", sr: 1,
      ks: { o: { a: 1, k: [{ t: 0, s: [0] }, { t: 30, s: [100] }] }, p: { a: 0, k: [100, 65, 0] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [110, 30] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 10 } }, { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 } }]
    },
    // Calendar rings
    { ddd: 0, ind: 3, ty: 4, nm: "Ring1", sr: 1,
      ks: { o: { a: 1, k: [{ t: 30, s: [0] }, { t: 45, s: [100] }] }, p: { a: 0, k: [70, 52, 0] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [8, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.4, 0.4, 0.4, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 4, ty: 4, nm: "Ring2", sr: 1,
      ks: { o: { a: 1, k: [{ t: 35, s: [0] }, { t: 50, s: [100] }] }, p: { a: 0, k: [100, 52, 0] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [8, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.4, 0.4, 0.4, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 5, ty: 4, nm: "Ring3", sr: 1,
      ks: { o: { a: 1, k: [{ t: 40, s: [0] }, { t: 55, s: [100] }] }, p: { a: 0, k: [130, 52, 0] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [8, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.4, 0.4, 0.4, 1] }, o: { a: 0, k: 100 } }]
    },
    // Calendar date cells
    { ddd: 0, ind: 6, ty: 4, nm: "Cell1", sr: 1,
      ks: { o: { a: 1, k: [{ t: 50, s: [0] }, { t: 65, s: [100] }] }, p: { a: 0, k: [70, 95, 0] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.95, 0.95, 0.97, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 7, ty: 4, nm: "Cell2", sr: 1,
      ks: { o: { a: 1, k: [{ t: 55, s: [0] }, { t: 70, s: [100] }] }, p: { a: 0, k: [95, 95, 0] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } }, { ty: "fl", c: { a: 0, k: [0.95, 0.95, 0.97, 1] }, o: { a: 0, k: 100 } }]
    },
    // Highlighted date (interview scheduled)
    { ddd: 0, ind: 8, ty: 4, nm: "HighlightedCell", sr: 1,
      ks: { o: { a: 1, k: [{ t: 70, s: [0] }, { t: 90, s: [100] }] }, p: { a: 0, k: [120, 95, 0] }, s: { a: 1, k: [{ t: 70, s: [0, 0, 100] }, { t: 90, s: [100, 100, 100] }, { t: 100, s: [115, 115, 100] }, { t: 110, s: [100, 100, 100] }] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [24, 24] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } }, { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 } }]
    },
    // Checkmark on highlighted cell
    { ddd: 0, ind: 9, ty: 4, nm: "CheckHire", sr: 1,
      ks: { o: { a: 1, k: [{ t: 100, s: [0] }, { t: 120, s: [100] }] }, p: { a: 0, k: [120, 95, 0] } },
      shapes: [{ ty: "sh", ks: { a: 0, k: { i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-6, 0], [-2, 5], [7, -5]], c: false } } }, { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, lj: 2 }]
    },
    // Person icon 1 (left)
    { ddd: 0, ind: 10, ty: 4, nm: "Person1Head", sr: 1,
      ks: { o: { a: 1, k: [{ t: 90, s: [0] }, { t: 110, s: [100] }] }, p: { a: 1, k: [{ t: 90, s: [40, 140, 0] }, { t: 130, s: [55, 140, 0] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [18, 18] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 11, ty: 4, nm: "Person1Body", sr: 1,
      ks: { o: { a: 1, k: [{ t: 95, s: [0] }, { t: 115, s: [100] }] }, p: { a: 1, k: [{ t: 95, s: [40, 160, 0] }, { t: 135, s: [55, 160, 0] }] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [24, 18] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } }, { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } }]
    },
    // Person icon 2 (right)
    { ddd: 0, ind: 12, ty: 4, nm: "Person2Head", sr: 1,
      ks: { o: { a: 1, k: [{ t: 100, s: [0] }, { t: 120, s: [100] }] }, p: { a: 1, k: [{ t: 100, s: [160, 140, 0] }, { t: 140, s: [145, 140, 0] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [18, 18] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 100 } }]
    },
    { ddd: 0, ind: 13, ty: 4, nm: "Person2Body", sr: 1,
      ks: { o: { a: 1, k: [{ t: 105, s: [0] }, { t: 125, s: [100] }] }, p: { a: 1, k: [{ t: 105, s: [160, 160, 0] }, { t: 145, s: [145, 160, 0] }] } },
      shapes: [{ ty: "rc", s: { a: 0, k: [24, 18] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 } }, { ty: "fl", c: { a: 0, k: [0.231, 0.51, 0.965, 1] }, o: { a: 0, k: 100 } }]
    },
    // Connection line between people
    { ddd: 0, ind: 14, ty: 4, nm: "ConnectionLine", sr: 1,
      ks: { o: { a: 1, k: [{ t: 140, s: [0] }, { t: 160, s: [100] }] }, p: { a: 0, k: [100, 150, 0] } },
      shapes: [{ ty: "rc", s: { a: 1, k: [{ t: 140, s: [0, 3] }, { t: 160, s: [50, 3] }] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } }, { ty: "gf", t: 1, s: { a: 0, k: [-25, 0] }, e: { a: 0, k: [25, 0] }, g: { p: 2, k: { a: 0, k: [0, 0.063, 0.725, 0.506, 1, 0.231, 0.51, 0.965] } } }]
    },
    // Handshake/success indicator
    { ddd: 0, ind: 15, ty: 4, nm: "SuccessGlow", sr: 1,
      ks: { o: { a: 1, k: [{ t: 160, s: [0] }, { t: 170, s: [50] }, { t: 180, s: [0] }] }, p: { a: 0, k: [100, 150, 0] }, s: { a: 1, k: [{ t: 160, s: [0, 0, 100] }, { t: 175, s: [150, 150, 100] }] } },
      shapes: [{ ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 } }]
    }
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
    { icon: Brain, title: 'AI Resume Parsing', description: 'Extract skills, experience, and qualifications automatically with 99% accuracy using advanced NLP.', color: 'bg-emerald-100 text-emerald-600' },
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="fixed inset-0 -z-10">
        <AnimatedGridPattern numSquares={40} maxOpacity={0.08} duration={4} repeatDelay={1} className="text-primary" />
        <div className="absolute inset-0 bg-gradient-radial" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'glass-nav shadow-sm' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/brand/Workera_logo_icon.png"
              alt="Workera"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Workera
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</Link>
            <Link href="#requisitions" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Requisitions</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Pricing</Link>
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
              <Link href="#requisitions" className="block text-gray-600 hover:text-primary">Requisitions</Link>
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
                  Next-Gen Recruitment Platform
                </motion.div>
                <motion.h1 variants={fadeInUp} className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                  Hire Smarter.<br /><span className="gradient-text">Hire Faster.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="mb-8 text-xl text-gray-600 lg:max-w-xl">
                  The AI-powered recruitment platform that transforms how you source, screen, and hire top talent. From resume parsing to candidate matching - all automated.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Link href="/get-started" className="group btn-primary flex items-center gap-2 text-lg">Start Free Trial<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></Link>
                  <Link href="/book-demo" className="btn-secondary flex items-center gap-2 text-lg"><Calendar className="h-5 w-5" />Schedule Demo</Link>
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
                    <Image
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                      alt="Modern recruitment team collaborating"
                      width={600}
                      height={400}
                      className="w-full h-auto rounded-2xl object-cover"
                      priority
                    />
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
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
              <div className="flex animate-marquee gap-8 items-center">
                {[
                  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
                  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
                  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
                  { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
                  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
                  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
                  { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
                  { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
                  { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
                  { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg' },
                  { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
                  { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
                  { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
                  { name: 'Cisco', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg' },
                  { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg' },
                  { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
                  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
                  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
                  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
                  { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
                  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
                  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
                  { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
                  { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
                  { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
                  { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg' },
                  { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
                  { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
                  { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
                  { name: 'Cisco', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg' },
                  { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg' },
                  { name: 'Uber', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
                ].map((company, i) => (
                  <div key={i} className="flex-shrink-0 px-8 py-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                    <div className="h-8 w-28 flex items-center justify-center transition-all duration-300" style={{ filter: 'grayscale(100%) brightness(0.5) sepia(100%) hue-rotate(100deg) saturate(400%)' }}>
                      <img src={company.logo} alt={company.name} className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
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

        {/* How It Works - Premium Lottie Animation Section */}
        <section id="how-it-works" className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Sparkles className="h-4 w-4" />
                Simple 3-Step Process
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How Workera Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in minutes. Our streamlined process takes you from posting to hiring faster than ever.</p>
            </motion.div>

            {/* Animated Steps with Lottie */}
            <div className="relative">
              {/* Connection Line - Desktop */}
              <div className="hidden lg:block absolute top-1/2 left-[20%] right-[20%] h-1 -translate-y-1/2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full origin-left"
                />
              </div>

              <div className="grid gap-12 lg:gap-8 md:grid-cols-3 relative">
                {/* Step 1: Post Job */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0 }}
                  className="relative group"
                >
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group-hover:-translate-y-2">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 left-8 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">1</div>
                    </div>

                    {/* Lottie Animation */}
                    <div className="h-48 flex items-center justify-center mb-6 mt-4">
                      <div className="w-40 h-40 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-full blur-2xl" />
                        <Lottie animationData={postJobAnimation} loop={true} className="w-full h-full relative z-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Post or Import</h3>
                      <p className="text-gray-600 leading-relaxed">Create job posts or import existing descriptions. Our AI optimizes them for better candidate matches.</p>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 space-y-2">
                      {['AI-optimized job descriptions', 'Multi-platform posting', 'Template library'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow - Mobile/Tablet */}
                  <div className="flex justify-center my-6 md:hidden">
                    <ArrowRight className="h-8 w-8 text-primary/40 rotate-90" />
                  </div>
                </motion.div>

                {/* Step 2: AI Screen */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative group"
                >
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-blue-500/20 transition-all duration-500 group-hover:-translate-y-2">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 left-8 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">2</div>
                    </div>

                    {/* Lottie Animation */}
                    <div className="h-48 flex items-center justify-center mb-6 mt-4">
                      <div className="w-40 h-40 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-2xl" />
                        <Lottie animationData={aiScreenAnimation} loop={true} className="w-full h-full relative z-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Source & Screen</h3>
                      <p className="text-gray-600 leading-relaxed">Candidates flow in from multiple channels. AI automatically parses, ranks, and surfaces top talent.</p>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 space-y-2">
                      {['AI-powered resume parsing', 'Intelligent candidate ranking', 'Automated screening'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow - Mobile/Tablet */}
                  <div className="flex justify-center my-6 md:hidden">
                    <ArrowRight className="h-8 w-8 text-blue-400/40 rotate-90" />
                  </div>
                </motion.div>

                {/* Step 3: Interview & Hire */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative group"
                >
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-purple-500/20 transition-all duration-500 group-hover:-translate-y-2">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 left-8 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">3</div>
                    </div>

                    {/* Lottie Animation */}
                    <div className="h-48 flex items-center justify-center mb-6 mt-4">
                      <div className="w-40 h-40 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full blur-2xl" />
                        <Lottie animationData={interviewHireAnimation} loop={true} className="w-full h-full relative z-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Interview & Hire</h3>
                      <p className="text-gray-600 leading-relaxed">Schedule interviews, collaborate with your team, and extend offers - all in one platform.</p>
                    </div>

                    {/* Features List */}
                    <div className="mt-6 space-y-2">
                      {['Integrated video interviews', 'Team collaboration tools', 'Seamless offer management'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-16"
            >
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                Start Hiring Today
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-4 text-sm text-gray-500">No credit card required. Free 14-day trial.</p>
            </motion.div>
          </div>
        </section>

        {/* Job Requisition Management Section */}
        <section id="requisitions" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <span className="badge badge-primary mb-4">New Feature</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Job Requisition Management</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Streamline your hiring workflow with industry-leading functionality that outperforms traditional HCM systems. From requisition creation to multi-level approvals - all automated and intelligent.</p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left: Feature Preview */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-4 text-gray-400 text-sm">Job Requisition Dashboard</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Open', value: '12', color: 'text-blue-600 bg-blue-50' },
                        { label: 'Pending', value: '4', color: 'text-amber-600 bg-amber-50' },
                        { label: 'Approved', value: '8', color: 'text-green-600 bg-green-50' },
                        { label: 'Filled', value: '23', color: 'text-purple-600 bg-purple-50' },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded-xl bg-gray-50">
                          <div className={`text-2xl font-bold ${stat.color.split(' ')[0]}`}>{stat.value}</div>
                          <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Requisition Cards */}
                    {[
                      { title: 'Senior Software Engineer', dept: 'Engineering', status: 'Pending Approval', level: '2/3', priority: 'High' },
                      { title: 'Product Manager', dept: 'Product', status: 'Approved', level: '3/3', priority: 'Normal' },
                      { title: 'DevOps Engineer', dept: 'Engineering', status: 'Posted', level: '3/3', priority: 'Critical' },
                    ].map((req, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + idx * 0.1 }} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{req.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${req.priority === 'Critical' ? 'bg-red-100 text-red-600' : req.priority === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{req.priority}</span>
                          </div>
                          <div className="text-sm text-gray-500">{req.dept}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-600' : req.status === 'Posted' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>{req.status}</span>
                          <div className="text-xs text-gray-400 mt-1">Level {req.level}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right: Features List */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6">
                <motion.h3 variants={fadeInUp} className="text-2xl font-bold text-gray-900">Everything you need for enterprise hiring</motion.h3>

                <div className="grid gap-4">
                  {[
                    { icon: ClipboardList, title: '8-Step Creation Wizard', desc: 'Guided requisition creation with validation at every step' },
                    { icon: Workflow, title: 'Dynamic Approval Workflows', desc: 'Rule-based approval chains with SLA monitoring and escalation' },
                    { icon: Building2, title: 'Multi-Tenant Support', desc: 'Full data isolation with white-label ready deployment' },
                    { icon: DollarSign, title: 'Budget Validation', desc: 'Real-time cost center checks and salary band compliance' },
                    { icon: Clock, title: 'SLA Monitoring', desc: 'Automatic escalation for overdue approvals with notifications' },
                    { icon: Layers, title: 'Audit Trail', desc: 'Immutable logging for compliance and GDPR requirements' },
                  ].map((feature, idx) => (
                    <motion.div key={idx} variants={fadeInUp} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mt-0.5">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link href="/dashboard/requisitions" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                  Explore Requisition Management
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
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
                <motion.div variants={fadeInUp} className="mt-8">
                  <Link href="/dashboard/search" className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                    Explore AI Job Search
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
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

        {/* Candidate Portal Section */}
        <section id="candidate-portal" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left: Content */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                <motion.span variants={fadeInUp} className="badge badge-primary mb-4">Candidate Portal</motion.span>
                <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 mb-6">Your Branded Career Portal</motion.h2>
                <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8">Create a seamless application experience like leading enterprise platforms. Host jobs on your branded portal where candidates can apply, track status, and engage with your company.</motion.p>

                <motion.div variants={staggerContainer} className="space-y-4">
                  {[
                    { icon: Upload, title: 'Smart Resume Import', desc: 'Import from LinkedIn, job portals, or PDF with AI-powered parsing' },
                    { icon: Brain, title: 'Intelligent Auto-Fill', desc: 'AI extracts experience, skills, and education to populate forms automatically' },
                    { icon: Eye, title: 'Application Tracking', desc: 'Candidates track their application status in real-time' },
                    { icon: Search, title: 'AI Job Matching', desc: 'Smart suggestions for positions matching candidate profiles' },
                  ].map((feature, idx) => (
                    <motion.div key={idx} variants={fadeInUp} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-8">
                  <Link href="/portal" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    Explore Candidate Portal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right: Portal Preview */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                  {/* Browser Header */}
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="ml-4 flex-1 bg-white rounded-lg px-3 py-1 text-sm text-gray-500">careers.yourcompany.com</div>
                    </div>
                  </div>
                  {/* Portal Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">TechCorp Careers</h4>
                        <p className="text-sm text-gray-500">Find your next opportunity</p>
                      </div>
                    </div>

                    {/* Job Cards */}
                    {[
                      { title: 'Senior Software Engineer', location: 'San Francisco, CA', type: 'Full-time' },
                      { title: 'Product Designer', location: 'Remote', type: 'Full-time' },
                      { title: 'Data Scientist', location: 'New York, NY', type: 'Hybrid' },
                    ].map((job, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + idx * 0.1 }} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900">{job.title}</h5>
                            <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}

                    <div className="pt-4">
                      <div className="text-center text-sm text-gray-500">Powered by <span className="font-semibold text-primary">Workera</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-white">
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
                <Link href="/book-demo" className="w-full sm:w-auto rounded-full border-2 border-white/30 bg-white/10 backdrop-blur px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/20">Schedule Demo</Link>
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
                  <Image
                    src="/images/brand/Workera_logo_icon.png"
                    alt="Workera"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                  <span className="text-2xl font-bold text-white">Workera</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-sm">The intelligent recruitment platform that helps you find, engage, and hire top talent faster.</p>
                <div className="flex gap-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center hover:from-primary/30 hover:to-emerald-600/30 transition-all">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center hover:from-primary/30 hover:to-emerald-600/30 transition-all">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center hover:from-primary/30 hover:to-emerald-600/30 transition-all">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                </div>
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
