'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  FileText,
  PieChart,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Video,
  ScrollText,
  Inbox,
  ClipboardList,
  Plus,
  CheckSquare,
  Wallet,
  Search,
  UserPlus,
  ListFilter,
  Mail,
  Bell,
  BarChart3,
  TrendingUp,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  children?: {
    name: string;
    href: string;
    icon?: any;
  }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Requisitions',
    href: '/dashboard/requisitions',
    icon: ClipboardList,
    children: [
      { name: 'All Requisitions', href: '/dashboard/requisitions', icon: ListFilter },
      { name: 'Create Requisition', href: '/dashboard/requisitions/create', icon: Plus },
      { name: 'My Approvals', href: '/dashboard/requisitions/approvals', icon: CheckSquare },
      { name: 'Budget', href: '/dashboard/requisitions/budget', icon: Wallet },
    ],
  },
  {
    name: 'Jobs',
    href: '/dashboard/jobs',
    icon: Briefcase,
    children: [
      { name: 'Active Jobs', href: '/dashboard/jobs' },
      { name: 'Create Job', href: '/dashboard/jobs/create' },
      { name: 'Application Forms', href: '/dashboard/forms' },
    ],
  },
  {
    name: 'Talent Pool',
    href: '/dashboard/candidates',
    icon: Users,
    children: [
      { name: 'All Candidates', href: '/dashboard/candidates', icon: Users },
      { name: 'Resume Bank', href: '/dashboard/resumes', icon: ScrollText },
      { name: 'Shortlists', href: '/dashboard/shortlist', icon: UserPlus },
    ],
  },
  { name: 'Interviews', href: '/dashboard/interviews', icon: Video },
  {
    name: 'Inbox',
    href: '/dashboard/inbox',
    icon: Inbox,
    badge: 5,
    children: [
      { name: 'Messages', href: '/dashboard/messages', icon: Mail },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    ],
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: PieChart,
    children: [
      { name: 'Hiring Metrics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Pipeline Reports', href: '/dashboard/analytics/pipeline', icon: TrendingUp },
    ],
  },
];

const secondaryNav = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
  const isChildActive = hasChildren && item.children?.some(child => pathname === child.href || pathname.startsWith(child.href));

  // Auto-expand if child is active
  if (isChildActive && !isExpanded) {
    setIsExpanded(true);
  }

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
          isActive || isChildActive
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        {(isActive && !hasChildren) && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <item.icon className={cn("h-5 w-5", isActive || isChildActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600")} />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </Link>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
              {item.children?.map((child) => {
                const isChildItemActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isChildItemActive
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {child.icon && <child.icon className="h-4 w-4" />}
                    {child.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-gray-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/brand/Workera_Full_Icon.png"
            alt="Workera"
            width={140}
            height={40}
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Global Search */}
      <div className="px-4 py-4">
        <Link
          href="/dashboard/search"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search candidates...</span>
          <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-400">
            ⌘K
          </kbd>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavItemComponent key={item.name} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* Create Requisition CTA */}
        <div className="mt-6 px-2">
          <Link
            href="/dashboard/requisitions/create"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Sparkles className="h-4 w-4" />
            Create Requisition
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <nav className="space-y-1">
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "text-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-gray-400")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 cursor-pointer">
          <div className="relative">
            <img
              src="https://i.pravatar.cc/100?img=32"
              alt="User"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Sarah Johnson</p>
            <p className="text-xs text-gray-500 truncate">Talent Acquisition Lead</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
