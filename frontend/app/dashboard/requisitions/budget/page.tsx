'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  AlertTriangle,
  Building2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const budgetData = {
  totalBudget: 2500000,
  allocated: 1850000,
  reserved: 450000,
  available: 200000,
  spent: 1650000,
};

const departmentBudgets = [
  { name: 'Engineering', budget: 1200000, used: 920000, reserved: 180000 },
  { name: 'Product', budget: 500000, used: 380000, reserved: 80000 },
  { name: 'Marketing', budget: 400000, used: 220000, reserved: 100000 },
  { name: 'Data', budget: 300000, used: 130000, reserved: 90000 },
  { name: 'Design', budget: 100000, used: 0, reserved: 0 },
];

const recentReservations = [
  { id: 'REQ-2024-001', title: 'Senior Software Engineer', amount: 360000, status: 'reserved' },
  { id: 'REQ-2024-006', title: 'Marketing Manager', amount: 130000, status: 'pending' },
  { id: 'REQ-2024-007', title: 'Data Analyst x3', amount: 330000, status: 'reserved' },
];

export default function BudgetPage() {
  const utilizationPercent = ((budgetData.spent + budgetData.reserved) / budgetData.totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring Budget</h1>
        <p className="mt-1 text-sm text-gray-500">Track budget allocation and reservations for requisitions</p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: `$${(budgetData.totalBudget / 1000000).toFixed(1)}M`, icon: Wallet, color: 'from-blue-500 to-blue-600' },
          { label: 'Spent', value: `$${(budgetData.spent / 1000).toFixed(0)}K`, icon: TrendingDown, color: 'from-gray-500 to-gray-600' },
          { label: 'Reserved', value: `$${(budgetData.reserved / 1000).toFixed(0)}K`, icon: AlertTriangle, color: 'from-amber-500 to-amber-600' },
          { label: 'Available', value: `$${(budgetData.available / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative overflow-hidden bg-white rounded-xl border border-gray-100 p-6"
          >
            <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", stat.color)} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget Utilization Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">FY 2024 Hiring Budget</span>
            <span className="font-semibold text-gray-900">{utilizationPercent.toFixed(1)}% utilized</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-gray-500 transition-all"
                style={{ width: `${(budgetData.spent / budgetData.totalBudget) * 100}%` }}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(budgetData.reserved / budgetData.totalBudget) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="text-gray-600">Spent (${(budgetData.spent / 1000).toFixed(0)}K)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-gray-600">Reserved (${(budgetData.reserved / 1000).toFixed(0)}K)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-100" />
              <span className="text-gray-600">Available (${(budgetData.available / 1000).toFixed(0)}K)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget by Department</h2>
          <div className="space-y-4">
            {departmentBudgets.map((dept) => {
              const usedPct = (dept.used / dept.budget) * 100;
              const reservedPct = (dept.reserved / dept.budget) * 100;

              return (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{dept.name}</span>
                    </div>
                    <span className="text-gray-500">
                      ${(dept.used / 1000).toFixed(0)}K / ${(dept.budget / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-primary transition-all"
                        style={{ width: `${usedPct}%` }}
                      />
                      <div
                        className="bg-amber-400 transition-all"
                        style={{ width: `${reservedPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h2>
          <div className="space-y-4">
            {recentReservations.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(item.amount / 1000).toFixed(0)}K</p>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    item.status === 'reserved' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {item.status === 'reserved' ? 'Reserved' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
