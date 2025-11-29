"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "email", label: "Email Address" },
  { value: "phone", label: "Phone Number" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown Select" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "file", label: "File Upload" },
]

export default function EditFormPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<any[]>([])

  const tenantId = "default-tenant-id"

  useEffect(() => {
    fetchForm()
  }, [])

  const fetchForm = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms?tenantId=${tenantId}`)
      if (res.ok) {
        const forms = await res.json()
        const form = forms.find((f: any) => f.id === params.id)
        if (form) {
          setTitle(form.title)
          setDescription(form.description || "")
          setFields(form.fields || [])
        } else {
          alert("Form not found")
          router.push("/dashboard/forms")
        }
      }
    } catch (error) {
      console.error("Failed to fetch form", error)
    } finally {
      setLoading(false)
    }
  }

  const addField = () => {
    const id = `field_${Date.now()}`
    setFields([...fields, {
      id,
      label: "New Field",
      type: "text",
      required: false,
      order: fields.length + 1
    }])
  }

  const removeField = (index: number) => {
    const newFields = [...fields]
    newFields.splice(index, 1)
    setFields(newFields)
  }

  const updateField = (index: number, updates: any) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms/${params.id}?tenantId=${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fields
        })
      })

      if (res.ok) {
        router.push("/dashboard/forms")
      } else {
        alert("Failed to update form")
      }
    } catch (error) {
      console.error("Error updating form:", error)
      alert("Error updating form")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Form</h2>
        <p className="text-muted-foreground">Modify your application form.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Form Title</label>
              <input
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Form Fields</CardTitle>
            <Button type="button" onClick={addField} variant="outline" size="sm">
              + Add Field
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative group">
                <Button
                  type="button"
                  onClick={() => removeField(index)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </Button>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium">Label</label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium">Type</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                    >
                      {FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {(field.type === 'select' || field.type === 'multiselect') && (
                     <div className="grid gap-2 md:col-span-2">
                       <label className="text-xs font-medium">Options (comma separated)</label>
                       <input
                         className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                         value={field.options?.join(', ') || ''}
                         onChange={(e) => updateField(index, { options: e.target.value.split(',').map((s: string) => s.trim()) })}
                       />
                     </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req_${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`req_${field.id}`} className="text-sm">Required Field</label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
