'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Search, MoreVertical, Send } from 'lucide-react';

export default function MessagesPage() {
  const users = [
    { id: 1, name: 'Alice Smith', role: 'UX Designer', lastMsg: 'Thanks for the update!', time: '2m', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100' },
    { id: 2, name: 'Michael Brown', role: 'Frontend Dev', lastMsg: 'When is the next interview?', time: '1h', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
    { id: 3, name: 'Sarah Lee', role: 'Product Manager', lastMsg: 'Here is my portfolio link.', time: '3h', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  ];

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search messages..." className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
             <div key={user.id} className="cursor-pointer border-b border-gray-100 p-4 hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <img src={user.img} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                         <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                         <span className="text-xs text-gray-500">{user.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.lastMsg}</p>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
           <div className="flex items-center gap-3">
              <img src={users[0].img} alt="Alice" className="h-10 w-10 rounded-full object-cover" />
              <div>
                 <h2 className="text-sm font-bold text-gray-900">Alice Smith</h2>
                 <p className="text-xs text-green-600">Online</p>
              </div>
           </div>
           <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
           <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-primary px-4 py-2 text-white">
                 <p className="text-sm">Hi Alice, thanks for applying. We reviewed your profile.</p>
                 <span className="mt-1 block text-right text-[10px] text-emerald-100">10:30 AM</span>
              </div>
           </div>
           <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-white border border-gray-100 px-4 py-2 text-gray-800 shadow-sm">
                 <p className="text-sm">Thanks! I'm really excited about this opportunity. When can we discuss further?</p>
                 <span className="mt-1 block text-right text-[10px] text-gray-400">10:32 AM</span>
              </div>
           </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-primary px-4 py-2 text-white">
                 <p className="text-sm">Let's schedule a call for tomorrow at 2 PM.</p>
                 <span className="mt-1 block text-right text-[10px] text-emerald-100">10:33 AM</span>
              </div>
           </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
           <div className="flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-emerald-600 transition-colors">
                 <Send className="h-4 w-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
