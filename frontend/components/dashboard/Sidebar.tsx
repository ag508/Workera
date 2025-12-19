'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  FileText,
  PieChart,
  Plug,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Forms', href: '/dashboard/forms', icon: FileText },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
];

const secondaryNav = [
  { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Plug },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

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

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600")} />
                <span>{item.name}</span>
                {item.name === 'Messages' && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">3</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Post Job CTA */}
        <div className="mt-6 px-2">
          <Link
            href="/dashboard/jobs/create"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Sparkles className="h-4 w-4" />
            Post New Job
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Settings</p>
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
