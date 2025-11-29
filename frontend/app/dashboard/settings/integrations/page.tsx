"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTenantId } from "@/lib/utils"

export default function IntegrationsSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>({
    linkedin: {},
    workday: {},
    naukri: {},
    jobBoards: []
  })

  // Mock tenant ID - in real app this comes from auth context
  const tenantId = getTenantId()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/settings?tenantId=${tenantId}`)
      if (res.ok) {
        const data = await res.json()
        setSettings(data || { linkedin: {}, workday: {}, naukri: {}, jobBoards: [] })
      }
    } catch (error) {
      console.error("Failed to fetch settings", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string, data: any) => {
    const newSettings = { ...settings, [section]: data }
    setSettings(newSettings)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/settings?tenantId=${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      })
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Failed to save settings", error)
      alert("Failed to save settings")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integration Settings</h2>
        <p className="text-muted-foreground">Configure your external connections.</p>
      </div>

      <div className="grid gap-6">
        {/* LinkedIn Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Integration</CardTitle>
            <CardDescription>Configure LinkedIn for job posting and candidate sourcing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSave("linkedin", {
                clientId: formData.get("clientId"),
                clientSecret: formData.get("clientSecret"),
                accessToken: formData.get("accessToken"),
                organizationId: formData.get("organizationId"),
              })
            }}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Client ID</label>
                <input
                  name="clientId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.linkedin?.clientId}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Client Secret</label>
                <input
                  name="clientSecret"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.linkedin?.clientSecret}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Access Token</label>
                <input
                  name="accessToken"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.linkedin?.accessToken}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Organization ID</label>
                <input
                  name="organizationId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.linkedin?.organizationId}
                />
              </div>
              <Button type="submit">Save LinkedIn Settings</Button>
            </form>
          </CardContent>
        </Card>

        {/* Workday Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Workday Integration</CardTitle>
            <CardDescription>Connect with Workday HCM.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSave("workday", {
                tenantName: formData.get("tenantName"),
                username: formData.get("username"),
                baseUrl: formData.get("baseUrl"),
                password: formData.get("password"),
              })
            }}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tenant Name</label>
                <input
                  name="tenantName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.workday?.tenantName}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Base URL</label>
                <input
                  name="baseUrl"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.workday?.baseUrl}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Username</label>
                <input
                  name="username"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.workday?.username}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.workday?.password}
                />
              </div>
              <Button type="submit">Save Workday Settings</Button>
            </form>
          </CardContent>
        </Card>

        {/* Naukri Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Naukri Integration</CardTitle>
            <CardDescription>Configure Naukri.com recruitment services.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSave("naukri", {
                accountId: formData.get("accountId"),
                apiKey: formData.get("apiKey"),
              })
            }}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Account ID</label>
                <input
                  name="accountId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.naukri?.accountId}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">API Key</label>
                <input
                  name="apiKey"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  defaultValue={settings.naukri?.apiKey}
                />
              </div>
              <Button type="submit">Save Naukri Settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
