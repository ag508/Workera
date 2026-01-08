'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  Building2,
  ChevronRight,
  Eye,
  Edit,
  Copy,
  Trash2,
  Briefcase,
  ArrowRight,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for requisitions
const requisitions = [
  {
    id: 'REQ-2024-001',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    headcount: 2,
    status: 'PENDING_APPROVAL',
    priority: 'HIGH',
    hiringManager: 'John Smith',
    recruiter: 'Sarah Johnson',
    salaryRange: '$150,000 - $180,000',
    createdAt: '2024-12-18',
    approvalLevel: 2,
    totalLevels: 3,
  },
  {
    id: 'REQ-2024-002',
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    headcount: 1,
    status: 'APPROVED',
    priority: 'NORMAL',
    hiringManager: 'Emily Chen',
    recruiter: 'Mike Brown',
    salaryRange: '$130,000 - $160,000',
    createdAt: '2024-12-15',
    approvalLevel: 3,
    totalLevels: 3,
  },
  {
    id: 'REQ-2024-003',
    title: 'UX Designer',
    department: 'Design',
    location: 'New York, NY',
    headcount: 1,
    status: 'DRAFT',
    priority: 'NORMAL',
    hiringManager: 'Lisa Park',
    recruiter: null,
    salaryRange: '$100,000 - $130,000',
    createdAt: '2024-12-20',
    approvalLevel: 0,
    totalLevels: 2,
  },
  {
    id: 'REQ-2024-004',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Austin, TX',
    headcount: 3,
    status: 'POSTED',
    priority: 'CRITICAL',
    hiringManager: 'David Lee',
    recruiter: 'Sarah Johnson',
    salaryRange: '$140,000 - $170,000',
    createdAt: '2024-12-10',
    approvalLevel: 3,
    totalLevels: 3,
  },
  {
    id: 'REQ-2024-005',
    title: 'Data Scientist',
    department: 'Data',
    location: 'Seattle, WA',
    headcount: 2,
    status: 'REJECTED',
    priority: 'NORMAL',
    hiringManager: 'Anna Wilson',
    recruiter: null,
    salaryRange: '$160,000 - $190,000',
    createdAt: '2024-12-12',
    approvalLevel: 2,
    totalLevels: 4,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-600 bg-gray-100', icon: FileText },
  SUBMITTED: { label: 'Submitted', color: 'text-blue-600 bg-blue-50', icon: Clock },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  APPROVED: { label: 'Approved', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'text-red-600 bg-red-50', icon: XCircle },
  POSTED: { label: 'Posted', color: 'text-primary bg-primary/10', icon: CheckCircle2 },
  ACTIVE_HIRING: { label: 'Active Hiring', color: 'text-purple-600 bg-purple-50', icon: Users },
  FILLED: { label: 'Filled', color: 'text-green-700 bg-green-100', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500 bg-gray-100', icon: XCircle },
  ON_HOLD: { label: 'On Hold', color: 'text-orange-600 bg-orange-50', icon: AlertCircle },
  CLOSED: { label: 'Closed', color: 'text-gray-500 bg-gray-100', icon: FileText },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'text-gray-500 bg-gray-50' },
  NORMAL: { label: 'Normal', color: 'text-blue-600 bg-blue-50' },
  HIGH: { label: 'High', color: 'text-amber-600 bg-amber-50' },
  CRITICAL: { label: 'Critical', color: 'text-red-600 bg-red-50' },
};

const filterTabs = [
  { name: 'All', value: 'all', count: 12 },
  { name: 'Draft', value: 'DRAFT', count: 3 },
  { name: 'Pending', value: 'PENDING_APPROVAL', count: 4 },
  { name: 'Approved', value: 'APPROVED', count: 2 },
  { name: 'Posted', value: 'POSTED', count: 2 },
  { name: 'Rejected', value: 'REJECTED', count: 1 },
];

export default function RequisitionsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequisitions = requisitions.filter((req) => {
    if (activeFilter !== 'all' && req.status !== activeFilter) return false;
    if (searchQuery && !req.title.toLowerCase().includes(searchQuery.toLowerCase()) && !req.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Requisitions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage hiring requests and approvals</p>
        </div>
        <Link
          href="/dashboard/requisitions/create"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Requisition
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requisitions', value: 12, color: 'from-blue-500 to-blue-600' },
          { label: 'Pending Approval', value: 4, color: 'from-amber-500 to-amber-600' },
          { label: 'Active Hiring', value: 5, color: 'from-green-500 to-green-600' },
          { label: 'Filled This Month', value: 8, color: 'from-purple-500 to-purple-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", stat.color)} />
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                activeFilter === tab.value
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {tab.name}
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeFilter === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requisitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.map((req, idx) => {
          const status = statusConfig[req.status];
          const priority = priorityConfig[req.priority];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={cn("flex-shrink-0 rounded-xl p-3", status.color)}>
                  <StatusIcon className="h-5 w-5" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/requisitions/${req.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                        >
                          {req.title}
                        </Link>
                        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", priority.color)}>
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{req.id}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {req.department}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {req.headcount} {req.headcount === 1 ? 'position' : 'positions'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {req.createdAt}
                    </div>
                    <span className="text-gray-300">|</span>
                    <span>{req.salaryRange}</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://i.pravatar.cc/100?img=${(req.hiringManager.length * 3) % 70}`}
                          alt={req.hiringManager}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{req.hiringManager}</span>
                      </div>
                      {req.recruiter && (
                        <>
                          <span className="text-gray-300">→</span>
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://i.pravatar.cc/100?img=${(req.recruiter.length * 5) % 70}`}
                              alt={req.recruiter}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">{req.recruiter}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-medium", status.color)}>
                        {status.label}
                      </span>
                      {req.status === 'PENDING_APPROVAL' && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>Level {req.approvalLevel} of {req.totalLevels}</span>
                        </div>
                      )}
                      {req.status === 'APPROVED' && (
                        <Link
                          href={`/dashboard/jobs/create?requisitionId=${req.id}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          Create Job
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/requisitions/${req.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
