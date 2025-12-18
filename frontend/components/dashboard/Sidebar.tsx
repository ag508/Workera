'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  PlusCircle,
  LogOut,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-[275px] flex-col justify-between border-r border-gray-100 bg-white px-6 py-6">
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded bg-primary" />
          <span className="text-xl font-bold tracking-tight text-gray-900">Workera</span>
        </Link>

        {/* Nav Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-4 rounded-full px-4 py-3 text-lg transition-colors",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive ? "stroke-[2.5px]" : "stroke-2"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <button className="mt-6 w-full rounded-full bg-primary py-3.5 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-600">
          Post Job
        </button>
      </div>

      {/* User Profile */}
      <div className="flex cursor-pointer items-center gap-3 rounded-full p-3 hover:bg-gray-100">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">Recruiter</span>
          <span className="text-xs text-gray-500">@workera_hr</span>
        </div>
        <LogOut className="ml-auto h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}
