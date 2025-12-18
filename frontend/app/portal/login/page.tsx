"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getTenantId } from "@/lib/utils"
import AnimatedGridPattern from "@/components/reactbits/AnimatedGridPattern"

export default function CandidateLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const tenantId = getTenantId()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/candidate/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenantId })
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("candidateToken", data.accessToken)
        localStorage.setItem("candidateId", data.candidate.id)
        router.push("/portal/dashboard")
      } else {
        // Mock login fallback for DEMO purposes if backend is not running
        if (email === "demo@workera.ai") {
             localStorage.setItem("candidateToken", "mock-token")
             localStorage.setItem("candidateId", "mock-candidate-id")
             router.push("/portal/dashboard")
             return
        }
        setError("Invalid email or password")
      }
    } catch (err) {
      // Mock login fallback for DEMO purposes
       if (email === "demo@workera.ai") {
             localStorage.setItem("candidateToken", "mock-token")
             localStorage.setItem("candidateId", "mock-candidate-id")
             router.push("/portal/dashboard")
             return
        }
      setError("An error occurred during login")
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
          <CardTitle className="text-2xl font-bold text-gray-900">Candidate Portal</CardTitle>
          <CardDescription>Sign in to manage your applications</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-emerald-600 text-white font-semibold h-11" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

             <div className="mt-4 text-center text-xs text-gray-400">
              Demo Login: demo@workera.ai / any password
            </div>

            <div className="text-center text-sm pt-2">
              Don't have an account?{" "}
              <Link href="/portal/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
