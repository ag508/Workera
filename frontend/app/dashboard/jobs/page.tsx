"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { jobsService, Job } from "@/lib/services/jobs"
import { Search, Plus, MapPin, Users, Clock, MoreHorizontal, Loader2, Briefcase, ChevronRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import TiltedCard from "@/components/reactbits/TiltedCard"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await jobsService.getAll()
        setJobs(data)
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        // Optional: Set fallback or error state
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
            <p className="text-gray-500">Manage your open positions and track applicants.</p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-emerald-600 shadow-lg shadow-primary/25">
             <Plus className="h-4 w-4" /> Post New Job
          </Button>
       </div>

       {/* Search */}
       <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
             className="h-10 w-full rounded-full border-none bg-white pl-10 pr-4 text-sm shadow-sm ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
             placeholder="Search jobs by title, department, or location..."
             value={search}
             onChange={e => setSearch(e.target.value)}
          />
       </div>

       {/* Loading State */}
       {loading && (
         <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       )}

       {/* Empty State */}
       {!loading && jobs.length === 0 && (
         <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
               <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">No active jobs found</p>
            <p className="text-sm text-gray-500">Create your first job posting to start hiring.</p>
         </div>
       )}

       {/* Grid */}
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(job => (
             <TiltedCard key={job.id} className="h-full">
                <GlassCard className="group relative flex h-full flex-col justify-between overflow-hidden border border-white/60 bg-gradient-to-br from-white/80 to-white/40 p-6 transition-all hover:shadow-2xl hover:shadow-primary/5">
                   {/* Background Decor */}
                   <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

                   <div>
                      <div className="flex justify-between items-start mb-6">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                             job.status === 'POSTED' || job.status === 'Active'
                             ? 'bg-emerald-100 text-emerald-700'
                             : 'bg-gray-100 text-gray-700'
                          }`}>
                             {job.status}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600">
                             <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </div>

                      <div className="mb-6">
                         <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                           {job.title}
                         </h3>
                         <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                           {job.company || 'Engineering Team'}
                         </p>
                      </div>

                      {/* Job Metadata Pills */}
                      <div className="flex flex-wrap gap-2 mb-6">
                         <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-100">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {job.location || 'Remote'}
                         </div>
                         <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-100">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {job.type || 'Full-time'}
                         </div>
                      </div>

                      {/* Description Snippet (Mock if missing) */}
                      <p className="mb-6 line-clamp-2 text-sm text-gray-500">
                         {job.description
                            ? job.description.replace(/[#*]/g, '')
                            : "We are looking for an experienced professional to join our team and help drive innovation. This role offers great benefits and growth opportunities..."
                         }
                      </p>
                   </div>

                   <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100">
                               <img src={`https://i.pravatar.cc/100?u=${job.id}${i}`} alt="Applicant" className="h-full w-full rounded-full object-cover" />
                            </div>
                         ))}
                         <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-50 text-[10px] font-bold text-gray-500">
                            +{Math.max(0, (job.applicantCount || 0) - 3)}
                         </div>
                      </div>
                      <Button variant="ghost" className="gap-1 text-sm font-medium text-primary hover:text-primary hover:bg-primary/5 p-0 hover:no-underline">
                        View Applicants <ChevronRight className="h-4 w-4" />
                      </Button>
                   </div>
                </GlassCard>
             </TiltedCard>
          ))}
       </div>
    </div>
  )
}
