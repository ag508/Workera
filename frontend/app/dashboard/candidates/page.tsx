'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin, FileText, X, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { candidatesService, Candidate } from '@/lib/services/candidates';
import { MOCK_RESUME_TEXT } from '@/lib/demo-data';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const data = await candidatesService.getAll();
        setCandidates(data);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  return (
    <div className="max-w-3xl">
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

      {loading && (
        <div className="flex h-64 items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
           <p className="text-gray-500">No candidates found.</p>
        </div>
      )}

      <div className="space-y-4">
        {candidates.map((candidate) => {
          const fullName = `${candidate.firstName} ${candidate.lastName}`;
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
          // Mock score if missing
          const score = candidate.matchScore || Math.floor(Math.random() * 40) + 60;
          // Mock status if missing
          const status = 'Screening';

          return (
            <GlassCard key={candidate.id} className="cursor-pointer p-5 transition-all hover:bg-gray-50/50">
              <div className="flex gap-4">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{fullName}</h3>
                      <p className="text-sm text-gray-500">{candidate.location || 'Remote'}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {candidate.location || 'Remote'}
                    </span>
                    {score > 80 && (
                       <span className="font-bold text-primary">
                         {score}% Match
                       </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.skills && candidate.skills.map((skill) => (
                      <span key={skill} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                 <div className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                   status === 'Interview' ? 'bg-purple-100 text-purple-700' :
                   status === 'Screening' ? 'bg-blue-100 text-blue-700' :
                   status === 'Offer' ? 'bg-green-100 text-green-700' :
                   'bg-gray-100 text-gray-700'
                 }`}>
                   {status}
                 </div>
                 <div className="flex gap-3 items-center">
                   <button
                     onClick={(e) => { e.stopPropagation(); setSelectedCandidate({ ...candidate, fullName, avatarUrl }); }}
                     className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                   >
                      <FileText className="h-3 w-3" /> View Resume
                   </button>
                   <div className="h-4 w-px bg-gray-200"></div>
                   <button className="text-gray-400 hover:text-gray-600">
                     <Mail className="h-4 w-4" />
                   </button>
                   <button className="text-gray-400 hover:text-gray-600">
                     <Phone className="h-4 w-4" />
                   </button>
                 </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Resume Modal */}
      {selectedCandidate && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[85vh] flex flex-col">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <img
                        src={selectedCandidate.avatarUrl}
                        alt={selectedCandidate.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.fullName}</h2>
                        <p className="text-gray-500">{selectedCandidate.location}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                     <X className="h-6 w-6 text-gray-500" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto pr-2">
                   <div className="prose prose-sm max-w-none bg-gray-50 p-8 rounded-lg font-mono text-sm whitespace-pre-wrap border border-gray-100 shadow-inner text-gray-700">
                      {selectedCandidate.resumeText || MOCK_RESUME_TEXT.replace('ALICE SMITH', selectedCandidate.fullName.toUpperCase())}
                   </div>
               </div>

               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => setSelectedCandidate(null)} className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 font-medium text-gray-700">Close</button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-emerald-600 font-medium shadow-sm shadow-primary/30">Schedule Interview</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
