"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PublicApplyPage({ params }: { params: { slug: string } }) {
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [])

  const fetchForm = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms/slug/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setForm(data)
      } else {
        setForm(null)
      }
    } catch (error) {
      console.error("Failed to fetch form", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data: Record<string, any> = {}

    // Process form fields
    form.fields.forEach((field: any) => {
      if (field.type === 'multiselect') {
        const selected = formData.getAll(field.id)
        data[field.id] = selected
      } else if (field.type !== 'file') {
        data[field.id] = formData.get(field.id)
      }
    })

    // Handle resume separately (in a real app, you'd upload to S3/Cloud Storage first)
    // For this demo, we'll just mock the URL
    const resumeUrl = "https://example.com/resume.pdf"

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form.id,
          data,
          resumeUrl,
          // userAgent/ip would be handled by backend usually or passed here
        })
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        alert("Failed to submit application. Please try again.")
      }
    } catch (error) {
      console.error("Submission error", error)
      alert("An error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (!form) return notFound()

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center p-6">
          <div className="mb-4 text-green-500 flex justify-center">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="mb-2">Application Received!</CardTitle>
          <CardDescription>{form.thankYouMessage || "Thank you for applying. We will be in touch soon."}</CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
          <p className="text-gray-600">{form.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>{form.welcomeMessage || "Please fill out the details below."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields
                .sort((a: any, b: any) => a.order - b.order)
                .map((field: any) => (
                <div key={field.id} className="grid gap-2">
                  <label className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.id}
                      required={field.required}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.id}
                      required={field.required}
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'multiselect' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {field.options?.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name={field.id} value={opt} className="rounded border-gray-300" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.id}
                      required={field.required}
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
