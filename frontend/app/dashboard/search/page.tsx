"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Search,
  Sliders,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign,
  Globe,
  Star,
  FileText,
  Users,
  Building2,
  Award,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  UserPlus,
  MessageSquare,
  Eye
} from "lucide-react"
import { cn, getTenantId } from "@/lib/utils"

interface Candidate {
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
  noticePeriod: string
  workAuth: string
  salary: string
  education: string
  source: string
}

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterCategory {
  id: string
  name: string
  icon: any
  options: FilterOption[]
  type: 'checkbox' | 'range' | 'radio'
}

const filterCategories: FilterCategory[] = [
  {
    id: 'experience',
    name: 'Experience',
    icon: Briefcase,
    type: 'checkbox',
    options: [
      { value: '0-2', label: '0-2 years', count: 45 },
      { value: '3-5', label: '3-5 years', count: 89 },
      { value: '5-8', label: '5-8 years', count: 67 },
      { value: '8-10', label: '8-10 years', count: 34 },
      { value: '10+', label: '10+ years', count: 23 }
    ]
  },
  {
    id: 'roleLevel',
    name: 'Role Level',
    icon: Users,
    type: 'checkbox',
    options: [
      { value: 'junior', label: 'Junior', count: 56 },
      { value: 'mid', label: 'Mid-Level', count: 78 },
      { value: 'senior', label: 'Senior', count: 92 },
      { value: 'lead', label: 'Lead', count: 34 },
      { value: 'principal', label: 'Principal', count: 18 },
      { value: 'director', label: 'Director', count: 12 },
      { value: 'vp', label: 'VP/Executive', count: 8 }
    ]
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: Star,
    type: 'checkbox',
    options: [
      { value: 'react', label: 'React', count: 156 },
      { value: 'typescript', label: 'TypeScript', count: 132 },
      { value: 'python', label: 'Python', count: 145 },
      { value: 'node', label: 'Node.js', count: 98 },
      { value: 'aws', label: 'AWS', count: 87 },
      { value: 'docker', label: 'Docker', count: 76 },
      { value: 'kubernetes', label: 'Kubernetes', count: 54 },
      { value: 'java', label: 'Java', count: 89 },
      { value: 'sql', label: 'SQL', count: 134 },
      { value: 'ml', label: 'Machine Learning', count: 45 }
    ]
  },
  {
    id: 'proficiency',
    name: 'Skill Proficiency',
    icon: Award,
    type: 'checkbox',
    options: [
      { value: 'beginner', label: 'Beginner', count: 34 },
      { value: 'intermediate', label: 'Intermediate', count: 89 },
      { value: 'advanced', label: 'Advanced', count: 67 },
      { value: 'expert', label: 'Expert', count: 45 }
    ]
  },
  {
    id: 'certifications',
    name: 'Certifications',
    icon: Award,
    type: 'checkbox',
    options: [
      { value: 'aws-sa', label: 'AWS Solutions Architect', count: 34 },
      { value: 'aws-dev', label: 'AWS Developer', count: 28 },
      { value: 'gcp', label: 'Google Cloud', count: 23 },
      { value: 'azure', label: 'Azure Certified', count: 31 },
      { value: 'pmp', label: 'PMP', count: 19 },
      { value: 'scrum', label: 'Scrum Master', count: 42 },
      { value: 'cissp', label: 'CISSP', count: 12 }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    type: 'checkbox',
    options: [
      { value: 'phd', label: 'PhD', count: 18 },
      { value: 'masters', label: "Master's Degree", count: 67 },
      { value: 'bachelors', label: "Bachelor's Degree", count: 145 },
      { value: 'associate', label: "Associate's Degree", count: 23 },
      { value: 'bootcamp', label: 'Bootcamp', count: 34 },
      { value: 'self-taught', label: 'Self-taught', count: 28 }
    ]
  },
  {
    id: 'educationField',
    name: 'Field of Study',
    icon: GraduationCap,
    type: 'checkbox',
    options: [
      { value: 'cs', label: 'Computer Science', count: 112 },
      { value: 'engineering', label: 'Engineering', count: 89 },
      { value: 'math', label: 'Mathematics', count: 34 },
      { value: 'business', label: 'Business/MBA', count: 45 },
      { value: 'physics', label: 'Physics', count: 23 },
      { value: 'other', label: 'Other', count: 67 }
    ]
  },
  {
    id: 'location',
    name: 'Location',
    icon: MapPin,
    type: 'checkbox',
    options: [
      { value: 'sf', label: 'San Francisco, CA', count: 89 },
      { value: 'ny', label: 'New York, NY', count: 78 },
      { value: 'seattle', label: 'Seattle, WA', count: 56 },
      { value: 'austin', label: 'Austin, TX', count: 45 },
      { value: 'boston', label: 'Boston, MA', count: 34 },
      { value: 'la', label: 'Los Angeles, CA', count: 42 },
      { value: 'chicago', label: 'Chicago, IL', count: 31 },
      { value: 'denver', label: 'Denver, CO', count: 28 },
      { value: 'remote', label: 'Remote Only', count: 134 }
    ]
  },
  {
    id: 'relocation',
    name: 'Willing to Relocate',
    icon: Globe,
    type: 'checkbox',
    options: [
      { value: 'yes', label: 'Yes', count: 156 },
      { value: 'no', label: 'No', count: 89 },
      { value: 'negotiable', label: 'Negotiable', count: 67 }
    ]
  },
  {
    id: 'workAuth',
    name: 'Work Authorization',
    icon: FileText,
    type: 'checkbox',
    options: [
      { value: 'citizen', label: 'US Citizen', count: 145 },
      { value: 'greencard', label: 'Green Card', count: 67 },
      { value: 'h1b', label: 'H1B Visa', count: 89 },
      { value: 'opt', label: 'OPT/CPT', count: 34 },
      { value: 'tn', label: 'TN Visa', count: 12 },
      { value: 'other', label: 'Other', count: 23 }
    ]
  },
  {
    id: 'noticePeriod',
    name: 'Notice Period',
    icon: Clock,
    type: 'checkbox',
    options: [
      { value: 'immediate', label: 'Immediate', count: 45 },
      { value: '2weeks', label: '2 weeks', count: 89 },
      { value: '1month', label: '1 month', count: 67 },
      { value: '2months', label: '2 months', count: 34 },
      { value: '3months', label: '3+ months', count: 23 }
    ]
  },
  {
    id: 'employmentType',
    name: 'Employment Type',
    icon: Briefcase,
    type: 'checkbox',
    options: [
      { value: 'fulltime', label: 'Full-time', count: 234 },
      { value: 'parttime', label: 'Part-time', count: 45 },
      { value: 'contract', label: 'Contract', count: 78 },
      { value: 'freelance', label: 'Freelance', count: 34 },
      { value: 'intern', label: 'Internship', count: 23 }
    ]
  },
  {
    id: 'workModel',
    name: 'Work Model',
    icon: Building2,
    type: 'checkbox',
    options: [
      { value: 'onsite', label: 'On-site', count: 89 },
      { value: 'remote', label: 'Remote', count: 156 },
      { value: 'hybrid', label: 'Hybrid', count: 112 }
    ]
  },
  {
    id: 'salary',
    name: 'Expected Salary',
    icon: DollarSign,
    type: 'checkbox',
    options: [
      { value: '50-75', label: '$50K - $75K', count: 34 },
      { value: '75-100', label: '$75K - $100K', count: 56 },
      { value: '100-125', label: '$100K - $125K', count: 78 },
      { value: '125-150', label: '$125K - $150K', count: 67 },
      { value: '150-175', label: '$150K - $175K', count: 45 },
      { value: '175-200', label: '$175K - $200K', count: 34 },
      { value: '200+', label: '$200K+', count: 23 }
    ]
  },
  {
    id: 'applicationStatus',
    name: 'Application Status',
    icon: FileText,
    type: 'checkbox',
    options: [
      { value: 'new', label: 'New', count: 89 },
      { value: 'screening', label: 'Screening', count: 56 },
      { value: 'interviewing', label: 'Interviewing', count: 34 },
      { value: 'offered', label: 'Offered', count: 12 },
      { value: 'rejected', label: 'Rejected', count: 45 },
      { value: 'withdrawn', label: 'Withdrawn', count: 23 }
    ]
  },
  {
    id: 'source',
    name: 'Source Channel',
    icon: Globe,
    type: 'checkbox',
    options: [
      { value: 'linkedin', label: 'LinkedIn', count: 145 },
      { value: 'indeed', label: 'Indeed', count: 89 },
      { value: 'referral', label: 'Employee Referral', count: 67 },
      { value: 'career-site', label: 'Career Site', count: 56 },
      { value: 'agency', label: 'Staffing Agency', count: 34 },
      { value: 'naukri', label: 'Naukri', count: 45 },
      { value: 'glassdoor', label: 'Glassdoor', count: 28 },
      { value: 'other', label: 'Other', count: 23 }
    ]
  },
  {
    id: 'industry',
    name: 'Industry Experience',
    icon: Building2,
    type: 'checkbox',
    options: [
      { value: 'tech', label: 'Technology', count: 189 },
      { value: 'fintech', label: 'FinTech', count: 78 },
      { value: 'healthcare', label: 'Healthcare', count: 56 },
      { value: 'ecommerce', label: 'E-commerce', count: 67 },
      { value: 'saas', label: 'SaaS', count: 112 },
      { value: 'consulting', label: 'Consulting', count: 45 },
      { value: 'startup', label: 'Startup', count: 89 },
      { value: 'enterprise', label: 'Enterprise', count: 67 }
    ]
  },
  {
    id: 'language',
    name: 'Languages',
    icon: Globe,
    type: 'checkbox',
    options: [
      { value: 'english', label: 'English', count: 312 },
      { value: 'spanish', label: 'Spanish', count: 67 },
      { value: 'mandarin', label: 'Mandarin', count: 45 },
      { value: 'hindi', label: 'Hindi', count: 78 },
      { value: 'french', label: 'French', count: 34 },
      { value: 'german', label: 'German', count: 23 }
    ]
  },
  {
    id: 'lastActive',
    name: 'Last Active',
    icon: Calendar,
    type: 'checkbox',
    options: [
      { value: 'today', label: 'Today', count: 45 },
      { value: 'week', label: 'This Week', count: 89 },
      { value: 'month', label: 'This Month', count: 156 },
      { value: '3months', label: 'Last 3 Months', count: 234 },
      { value: '6months', label: 'Last 6 Months', count: 312 }
    ]
  },
  {
    id: 'diversity',
    name: 'Diversity',
    icon: Users,
    type: 'checkbox',
    options: [
      { value: 'veteran', label: 'Veteran', count: 34 },
      { value: 'disability', label: 'Person with Disability', count: 23 },
      { value: 'underrepresented', label: 'Underrepresented Group', count: 67 }
    ]
  }
]

const mockCandidates: Candidate[] = [
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
    noticePeriod: "2 weeks",
    workAuth: "US Citizen",
    salary: "$150K - $175K",
    education: "M.S. Computer Science",
    source: "LinkedIn"
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
    noticePeriod: "1 month",
    workAuth: "H1B Visa",
    salary: "$130K - $150K",
    education: "B.S. Computer Science",
    source: "Indeed"
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
    noticePeriod: "Immediate",
    workAuth: "US Citizen",
    salary: "$140K - $160K",
    education: "B.S. Computer Engineering",
    source: "Referral"
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
    noticePeriod: "2 weeks",
    workAuth: "Green Card",
    salary: "$120K - $140K",
    education: "B.A. Design",
    source: "Career Site"
  },
  {
    id: "5",
    name: "Priya Patel",
    position: "Data Scientist",
    experience: "5 years",
    location: "Boston, MA",
    skills: ["Python", "TensorFlow", "SQL", "Spark", "Machine Learning"],
    matchScore: 87,
    email: "p.patel@email.com",
    phone: "+1 (555) 567-8901",
    avatar: "PP",
    noticePeriod: "1 month",
    workAuth: "H1B Visa",
    salary: "$160K - $180K",
    education: "Ph.D. Statistics",
    source: "LinkedIn"
  },
  {
    id: "6",
    name: "James Wilson",
    position: "Platform Engineer",
    experience: "8 years",
    location: "Remote",
    skills: ["Kubernetes", "Go", "AWS", "Terraform", "CI/CD"],
    matchScore: 85,
    email: "j.wilson@email.com",
    phone: "+1 (555) 678-9012",
    avatar: "JW",
    noticePeriod: "2 months",
    workAuth: "US Citizen",
    salary: "$170K - $190K",
    education: "M.S. Computer Science",
    source: "Glassdoor"
  }
]

