"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FormsListPage() {
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const tenantId = "default-tenant-id"

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms?tenantId=${tenantId}`)
      if (res.ok) {
        const data = await res.json()
        setForms(data)
      }
    } catch (error) {
      console.error("Failed to fetch forms", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms/${id}?tenantId=${tenantId}`, {
        method: "DELETE"
      })
      fetchForms()
    } catch (error) {
      console.error("Failed to delete form", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruitment Forms</h2>
          <p className="text-muted-foreground">Manage your job application forms.</p>
        </div>
        <Link href="/dashboard/forms/create">
          <Button>Create New Form</Button>
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No forms found.</p>
            <Link href="/dashboard/forms/create">
              <Button variant="outline">Create your first form</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="truncate">{form.title}</CardTitle>
                    <CardDescription className="truncate">{form.slug}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{form.submissionCount} Submissions</span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/forms/${form.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View</Button>
                  </Link>
                  <Link href={`/dashboard/forms/edit/${form.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Edit</Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(form.id)} className="text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
