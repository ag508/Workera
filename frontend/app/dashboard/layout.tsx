'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { WelcomeTutorial } from '@/components/dashboard/WelcomeTutorial';
import { Bell, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserData {
  firstName?: string;
  lastName?: string;
  onboardingCompleted?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check for authentication token and onboarding status
    const checkAuth = async () => {
      const token = localStorage.getItem('recruiter_token');
      if (!token) {
        router.push('/login');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch onboarding status
        const response = await fetch(`${API_BASE_URL}/users/onboarding/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('recruiter_token');
            localStorage.removeItem('recruiter_user');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch status');
        }

        const status = await response.json();

        // Check if onboarding is completed
        if (!status.completed) {
          router.push('/onboarding');
          return;
        }

        setUserName(status.profile?.firstName || 'there');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback to local storage
        const userData = localStorage.getItem('recruiter_user');
        if (userData) {
          try {
            const user: UserData = JSON.parse(userData);
            setUserName(user.firstName || 'there');
            setIsAuthenticated(true);
          } catch {
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Welcome Tutorial for new users */}
      <WelcomeTutorial userName={userName} />

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
