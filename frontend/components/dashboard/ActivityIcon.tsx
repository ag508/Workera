import { CheckCircle2, FileText, Star, Calendar, Mail, LucideIcon } from "lucide-react"

interface ActivityIconProps {
  type: string
  className?: string
}

export default function ActivityIcon({ type, className = "w-5 h-5" }: ActivityIconProps) {
  const iconMap: Record<string, LucideIcon> = {
    "parsed": CheckCircle2,
    "posted": FileText,
    "match": Star,
    "interview": Calendar,
    "application": Mail
  }

  const Icon = iconMap[type] || CheckCircle2
  return <Icon className={className} />
}
