import { Card } from "@/components/ui/card"

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)] mb-2">Resume Database</h2>
        <p className="text-[var(--gray-600)]">Browse and manage all parsed resumes</p>
      </div>
      <Card className="border-none shadow-md p-12 text-center">
        <p className="text-[var(--gray-500)]">Resume database coming soon...</p>
      </Card>
    </div>
  )
}
