'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Trash2,
  Reply,
  Forward,
  Send,
  X,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Paperclip,
  Settings,
  MoreVertical,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Message {
  id: number;
  type: 'message';
  from: string;
  email: string;
  avatar: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  timestamp: Date;
  unread: boolean;
  starred: boolean;
  candidateId?: string;
  jobTitle?: string;
  replies?: Reply[];
}

interface Reply {
  id: number;
  from: string;
  content: string;
  time: string;
}

interface Notification {
  id: number;
  type: string;
  icon: React.ElementType;
  color: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'message',
    from: 'John Smith',
    email: 'john.smith@email.com',
    avatar: 'https://i.pravatar.cc/100?img=12',
    subject: 'Interview feedback for Sarah Chen',
    preview: 'Hi, I wanted to share my thoughts on the interview we conducted yesterday...',
    content: `Hi Team,

I wanted to share my thoughts on the interview we conducted yesterday with Sarah Chen for the Senior Software Engineer position.

Overall, I was very impressed with her technical skills and problem-solving abilities. She demonstrated strong knowledge of system design and was able to articulate her thought process clearly.

Key Strengths:
- Excellent communication skills
- Deep understanding of distributed systems
- Strong coding abilities in TypeScript and Python

Areas to explore further:
- Experience with our specific tech stack
- Team leadership experience

I would recommend moving her to the next round.

Best,
John Smith`,
    time: '10 mins ago',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    unread: true,
    starred: false,
    candidateId: 'sarah-chen',
    jobTitle: 'Senior Software Engineer',
    replies: [],
  },
  {
    id: 2,
    type: 'message',
    from: 'Emily Davis',
    email: 'emily.davis@company.com',
    avatar: 'https://i.pravatar.cc/100?img=23',
    subject: 'Re: Marketing Manager requisition',
    preview: 'Thanks for the update. I have reviewed the job description and...',
    content: `Hi,

Thanks for the update. I have reviewed the job description and it looks great. I have a few suggestions:

1. We should emphasize the digital marketing experience requirement
2. Consider adding a salary range to attract better candidates
3. The benefits section could include our remote work policy

Let me know if you'd like to discuss these changes.

Best,
Emily`,
    time: '1 hour ago',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    unread: true,
    starred: true,
    replies: [
      {
        id: 1,
        from: 'You',
        content: 'Great suggestions Emily! I will incorporate these changes.',
        time: '45 mins ago',
      },
    ],
  },
  {
    id: 3,
    type: 'message',
    from: 'Mike Chen (Candidate)',
    email: 'mike.chen@gmail.com',
    avatar: 'https://i.pravatar.cc/100?img=34',
    subject: 'Question about Data Analyst position',
    preview: 'Hello, I recently applied for the Data Analyst position and wanted to ask...',
    content: `Hello,

I recently applied for the Data Analyst position at your company and wanted to follow up with a few questions:

1. What is the expected timeline for the interview process?
2. Is remote work available for this position?
3. Could you share more details about the team I would be working with?

Thank you for your time. I'm very excited about this opportunity!

Best regards,
Mike Chen`,
    time: '3 hours ago',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    unread: false,
    starred: false,
    candidateId: 'mike-chen',
    jobTitle: 'Data Analyst',
    replies: [],
  },
  {
    id: 4,
    type: 'message',
    from: 'Lisa Park',
    email: 'lisa.park@company.com',
    avatar: 'https://i.pravatar.cc/100?img=45',
    subject: 'UX Designer candidate shortlist',
    preview: 'Here are the top 5 candidates I recommend for the UX Designer role...',
    content: `Hi Team,

After reviewing all applications, here are my top 5 candidates for the UX Designer position:

1. **Alex Johnson** - 7 years experience, strong portfolio
2. **Maria Garcia** - 5 years experience, excellent Figma skills
3. **David Kim** - 4 years experience, fintech background
4. **Sophie Turner** - 6 years experience, design leadership
5. **James Lee** - 3 years experience, fresh perspective

I've attached their portfolios for review. Let me know if you'd like to schedule interviews.

Best,
Lisa`,
    time: '5 hours ago',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    unread: false,
    starred: false,
  },
];

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'approval',
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
    title: 'Requisition Approved',
    message: 'REQ-2024-002 (Product Manager) has been approved by Finance',
    time: '5 mins ago',
    unread: true,
    actionUrl: '/dashboard/requisitions/REQ-2024-002',
    actionLabel: 'View Requisition',
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
    actionUrl: '/dashboard/requisitions/approvals',
    actionLabel: 'Review Now',
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
    actionUrl: '/dashboard/interviews',
    actionLabel: 'View Interview',
  },
  {
    id: 4,
    type: 'application',
    icon: User,
    color: 'text-purple-600 bg-purple-50',
    title: 'New Applications',
    message: '5 new applications received for Senior Software Engineer position',
    time: '2 hours ago',
    unread: false,
    actionUrl: '/dashboard/jobs/1/applicants',
    actionLabel: 'View Applications',
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
    actionUrl: '/dashboard/requisitions/approvals',
    actionLabel: 'Take Action',
  },
  {
    id: 6,
    type: 'candidate_response',
    icon: MessageSquare,
    color: 'text-teal-600 bg-teal-50',
    title: 'Candidate Responded',
    message: 'Sarah Chen has accepted the interview invitation for Dec 23',
    time: '4 hours ago',
    unread: false,
  },
];

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('notifications');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    content: '',
    sendEmailNotification: true,
  });

  const unreadMessages = messages.filter(m => m.unread).length;
  const unreadNotifications = notifications.filter(n => n.unread).length;

  const filteredMessages = messages.filter(m =>
    m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAllRead = () => {
    if (activeTab === 'messages') {
      setMessages(messages.map(m => ({ ...m, unread: false })));
    } else {
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    }
  };

  const handleToggleStar = (id: number) => {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, starred: !m.starred } : m
    ));
  };

  const handleArchive = (id: number) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.content) {
      alert('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert(`Message sent to ${composeForm.to}${composeForm.sendEmailNotification ? '\nEmail notification will be sent to the recipient.' : ''}`);

      setShowComposeModal(false);
      setComposeForm({
        to: '',
        subject: '',
        content: '',
        sendEmailNotification: true,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;

    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newReply: Reply = {
        id: Date.now(),
        from: 'You',
        content: replyContent,
        time: 'Just now',
      };

      setMessages(messages.map(m =>
        m.id === selectedMessage.id
          ? { ...m, replies: [...(m.replies || []), newReply] }
          : m
      ));

      setSelectedMessage({
        ...selectedMessage,
        replies: [...(selectedMessage.replies || []), newReply],
      });

      setReplyContent('');
      alert(`Reply sent to ${selectedMessage.from}.\nEmail notification sent.`);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(notifications.map(n =>
      n.id === notification.id ? { ...n, unread: false } : n
    ));
  };

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    setMessages(messages.map(m =>
      m.id === message.id ? { ...m, unread: false } : m
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your messages and notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Compose
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages and notifications..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setActiveTab('notifications'); setSelectedMessage(null); }}
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
          onClick={() => { setActiveTab('messages'); setSelectedMessage(null); }}
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
      <div className="flex gap-6">
        {/* List */}
        <div className={cn(
          "bg-white rounded-xl border border-gray-100 overflow-hidden flex-1",
          selectedMessage && activeTab === 'messages' ? "hidden lg:block lg:max-w-md" : ""
        )}>
          {activeTab === 'notifications' && (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleNotificationClick(item)}
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
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
                        >
                          {item.actionLabel}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    {item.unread && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="divide-y divide-gray-100">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages found</p>
                </div>
              ) : (
                filteredMessages.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleOpenMessage(item)}
                    className={cn(
                      "flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group",
                      item.unread && "bg-primary/5",
                      selectedMessage?.id === item.id && "bg-primary/10"
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
                      {item.jobTitle && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          <Briefcase className="h-3 w-3" />
                          {item.jobTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStar(item.id); }}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"
                      >
                        <Star className={cn("h-4 w-4", item.starred && "text-amber-400 fill-amber-400")} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleArchive(item.id); }}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Message Detail */}
        {selectedMessage && activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-100 flex-1 flex flex-col"
          >
            {/* Detail Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedMessage(null)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleStar(selectedMessage.id)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Star className={cn("h-5 w-5", selectedMessage.starred ? "text-amber-400 fill-amber-400" : "text-gray-400")} />
                </button>
                <button
                  onClick={() => handleArchive(selectedMessage.id)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Archive className="h-5 w-5 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={selectedMessage.avatar}
                  alt={selectedMessage.from}
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedMessage.from}</h2>
                      <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">{selectedMessage.time}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedMessage.subject}</h3>

              {selectedMessage.jobTitle && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    Related to: {selectedMessage.jobTitle}
                  </span>
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{selectedMessage.content}</div>
              </div>

              {/* Replies */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <h4 className="text-sm font-medium text-gray-500">Replies</h4>
                  {selectedMessage.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{reply.from}</span>
                        <span className="text-xs text-gray-500">{reply.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                  className="flex-1 rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || sending}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50 self-end"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Email notification will be sent to {selectedMessage.email}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowComposeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                    <p className="text-sm text-gray-500">Send a message to a candidate or team member</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To *</label>
                  <input
                    type="email"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="Enter email address or search candidates..."
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    placeholder="Enter subject"
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                    placeholder="Write your message..."
                    rows={8}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={composeForm.sendEmailNotification}
                    onChange={(e) => setComposeForm({ ...composeForm, sendEmailNotification: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Send email notification to recipient</span>
                  </div>
                </label>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                  <Paperclip className="h-4 w-4" />
                  Attach file
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
