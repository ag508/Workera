'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase,
  UserPlus,
  FileText,
  CheckCircle2,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

// Mock data if backend is empty
const DEMO_ACTIVITIES = [
  {
    id: '1',
    type: 'candidate_applied',
    user: 'Sarah Wilson',
    action: 'applied for',
    target: 'Senior React Developer',
    time: '2h ago',
    avatar: 'SW',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: '2',
    type: 'job_posted',
    user: 'Recruiting Team',
    action: 'posted new job',
    target: 'Product Manager',
    time: '5h ago',
    avatar: 'RT',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: '3',
    type: 'interview_scheduled',
    user: 'Mike Chen',
    action: 'scheduled interview with',
    target: 'David Kim',
    time: '1d ago',
    avatar: 'MC',
    color: 'bg-purple-100 text-purple-700'
  }
];

export default function DashboardPage() {
  const [activities, setActivities] = useState(DEMO_ACTIVITIES);
  const [loading, setLoading] = useState(false);

  // In production, fetch from /activity-feed
  /*
  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity-feed?tenantId=demo`);
        const data = await res.json();
        if (data && data.length > 0) setActivities(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchActivities();
  }, []);
  */

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {activities.map((item) => (
          <GlassCard key={item.id} className="border-b border-gray-100 p-4 transition-colors hover:bg-gray-50/50">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${item.color}`}>
                {item.avatar}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900">{item.user}</span>
                    <span className="text-gray-500">@user_{item.id}</span>
                    <span className="mx-1 text-gray-400">·</span>
                    <span className="text-gray-500 hover:underline">{item.time}</span>
                  </div>
                  <button className="rounded-full p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-1 text-gray-800">
                  {item.action} <span className="font-semibold text-primary">{item.target}</span>
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between text-gray-500">
                  <button className="group flex items-center gap-2 text-sm hover:text-blue-500">
                    <div className="rounded-full p-2 group-hover:bg-blue-50">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span>Details</span>
                  </button>
                  <button className="group flex items-center gap-2 text-sm hover:text-green-500">
                     <div className="rounded-full p-2 group-hover:bg-green-50">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span>Approve</span>
                  </button>
                  <button className="group flex items-center gap-2 text-sm hover:text-red-500">
                     <div className="rounded-full p-2 group-hover:bg-red-50">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span>Snooze</span>
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
