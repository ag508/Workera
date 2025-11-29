"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTenantId } from "@/lib/utils"

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const tenantId = getTenantId()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/jobs?tenantId=${tenantId}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
          <p className="text-gray-500">Find your next great opportunity</p>
        </div>
        <div className="w-full md:w-1/3">
          <input
            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading jobs...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No jobs found matching your search.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                  <div className="text-sm text-gray-500">{job.location || "Remote"}</div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills?.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/apply/${job.id}`} className="w-full">
                    <Button className="w-full">Apply Now</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
