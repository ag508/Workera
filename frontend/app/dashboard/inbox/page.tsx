'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Bell,
  Check,
  Clock,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
  Star,
  Archive,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const messages = [
  {
    id: 1,
    type: 'message',
    from: 'John Smith',
    avatar: 'https://i.pravatar.cc/100?img=12',
    subject: 'Interview feedback for Sarah Chen',
    preview: 'Hi, I wanted to share my thoughts on the interview we conducted yesterday...',
    time: '10 mins ago',
    unread: true,
    starred: false,
  },
  {
    id: 2,
    type: 'message',
    from: 'Emily Davis',
    avatar: 'https://i.pravatar.cc/100?img=23',
    subject: 'Re: Marketing Manager requisition',
    preview: 'Thanks for the update. I have reviewed the job description and...',
    time: '1 hour ago',
    unread: true,
    starred: true,
  },
  {
    id: 3,
    type: 'message',
    from: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/100?img=34',
    subject: 'Candidate referral',
    preview: 'I wanted to refer a great candidate for the Data Analyst position...',
    time: '3 hours ago',
    unread: false,
    starred: false,
  },
];

const notifications = [
  {
    id: 1,
    type: 'approval',
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
    title: 'Requisition Approved',
    message: 'REQ-2024-002 (Product Manager) has been approved by Finance',
    time: '5 mins ago',
    unread: true,
  },
  {
    id: 2,
    type: 'pending',
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-50',
    title: 'Approval Required',
    message: 'REQ-2024-001 (Senior Software Engineer) is waiting for your approval',
    time: '30 mins ago',
    unread: true,
  },
  {
    id: 3,
    type: 'interview',
    icon: Calendar,
    color: 'text-blue-600 bg-blue-50',
    title: 'Interview Scheduled',
    message: 'Interview with James Wilson for DevOps Engineer tomorrow at 2:00 PM',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 4,
    type: 'application',
    icon: User,
    color: 'text-purple-600 bg-purple-50',
    title: 'New Application',
    message: '5 new applications received for Senior Software Engineer position',
    time: '2 hours ago',
    unread: false,
  },
  {
    id: 5,
    type: 'deadline',
    icon: Clock,
    color: 'text-red-600 bg-red-50',
    title: 'SLA Warning',
    message: 'Marketing Manager approval is due in 4 hours',
    time: '3 hours ago',
    unread: false,
  },
];

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('notifications');

  const unreadMessages = messages.filter(m => m.unread).length;
  const unreadNotifications = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your messages and notifications</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
          <Check className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('notifications')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === 'notifications'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadNotifications > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {unreadNotifications}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === 'messages'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Mail className="h-4 w-4" />
          Messages
          {unreadMessages > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {unreadMessages}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {activeTab === 'notifications' && (
          <div className="divide-y divide-gray-100">
            {notifications.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                  item.unread && "bg-primary/5"
                )}
              >
                <div className={cn("flex-shrink-0 p-2 rounded-lg", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm font-medium", item.unread ? "text-gray-900" : "text-gray-700")}>
                      {item.title}
                    </p>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.message}</p>
                </div>
                {item.unread && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="divide-y divide-gray-100">
            {messages.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group",
                  item.unread && "bg-primary/5"
                )}
              >
                <img
                  src={item.avatar}
                  alt={item.from}
                  className="h-10 w-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", item.unread ? "text-gray-900" : "text-gray-700")}>
                        {item.from}
                      </p>
                      {item.starred && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                    </div>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <p className={cn("text-sm mt-0.5", item.unread ? "text-gray-900 font-medium" : "text-gray-700")}>
                    {item.subject}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 truncate">{item.preview}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                    <Archive className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
