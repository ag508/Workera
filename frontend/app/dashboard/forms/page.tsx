'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FileText,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  Calendar,
  Users,
  ExternalLink,
  Copy,
  Link2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Grid,
  List,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

const statusColors: Record<string, string> = {
  true: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  false: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function FormsListPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const tenantId = getTenantId();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Failed to fetch forms', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/forms/${id}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      fetchForms();
    } catch (error) {
      console.error('Failed to delete form', error);
    }
  };

  const copyFormLink = (slug: string) => {
    const link = `${window.location.origin}/apply/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  const filtered = forms.filter(f =>
    f.title?.toLowerCase().includes(search.toLowerCase()) ||
    f.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0);
  const activeForms = forms.filter(f => f.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Forms</h1>
          <p className="text-gray-500 mt-1">Create and manage job application forms</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className="h-4 w-4" />
          </button>
          <Link
            href="/dashboard/forms/create"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Link>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Forms', value: forms.length, icon: FileText, color: 'text-gray-900', bgColor: 'bg-gray-100' },
          { label: 'Active', value: activeForms, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
          { label: 'Total Submissions', value: totalSubmissions, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'Avg. per Form', value: forms.length > 0 ? Math.round(totalSubmissions / forms.length) : 0, icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-white p-4 border border-gray-100 flex items-center gap-4"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading forms...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && forms.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No forms found</p>
          <p className="text-sm text-gray-500 mb-4">Create your first application form to start collecting candidates</p>
          <Link
            href="/dashboard/forms/create"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Create Form
          </Link>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all relative"
            >
              {/* Background Gradient */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${statusColors[form.isActive?.toString()] || statusColors['false']}`}>
                  {form.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === form.id ? null : form.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {showDropdown === form.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-10"
                      >
                        <Link href={`/dashboard/forms/${form.id}`} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Eye className="h-4 w-4" /> View Submissions
                        </Link>
                        <Link href={`/dashboard/forms/edit/${form.id}`} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Edit3 className="h-4 w-4" /> Edit Form
                        </Link>
                        <button
                          onClick={() => copyFormLink(form.slug)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" /> Copy Link
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4 relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors">
                  {form.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5" />
                  /apply/{form.slug}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  {form.submissionCount || 0} submissions
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(form.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 flex items-center gap-2">
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <Link
                  href={`/dashboard/forms/edit/${form.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-6">
                {/* Icon */}
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-7 w-7 text-primary" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {form.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3.5 w-3.5" />
                          /apply/{form.slug}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${statusColors[form.isActive?.toString()] || statusColors['false']}`}>
                      {form.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{form.submissionCount || 0}</span>
                        <span className="text-gray-500">submissions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyFormLink(form.slug)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </button>
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/forms/edit/${form.id}`}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}
