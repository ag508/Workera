'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Bell, Calendar, CheckCircle2, UserPlus, FileText, AlertCircle, Briefcase, MessageSquare, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const iconMap: Record<string, any> = {
  application: UserPlus,
  interview: Calendar,
  system: CheckCircle2,
  resume: FileText,
  alert: AlertCircle,
  job: Briefcase,
  message: MessageSquare,
};

const colorMap: Record<string, string> = {
  application: 'bg-blue-100 text-blue-600',
  interview: 'bg-purple-100 text-purple-600',
  system: 'bg-green-100 text-green-600',
  resume: 'bg-orange-100 text-orange-600',
  alert: 'bg-red-100 text-red-600',
  job: 'bg-emerald-100 text-emerald-600',
  message: 'bg-indigo-100 text-indigo-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const tenantId = getTenantId();
  const limit = 20;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentOffset = loadMore ? offset : 0;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications?tenantId=${tenantId}&limit=${limit}&offset=${currentOffset}`
      );
      if (res.ok) {
        const data = await res.json();
        if (loadMore) {
          setNotifications(prev => [...prev, ...(data.data || [])]);
        } else {
          setNotifications(data.data || []);
        }
        setUnreadCount(data.unreadCount || 0);
        setTotal(data.total || 0);
        setOffset(currentOffset + limit);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read?tenantId=${tenantId}`,
        { method: 'PUT' }
      );
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read?tenantId=${tenantId}`,
        { method: 'PUT' }
      );
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}?tenantId=${tenantId}`,
        { method: 'DELETE' }
      );
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">
            Stay updated on your hiring pipeline.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNotifications()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">You'll be notified when there's activity in your hiring pipeline.</p>
          </GlassCard>
        ) : (
          notifications.map((notif) => {
            const IconComponent = iconMap[notif.type] || Bell;
            const colorClass = colorMap[notif.type] || 'bg-gray-100 text-gray-600';

            return (
              <GlassCard
                key={notif.id}
                className={`p-4 transition-all hover:shadow-md cursor-pointer group ${
                  !notif.isRead ? 'border-l-4 border-l-primary bg-emerald-50/30' : ''
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-sm font-semibold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notif.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notif.description}</p>
                    {notif.link && (
                      <p className="mt-2 text-xs text-primary font-medium">Click to view details</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {notifications.length < total && (
        <div className="text-center pt-8">
          <button
            onClick={() => fetchNotifications(true)}
            disabled={loadingMore}
            className="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Load More (${total - notifications.length} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
