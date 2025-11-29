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
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">John Doe applied to Senior React Dev</span>
              <span className="text-xs text-gray-500">2 mins ago</span>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="h-8 w-8 flex-shrink-0 rounded-full bg-green-100" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Job &quot;Product Manager&quot; posted</span>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
          </div>
        </div>
        <button className="mt-4 w-full text-sm text-primary hover:underline">Show more</button>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Suggested Candidates</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-300" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Alice Smith</span>
                  <span className="text-xs text-gray-500">UX Designer</span>
                </div>
              </div>
              <button className="rounded-full bg-black px-3 py-1 text-sm font-bold text-white hover:bg-gray-800">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
