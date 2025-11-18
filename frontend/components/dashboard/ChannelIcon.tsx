import { Briefcase, Search, BarChart3, Building2, Globe, LucideIcon } from "lucide-react"

interface ChannelIconProps {
  channel: string
  className?: string
}

export default function ChannelIcon({ channel, className = "w-5 h-5" }: ChannelIconProps) {
  const iconMap: Record<string, LucideIcon> = {
    "LinkedIn": Briefcase,
    "Indeed": Search,
    "Workday": BarChart3,
    "Monster": Building2,
    "Glassdoor": Building2,
    "Company Website": Globe
  }

  const Icon = iconMap[channel] || Globe
  return <Icon className={className} />
}
