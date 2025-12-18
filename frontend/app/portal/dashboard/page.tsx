"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Briefcase, FileText, CheckCircle2, Clock, User, LogOut, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CandidateDashboard() {
  const router = useRouter()
  // Mock data for demo/preview
  const applications = [
    { id: 1, role: "Senior Frontend Engineer", company: "Workera", status: "Interviewing", date: "2023-10-24", location: "Remote" },
    { id: 2, role: "Product Designer", company: "TechFlow", status: "Applied", date: "2023-10-22", location: "New York, NY" },
    { id: 3, role: "Backend Developer", company: "StartUp Inc", status: "Rejected", date: "2023-10-15", location: "San Francisco, CA" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("candidateToken")
    localStorage.removeItem("candidateId")
    router.push("/portal/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
                src="/images/brand/Workera_Full_Icon.png"
                alt="Workera"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
               </div>
               <span className="text-sm font-medium text-gray-700">John Doe</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
               <LogOut className="h-4 w-4" />
               <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
           <p className="text-gray-500">Track the status of your job applications.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
           <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Briefcase className="h-6 w-6" />
                 </div>
                 <div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <div className="text-sm text-gray-500">Active Applications</div>
                 </div>
              </div>
           </GlassCard>
           <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Clock className="h-6 w-6" />
                 </div>
                 <div>
                    <div className="text-2xl font-bold text-gray-900">4</div>
                    <div className="text-sm text-gray-500">Interviews Pending</div>
                 </div>
              </div>
           </GlassCard>
           <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                 </div>
                 <div>
                    <div className="text-2xl font-bold text-gray-900">1</div>
                    <div className="text-sm text-gray-500">Offers Received</div>
                 </div>
              </div>
           </GlassCard>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
           {applications.map((app) => (
              <GlassCard key={app.id} className="p-6 transition-all hover:shadow-md">
                 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{app.role}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                             app.status === 'Interviewing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                             app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                             'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                             {app.status}
                          </span>
                       </div>
                       <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{app.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Applied {app.date}</span>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <Button variant="outline" size="sm">View Details</Button>
                       {app.status === 'Interviewing' && (
                          <Button size="sm" className="bg-primary hover:bg-emerald-600">Prepare for Interview</Button>
                       )}
                    </div>
                 </div>
              </GlassCard>
           ))}
        </div>
      </main>
    </div>
  )
}
