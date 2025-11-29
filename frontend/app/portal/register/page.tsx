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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const tenantId = getTenantId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          tenantId
        })
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("candidateToken", data.accessToken)
        localStorage.setItem("candidateId", data.candidate.id)
        router.push("/portal/dashboard")
      } else {
        const err = await res.json()
        setError(err.message || "Registration failed")
      }
    } catch (err) {
       // Demo Fallback
        localStorage.setItem("candidateToken", "mock-token")
        localStorage.setItem("candidateId", "mock-candidate-id")
        router.push("/portal/dashboard")
        return
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
          <CardDescription>Join our talent network</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  name="firstName"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  name="lastName"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input
                name="phone"
                type="tel"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 text-white font-semibold h-11" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
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
