'use client';

import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

const DEMO_CANDIDATES = [
  {
    id: '1',
    name: 'Alexandra Berg',
    role: 'Senior UX Designer',
    location: 'Berlin, Germany',
    skills: ['Figma', 'React', 'Prototyping'],
    matchScore: 92,
    status: 'Interview',
    avatar: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: '2',
    name: 'James Wilson',
    role: 'Backend Engineer',
    location: 'London, UK',
    skills: ['Node.js', 'PostgreSQL', 'AWS'],
    matchScore: 88,
    status: 'Screening',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    role: 'Product Manager',
    location: 'San Francisco, CA',
    skills: ['Agile', 'Strategy', 'Analytics'],
    matchScore: 75,
    status: 'Applied',
    avatar: 'https://i.pravatar.cc/150?u=3',
  },
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState(DEMO_CANDIDATES);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
             <Filter className="h-4 w-4" />
             Filter
           </button>
           <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
             <Search className="h-4 w-4" />
             Search
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <GlassCard key={candidate.id} className="cursor-pointer p-5 transition-all hover:bg-gray-50/50">
            <div className="flex gap-4">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-500">{candidate.role}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {candidate.location}
                  </span>
                  {candidate.matchScore > 80 && (
                     <span className="font-bold text-primary">
                       {candidate.matchScore}% Match
                     </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
               <div className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                 candidate.status === 'Interview' ? 'bg-purple-100 text-purple-700' :
                 candidate.status === 'Screening' ? 'bg-blue-100 text-blue-700' :
                 'bg-gray-100 text-gray-700'
               }`}>
                 {candidate.status}
               </div>
               <div className="flex gap-3">
                 <button className="text-gray-400 hover:text-gray-600">
                   <Mail className="h-4 w-4" />
                 </button>
                 <button className="text-gray-400 hover:text-gray-600">
                   <Phone className="h-4 w-4" />
                 </button>
               </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
