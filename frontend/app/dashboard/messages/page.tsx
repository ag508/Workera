'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, Star, Archive, Trash2, Reply, Loader2, Mail, RefreshCw, X, Plus } from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  recipientName?: string;
  recipientEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  candidateId?: string;
  jobTitle?: string;
  createdAt: string;
  replies?: Message[];
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', toName: '', subject: '', content: '' });
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const tenantId = getTenantId();
  const userEmail = 'recruiter@workera.ai'; // In production, get from auth context

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages?tenantId=${tenantId}&userEmail=${userEmail}`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
        if (data.data && data.data.length > 0 && !selectedMessage) {
          setSelectedMessage(data.data[0]);
          // Mark first message as read
          if (!data.data[0].isRead) {
            markAsRead(data.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}/read?tenantId=${tenantId}`,
        { method: 'PUT' }
      );
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, isRead: true } : m))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const toggleStar = async (messageId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}/star?tenantId=${tenantId}`,
        { method: 'PUT' }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, isStarred: data.data.isStarred } : m))
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, isStarred: data.data.isStarred } : null);
        }
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}/archive?tenantId=${tenantId}`,
        { method: 'PUT' }
      );
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}?tenantId=${tenantId}`,
        { method: 'DELETE' }
      );
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !newMessageContent.trim()) return;
    setSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${selectedMessage.id}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newMessageContent,
            senderName: 'Recruiter',
            senderEmail: userEmail,
            tenantId,
          }),
        }
      );
      if (res.ok) {
        setNewMessageContent('');
        fetchMessages(); // Refresh to get updated thread
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const sendNewMessage = async () => {
    if (!composeData.to || !composeData.subject || !composeData.content) return;
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeData.to,
          toName: composeData.toName,
          subject: composeData.subject,
          content: composeData.content,
          senderName: 'Recruiter',
          senderEmail: userEmail,
          tenantId,
        }),
      });
      if (res.ok) {
        setShowCompose(false);
        setComposeData({ to: '', toName: '', subject: '', content: '' });
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const selectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const filteredMessages = messages.filter(
    m =>
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Messages</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMessages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowCompose(true)}
                className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => selectMessage(message)}
                className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-white transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-white border-l-2 border-l-primary' : ''
                } ${!message.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    {message.senderAvatar ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {message.senderName.charAt(0)}
                      </div>
                    )}
                    {!message.isRead && (
                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm truncate ${!message.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {message.senderName}
                      </h3>
                      <div className="flex items-center gap-1">
                        {message.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                        <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                      </div>
                    </div>
                    <p className={`text-sm truncate ${!message.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedMessage ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              {selectedMessage.senderAvatar ? (
                <img
                  src={selectedMessage.senderAvatar}
                  alt={selectedMessage.senderName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {selectedMessage.senderName.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-sm font-bold text-gray-900">{selectedMessage.senderName}</h2>
                <p className="text-xs text-gray-500">{selectedMessage.senderEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleStar(selectedMessage.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedMessage.isStarred
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Star className={`h-4 w-4 ${selectedMessage.isStarred ? 'fill-amber-500' : ''}`} />
              </button>
              <button
                onClick={() => archiveMessage(selectedMessage.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                {selectedMessage.jobTitle && (
                  <span className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium mb-4">
                    Re: {selectedMessage.jobTitle}
                  </span>
                )}
              </div>

              {/* Original Message */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {selectedMessage.senderName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{selectedMessage.senderName}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              {/* Replies */}
              {selectedMessage.replies?.map((reply, index) => (
                <div
                  key={reply.id || index}
                  className={`rounded-xl p-4 ${
                    reply.senderEmail === userEmail ? 'bg-primary/5 ml-8' : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {reply.senderName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{reply.senderName}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button
                onClick={sendReply}
                disabled={sending || !newMessageContent.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a conversation</h3>
            <p className="text-gray-500">Choose a message from the list to view</p>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">New Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Message subject"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  placeholder="Write your message..."
                  rows={6}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendNewMessage}
                disabled={sending || !composeData.to || !composeData.subject || !composeData.content}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
