'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Mail, Bell, Shield, Globe, Database, Smartphone, Slack, Github, Linkedin, ArrowRight, Briefcase, Video, Calendar, Building2, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const integrationCategories = [
    {
      title: 'Job Boards',
      description: 'LinkedIn, Indeed, Naukri, Glassdoor, Monster, ZipRecruiter',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      count: '6 platforms'
    },
    {
      title: 'Enterprise HCM',
      description: 'Workday integration for enterprise recruitment',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      count: '1 platform'
    },
    {
      title: 'Video Conferencing',
      description: 'Zoom, Microsoft Teams, Cisco Webex',
      icon: Video,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      count: '3 platforms'
    },
    {
      title: 'Calendar & Email',
      description: 'Google Calendar, Outlook, SMTP, SendGrid',
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      count: '4 services'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and integrations.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 w-full justify-start border-b border-gray-200 bg-transparent p-0">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile Information</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input defaultValue="Alex Johnson" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input defaultValue="alex.j@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <Input defaultValue="Acme Inc." />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Input defaultValue="Senior Recruiter" disabled />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </GlassCard>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <GlassCard className="p-6">
             <h2 className="mb-4 text-lg font-semibold text-gray-900">Email Notifications</h2>
             <div className="space-y-4">
               {[
                 'New candidate application',
                 'Interview scheduled',
                 'Daily digest',
                 'Weekly performance report'
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-gray-700">{item}</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                 </div>
               ))}
             </div>
          </GlassCard>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Hero Card with CTA */}
          <GlassCard className="p-6 bg-gradient-to-r from-primary/5 to-emerald-50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Third-Party Integrations</h2>
                <p className="text-gray-500 mt-1">
                  Connect job boards, video conferencing, calendar, and email services to streamline your recruitment workflow.
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/settings/integrations')}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                Manage All Integrations
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </GlassCard>

          {/* Integration Categories Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {integrationCategories.map((category, i) => (
              <GlassCard
                key={i}
                className="p-5 cursor-pointer hover:shadow-md transition-all group"
                onClick={() => router.push('/dashboard/settings/integrations')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{category.count}</span>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Quick Connect Cards */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Connect</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Slack */}
              <GlassCard className="flex flex-col justify-between p-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Slack className="h-5 w-5 text-gray-700" />
                  </div>
                  <h4 className="font-medium text-gray-900">Slack</h4>
                  <p className="text-xs text-gray-500 mt-1">Team notifications</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Connect</Button>
              </GlassCard>

              {/* LinkedIn */}
              <GlassCard className="flex flex-col justify-between p-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">LinkedIn</h4>
                  <p className="text-xs text-gray-500 mt-1">Jobs & candidates</p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => { e.stopPropagation(); router.push('/dashboard/settings/integrations'); }}
                >
                  Configure
                </Button>
              </GlassCard>

              {/* GitHub */}
              <GlassCard className="flex flex-col justify-between p-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Github className="h-5 w-5 text-gray-900" />
                  </div>
                  <h4 className="font-medium text-gray-900">GitHub</h4>
                  <p className="text-xs text-gray-500 mt-1">Portfolio analysis</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Connect</Button>
              </GlassCard>

              {/* Zoom */}
              <GlassCard className="flex flex-col justify-between p-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-gray-900">Zoom</h4>
                  <p className="text-xs text-gray-500 mt-1">Video interviews</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={(e) => { e.stopPropagation(); router.push('/dashboard/settings/integrations'); }}
                >
                  Configure
                </Button>
              </GlassCard>
            </div>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
           <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">Enterprise Plan</h3>
                    <p className="text-gray-500">Billed annually</p>
                 </div>
                 <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Active</span>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                 <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Next billing date</span>
                    <span className="font-medium text-gray-900">October 24, 2024</span>
                 </div>
                 <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Payment method</span>
                    <span className="font-medium text-gray-900">Visa ending in 4242</span>
                 </div>
              </div>
              <div className="mt-6 flex gap-4">
                 <Button variant="outline">Update Payment Method</Button>
                 <Button variant="outline" className="text-red-600 hover:text-red-700">Cancel Subscription</Button>
              </div>
           </GlassCard>
        </TabsContent>

      </Tabs>
    </div>
  );
}
