'use client';

import { Search, TrendingUp, Users, Briefcase, Clock, ArrowUpRight, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const recentActivity = [
  { type: 'application', user: 'John Carter', action: 'applied to', target: 'Senior React Dev', time: '2m ago', avatar: 'https://i.pravatar.cc/100?img=11' },
  { type: 'job', user: 'You', action: 'posted', target: 'Product Manager', time: '1h ago', avatar: null },
  { type: 'interview', user: 'Sarah Lee', action: 'completed interview for', target: 'UX Designer', time: '3h ago', avatar: 'https://i.pravatar.cc/100?img=5' },
];

const suggestedCandidates = [
  { name: 'Alice Smith', role: 'UX Designer', match: 98, avatar: 'https://i.pravatar.cc/100?img=9' },
  { name: 'Michael Chen', role: 'Frontend Dev', match: 94, avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: 'Emily Davis', role: 'Product Mgr', match: 91, avatar: 'https://i.pravatar.cc/100?img=16' },
];

const quickStats = [
  { label: 'Active Jobs', value: '12', change: '+2', icon: Briefcase, color: 'bg-blue-500' },
  { label: 'New Applicants', value: '48', change: '+15', icon: Users, color: 'bg-purple-500' },
  { label: 'Interviews', value: '8', change: '+3', icon: Clock, color: 'bg-amber-500' },
];

export function RightPanel() {
  return (
    <div className="fixed inset-y-0 right-0 hidden w-[360px] flex-col border-l border-gray-100 bg-gray-50/50 xl:flex overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-white p-3 border border-gray-100 shadow-sm"
            >
              <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {stat.label}
                <span className="text-green-600 font-medium">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-xs font-medium text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-3"
              >
                {item.avatar ? (
                  <img src={item.avatar} alt={item.user} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">
                    <span className="font-medium text-gray-900">{item.user}</span> {item.action}{' '}
                    <span className="font-medium text-primary">{item.target}</span>
                  </p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Suggested Candidates */}
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">AI Suggestions</h3>
            </div>
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Smart Match</span>
          </div>
          <div className="space-y-3">
            {suggestedCandidates.map((candidate, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={candidate.avatar} alt={candidate.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="text-[9px] font-bold text-primary">{candidate.match}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.role}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
                  View
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hiring Insights */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Hiring Insights</h3>
          </div>
          <p className="text-sm text-emerald-100 mb-4">Your hiring pipeline is performing 23% better than last month.</p>
          <button className="flex items-center gap-1 text-sm font-medium text-white hover:underline">
            View Analytics <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
