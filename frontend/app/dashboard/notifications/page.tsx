'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Bell, Calendar, CheckCircle2, UserPlus, FileText, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'application',
      title: 'New Application Received',
      desc: 'John Doe applied for Senior Frontend Developer position.',
      time: '2 hours ago',
      read: false,
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'interview',
      title: 'Interview Reminder',
      desc: 'Interview with Sarah Smith starts in 30 minutes.',
      time: '30 mins ago',
      read: false,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      desc: 'Your plan was successfully renewed.',
      time: '1 day ago',
      read: true,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 4,
      type: 'resume',
      title: 'Resume Analysis Complete',
      desc: 'AI has finished parsing 15 new resumes.',
      time: 'Yesterday',
      read: true,
      icon: FileText,
      color: 'bg-orange-100 text-orange-600'
    },
     {
      id: 5,
      type: 'alert',
      title: 'Action Required',
      desc: 'Please verify your email address to enable SMS notifications.',
      time: '2 days ago',
      read: true,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
           <p className="text-gray-500">Stay updated on your hiring pipeline.</p>
        </div>
        <button className="text-sm text-primary hover:underline font-medium">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <GlassCard key={notif.id} className={`p-4 transition-all hover:shadow-md ${!notif.read ? 'border-l-4 border-l-primary bg-emerald-50/30' : ''}`}>
             <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${notif.color}`}>
                   <notif.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <h3 className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notif.time}</span>
                   </div>
                   <p className="mt-1 text-sm text-gray-600">{notif.desc}</p>
                </div>
             </div>
          </GlassCard>
        ))}
      </div>

      <div className="text-center pt-8">
         <button className="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Load More
         </button>
      </div>
    </div>
  );
}
