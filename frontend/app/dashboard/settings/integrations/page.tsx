'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase,
  Check,
  X,
  AlertCircle,
  Settings2,
  Server,
  Send,
  Clock,
  Plug,
  LogOut,
  Play,
  ArrowRight
} from 'lucide-react';
import { getTenantId } from '@/lib/utils';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  connected: boolean;
  authenticated?: boolean;
  children: React.ReactNode;
  onSave: (e: React.FormEvent) => void;
  onTestConnection?: () => Promise<{ success: boolean; message: string }>;
  onConnect?: () => void;
  onDisconnect?: () => void;
  loading?: boolean;
  requiresOAuth?: boolean;
  setupUrl?: string;
  setupInstructions?: string;
}

function IntegrationCard({
  title,
  description,
  icon,
  color,
  bgColor,
  connected,
  authenticated,
  children,
  onSave,
  onTestConnection,
  onConnect,
  onDisconnect,
  loading,
  requiresOAuth,
  setupUrl,
  setupInstructions,
}: IntegrationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTestConnection();
      setTestResult(result);
      setTimeout(() => setTestResult(null), 5000);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
      setTimeout(() => setTestResult(null), 5000);
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
            {requiresOAuth && authenticated && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                OAuth
              </span>
            )}
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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={onSave} className="border-t border-gray-100 p-6 space-y-5">
              {children}

              {/* OAuth Connect Button */}
              {requiresOAuth && !authenticated && onConnect && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Plug className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Connect Your Account</p>
                      <p className="text-sm text-gray-500">Authenticate with OAuth to enable this integration</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onConnect}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Connect
                  </button>
                </div>
              )}

              {/* Setup Instructions */}
              {setupUrl && setupInstructions && (
                <div className={`${bgColor} rounded-xl p-4 flex items-start gap-3`}>
                  <Settings2 className={`h-5 w-5 ${color} mt-0.5`} />
                  <div className="text-sm">
                    <span className={color}>{setupInstructions}</span>
                    <a href={setupUrl} target="_blank" rel="noopener noreferrer" className={`${color} underline inline-flex items-center gap-1 ml-1`}>
                      {new URL(setupUrl).hostname} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Test Result */}
              {testResult && (
                <div className={`rounded-xl p-4 flex items-center gap-3 ${
                  testResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${testResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                    {testResult.message}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  {authenticated && onDisconnect && (
                    <button
                      type="button"
                      onClick={onDisconnect}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {testing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Testing...</>
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
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InputField({ label, name, type = 'text', defaultValue, placeholder, icon, required, hint }: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-gray-200 bg-white py-3 ${icon ? 'pl-11' : 'pl-4'} pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
        />
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function SelectField({ label, name, defaultValue, options, icon, required }: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <select
          name={name}
          defaultValue={defaultValue}
          required={required}
          className={`w-full rounded-xl border border-gray-200 bg-white py-3 ${icon ? 'pl-11' : 'pl-4'} pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90" />
      </div>
    </div>
  );
}

function CheckboxField({ label, name, defaultChecked, hint }: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    linkedin: {},
    indeed: {},
    glassdoor: {},
    naukri: {},
    monster: {},
    ziprecruiter: {},
    workday: {},
    zoom: {},
    teams: {},
    webex: {},
    googleCalendar: {},
    outlookCalendar: {},
    email: { provider: 'smtp', smtp: {}, sendgrid: {} },
  });

  const tenantId = getTenantId();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchSettings();
    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const message = params.get('message');
    const error = params.get('error');

    if (success && message) {
      setSuccessMessage(decodeURIComponent(message));
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${apiUrl}/integrations/settings?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          ...settings,
          ...data,
          email: data.email || { provider: 'smtp', smtp: {}, sendgrid: {} },
        });
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
      await fetch(`${apiUrl}/integrations/settings?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [section]: data })
      });
      setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings', error);
      setErrorMessage('Failed to save settings');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const testConnection = async (section: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${apiUrl}/integrations/settings/test?tenantId=${tenantId}&provider=${section}`, {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        return result;
      }
      return { success: false, message: 'Failed to test connection' };
    } catch (error) {
      return { success: false, message: 'Connection test failed' };
    }
  };

  const initiateOAuth = async (provider: string) => {
    const redirectUrl = window.location.href;
    window.location.href = `${apiUrl}/oauth/${provider}/authorize?tenantId=${tenantId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
  };

  const disconnectOAuth = async (provider: string) => {
    try {
      await fetch(`${apiUrl}/oauth/${provider}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      });
      fetchSettings();
      setSuccessMessage(`${provider} disconnected successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to disconnect');
      setTimeout(() => setErrorMessage(null), 3000);
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

  const countConnected = (sections: string[]) =>
    sections.filter(s => {
      const data = settings[s];
      return data && (data.clientId || data.accountId || data.apiKey || data.accessToken || data.tenantId || data.username);
    }).length;

  const emailConnected = !!(
    settings.email?.sendgrid?.apiKey ||
    (settings.email?.smtp?.host && settings.email?.smtp?.username)
  );

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-lg"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-lg"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
        <p className="text-gray-500 mt-1">Connect your job boards, video conferencing, calendar, and email platforms</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Job Boards', value: countConnected(['linkedin', 'indeed', 'glassdoor', 'naukri', 'monster', 'ziprecruiter']), total: 6, icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { label: 'Enterprise', value: countConnected(['workday']), total: 1, icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-100' },
          { label: 'Video', value: countConnected(['zoom', 'teams', 'webex']), total: 3, icon: Video, color: 'text-pink-600', bgColor: 'bg-pink-100' },
          { label: 'Calendars', value: countConnected(['googleCalendar', 'outlookCalendar']), total: 2, icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-100' },
          { label: 'Email', value: emailConnected ? 1 : 0, total: 1, icon: Mail, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
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
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}/{stat.total}</div>
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
            description="Post jobs to LinkedIn and source candidates with OAuth"
            icon={<Linkedin className="h-6 w-6 text-blue-600" />}
            color="text-blue-600"
            bgColor="bg-blue-100"
            connected={!!(settings.linkedin?.clientId || settings.linkedin?.accessToken)}
            authenticated={!!settings.linkedin?.accessToken}
            loading={saving === 'linkedin'}
            requiresOAuth={true}
            onConnect={() => initiateOAuth('linkedin')}
            onDisconnect={() => disconnectOAuth('linkedin')}
            onTestConnection={() => testConnection('linkedin')}
            setupUrl="https://developer.linkedin.com/apps"
            setupInstructions="Create an app in the"
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('linkedin', {
                ...settings.linkedin,
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
                organizationId: formData.get('organizationId'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Client ID" name="clientId" defaultValue={settings.linkedin?.clientId} placeholder="LinkedIn Client ID" icon={<Key className="h-4 w-4" />} required />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.linkedin?.clientSecret} placeholder="LinkedIn Client Secret" icon={<Shield className="h-4 w-4" />} required />
              <InputField label="Organization ID" name="organizationId" defaultValue={settings.linkedin?.organizationId} placeholder="LinkedIn Organization ID" icon={<Building2 className="h-4 w-4" />} hint="Your company's LinkedIn organization ID" />
            </div>
          </IntegrationCard>

          {/* Indeed */}
          <IntegrationCard
            title="Indeed"
            description="Post jobs to Indeed and import applications via Partner API"
            icon={<Globe className="h-6 w-6 text-blue-800" />}
            color="text-blue-800"
            bgColor="bg-blue-50"
            connected={!!settings.indeed?.apiKey}
            loading={saving === 'indeed'}
            onTestConnection={() => testConnection('indeed')}
            setupUrl="https://developers.indeed.com/"
            setupInstructions="Apply for Partner API access at"
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
              <InputField label="API Key" name="apiKey" type="password" defaultValue={settings.indeed?.apiKey} placeholder="Indeed Partner API Key" icon={<Key className="h-4 w-4" />} required />
              <InputField label="Employer ID" name="employerId" defaultValue={settings.indeed?.employerId} placeholder="Indeed Employer ID" icon={<Building2 className="h-4 w-4" />} required />
              <InputField label="Sponsored Posting Key" name="sponsoredKey" type="password" defaultValue={settings.indeed?.sponsoredKey} placeholder="For sponsored job posts" icon={<Zap className="h-4 w-4" />} hint="Optional: For promoted job listings" />
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
            setupUrl="https://www.naukri.com/recruiter/"
            setupInstructions="Get partner API credentials from"
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('naukri', {
                accountId: formData.get('accountId'),
                apiKey: formData.get('apiKey'),
                apiSecret: formData.get('apiSecret'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Account ID" name="accountId" defaultValue={settings.naukri?.accountId} placeholder="Naukri Account ID" icon={<User className="h-4 w-4" />} required />
              <InputField label="API Key" name="apiKey" type="password" defaultValue={settings.naukri?.apiKey} placeholder="Naukri API Key" icon={<Key className="h-4 w-4" />} required />
              <InputField label="API Secret" name="apiSecret" type="password" defaultValue={settings.naukri?.apiSecret} placeholder="Naukri API Secret" icon={<Shield className="h-4 w-4" />} />
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

      {/* Enterprise Integration Section */}
      <div>
        <SectionHeader
          title="Enterprise Integration"
          description="Connect to enterprise HCM and ATS systems"
          icon={Building2}
        />
        <div className="space-y-4">
          {/* Workday */}
          <IntegrationCard
            title="Workday"
            description="Sync jobs and candidates with Workday HCM"
            icon={<Building2 className="h-6 w-6 text-orange-600" />}
            color="text-orange-600"
            bgColor="bg-orange-50"
            connected={!!(settings.workday?.username && settings.workday?.tenantName)}
            loading={saving === 'workday'}
            onTestConnection={() => testConnection('workday')}
            setupUrl="https://community.workday.com/developer"
            setupInstructions="Set up API access in Workday. Documentation at"
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('workday', {
                tenantName: formData.get('tenantName'),
                username: formData.get('username'),
                password: formData.get('password'),
                baseUrl: formData.get('baseUrl'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Tenant Name" name="tenantName" defaultValue={settings.workday?.tenantName} placeholder="Your Workday tenant name" icon={<Building2 className="h-4 w-4" />} required />
              <InputField label="Base URL" name="baseUrl" defaultValue={settings.workday?.baseUrl || 'https://wd2-impl-services1.workday.com'} placeholder="https://wd2-impl-services1.workday.com" icon={<Globe className="h-4 w-4" />} required />
              <InputField label="Integration Username" name="username" defaultValue={settings.workday?.username} placeholder="Integration system user" icon={<User className="h-4 w-4" />} required />
              <InputField label="Password" name="password" type="password" defaultValue={settings.workday?.password} placeholder="Integration password" icon={<Shield className="h-4 w-4" />} required />
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
            setupUrl="https://marketplace.zoom.us"
            setupInstructions="Create a Server-to-Server OAuth app in the"
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
            setupUrl="https://portal.azure.com"
            setupInstructions="Register an app in Azure Portal with Graph API permissions at"
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
            description="Sync interviews with Google Calendar and create Meet links"
            icon={<Calendar className="h-6 w-6 text-red-500" />}
            color="text-red-500"
            bgColor="bg-red-50"
            connected={!!(settings.googleCalendar?.clientId || settings.googleCalendar?.accessToken)}
            authenticated={!!settings.googleCalendar?.accessToken}
            loading={saving === 'googleCalendar'}
            requiresOAuth={true}
            onConnect={() => initiateOAuth('google-calendar')}
            onDisconnect={() => disconnectOAuth('google-calendar')}
            onTestConnection={() => testConnection('googleCalendar')}
            setupUrl="https://console.cloud.google.com"
            setupInstructions="Create OAuth credentials in"
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              handleSave('googleCalendar', {
                ...settings.googleCalendar,
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
              });
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField label="Client ID" name="clientId" defaultValue={settings.googleCalendar?.clientId} placeholder="Google OAuth Client ID" icon={<Key className="h-4 w-4" />} required />
              <InputField label="Client Secret" name="clientSecret" type="password" defaultValue={settings.googleCalendar?.clientSecret} placeholder="Google OAuth Client Secret" icon={<Shield className="h-4 w-4" />} required />
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
            setupUrl="https://portal.azure.com"
            setupInstructions="Register an app in Azure Portal at"
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

      {/* Email Services Section */}
      <div>
        <SectionHeader
          title="Email Services"
          description="Configure transactional email for notifications and communication"
          icon={Mail}
        />
        <div className="space-y-4">
          {/* Email Provider Selection */}
          <IntegrationCard
            title="Email Configuration"
            description="Set up SMTP or SendGrid for transactional emails"
            icon={<Mail className="h-6 w-6 text-emerald-600" />}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            connected={emailConnected}
            loading={saving === 'email'}
            onTestConnection={() => testConnection('email')}
            onSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              const provider = formData.get('provider') as 'smtp' | 'sendgrid';

              const emailSettings: any = { provider };

              if (provider === 'smtp') {
                emailSettings.smtp = {
                  host: formData.get('smtpHost'),
                  port: parseInt(formData.get('smtpPort') as string) || 587,
                  secure: formData.get('smtpSecure') === 'on',
                  username: formData.get('smtpUsername'),
                  password: formData.get('smtpPassword'),
                  fromName: formData.get('fromName'),
                  fromEmail: formData.get('fromEmail'),
                };
              } else {
                emailSettings.sendgrid = {
                  apiKey: formData.get('sendgridApiKey'),
                  fromName: formData.get('fromName'),
                  fromEmail: formData.get('fromEmail'),
                  sandboxMode: formData.get('sandboxMode') === 'on',
                };
              }

              handleSave('email', emailSettings);
            }}
          >
            <div className="space-y-6">
              <SelectField
                label="Email Provider"
                name="provider"
                defaultValue={settings.email?.provider || 'smtp'}
                options={[
                  { value: 'smtp', label: 'SMTP Server' },
                  { value: 'sendgrid', label: 'SendGrid' },
                ]}
                icon={<Server className="h-4 w-4" />}
              />

              {/* Common Fields */}
              <div className="grid gap-5 md:grid-cols-2">
                <InputField label="From Name" name="fromName" defaultValue={settings.email?.smtp?.fromName || settings.email?.sendgrid?.fromName || ''} placeholder="Your Company Name" icon={<User className="h-4 w-4" />} required />
                <InputField label="From Email" name="fromEmail" type="email" defaultValue={settings.email?.smtp?.fromEmail || settings.email?.sendgrid?.fromEmail || ''} placeholder="noreply@yourcompany.com" icon={<Mail className="h-4 w-4" />} required />
              </div>

              {/* SMTP Fields */}
              <div className="space-y-4" id="smtp-fields">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  SMTP Configuration
                </h4>
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField label="SMTP Host" name="smtpHost" defaultValue={settings.email?.smtp?.host || ''} placeholder="smtp.gmail.com" icon={<Globe className="h-4 w-4" />} />
                  <InputField label="SMTP Port" name="smtpPort" type="number" defaultValue={settings.email?.smtp?.port?.toString() || '587'} placeholder="587" icon={<Settings2 className="h-4 w-4" />} />
                  <InputField label="Username" name="smtpUsername" defaultValue={settings.email?.smtp?.username || ''} placeholder="your-email@gmail.com" icon={<User className="h-4 w-4" />} />
                  <InputField label="Password" name="smtpPassword" type="password" defaultValue={settings.email?.smtp?.password || ''} placeholder="App password or SMTP password" icon={<Shield className="h-4 w-4" />} />
                </div>
                <CheckboxField label="Use SSL/TLS (port 465)" name="smtpSecure" defaultChecked={settings.email?.smtp?.secure} hint="Enable for secure SMTP connections on port 465" />
              </div>

              {/* SendGrid Fields */}
              <div className="space-y-4 border-t border-gray-100 pt-4" id="sendgrid-fields">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  SendGrid Configuration
                </h4>
                <div className="grid gap-5 md:grid-cols-1">
                  <InputField label="SendGrid API Key" name="sendgridApiKey" type="password" defaultValue={settings.email?.sendgrid?.apiKey || ''} placeholder="SG.xxxxxxxxxxxx" icon={<Key className="h-4 w-4" />} hint="Get your API key from https://app.sendgrid.com/settings/api_keys" />
                </div>
                <CheckboxField label="Sandbox Mode" name="sandboxMode" defaultChecked={settings.email?.sendgrid?.sandboxMode} hint="Enable for testing without sending real emails" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Available Email Templates</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Interview Invitation</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Application Received</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Application Shortlisted</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Application Rejected</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Offer Letter</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Interview Reminder</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Password Reset</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Email Verification</li>
                </ul>
              </div>
            </div>
          </IntegrationCard>
        </div>
      </div>
    </div>
  );
}
