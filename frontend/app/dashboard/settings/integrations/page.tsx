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
  Zap,
  Database,
  Video,
  Calendar,
  Mail,
  MessageSquare,
  Briefcase,
  Play,
  Check,
  X,
  AlertCircle
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
  onTestConnection?: () => Promise<boolean>;
  loading?: boolean;
}

function IntegrationCard({ title, description, icon, color, bgColor, connected, children, onSave, onTestConnection, loading }: IntegrationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTestConnection();
      setTestResult(result);
      setTimeout(() => setTestResult(null), 3000);
    } catch {
      setTestResult(false);
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>
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
                <><CheckCircle className="h-3 w-3" />Connected</>
              ) : (
                <><XCircle className="h-3 w-3" />Not Connected</>
              )}
            </span>
            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

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
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Testing...</>
              ) : testResult === true ? (
                <><Check className="h-4 w-4 text-green-600" />Connected!</>
              ) : testResult === false ? (
                <><X className="h-4 w-4 text-red-600" />Failed</>
              ) : (
                <><RefreshCw className="h-4 w-4" />Test Connection</>
              )}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="h-4 w-4" />Save Settings</>
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
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

function SectionHeader({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    linkedin: {},
    indeed: {},
    glassdoor: {},
    naukri: {},
    monster: {},
    ziprecruiter: {},
    zoom: {},
    teams: {},
    webex: {},
    googleCalendar: {},
    outlookCalendar: {},
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
        setSettings(data || settings);
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

  const testConnection = async (section: string): Promise<boolean> => {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    return Math.random() > 0.3; // 70% success rate for demo
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

  const countConnected = (sections: string[]) =>
    sections.filter(s => {
      const data = settings[s];
      return data && (data.clientId || data.accountId || data.apiKey || data.tenantId);
    }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
        <p className="text-gray-500 mt-1">Connect your job boards, video conferencing, and calendar platforms</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Job Boards', value: countConnected(['linkedin', 'indeed', 'glassdoor', 'naukri', 'monster', 'ziprecruiter']), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'Video Platforms', value: countConnected(['zoom', 'teams', 'webex']), icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-100' },
          { label: 'Calendars', value: countConnected(['googleCalendar', 'outlookCalendar']), icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-100' },
          { label: 'API Calls Today', value: 124, icon: Database, color: 'text-gray-900', bgColor: 'bg-gray-100' },
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

      {/* Job Boards Section */}
      <div>
        <SectionHeader
          title="Job Boards"
          description="Connect to job boards to post positions and source candidates"
          icon={Briefcase}
        />
        <div className="space-y-4">
          {/* LinkedIn */}
          <IntegrationCard
            title="LinkedIn Jobs"
            description="Post jobs to LinkedIn and source candidates"
            icon={<Linkedin className="h-6 w-6 text-blue-600" />}
            color="text-blue-600"
            bgColor="bg-blue-100"
            connected={!!settings.linkedin?.clientId}
            loading={saving === 'linkedin'}
            onTestConnection={() => testConnection('linkedin')}
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
              <InputField label="Client ID" name="clientId" defaultValue={settings.linkedin?.clientId} placeholder="LinkedIn Client ID" icon={<Key className="h-4 w-4" />} />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.linkedin?.clientSecret} placeholder="LinkedIn Client Secret" icon={<Shield className="h-4 w-4" />} />
              <InputField label="Access Token" name="accessToken" defaultValue={settings.linkedin?.accessToken} placeholder="OAuth access token" icon={<Key className="h-4 w-4" />} />
              <InputField label="Organization ID" name="organizationId" defaultValue={settings.linkedin?.organizationId} placeholder="LinkedIn Organization ID" icon={<Building2 className="h-4 w-4" />} />
            </div>
          </IntegrationCard>

          {/* Indeed */}
          <IntegrationCard
            title="Indeed"
            description="Post jobs to Indeed and import applications"
            icon={<Globe className="h-6 w-6 text-blue-800" />}
            color="text-blue-800"
            bgColor="bg-blue-50"
            connected={!!settings.indeed?.apiKey}
            loading={saving === 'indeed'}
            onTestConnection={() => testConnection('indeed')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('indeed', {
                apiKey: formData.get('apiKey'),
                employerId: formData.get('employerId'),
                sponsoredKey: formData.get('sponsoredKey'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="API Key" name="apiKey" type="password" defaultValue={settings.indeed?.apiKey} placeholder="Indeed API Key" icon={<Key className="h-4 w-4" />} />
              <InputField label="Employer ID" name="employerId" defaultValue={settings.indeed?.employerId} placeholder="Indeed Employer ID" icon={<Building2 className="h-4 w-4" />} />
              <InputField label="Sponsored Posting Key" name="sponsoredKey" type="password" defaultValue={settings.indeed?.sponsoredKey} placeholder="For sponsored job posts" icon={<Shield className="h-4 w-4" />} />
            </div>
          </IntegrationCard>

          {/* Glassdoor */}
          <IntegrationCard
            title="Glassdoor"
            description="Syndicate jobs to Glassdoor"
            icon={<Globe className="h-6 w-6 text-green-600" />}
            color="text-green-600"
            bgColor="bg-green-50"
            connected={!!settings.glassdoor?.partnerId}
            loading={saving === 'glassdoor'}
            onTestConnection={() => testConnection('glassdoor')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('glassdoor', {
                partnerId: formData.get('partnerId'),
                partnerKey: formData.get('partnerKey'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Partner ID" name="partnerId" defaultValue={settings.glassdoor?.partnerId} placeholder="Glassdoor Partner ID" icon={<User className="h-4 w-4" />} />
              <InputField label="Partner Key" name="partnerKey" type="password" defaultValue={settings.glassdoor?.partnerKey} placeholder="Glassdoor Partner Key" icon={<Key className="h-4 w-4" />} />
            </div>
          </IntegrationCard>

          {/* Naukri */}
          <IntegrationCard
            title="Naukri.com"
            description="Connect with Naukri for recruitment in India"
            icon={<Globe className="h-6 w-6 text-teal-600" />}
            color="text-teal-600"
            bgColor="bg-teal-100"
            connected={!!settings.naukri?.accountId}
            loading={saving === 'naukri'}
            onTestConnection={() => testConnection('naukri')}
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
              <InputField label="Account ID" name="accountId" defaultValue={settings.naukri?.accountId} placeholder="Naukri Account ID" icon={<User className="h-4 w-4" />} />
              <InputField label="API Key" name="apiKey" type="password" defaultValue={settings.naukri?.apiKey} placeholder="Naukri API Key" icon={<Key className="h-4 w-4" />} />
            </div>
          </IntegrationCard>

          {/* Monster */}
          <IntegrationCard
            title="Monster"
            description="Post jobs to Monster job board"
            icon={<Globe className="h-6 w-6 text-purple-600" />}
            color="text-purple-600"
            bgColor="bg-purple-50"
            connected={!!settings.monster?.accountId}
            loading={saving === 'monster'}
            onTestConnection={() => testConnection('monster')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('monster', {
                accountId: formData.get('accountId'),
                apiKey: formData.get('apiKey'),
                serviceKey: formData.get('serviceKey'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Account ID" name="accountId" defaultValue={settings.monster?.accountId} placeholder="Monster Account ID" icon={<User className="h-4 w-4" />} />
              <InputField label="API Key" name="apiKey" type="password" defaultValue={settings.monster?.apiKey} placeholder="Monster API Key" icon={<Key className="h-4 w-4" />} />
              <InputField label="Service Key" name="serviceKey" type="password" defaultValue={settings.monster?.serviceKey} placeholder="Monster Service Key" icon={<Shield className="h-4 w-4" />} />
            </div>
          </IntegrationCard>

          {/* ZipRecruiter */}
          <IntegrationCard
            title="ZipRecruiter"
            description="Distribute jobs to ZipRecruiter network"
            icon={<Globe className="h-6 w-6 text-green-700" />}
            color="text-green-700"
            bgColor="bg-green-100"
            connected={!!settings.ziprecruiter?.apiKey}
            loading={saving === 'ziprecruiter'}
            onTestConnection={() => testConnection('ziprecruiter')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('ziprecruiter', {
                apiKey: formData.get('apiKey'),
                accountId: formData.get('accountId'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="API Key" name="apiKey" type="password" defaultValue={settings.ziprecruiter?.apiKey} placeholder="ZipRecruiter API Key" icon={<Key className="h-4 w-4" />} />
              <InputField label="Account ID" name="accountId" defaultValue={settings.ziprecruiter?.accountId} placeholder="ZipRecruiter Account ID" icon={<User className="h-4 w-4" />} />
            </div>
          </IntegrationCard>
        </div>
      </div>

      {/* Video Conferencing Section */}
      <div>
        <SectionHeader
          title="Video Conferencing"
          description="Connect video platforms for interview scheduling"
          icon={Video}
        />
        <div className="space-y-4">
          {/* Zoom */}
          <IntegrationCard
            title="Zoom"
            description="Schedule and host video interviews via Zoom"
            icon={<Video className="h-6 w-6 text-blue-500" />}
            color="text-blue-500"
            bgColor="bg-blue-50"
            connected={!!settings.zoom?.clientId}
            loading={saving === 'zoom'}
            onTestConnection={() => testConnection('zoom')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('zoom', {
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
                accountId: formData.get('accountId'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Client ID" name="clientId" defaultValue={settings.zoom?.clientId} placeholder="Zoom OAuth Client ID" icon={<Key className="h-4 w-4" />} />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.zoom?.clientSecret} placeholder="Zoom OAuth Client Secret" icon={<Shield className="h-4 w-4" />} />
              <InputField label="Account ID" name="accountId" defaultValue={settings.zoom?.accountId} placeholder="Zoom Account ID" icon={<User className="h-4 w-4" />} />
            </div>
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <Video className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                Create a Server-to-Server OAuth app in the <a href="https://marketplace.zoom.us" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Zoom Marketplace <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
          </IntegrationCard>

          {/* Microsoft Teams */}
          <IntegrationCard
            title="Microsoft Teams"
            description="Schedule interviews via Microsoft Teams meetings"
            icon={<Video className="h-6 w-6 text-purple-600" />}
            color="text-purple-600"
            bgColor="bg-purple-50"
            connected={!!settings.teams?.clientId}
            loading={saving === 'teams'}
            onTestConnection={() => testConnection('teams')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('teams', {
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
                tenantId: formData.get('tenantId'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Application (Client) ID" name="clientId" defaultValue={settings.teams?.clientId} placeholder="Azure AD App Client ID" icon={<Key className="h-4 w-4" />} />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.teams?.clientSecret} placeholder="Azure AD App Secret" icon={<Shield className="h-4 w-4" />} />
              <InputField label="Directory (Tenant) ID" name="tenantId" defaultValue={settings.teams?.tenantId} placeholder="Azure AD Tenant ID" icon={<Building2 className="h-4 w-4" />} />
            </div>
            <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
              <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-700">
                Register an app in <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Azure Portal <ExternalLink className="h-3 w-3" /></a> with Graph API permissions
              </div>
            </div>
          </IntegrationCard>

          {/* Webex */}
          <IntegrationCard
            title="Cisco Webex"
            description="Host interviews using Webex meetings"
            icon={<Video className="h-6 w-6 text-green-600" />}
            color="text-green-600"
            bgColor="bg-green-50"
            connected={!!settings.webex?.clientId}
            loading={saving === 'webex'}
            onTestConnection={() => testConnection('webex')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('webex', {
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Client ID" name="clientId" defaultValue={settings.webex?.clientId} placeholder="Webex Integration Client ID" icon={<Key className="h-4 w-4" />} />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.webex?.clientSecret} placeholder="Webex Integration Client Secret" icon={<Shield className="h-4 w-4" />} />
            </div>
          </IntegrationCard>
        </div>
      </div>

      {/* Calendar Integrations Section */}
      <div>
        <SectionHeader
          title="Calendar Integrations"
          description="Sync interviews with your team's calendars"
          icon={Calendar}
        />
        <div className="space-y-4">
          {/* Google Calendar */}
          <IntegrationCard
            title="Google Calendar"
            description="Sync interviews with Google Calendar"
            icon={<Calendar className="h-6 w-6 text-red-500" />}
            color="text-red-500"
            bgColor="bg-red-50"
            connected={!!settings.googleCalendar?.clientId}
            loading={saving === 'googleCalendar'}
            onTestConnection={() => testConnection('googleCalendar')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('googleCalendar', {
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Client ID" name="clientId" defaultValue={settings.googleCalendar?.clientId} placeholder="Google OAuth Client ID" icon={<Key className="h-4 w-4" />} />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.googleCalendar?.clientSecret} placeholder="Google OAuth Client Secret" icon={<Shield className="h-4 w-4" />} />
            </div>
            <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3">
              <Calendar className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="text-sm text-red-700">
                Create OAuth credentials in <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
          </IntegrationCard>

          {/* Outlook Calendar */}
          <IntegrationCard
            title="Outlook Calendar"
            description="Sync interviews with Microsoft Outlook"
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            color="text-blue-600"
            bgColor="bg-blue-50"
            connected={!!settings.outlookCalendar?.clientId}
            loading={saving === 'outlookCalendar'}
            onTestConnection={() => testConnection('outlookCalendar')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('outlookCalendar', {
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
                tenantId: formData.get('tenantId'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Application ID" name="clientId" defaultValue={settings.outlookCalendar?.clientId} placeholder="Azure AD App ID" icon={<Key className="h-4 w-4" />} />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.outlookCalendar?.clientSecret} placeholder="Azure AD Client Secret" icon={<Shield className="h-4 w-4" />} />
              <InputField label="Tenant ID" name="tenantId" defaultValue={settings.outlookCalendar?.tenantId} placeholder="Azure AD Tenant ID" icon={<Building2 className="h-4 w-4" />} />
            </div>
          </IntegrationCard>
        </div>
      </div>
    </div>
  );
}
