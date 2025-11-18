import KPICard from "@/components/dashboard/KPICard"
import ActivityIcon from "@/components/dashboard/ActivityIcon"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function DashboardPage() {
  const kpis = [
    {
      title: "Pending Job Descriptions",
      value: "12",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      trend: { value: "8%", isPositive: false },
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Active Job Postings",
      value: "28",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      trend: { value: "12%", isPositive: true },
      color: "var(--emerald)"
    },
    {
      title: "Applications Received",
      value: "1,247",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      trend: { value: "24%", isPositive: true },
      color: "var(--mint)"
    },
    {
      title: "Resumes Parsed",
      value: "1,189",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      trend: { value: "18%", isPositive: true },
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Top Matches Found",
      value: "456",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: "31%", isPositive: true },
      color: "var(--gold)"
    },
    {
      title: "AI Insights Generated",
      value: "892",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      trend: { value: "42%", isPositive: true },
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    }
  ]

  const recentActivity = [
    { action: "Resume parsed", candidate: "John Smith - Senior Developer", time: "5 minutes ago", type: "parsed" },
    { action: "Job posted", job: "Backend Engineer - Remote", time: "12 minutes ago", type: "posted" },
    { action: "Match found", candidate: "Sarah Johnson - 94% match", time: "23 minutes ago", type: "match" },
    { action: "Interview scheduled", candidate: "Michael Chen", time: "1 hour ago", type: "interview" },
    { action: "Application received", job: "Frontend Developer", time: "2 hours ago", type: "application" }
  ]

  const topCandidates = [
    { name: "Emma Williams", position: "Full Stack Developer", match: 96, skills: "React, Node.js, Python" },
    { name: "David Brown", position: "DevOps Engineer", match: 94, skills: "AWS, Docker, Kubernetes" },
    { name: "Lisa Anderson", position: "Data Scientist", match: 92, skills: "Python, ML, TensorFlow" },
    { name: "James Wilson", position: "Product Manager", match: 89, skills: "Agile, Strategy, Analytics" }
  ]

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your recruitment pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-[var(--gray-200)] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] flex items-center justify-center text-white">
                    <ActivityIcon type={activity.type} className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--gray-900)]">{activity.action}</p>
                    <p className="text-sm text-[var(--gray-600)]">{activity.candidate || activity.job}</p>
                    <p className="text-xs text-[var(--gray-500)] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Candidates */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Top Candidates This Week</CardTitle>
            <CardDescription>Highest matching candidates from AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCandidates.map((candidate, index) => (
                <div key={index} className="flex items-center gap-3 pb-3 border-b border-[var(--gray-200)] last:border-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] flex items-center justify-center text-white font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--gray-900)]">{candidate.name}</p>
                    <p className="text-xs text-[var(--gray-600)]">{candidate.position}</p>
                    <p className="text-xs text-[var(--gray-500)] mt-1">{candidate.skills}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[var(--emerald)] font-[var(--font-ibm-plex-mono)]">
                      {candidate.match}%
                    </div>
                    <p className="text-xs text-[var(--gray-500)]">Match</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview Chart */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Recruitment Pipeline Overview</CardTitle>
          <CardDescription>Current status of candidates across stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: "Applications", count: 1247, percentage: 100, color: "var(--gray-400)" },
              { stage: "Resumes Parsed", count: 1189, percentage: 95, color: "var(--mint)" },
              { stage: "Matches Found", count: 456, percentage: 37, color: "var(--emerald)" },
              { stage: "Shortlisted", count: 142, percentage: 11, color: "var(--gold)" },
              { stage: "Interviews Scheduled", count: 58, percentage: 5, color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
            ].map((stage, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[var(--gray-700)]">{stage.stage}</span>
                  <span className="text-sm font-bold text-[var(--gray-900)] font-[var(--font-ibm-plex-mono)]">
                    {stage.count}
                  </span>
                </div>
                <div className="w-full h-3 bg-[var(--gray-200)] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stage.percentage}%`,
                      background: stage.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
