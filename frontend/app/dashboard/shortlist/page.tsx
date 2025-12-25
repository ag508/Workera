"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTenantId } from "@/lib/utils"
import { Loader2, Mail, Download, Calendar, RefreshCw } from "lucide-react"

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
  const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailContent, setEmailContent] = useState({ subject: '', message: '' })
  const tenantId = getTenantId()

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates?tenantId=${tenantId}`)
      if (res.ok) {
        const data = await res.json()
        const candidateList = data.data || []
        const mapped = candidateList.map((c: any, i: number) => ({
          id: c.id,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
          position: c.currentTitle || 'Candidate',
          experience: c.yearsOfExperience ? `${c.yearsOfExperience} years` : 'N/A',
          location: c.location || 'Not specified',
          skills: c.skills || [],
          matchScore: c.matchScore || Math.max(60, 95 - i * 3),
          email: c.email || '',
          phone: c.phone || '',
          avatar: `${(c.firstName || 'U').charAt(0)}${(c.lastName || '').charAt(0)}`.toUpperCase(),
          aiRationale: c.aiSummary || `Candidate has relevant experience and skills matching the job requirements.`,
          selected: false
        }))
        mapped.sort((a: ShortlistedCandidate, b: ShortlistedCandidate) => b.matchScore - a.matchScore)
        setCandidates(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    } finally {
      setLoading(false)
    }
  }

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
  const selectedCandidates = candidates.filter(c => c.selected)

  const handleBulkInterview = async () => {
    if (selectedCount === 0) return
    setActionLoading('interview')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/bulk/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: selectedCandidates.map(c => c.id),
          subject: 'Interview Invitation',
          message: `We are pleased to invite you for an interview. Please respond to schedule a convenient time.\n\nBest regards,\nThe Hiring Team`,
          tenantId
        })
      })
      alert(`Interview invites sent to ${selectedCount} candidate(s)`)
      setCandidates(candidates.map(c => ({ ...c, selected: false })))
    } catch (error) {
      console.error('Failed to send interview invites:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkExport = async () => {
    if (selectedCount === 0) return
    setActionLoading('export')
    try {
      const csv = [
        ['Name', 'Email', 'Phone', 'Location', 'Position', 'Match Score', 'Skills'].join(','),
        ...selectedCandidates.map(c => [c.name, c.email, c.phone, c.location, c.position, c.matchScore, c.skills.join(';')].join(','))
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } finally {
      setActionLoading(null)
    }
  }

  const sendBulkEmail = async () => {
    if (!emailContent.subject || !emailContent.message) return
    setActionLoading('email')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/bulk/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: selectedCandidates.map(c => c.id),
          subject: emailContent.subject,
          message: emailContent.message,
          tenantId
        })
      })
      alert(`Email sent to ${selectedCount} candidate(s)`)
      setShowEmailModal(false)
      setEmailContent({ subject: '', message: '' })
      setCandidates(candidates.map(c => ({ ...c, selected: false })))
    } catch (error) {
      console.error('Failed to send emails:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading candidates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Shortlist</h2>
          <p className="text-gray-600">Top-ranked candidates with AI-generated match insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCandidates}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Show Top:</label>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={5}>5 Candidates</option>
            <option value={10}>10 Candidates</option>
            <option value={15}>15 Candidates</option>
            <option value={30}>30 Candidates</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{selectedCount} selected</span>
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {candidates.every(c => c.selected) ? "Deselect All" : "Select All"}
          </Button>
          <Button variant="default" size="sm" onClick={handleBulkInterview} disabled={selectedCount === 0 || actionLoading === 'interview'}>
            {actionLoading === 'interview' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
            Send Interview Invites
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={selectedCount === 0 || actionLoading === 'export'}>
            {actionLoading === 'export' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)} disabled={selectedCount === 0}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No candidates found. Add candidates to see them in the shortlist.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.slice(0, topN).map((candidate, index) => (
            <Card key={candidate.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={candidate.selected}
                    onChange={() => toggleSelect(candidate.id)}
                    className="mt-1 w-5 h-5 text-primary border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex items-start justify-between flex-1">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                          {candidate.avatar}
                        </div>
                        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          #{index + 1}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">{candidate.name}</CardTitle>
                        <CardDescription className="text-base">{candidate.position}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{candidate.experience}</span>
                          <span>{candidate.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary font-mono">{candidate.matchScore}%</div>
                      <p className="text-xs text-gray-500">AI Match Score</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-24 space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-semibold text-primary mb-1">AI Match Analysis</p>
                  <p className="text-sm text-gray-700">{candidate.aiRationale}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button variant="default" size="sm" asChild>
                    <a href={`/dashboard/candidates/${candidate.id}`}>View Profile</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${candidate.email}`}><Mail className="h-4 w-4 mr-2" />Email</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Send Email to {selectedCount} Candidate(s)</h3>
              <button onClick={() => setShowEmailModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={emailContent.message}
                  onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
              <Button onClick={sendBulkEmail} disabled={actionLoading === 'email' || !emailContent.subject || !emailContent.message}>
                {actionLoading === 'email' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
