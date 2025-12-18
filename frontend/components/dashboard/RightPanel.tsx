'use client';

import { Search } from 'lucide-react';

export function RightPanel() {
  return (
    <div className="fixed inset-y-0 right-0 hidden w-[350px] flex-col border-l border-gray-100 bg-white px-6 py-4 xl:flex">
      {/* Search */}
      <div className="relative mb-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search candidates, jobs..."
          className="w-full rounded-full border-none bg-gray-100 py-3 pl-12 pr-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Trending / Widgets */}
      <div className="mb-6 rounded-2xl bg-gray-50 p-4">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
             <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
              alt="John Doe"
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">John Doe applied to Senior React Dev</span>
              <span className="text-xs text-gray-500">2 mins ago</span>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">
               JD
             </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Job "Product Manager" posted</span>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
          </div>
           <div className="flex gap-3">
             <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
              alt="Sarah"
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Sarah Lee updated her profile</span>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
          </div>
        </div>
        <button className="mt-4 w-full text-sm text-primary hover:underline">Show more</button>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Suggested Candidates</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
                  alt="Alice Smith"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Alice Smith</span>
                  <span className="text-xs text-gray-500">UX Designer</span>
                </div>
              </div>
              <button className="rounded-full bg-black px-3 py-1 text-sm font-bold text-white hover:bg-gray-800">
                View
              </button>
          </div>

          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                  alt="Michael Brown"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Michael Brown</span>
                  <span className="text-xs text-gray-500">Frontend Dev</span>
                </div>
              </div>
              <button className="rounded-full bg-black px-3 py-1 text-sm font-bold text-white hover:bg-gray-800">
                View
              </button>
          </div>

          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100"
                  alt="Emily Chen"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Emily Chen</span>
                  <span className="text-xs text-gray-500">Product Mgr</span>
                </div>
              </div>
              <button className="rounded-full bg-black px-3 py-1 text-sm font-bold text-white hover:bg-gray-800">
                View
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
