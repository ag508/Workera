'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
  Building2,
  Calendar,
  Filter,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const pendingApprovals = [
  {
    id: 'APR-001',
    requisitionId: 'REQ-2024-001',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    hiringManager: 'John Smith',
    salaryRange: '$150,000 - $180,000',
    headcount: 2,
    submittedAt: '2024-12-18',
    dueDate: '2024-12-23',
    priority: 'HIGH',
    level: 2,
    totalLevels: 3,
    role: 'Finance Approval',
    isOverdue: false,
  },
  {
    id: 'APR-002',
    requisitionId: 'REQ-2024-006',
    title: 'Marketing Manager',
    department: 'Marketing',
    hiringManager: 'Emily Davis',
    salaryRange: '$100,000 - $130,000',
    headcount: 1,
    submittedAt: '2024-12-15',
    dueDate: '2024-12-20',
    priority: 'CRITICAL',
    level: 1,
    totalLevels: 2,
    role: 'HRBP Review',
    isOverdue: true,
  },
  {
    id: 'APR-003',
    requisitionId: 'REQ-2024-007',
    title: 'Data Analyst',
    department: 'Data',
    hiringManager: 'Mike Chen',
    salaryRange: '$90,000 - $110,000',
    headcount: 3,
    submittedAt: '2024-12-19',
    dueDate: '2024-12-26',
    priority: 'NORMAL',
    level: 1,
    totalLevels: 3,
    role: 'HRBP Review',
    isOverdue: false,
  },
];

const approvalHistory = [
  {
    id: 'APR-H01',
    requisitionId: 'REQ-2024-002',
    title: 'Product Manager',
    action: 'APPROVED',
    date: '2024-12-17',
    comment: 'Approved - critical role for Q1 product launch',
  },
  {
    id: 'APR-H02',
    requisitionId: 'REQ-2024-004',
    title: 'DevOps Engineer',
    action: 'APPROVED',
    date: '2024-12-14',
    comment: 'Approved with minor budget adjustment',
  },
  {
    id: 'APR-H03',
    requisitionId: 'REQ-2024-005',
    title: 'Data Scientist',
    action: 'REJECTED',
    date: '2024-12-12',
    comment: 'Salary exceeds budget. Please revise.',
  },
];

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">Review and action pending requisition approvals</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">1 approval overdue</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pendingApprovals.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Overdue', value: 1, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Approved Today', value: 2, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Response Time', value: '1.2 days', icon: Clock, color: 'text-blue-600 bg-blue-50' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "pb-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'pending'
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Pending Approvals ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "pb-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'history'
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          History
        </button>
      </div>

      {/* Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingApprovals.map((approval, idx) => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "bg-white rounded-xl border p-6 transition-all hover:shadow-md",
                approval.isOverdue ? "border-red-200 bg-red-50/30" : "border-gray-100"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex-shrink-0 p-3 rounded-xl",
                  approval.isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                  <Clock className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/requisitions/${approval.requisitionId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary"
                        >
                          {approval.title}
                        </Link>
                        {approval.isOverdue && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                            OVERDUE
                          </span>
                        )}
                        {approval.priority === 'CRITICAL' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {approval.requisitionId} · Level {approval.level} of {approval.totalLevels} · {approval.role}
                      </p>
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      <p>Due: {approval.dueDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {approval.department}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {approval.headcount} positions
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Submitted {approval.submittedAt}
                    </div>
                    <span className="text-gray-300">|</span>
                    <span>{approval.salaryRange}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Requested by:</span>
                      <img
                        src={`https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`}
                        alt={approval.hiringManager}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-700">{approval.hiringManager}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <RotateCcw className="h-4 w-4" />
                        Send Back
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requisition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {approvalHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.requisitionId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      item.action === 'APPROVED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {item.action === 'APPROVED' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
