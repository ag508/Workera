"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const tenantId = "default-tenant-id"

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const candidateId = localStorage.getItem("candidateId")
    if (!candidateId) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/profile?candidateId=${candidateId}&tenantId=${tenantId}`)
      if (res.ok) {
        setProfile(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch profile", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const candidateId = localStorage.getItem("candidateId")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          tenantId,
          updates: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            location: profile.location,
            skills: typeof profile.skills === 'string' ? profile.skills.split(',') : profile.skills
          }
        })
      })

      if (res.ok) {
        alert("Profile updated successfully")
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>Failed to load profile</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your personal information</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  value={profile.firstName || ''}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  value={profile.lastName || ''}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                value={profile.email || ''}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input
                value={profile.phone || ''}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input
                value={profile.location || ''}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Skills (comma separated)</label>
              <input
                value={Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''}
                onChange={(e) => setProfile({...profile, skills: e.target.value.split(',').map((s: string) => s.trim())})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
