"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Candidate {
  id: string
  name: string
  position: string
  experience: string
  location: string
  skills: string[]
  matchScore: number
  email: string
  phone: string
  avatar: string
}

export default function CandidateSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])

  // Mock candidates
  const mockCandidates: Candidate[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      position: "Senior Full Stack Developer",
      experience: "7 years",
      location: "San Francisco, CA",
      skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
      matchScore: 96,
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      avatar: "SJ"
    },
    {
      id: "2",
      name: "Michael Chen",
      position: "Backend Engineer",
      experience: "5 years",
      location: "New York, NY",
      skills: ["Python", "Django", "Docker", "Kubernetes", "MongoDB"],
      matchScore: 94,
      email: "m.chen@email.com",
      phone: "+1 (555) 234-5678",
      avatar: "MC"
    },
    {
      id: "3",
      name: "Emma Williams",
      position: "DevOps Engineer",
      experience: "6 years",
      location: "Austin, TX",
      skills: ["AWS", "Terraform", "Jenkins", "Python", "Linux"],
      matchScore: 91,
      email: "emma.w@email.com",
      phone: "+1 (555) 345-6789",
      avatar: "EW"
    },
    {
      id: "4",
      name: "David Brown",
      position: "Frontend Developer",
      experience: "4 years",
      location: "Seattle, WA",
      skills: ["React", "Vue.js", "CSS", "JavaScript", "Figma"],
      matchScore: 89,
      email: "d.brown@email.com",
      phone: "+1 (555) 456-7890",
      avatar: "DB"
    }
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query")
      return
    }

    setIsSearching(true)
    
    try {
      // Simulate AI-powered search
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Extract filters from natural language query
      const filters: string[] = []
      if (searchQuery.toLowerCase().includes("python")) filters.push("Python")
      if (searchQuery.toLowerCase().includes("react")) filters.push("React")
      if (searchQuery.toLowerCase().includes("5") || searchQuery.toLowerCase().includes("five")) filters.push("5+ years experience")
      if (searchQuery.toLowerCase().includes("san francisco") || searchQuery.toLowerCase().includes("sf")) filters.push("San Francisco")
      if (searchQuery.toLowerCase().includes("new york") || searchQuery.toLowerCase().includes("ny")) filters.push("New York")
      
      setActiveFilters(filters)
      setCandidates(mockCandidates)
    } catch (error) {
      console.error("Search error:", error)
      alert("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter))
  }

  const exampleQueries = [
    "Find candidates with 3-5 years backend experience in Python, based in San Francisco",
    "Senior React developers in New York with strong communication skills",
    "DevOps engineers with AWS and Kubernetes experience",
    "Full stack developers with TypeScript and Node.js in remote locations"
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)] mb-2">Candidate Search</h2>
        <p className="text-[var(--gray-600)]">Use natural language to find the perfect candidates</p>
      </div>

      {/* Search Bar */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>AI-Powered Search</CardTitle>
          <CardDescription>
            Describe what you're looking for in natural language, and AI will find matching candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Find candidates with 5+ years experience in Python and React, located in San Francisco, with strong communication skills..."
                rows={3}
                className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--emerald)] focus:border-transparent resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSearch()
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              variant="default"
              size="lg"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Candidates
                </>
              )}
            </Button>
            <span className="text-sm text-[var(--gray-500)]">
              Press Cmd/Ctrl + Enter to search
            </span>
          </div>

          {/* Example Queries */}
          <div>
            <p className="text-sm font-medium text-[var(--gray-700)] mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(query)}
                  className="text-xs px-3 py-1.5 bg-[var(--gray-100)] hover:bg-[var(--gray-200)] text-[var(--gray-700)] rounded-full transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[var(--gray-700)]">Active Filters:</span>
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--emerald)] text-white rounded-full text-sm"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {candidates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--gray-900)]">
              Found {candidates.length} matching candidates
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export Results
              </Button>
              <Button variant="default" size="sm">
                Shortlist All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] flex items-center justify-center text-white font-bold text-lg">
                        {candidate.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{candidate.name}</CardTitle>
                        <CardDescription>{candidate.position}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--emerald)] font-[var(--font-ibm-plex-mono)]">
                        {candidate.matchScore}%
                      </div>
                      <p className="text-xs text-[var(--gray-500)]">Match</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--gray-500)] mb-1">Experience</p>
                      <p className="font-medium text-[var(--gray-900)]">{candidate.experience}</p>
                    </div>
                    <div>
                      <p className="text-[var(--gray-500)] mb-1">Location</p>
                      <p className="font-medium text-[var(--gray-900)]">{candidate.location}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[var(--gray-500)] mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[var(--gray-100)] text-[var(--gray-700)] rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-[var(--gray-200)]">
                    <Button variant="default" size="sm" className="flex-1">
                      View Resume
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Shortlist
                    </Button>
                    <Button variant="outline" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
