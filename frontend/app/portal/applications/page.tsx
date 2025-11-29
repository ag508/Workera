"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const tenantId = "default-tenant-id"

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const candidateId = localStorage.getItem("candidateId")
    if (!candidateId) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/applications?candidateId=${candidateId}&tenantId=${tenantId}`)
      if (res.ok) {
        setApplications(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch applications", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return

    const candidateId = localStorage.getItem("candidateId")
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/applications/${id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, tenantId })
      })
      fetchApplications()
    } catch (error) {
      console.error("Failed to withdraw", error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500">History of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">You haven't submitted any applications yet.</p>
            <Link href="/portal/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {app.application?.job?.title || "Unknown Position"}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Submitted on {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">Status</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>

                    {app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && (
                      <Button variant="outline" size="sm" onClick={() => handleWithdraw(app.id)} className="text-red-600 hover:text-red-700">
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
