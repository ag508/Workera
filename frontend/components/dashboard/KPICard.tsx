import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: string
}

export default function KPICard({ title, value, icon, trend, color = "var(--emerald)" }: KPICardProps) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[var(--gray-600)]">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color }}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[var(--gray-900)] font-[var(--font-ibm-plex-mono)]">
          {value}
        </div>
        {trend && (
          <p className="text-xs text-[var(--gray-600)] mt-2 flex items-center gap-1">
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            <span>from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
