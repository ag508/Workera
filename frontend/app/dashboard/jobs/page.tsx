"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { jobsService, Job } from "@/lib/services/jobs"
import { Search, Plus, MapPin, Users, Clock, MoreHorizontal, Loader2 } from "lucide-react"
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
            <p className="text-gray-500">Manage your open positions.</p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-emerald-600">
             <Plus className="h-4 w-4" /> Post New Job
          </Button>
       </div>

       {/* Search */}
       <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
             className="h-10 w-full rounded-md border border-gray-200 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
             placeholder="Search jobs..."
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
         <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
            <p className="text-gray-500">No jobs found. Create your first job posting.</p>
         </div>
       )}

       {/* Grid */}
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(job => (
             <TiltedCard key={job.id} className="h-full">
                <GlassCard className="h-full border border-gray-200 bg-white/50 p-6 hover:shadow-xl transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'POSTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                         {job.status}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                         <span className="sr-only">Menu</span>
                         <MoreHorizontal className="h-4 w-4" />
                      </Button>
                   </div>

                   <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                   <p className="text-sm text-gray-500 mb-4">{job.company || 'Workera'}</p>

                   <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-gray-400" />
                         {job.location || 'Remote'}
                      </div>
                       <div className="flex items-center gap-2">
                         <Clock className="h-4 w-4 text-gray-400" />
                         {job.type || 'Full-time'}
                      </div>
                       <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-gray-400" />
                         {job.applicantCount || 0} Applicants
                      </div>
                   </div>

                   <Button variant="outline" className="w-full mt-6 hover:bg-primary hover:text-white transition-colors">
                     View Details
                   </Button>
                </GlassCard>
             </TiltedCard>
          ))}
       </div>
    </div>
  )
}
