'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Save,
  Linkedin,
  Building2,
  Globe,
  Key,
  User,
  Link2,
  Shield,
  CheckCircle,
  XCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Settings,
  Zap,
  Database
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  connected: boolean;
  children: React.ReactNode;
  onSave: (e: React.FormEvent) => void;
  loading?: boolean;
}

function IntegrationCard({ title, description, icon, color, bgColor, connected, children, onSave, loading }: IntegrationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${bgColor} flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              connected
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {connected ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </>
              )}
            </span>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <form onSubmit={onSave} className="border-t border-gray-100 p-6 space-y-5">
          {children}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Test Connection
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, name, type = 'text', defaultValue, placeholder, icon }: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 bg-white py-3 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
        />
      </div>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    linkedin: {},
    workday: {},
    naukri: {},
    jobBoards: []
  });

  const tenantId = getTenantId();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/settings?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data || { linkedin: {}, workday: {}, naukri: {}, jobBoards: [] });
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(section);
    const newSettings = { ...settings, [section]: data };
    setSettings(newSettings);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/settings?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
          <p className="text-gray-500 mt-1">Connect your external services and job boards</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Integrations', value: 3, icon: Zap, color: 'text-gray-900', bgColor: 'bg-gray-100' },
          { label: 'Connected', value: Object.values(settings).filter((s: any) => s?.clientId || s?.accountId || s?.tenantName).length, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
          { label: 'Job Boards', value: settings.jobBoards?.length || 0, icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'API Calls Today', value: 124, icon: Database, color: 'text-purple-600', bgColor: 'bg-purple-100' },
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

      {/* Integration Cards */}
      <div className="space-y-4">
        {/* LinkedIn */}
        <IntegrationCard
          title="LinkedIn Integration"
          description="Connect with LinkedIn for job posting and candidate sourcing"
          icon={<Linkedin className="h-6 w-6 text-blue-600" />}
          color="text-blue-600"
          bgColor="bg-blue-100"
          connected={!!settings.linkedin?.clientId}
          loading={saving === 'linkedin'}
          onSave={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            handleSave('linkedin', {
              clientId: formData.get('clientId'),
              clientSecret: formData.get('clientSecret'),
              accessToken: formData.get('accessToken'),
              organizationId: formData.get('organizationId'),
            });
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Client ID"
              name="clientId"
              defaultValue={settings.linkedin?.clientId}
              placeholder="Enter your LinkedIn Client ID"
              icon={<Key className="h-4 w-4" />}
            />
            <InputField
              label="Client Secret"
              name="clientSecret"
              type="password"
              defaultValue={settings.linkedin?.clientSecret}
              placeholder="Enter your LinkedIn Client Secret"
              icon={<Shield className="h-4 w-4" />}
            />
            <InputField
              label="Access Token"
              name="accessToken"
              defaultValue={settings.linkedin?.accessToken}
              placeholder="OAuth access token"
              icon={<Key className="h-4 w-4" />}
            />
            <InputField
              label="Organization ID"
              name="organizationId"
              defaultValue={settings.linkedin?.organizationId}
              placeholder="Your LinkedIn Organization ID"
              icon={<Building2 className="h-4 w-4" />}
            />
          </div>
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Linkedin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Need help?</strong> Visit the{' '}
              <a href="https://developer.linkedin.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                LinkedIn Developer Portal <ExternalLink className="h-3 w-3" />
              </a>{' '}
              to create your application and obtain credentials.
            </div>
          </div>
        </IntegrationCard>

        {/* Workday */}
        <IntegrationCard
          title="Workday Integration"
          description="Connect with Workday HCM for seamless HR data sync"
          icon={<Building2 className="h-6 w-6 text-orange-600" />}
          color="text-orange-600"
          bgColor="bg-orange-100"
          connected={!!settings.workday?.tenantName}
          loading={saving === 'workday'}
          onSave={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            handleSave('workday', {
              tenantName: formData.get('tenantName'),
              username: formData.get('username'),
              baseUrl: formData.get('baseUrl'),
              password: formData.get('password'),
            });
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Tenant Name"
              name="tenantName"
              defaultValue={settings.workday?.tenantName}
              placeholder="Your Workday tenant name"
              icon={<Building2 className="h-4 w-4" />}
            />
            <InputField
              label="Base URL"
              name="baseUrl"
              defaultValue={settings.workday?.baseUrl}
              placeholder="https://your-tenant.workday.com"
              icon={<Link2 className="h-4 w-4" />}
            />
            <InputField
              label="Username"
              name="username"
              defaultValue={settings.workday?.username}
              placeholder="Integration username"
              icon={<User className="h-4 w-4" />}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              defaultValue={settings.workday?.password}
              placeholder="Integration password"
              icon={<Shield className="h-4 w-4" />}
            />
          </div>
          <div className="bg-orange-50 rounded-xl p-4 flex items-start gap-3">
            <Building2 className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-700">
              <strong>Integration System User Required.</strong> Create an Integration System User (ISU) in Workday with appropriate permissions for API access.
            </div>
          </div>
        </IntegrationCard>

        {/* Naukri */}
        <IntegrationCard
          title="Naukri Integration"
          description="Configure Naukri.com for recruitment services in India"
          icon={<Globe className="h-6 w-6 text-teal-600" />}
          color="text-teal-600"
          bgColor="bg-teal-100"
          connected={!!settings.naukri?.accountId}
          loading={saving === 'naukri'}
          onSave={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            handleSave('naukri', {
              accountId: formData.get('accountId'),
              apiKey: formData.get('apiKey'),
            });
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Account ID"
              name="accountId"
              defaultValue={settings.naukri?.accountId}
              placeholder="Your Naukri Account ID"
              icon={<User className="h-4 w-4" />}
            />
            <InputField
              label="API Key"
              name="apiKey"
              type="password"
              defaultValue={settings.naukri?.apiKey}
              placeholder="Your Naukri API Key"
              icon={<Key className="h-4 w-4" />}
            />
          </div>
          <div className="bg-teal-50 rounded-xl p-4 flex items-start gap-3">
            <Globe className="h-5 w-5 text-teal-600 mt-0.5" />
            <div className="text-sm text-teal-700">
              <strong>Enterprise Access Required.</strong> Contact your Naukri account manager to obtain API credentials for integration.
            </div>
          </div>
        </IntegrationCard>
      </div>

      {/* Additional Integrations Coming Soon */}
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8">
        <div className="text-center">
          <div className="flex justify-center gap-4 mb-4">
            {['Indeed', 'Glassdoor', 'Monster', 'ZipRecruiter'].map((name, i) => (
              <div key={i} className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">More Integrations Coming Soon</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            We're working on adding support for Indeed, Glassdoor, Monster, ZipRecruiter, and more job boards.
          </p>
        </div>
      </div>
    </div>
  );
}