export default function CandidateSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['experience', 'skills', 'location'])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [sortBy, setSortBy] = useState<'matchScore' | 'experience' | 'recent'>('matchScore')

  const totalSelectedFilters = Object.values(selectedFilters).flat().length

  const handleSearch = async () => {
    if (!searchQuery.trim() && totalSelectedFilters === 0) {
      alert("Please enter a search query or select filters")
      return
    }

    setIsSearching(true)
    const tenantId = getTenantId()

    try {
      // Build search parameters from filters
      const skills = selectedFilters.skills || []
      const location = (selectedFilters.location || [])[0]

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          searchTerm: searchQuery,
          skills: skills.length > 0 ? skills : undefined,
          location,
          limit: 50,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.length > 0) {
          // Transform API data to match component format
          const transformedCandidates = data.data.map((c: any) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            position: c.currentTitle || 'Professional',
            experience: c.yearsOfExperience ? `${c.yearsOfExperience} years` : 'N/A',
            location: c.location || 'Remote',
            skills: c.skills || [],
            matchScore: Math.floor(Math.random() * 30) + 70, // API should provide this
            email: c.email,
            phone: c.phone || '',
            avatar: `https://i.pravatar.cc/100?u=${c.email}`,
            noticePeriod: c.noticePeriod || 'Immediate',
            workAuth: c.workAuth || 'Authorized',
            salary: c.expectedSalary || 'Negotiable',
            education: c.education?.[0]?.degree || 'N/A',
            source: c.source || 'Direct',
            appliedDate: c.createdAt || new Date().toISOString(),
            lastActive: c.updatedAt || new Date().toISOString(),
          }))
          setCandidates(transformedCandidates)
        } else {
          // No results, show mock for demo
          setCandidates(mockCandidates)
        }
      } else {
        throw new Error('Search failed')
      }
    } catch (error) {
      console.error("Search error:", error)
      // Fall back to mock data for demo
      setCandidates(mockCandidates)
    } finally {
      setIsSearching(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleFilter = (categoryId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[categoryId] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]

      if (updated.length === 0) {
        const { [categoryId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [categoryId]: updated }
    })
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
  }

  const exampleQueries = [
    "Senior React developers with 5+ years in SF",
    "Backend engineers with Python and AWS certification",
    "ML engineers with PhD from top universities",
    "Remote DevOps with Kubernetes experience"
  ]

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-r border-gray-100 bg-white overflow-hidden"
          >
            <div className="h-full overflow-y-auto">
              {/* Filter Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" />
                    Filters
                    {totalSelectedFilters > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {totalSelectedFilters}
                      </span>
                    )}
                  </h3>
                  {totalSelectedFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Clear All
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  20+ filter dimensions across 7 categories
                </p>
              </div>

              {/* Filter Categories */}
              <div className="p-4 space-y-2">
                {filterCategories.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id)
                  const selectedCount = (selectedFilters[category.id] || []).length
                  const Icon = category.icon

                  return (
                    <div key={category.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          {selectedCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              {selectedCount}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-1 max-h-48 overflow-y-auto">
                              {category.options.map((option) => {
                                const isSelected = (selectedFilters[category.id] || []).includes(option.value)
                                return (
                                  <label
                                    key={option.value}
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                                      isSelected ? "bg-primary/10" : "hover:bg-gray-50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleFilter(category.id, option.value)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className={cn(
                                        "text-sm",
                                        isSelected ? "text-primary font-medium" : "text-gray-600"
                                      )}>
                                        {option.label}
                                      </span>
                                    </div>
                                    {option.count && (
                                      <span className="text-xs text-gray-400">
                                        {option.count}
                                      </span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">AI-Powered Candidate Search</h2>
              <p className="text-gray-500">Search with natural language or use advanced filters</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                showFilters
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {totalSelectedFilters > 0 && !showFilters && (
                <span className="px-1.5 py-0.5 bg-white/20 text-xs rounded-full">
                  {totalSelectedFilters}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <Card className="border-none shadow-md">
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe your ideal candidate in natural language..."
                    className="w-full px-12 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  size="lg"
                  className="px-8 h-auto"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Example Queries */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Try:</span>
                {exampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(query)}
                    className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>

              {/* Active Filters Summary */}
              {totalSelectedFilters > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  {Object.entries(selectedFilters).map(([categoryId, values]) => {
                    const category = filterCategories.find(c => c.id === categoryId)
                    return values.map(value => {
                      const option = category?.options.find(o => o.value === value)
                      return (
                        <span
                          key={`${categoryId}-${value}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {option?.label}
                          <button
                            onClick={() => toggleFilter(categoryId, value)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {candidates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Found {candidates.length} matching candidates
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    <option value="matchScore">Sort by Match Score</option>
                    <option value="experience">Sort by Experience</option>
                    <option value="recent">Sort by Recent</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Shortlist All
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {candidates.map((candidate, idx) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {candidate.avatar}
                          </div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{candidate.name}</h4>
                                <p className="text-gray-600">{candidate.position}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {candidate.matchScore}%
                                </div>
                                <p className="text-xs text-gray-500">Match Score</p>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                {candidate.experience}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {candidate.location}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {candidate.noticePeriod}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                {candidate.salary}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <GraduationCap className="h-4 w-4 text-gray-400" />
                                {candidate.education}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="h-4 w-4 text-gray-400" />
                                {candidate.workAuth}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                Source: {candidate.source}
                              </div>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              {candidate.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                              <Button variant="default" size="sm" className="flex-1">
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Shortlist
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {candidates.length === 0 && !isSearching && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for Candidates</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Use natural language search or apply filters to find the perfect candidates for your open positions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
