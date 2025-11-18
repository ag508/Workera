import { Card } from "@/components/ui/card"

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gray-900)] mb-2">Job Descriptions</h2>
        <p className="text-[var(--gray-600)]">Manage all your job descriptions</p>
      </div>
      <Card className="border-none shadow-md p-12 text-center">
        <p className="text-[var(--gray-500)]">Job descriptions management coming soon...</p>
      </Card>
    </div>
  )
}
