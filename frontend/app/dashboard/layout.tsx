'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { Bell, Search, ChevronDown } from 'lucide-react';
import Image from 'next/image';

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
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>

              {/* User Menu */}
              <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors">
                <img
                  src="https://i.pravatar.cc/100?img=32"
                  alt="User"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
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
