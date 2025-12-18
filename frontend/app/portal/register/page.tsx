"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getTenantId } from "@/lib/utils"
import AnimatedGridPattern from "@/components/reactbits/AnimatedGridPattern"

export default function CandidateRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const tenantId = getTenantId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tenantId })
      })

      if (res.ok) {
        router.push("/portal/login")
      } else {
         // Mock fallback
        if (formData.email.includes("demo")) {
             router.push("/portal/login")
             return
        }
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      // Mock fallback
      if (formData.email.includes("demo")) {
             router.push("/portal/login")
             return
      }
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden p-4">
       <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="text-primary opacity-30"
      />

      <Card className="z-10 w-full max-w-md border-gray-200 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mb-6 flex justify-center">
            <Image
                src="/images/brand/Workera_Text_logo.png"
                alt="Workera"
                width={180}
                height={60}
                className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription>Join our talent network today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Create a password"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 text-white font-semibold h-11" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm pt-2">
              Already have an account?{" "}
              <Link href="/portal/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
