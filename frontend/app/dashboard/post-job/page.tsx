"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ChannelIcon from "@/components/dashboard/ChannelIcon"

export default function PostJobPage() {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [channels, setChannels] = useState([
    { name: "LinkedIn", enabled: true, status: "draft" },
    { name: "Indeed", enabled: true, status: "draft" },
    { name: "Workday", enabled: false, status: "draft" },
    { name: "Monster", enabled: false, status: "draft" },
    { name: "Glassdoor", enabled: true, status: "draft" },
    { name: "Company Website", enabled: true, status: "draft" }
  ])

  const generateJobDescription = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title")
      return
    }

    setIsGenerating(true)
    
    try {
      // Simulate AI generation (will be replaced with actual Google AI API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generatedJD = `# ${jobTitle}

## About the Role
We are seeking a talented ${jobTitle} to join our dynamic team. This role offers an exciting opportunity to work on cutting-edge projects and make a significant impact on our organization.

## Key Responsibilities
- Lead and execute strategic initiatives in your domain
- Collaborate with cross-functional teams to deliver high-quality solutions
- Mentor junior team members and contribute to team growth
- Drive innovation and continuous improvement in processes and technologies
- Participate in architectural decisions and technical planning

## Required Qualifications
- Bachelor's degree in relevant field or equivalent experience
- 5+ years of experience in a similar role
- Strong technical skills and problem-solving abilities
- Excellent communication and collaboration skills
- Proven track record of delivering results in fast-paced environments

## Preferred Qualifications
- Master's degree in related field
- Experience with modern technologies and frameworks
- Leadership experience and mentoring capabilities
- Industry certifications relevant to the role

## What We Offer
- Competitive salary and comprehensive benefits package
- Flexible work arrangements including remote options
- Professional development opportunities and training budget
- Collaborative and inclusive work environment
- Cutting-edge technology stack and tools

## How to Apply
Submit your resume and portfolio through our application portal. We look forward to hearing from you!`

      setJobDescription(generatedJD)
    } catch (error) {
      console.error("Error generating job description:", error)
      alert("Failed to generate job description. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleChannel = (index: number) => {
    const updated = [...channels]
    updated[index].enabled = !updated[index].enabled
    setChannels(updated)
  }

  const postJob = () => {
    if (!jobDescription.trim()) {
      alert("Please enter or generate a job description")
      return
    }

    const enabledChannels = channels.filter(c => c.enabled)
    if (enabledChannels.length === 0) {
      alert("Please select at least one posting channel")
      return
    }

    // Simulate posting
    const updated = channels.map(channel => ({
      ...channel,
      status: channel.enabled ? "posted" : "draft"
    }))
    setChannels(updated)
    alert(`Job posted successfully to ${enabledChannels.length} channel(s)!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)] mb-2">Create Job Description</h2>
        <p className="text-[var(--gray-600)]">Generate AI-powered job descriptions and post across multiple platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job Description Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Enter job details or use AI to generate a complete job description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--emerald)] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={generateJobDescription}
                  disabled={isGenerating}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Generate JD
                    </>
                  )}
                </Button>
                <span className="text-sm text-[var(--gray-500)]">
                  or write your own below
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Enter or generate job description..."
                  rows={18}
                  className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--emerald)] focus:border-transparent font-mono text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={postJob} variant="default" size="lg">
                  Post Job
                </Button>
                <Button variant="outline" size="lg">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Publishing Channels */}
        <div className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Publishing Channels</CardTitle>
              <CardDescription>Select platforms to post this job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {channels.map((channel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--gray-200)] hover:border-[var(--emerald)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] flex items-center justify-center text-white">
                        <ChannelIcon channel={channel.name} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--gray-900)]">{channel.name}</p>
                        <p className="text-xs text-[var(--gray-500)] capitalize">{channel.status}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channel.enabled}
                        onChange={() => toggleChannel(index)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--gray-300)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--emerald)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--emerald)]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] text-white">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Generate professional JDs in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Optimized for SEO and ATS compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Industry-specific templates and best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Multi-platform posting with one click</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
