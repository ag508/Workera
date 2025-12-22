'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[280px] xl:mr-[360px]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">Recruitment Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Link
                href="/dashboard/notifications"
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}
