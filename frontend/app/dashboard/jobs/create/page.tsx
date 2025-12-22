'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Globe,
  Linkedin,
  ExternalLink,
  Copy,
  Zap,
  Settings,
  Save,
  Send,
  Eye,
  GripVertical,
  X,
  AlertCircle,
  CheckCircle2,
  LayoutTemplate,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Company Templates
const companyTemplates = [
  {
    id: 'standard',
    name: 'Standard Application',
    description: 'Basic application form with essential fields',
    fields: [
      { id: '1', type: 'text', label: 'Full Name', required: true },
      { id: '2', type: 'email', label: 'Email Address', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', type: 'file', label: 'Resume/CV', required: true, accept: '.pdf,.doc,.docx' },
      { id: '5', type: 'file', label: 'Cover Letter', required: false, accept: '.pdf,.doc,.docx' },
      { id: '6', type: 'url', label: 'LinkedIn Profile', required: false },
    ],
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Application',
    description: 'Detailed form with work history and skills',
    fields: [
      { id: '1', type: 'text', label: 'Full Name', required: true },
      { id: '2', type: 'email', label: 'Email Address', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', type: 'file', label: 'Resume/CV', required: true, accept: '.pdf,.doc,.docx' },
      { id: '5', type: 'url', label: 'LinkedIn Profile', required: false },
      { id: '6', type: 'url', label: 'Portfolio/Website', required: false },
      { id: '7', type: 'select', label: 'Years of Experience', required: true, options: ['0-1 years', '2-4 years', '5-7 years', '8-10 years', '10+ years'] },
      { id: '8', type: 'textarea', label: 'Why are you interested in this role?', required: true },
      { id: '9', type: 'select', label: 'Work Authorization', required: true, options: ['Authorized to work', 'Require sponsorship'] },
      { id: '10', type: 'select', label: 'Notice Period', required: true, options: ['Immediately', '2 weeks', '1 month', '2 months', '3+ months'] },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Role Application',
    description: 'For engineering and technical positions',
    fields: [
      { id: '1', type: 'text', label: 'Full Name', required: true },
      { id: '2', type: 'email', label: 'Email Address', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', required: true },
      { id: '4', type: 'file', label: 'Resume/CV', required: true, accept: '.pdf,.doc,.docx' },
      { id: '5', type: 'url', label: 'LinkedIn Profile', required: false },
      { id: '6', type: 'url', label: 'GitHub Profile', required: false },
      { id: '7', type: 'url', label: 'Portfolio/Personal Website', required: false },
      { id: '8', type: 'textarea', label: 'Technical Skills', required: true },
      { id: '9', type: 'select', label: 'Years of Experience', required: true, options: ['0-1 years', '2-4 years', '5-7 years', '8-10 years', '10+ years'] },
      { id: '10', type: 'textarea', label: 'Describe a challenging technical problem you solved', required: false },
      { id: '11', type: 'select', label: 'Preferred Work Style', required: false, options: ['Remote', 'Hybrid', 'On-site', 'Flexible'] },
    ],
  },
];

// Job posting platforms
const jobPlatforms = [
  { id: 'linkedin', name: 'LinkedIn Jobs', icon: Linkedin, color: 'bg-blue-100 text-blue-600', connected: true },
  { id: 'indeed', name: 'Indeed', icon: Globe, color: 'bg-blue-50 text-blue-800', connected: true },
  { id: 'glassdoor', name: 'Glassdoor', icon: Globe, color: 'bg-green-50 text-green-600', connected: false },
  { id: 'naukri', name: 'Naukri', icon: Globe, color: 'bg-teal-50 text-teal-600', connected: false },
  { id: 'monster', name: 'Monster', icon: Globe, color: 'bg-purple-50 text-purple-600', connected: false },
  { id: 'ziprecruiter', name: 'ZipRecruiter', icon: Globe, color: 'bg-green-100 text-green-700', connected: true },
];

// Field types for custom fields
const fieldTypes = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL/Link' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file', label: 'File Upload' },
];

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  accept?: string;
}

function CreateJobContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requisitionId = searchParams.get('requisitionId');

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Job Details
  const [jobDetails, setJobDetails] = useState({
    title: '',
    department: '',
    location: '',
    locationType: 'hybrid',
    employmentType: 'full-time',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    description: '',
    requirements: '',
    benefits: '',
    headcount: 1,
  });

  // Application Form
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [formFields, setFormFields] = useState<FormField[]>(companyTemplates[0].fields);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [newField, setNewField] = useState<Partial<FormField>>({ type: 'text', label: '', required: false });

  // Publishing
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'indeed']);
  const [publishSettings, setPublishSettings] = useState({
    publishNow: true,
    scheduleDate: '',
    expiresAfterDays: 30,
    autoRenew: false,
  });

  // Load requisition data if coming from a requisition
  useEffect(() => {
    if (requisitionId) {
      // Simulate loading requisition data
      setLoading(true);
      setTimeout(() => {
        // Mock requisition data
        setJobDetails({
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          locationType: 'hybrid',
          employmentType: 'full-time',
          salaryMin: '150000',
          salaryMax: '180000',
          salaryCurrency: 'USD',
          description: `We are seeking a talented Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.

**Key Responsibilities:**
- Design and implement scalable backend services
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews
- Contribute to architectural decisions`,
          requirements: `**Required Qualifications:**
- 5+ years of software development experience
- Strong proficiency in TypeScript/JavaScript
- Experience with React and Node.js
- Familiarity with cloud platforms (AWS/GCP/Azure)
- Excellent communication skills

**Nice to Have:**
- Experience with microservices architecture
- Knowledge of CI/CD pipelines
- Open source contributions`,
          benefits: `- Competitive salary and equity
- Health, dental, and vision insurance
- Unlimited PTO
- Remote-friendly culture
- Learning & development budget
- Home office stipend`,
          headcount: 2,
        });
        setSelectedTemplate('technical');
        setFormFields(companyTemplates[2].fields);
        setLoading(false);
      }, 1000);
    }
  }, [requisitionId]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = companyTemplates.find(t => t.id === templateId);
    if (template) {
      setFormFields(template.fields);
    }
  };

  const addCustomField = () => {
    if (newField.label) {
      const field: FormField = {
        id: `custom-${Date.now()}`,
        type: newField.type || 'text',
        label: newField.label,
        required: newField.required || false,
        options: newField.type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      };
      setFormFields([...formFields, field]);
      setNewField({ type: 'text', label: '', required: false });
      setShowFieldEditor(false);
    }
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    alert('Draft saved successfully!');
  };

  const handlePublish = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    router.push('/dashboard/jobs?published=true');
  };

  const steps = [
    { number: 1, title: 'Job Details', description: 'Basic information' },
    { number: 2, title: 'Application Form', description: 'Configure fields' },
    { number: 3, title: 'Publish', description: 'Post to platforms' },
  ];

  if (loading && currentStep === 1) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading requisition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/jobs"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {requisitionId ? 'Create Job from Requisition' : 'Create New Job'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {requisitionId ? `Converting requisition ${requisitionId}` : 'Post a new job position'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(step.number)}
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  currentStep >= step.number
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400"
                )}>
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    "font-medium text-sm",
                    currentStep >= step.number ? "text-gray-900" : "text-gray-400"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > step.number ? "bg-primary" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Job Details</h2>
                <p className="text-sm text-gray-500">Enter the basic information about this position</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={jobDetails.title}
                  onChange={(e) => setJobDetails({ ...jobDetails, title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select
                  value={jobDetails.department}
                  onChange={(e) => setJobDetails({ ...jobDetails, department: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={jobDetails.location}
                  onChange={(e) => setJobDetails({ ...jobDetails, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                <div className="flex gap-3">
                  {['remote', 'hybrid', 'onsite'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setJobDetails({ ...jobDetails, locationType: type })}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        jobDetails.locationType === type
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                <select
                  value={jobDetails.employmentType}
                  onChange={(e) => setJobDetails({ ...jobDetails, employmentType: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <div className="flex items-center gap-3">
                  <select
                    value={jobDetails.salaryCurrency}
                    onChange={(e) => setJobDetails({ ...jobDetails, salaryCurrency: e.target.value })}
                    className="rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                  <input
                    type="text"
                    value={jobDetails.salaryMin}
                    onChange={(e) => setJobDetails({ ...jobDetails, salaryMin: e.target.value })}
                    placeholder="Min"
                    className="flex-1 rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="text"
                    value={jobDetails.salaryMax}
                    onChange={(e) => setJobDetails({ ...jobDetails, salaryMax: e.target.value })}
                    placeholder="Max"
                    className="flex-1 rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-gray-500 text-sm">per year</span>
                </div>
              </div>

              {/* Headcount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Positions</label>
                <input
                  type="number"
                  min="1"
                  value={jobDetails.headcount}
                  onChange={(e) => setJobDetails({ ...jobDetails, headcount: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Job Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                <div className="relative">
                  <textarea
                    value={jobDetails.description}
                    onChange={(e) => setJobDetails({ ...jobDetails, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                    rows={8}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-white text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    AI Enhance
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <textarea
                  value={jobDetails.requirements}
                  onChange={(e) => setJobDetails({ ...jobDetails, requirements: e.target.value })}
                  placeholder="List the qualifications, skills, and experience required..."
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Benefits */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits & Perks</label>
                <textarea
                  value={jobDetails.benefits}
                  onChange={(e) => setJobDetails({ ...jobDetails, benefits: e.target.value })}
                  placeholder="Describe the benefits, perks, and company culture..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              >
                Next: Application Form
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Template Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <LayoutTemplate className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Company Templates</h2>
                  <p className="text-sm text-gray-500">Start with a pre-configured template or customize your own</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {companyTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {selectedTemplate === template.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <p className="text-xs text-gray-400">{template.fields.length} fields</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Editor */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Application Form Fields</h2>
                    <p className="text-sm text-gray-500">Customize the fields candidates will fill out</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFieldEditor(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Field
                </button>
              </div>

              <div className="space-y-3">
                {formFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 group"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{field.label}</span>
                        {field.required && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">Required</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 capitalize">{field.type}</p>
                    </div>
                    <button
                      onClick={() => removeField(field.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Add Field Modal */}
              <AnimatePresence>
                {showFieldEditor && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowFieldEditor(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.95 }}
                      className="bg-white rounded-2xl p-6 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Add Custom Field</h3>
                        <button onClick={() => setShowFieldEditor(false)} className="p-2 rounded-lg hover:bg-gray-100">
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                          <input
                            type="text"
                            value={newField.label || ''}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            placeholder="e.g. Portfolio URL"
                            className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                          <select
                            value={newField.type || 'text'}
                            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newField.required || false}
                            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                          />
                          <span className="text-sm text-gray-700">Required field</span>
                        </label>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowFieldEditor(false)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addCustomField}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-sm font-medium text-white hover:bg-primary/90"
                        >
                          Add Field
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              >
                Next: Publish
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Platform Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Publishing Platforms</h2>
                  <p className="text-sm text-gray-500">Select where to post this job</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => platform.connected && togglePlatform(platform.id)}
                      disabled={!platform.connected}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all relative",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : platform.connected
                          ? "border-gray-200 hover:border-gray-300"
                          : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", platform.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                          <p className="text-xs text-gray-500">
                            {platform.connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      {!platform.connected && (
                        <Link
                          href="/dashboard/settings/integrations"
                          className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="flex items-center gap-1 text-sm font-medium text-primary">
                            Connect <ExternalLink className="h-3 w-3" />
                          </span>
                        </Link>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application Link */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Application Link</h2>
                  <p className="text-sm text-gray-500">Candidates will apply through your company portal</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="flex-1 font-mono text-sm text-gray-600 truncate">
                  https://careers.yourcompany.com/jobs/senior-software-engineer
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Publish Settings</h2>
                  <p className="text-sm text-gray-500">Configure when and how to publish</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="publishTime"
                      checked={publishSettings.publishNow}
                      onChange={() => setPublishSettings({ ...publishSettings, publishNow: true })}
                      className="w-4 h-4 border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">Publish immediately</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="publishTime"
                      checked={!publishSettings.publishNow}
                      onChange={() => setPublishSettings({ ...publishSettings, publishNow: false })}
                      className="w-4 h-4 border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">Schedule for later</span>
                  </label>
                </div>

                {!publishSettings.publishNow && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
                    <input
                      type="datetime-local"
                      value={publishSettings.scheduleDate}
                      onChange={(e) => setPublishSettings({ ...publishSettings, scheduleDate: e.target.value })}
                      className="rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job expires after</label>
                  <select
                    value={publishSettings.expiresAfterDays}
                    onChange={(e) => setPublishSettings({ ...publishSettings, expiresAfterDays: parseInt(e.target.value) })}
                    className="rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={0}>Never</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishSettings.autoRenew}
                    onChange={(e) => setPublishSettings({ ...publishSettings, autoRenew: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700">Auto-renew job posting when it expires</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-2xl border border-primary/20 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Publishing Summary</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Job Title</span>
                  <span className="font-medium text-gray-900">{jobDetails.title || 'Untitled'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platforms</span>
                  <span className="font-medium text-gray-900">{selectedPlatforms.length} selected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Form Fields</span>
                  <span className="font-medium text-gray-900">{formFields.length} fields</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Publish Time</span>
                  <span className="font-medium text-gray-900">
                    {publishSettings.publishNow ? 'Immediately' : publishSettings.scheduleDate || 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handlePublish}
                disabled={loading || selectedPlatforms.length === 0}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Job
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <CreateJobContent />
    </Suspense>
  );
}
