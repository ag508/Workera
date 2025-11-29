"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("candidateToken")
    if (!token && !pathname.includes("/login") && !pathname.includes("/register")) {
      router.push("/portal/login")
    }
  }, [pathname, router])

  if (!mounted) return null

  // Don't show sidebar for auth pages
  if (pathname.includes("/login") || pathname.includes("/register")) {
    return <>{children}</>
  }

  const handleLogout = () => {
    localStorage.removeItem("candidateToken")
    localStorage.removeItem("candidateId")
    router.push("/portal/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal/dashboard" className="font-bold text-xl text-gray-900">
              Candidate Portal
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/portal/dashboard" className={`text-sm font-medium ${pathname === '/portal/dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                Dashboard
              </Link>
              <Link href="/portal/jobs" className={`text-sm font-medium ${pathname === '/portal/jobs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                Browse Jobs
              </Link>
              <Link href="/portal/applications" className={`text-sm font-medium ${pathname === '/portal/applications' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                My Applications
              </Link>
              <Link href="/portal/profile" className={`text-sm font-medium ${pathname === '/portal/profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                Profile
              </Link>
            </nav>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-red-600">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
