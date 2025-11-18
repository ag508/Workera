"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ShortlistedCandidate {
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
  aiRationale: string
  selected: boolean
}

export default function ShortlistPage() {
  const [topN, setTopN] = useState(10)
  const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([
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
      avatar: "SJ",
      aiRationale: "Excellent match with 7 years of experience in full-stack development. Strong proficiency in React and Node.js aligns perfectly with job requirements. Located in San Francisco with proven track record in scalable applications.",
      selected: false
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
      avatar: "MC",
      aiRationale: "Strong backend expertise with 5 years focused experience. Docker and Kubernetes skills demonstrate modern DevOps understanding. Python proficiency matches technical stack requirements.",
      selected: false
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
      avatar: "EW",
      aiRationale: "Comprehensive DevOps background with AWS and Infrastructure as Code expertise. 6 years of experience shows maturity. Strong automation skills with Jenkins and Python.",
      selected: false
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
      avatar: "DB",
      aiRationale: "Solid frontend skills with modern frameworks. 4 years of focused experience in UI development. Design collaboration skills with Figma is a plus for cross-functional work.",
      selected: false
    },
    {
      id: "5",
      name: "Lisa Anderson",
      position: "Data Scientist",
      experience: "5 years",
      location: "Boston, MA",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "R"],
      matchScore: 87,
      email: "lisa.a@email.com",
      phone: "+1 (555) 567-8901",
      avatar: "LA",
      aiRationale: "Strong analytical background with 5 years in data science. Machine learning expertise with TensorFlow aligns with AI initiatives. Python and SQL skills enable data-driven decisions.",
      selected: false
    }
  ])

  const toggleSelectAll = () => {
    const allSelected = candidates.every(c => c.selected)
    setCandidates(candidates.map(c => ({ ...c, selected: !allSelected })))
  }

  const toggleSelect = (id: string) => {
    setCandidates(candidates.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ))
  }

  const selectedCount = candidates.filter(c => c.selected).length

  const handleBulkAction = (action: string) => {
    if (selectedCount === 0) {
      alert("Please select at least one candidate")
      return
    }

    const selectedNames = candidates
      .filter(c => c.selected)
      .map(c => c.name)
      .join(", ")

    switch (action) {
      case "interview":
        alert(`Sending interview invites to: ${selectedNames}`)
        break
      case "export":
        alert(`Exporting ${selectedCount} candidate(s) to PDF/CSV`)
        break
      case "email":
        alert(`Opening email composer for ${selectedCount} candidate(s)`)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)] mb-2">AI Shortlist</h2>
        <p className="text-[var(--gray-600)]">Top-ranked candidates with AI-generated match insights</p>
      </div>

      {/* Top N Selector & Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-[var(--gray-700)]">
            Show Top:
          </label>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--emerald)] focus:border-transparent"
          >
            <option value={5}>5 Candidates</option>
            <option value={10}>10 Candidates</option>
            <option value={15}>15 Candidates</option>
            <option value={30}>30 Candidates</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--gray-600)]">
            {selectedCount} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
          >
            {candidates.every(c => c.selected) ? "Deselect All" : "Select All"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleBulkAction("interview")}
            disabled={selectedCount === 0}
          >
            Send Interview Invites
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("export")}
            disabled={selectedCount === 0}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {candidates.slice(0, topN).map((candidate, index) => (
          <Card key={candidate.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={candidate.selected}
                  onChange={() => toggleSelect(candidate.id)}
                  className="mt-1 w-5 h-5 text-[var(--emerald)] border-[var(--gray-300)] rounded focus:ring-[var(--emerald)] cursor-pointer"
                />
                <div className="flex items-start justify-between flex-1">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] flex items-center justify-center text-white font-bold text-xl">
                        {candidate.avatar}
                      </div>
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--gold)] text-white flex items-center justify-center text-xs font-bold">
                        #{index + 1}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{candidate.name}</CardTitle>
                      <CardDescription className="text-base">{candidate.position}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-[var(--gray-600)]">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {candidate.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {candidate.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--emerald)] font-[var(--font-ibm-plex-mono)]">
                      {candidate.matchScore}%
                    </div>
                    <p className="text-xs text-[var(--gray-500)]">AI Match Score</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-24 space-y-4">
              {/* AI Rationale */}
              <div className="p-4 bg-gradient-to-br from-[var(--mint)]/10 to-[var(--emerald)]/10 rounded-lg border border-[var(--emerald)]/20">
                <div className="flex items-start gap-2 mb-2">
                  <svg className="w-5 h-5 text-[var(--emerald)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-[var(--emerald)] mb-1">AI Match Analysis</p>
                    <p className="text-sm text-[var(--gray-700)]">{candidate.aiRationale}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm font-medium text-[var(--gray-700)] mb-2">Key Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[var(--gray-100)] text-[var(--gray-700)] rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[var(--gray-200)]">
                <Button variant="default" size="sm">
                  View Full Resume
                </Button>
                <Button variant="outline" size="sm">
                  Send Interview Link
                </Button>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
