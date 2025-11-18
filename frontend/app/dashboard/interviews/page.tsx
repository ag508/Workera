import { Card } from "@/components/ui/card"

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)] mb-2">Interviews & Tests</h2>
        <p className="text-[var(--gray-600)]">Schedule and manage candidate interviews</p>
      </div>
      <Card className="border-none shadow-md p-12 text-center">
        <p className="text-[var(--gray-500)]">Interview management coming soon...</p>
      </Card>
    </div>
  )
}
