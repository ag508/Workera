'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Briefcase,
  Building2,
  Users,
  Wallet,
  UserPlus,
  FileCheck,
  Send,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Requisition Type', icon: FileText },
  { id: 2, name: 'Job Information', icon: Briefcase },
  { id: 3, name: 'Organization', icon: Building2 },
  { id: 4, name: 'Hiring Details', icon: Users },
  { id: 5, name: 'Compensation', icon: Wallet },
  { id: 6, name: 'Hiring Team', icon: UserPlus },
  { id: 7, name: 'Justification', icon: FileCheck },
  { id: 8, name: 'Review & Submit', icon: Send },
];

const requisitionTypes = [
  { id: 'POSITION_BASED', name: 'Position Based', description: 'Linked to an existing position in your organization' },
  { id: 'NON_POSITION', name: 'Non-Position', description: 'Free-form job requisition not tied to a position' },
  { id: 'REPLACEMENT', name: 'Replacement', description: 'Replacing a departing or departing employee' },
  { id: 'NEW_HEADCOUNT', name: 'New Headcount', description: 'Creating a new position (requires budget approval)' },
  { id: 'EVERGREEN', name: 'Evergreen', description: 'Continuous hiring for high-volume roles' },
  { id: 'PIPELINE', name: 'Pipeline', description: 'Building a talent pipeline for future needs' },
];

export default function CreateRequisitionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    requisitionType: '',
    jobTitle: '',
    jobCode: '',
    department: '',
    location: '',
    headcount: 1,
    employmentType: 'FULL_TIME',
    workModel: 'ONSITE',
    salaryMin: '',
    salaryMax: '',
    costCenter: '',
    hiringManager: '',
    recruiter: '',
    justification: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({ ...formData, requisitionType: typeId });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/requisitions"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Job Requisition</h1>
          <p className="text-sm text-gray-500">Complete the wizard to submit a new hiring request</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    currentStep === step.id
                      ? "border-primary bg-primary text-white"
                      : currentStep > step.id
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-200 bg-white text-gray-400"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    currentStep === step.id
                      ? "text-primary"
                      : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-400"
                  )}
                >
                  {step.name}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-12 mx-2",
                    currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Requisition Type */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Select Requisition Type</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose the type of hiring request. This determines the workflow and required fields.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requisitionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={cn(
                      "flex flex-col items-start p-6 rounded-xl border-2 text-left transition-all hover:shadow-md",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-gray-900">{type.name}</span>
                      {selectedType === type.id && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{type.description}</p>
                  </button>
                ))}
              </div>

              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-blue-50 border border-blue-100"
                >
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> {selectedType === 'NEW_HEADCOUNT'
                      ? 'New headcount requisitions require finance approval and budget validation.'
                      : selectedType === 'REPLACEMENT'
                      ? 'You will need to specify the employee being replaced in the next steps.'
                      : 'Proceed to the next step to fill in job details.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Job Information */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Job Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the details for the position you want to fill.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Code</label>
                  <input
                    type="text"
                    value={formData.jobCode}
                    onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
                    placeholder="e.g., ENG-001"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                  <textarea
                    rows={6}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-2 text-xs text-gray-500">Tip: Use AI to generate a comprehensive job description</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other steps */}
          {currentStep > 2 && currentStep < 8 && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep - 1].name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete this step to continue with your requisition.
                </p>
              </div>

              <div className="py-20 text-center">
                <div className="flex justify-center mb-4">
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return <StepIcon className="h-16 w-16 text-gray-300" />;
                  })()}
                </div>
                <p className="text-gray-500">Form fields for {steps[currentStep - 1].name} will be implemented here.</p>
              </div>
            </motion.div>
          )}

          {/* Step 8: Review & Submit */}
          {currentStep === 8 && (
            <motion.div
              key="step-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review all information before submitting for approval.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <h3 className="font-medium text-green-800">Ready for Submission</h3>
                  <p className="text-sm text-green-700 mt-1">
                    All required fields have been completed. Click submit to send for approval.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-4">Approval Workflow Preview</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">1</div>
                      <span className="text-sm text-gray-600">HRBP Review</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-medium">2</div>
                      <span className="text-sm text-gray-600">Finance Approval</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-medium">3</div>
                      <span className="text-sm text-gray-600">Dept Head Final</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              currentStep === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Save as Draft
            </button>
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedType}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all",
                  currentStep === 1 && !selectedType
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                )}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25 transition-all">
                <Send className="h-4 w-4" />
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
