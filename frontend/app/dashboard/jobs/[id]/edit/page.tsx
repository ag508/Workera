'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import { jobsService, Job } from '@/lib/services/jobs';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<Job | null>(null);

  // Job Details form
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    salary: '',
  });

  useEffect(() => {
    async function fetchJob() {
      try {
        const data = await jobsService.getById(jobId);
        if (data) {
          setJob(data);
          setJobDetails({
            title: data.title || '',
            company: data.company || '',
            location: data.location || '',
            type: data.type || 'Full-time',
            description: data.description || '',
            salary: (data as any).salary || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  const handleSave = async () => {
    if (!jobDetails.title) {
      alert('Please enter a job title');
      return;
    }
    setSaving(true);
    try {
      await jobsService.update(jobId, {
        title: jobDetails.title,
        description: jobDetails.description,
        company: jobDetails.company || undefined,
        location: jobDetails.location || undefined,
        type: jobDetails.type || undefined,
      });
      alert('Job updated successfully!');
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Failed to update job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-lg font-medium text-gray-900">Job not found</p>
        <Link href="/dashboard/jobs" className="mt-4 text-primary hover:underline">
          Back to Jobs
        </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-sm text-gray-500 mt-1">Update job details</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Job Details</h2>
            <p className="text-sm text-gray-500">Edit the job information</p>
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

          {/* Company/Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company/Department</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={jobDetails.company}
                onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
                placeholder="e.g. Engineering"
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={jobDetails.location}
                onChange={(e) => setJobDetails({ ...jobDetails, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
            <select
              value={jobDetails.type}
              onChange={(e) => setJobDetails({ ...jobDetails, type: e.target.value })}
              className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Job Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <div className="relative">
              <textarea
                value={jobDetails.description}
                onChange={(e) => setJobDetails({ ...jobDetails, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what makes it exciting..."
                rows={10}
                className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-white text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                AI Enhance
              </button>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <p className="font-medium text-gray-900">{job.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
