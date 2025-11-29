"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTenantId } from "@/lib/utils"
import { MOCK_APPLICATIONS } from "@/lib/demo-data"

export default function CandidateDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const tenantId = getTenantId()

  useEffect(() => {
    const fetchData = async () => {
      const candidateId = localStorage.getItem("candidateId")

      // Even if no candidateId (demo mode), we might want to show something?
      // But usually we need auth.
      // If mock login used, candidateId is "mock-candidate-id".

      if (!candidateId) return

      try {
        const [profileRes, appsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/profile?candidateId=${candidateId}&tenantId=${tenantId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/applications?candidateId=${candidateId}&tenantId=${tenantId}`)
        ])

        if (profileRes.ok) {
           setProfile(await profileRes.json())
        } else {
           setProfile({ firstName: 'Demo Candidate' })
        }

        if (appsRes.ok) {
           const data = await appsRes.json()
           if (data.length > 0) {
               setApplications(data)
           } else {
               setApplications(MOCK_APPLICATIONS)
           }
        } else {
           setApplications(MOCK_APPLICATIONS)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        // Fallback for Demo
        setProfile({ firstName: 'Demo Candidate' })
        setApplications(MOCK_APPLICATIONS)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.firstName || 'Candidate'}!
        </h1>
        <Link href="/portal/jobs">
          <Button>Find Jobs</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.filter(a => a.status !== 'REJECTED').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Profile Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="text-xs text-muted-foreground mt-1">Add more skills to reach 100%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground mt-1">No new messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Track the status of your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              You haven't applied to any jobs yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-medium text-gray-900">{app.job?.title || app.application?.job?.title || "Application"}</h3>
                    <p className="text-sm text-gray-500">Applied on {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${app.status === 'ACCEPTED' || app.status === 'Offer' ? 'bg-green-100 text-green-800' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <Link href={`/portal/applications/${app.id}`}>
                      <Button variant="outline" size="sm">Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
