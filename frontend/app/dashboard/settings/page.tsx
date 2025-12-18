'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Mail, Bell, Shield, Globe, Database, Smartphone, Slack, Github, Linkedin } from 'lucide-react';

export default function SettingsPage() {
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

        {/* Integrations Settings (Moved from previous page) */}
        <TabsContent value="integrations" className="space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
            {/* Slack */}
            <GlassCard className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <Slack className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Slack</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Receive notifications about new applicants and interview updates directly in your team channel.
                </p>
              </div>
              <Button variant="outline" className="w-full">Connect</Button>
            </GlassCard>

            {/* LinkedIn */}
            <GlassCard className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Linkedin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">LinkedIn Recruiter</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Sync candidates and job postings directly with LinkedIn Recruiter System Connect.
                </p>
              </div>
               <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Connected</Button>
            </GlassCard>

            {/* GitHub */}
             <GlassCard className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <Github className="h-6 w-6 text-gray-900" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">GitHub</h3>
                <p className="mb-4 text-sm text-gray-500">
                   Automatically analyze developer portfolios and contribution graphs.
                </p>
              </div>
              <Button variant="outline" className="w-full">Connect</Button>
            </GlassCard>

            {/* Zoom */}
            <GlassCard className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                   <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Zoom</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Automatically generate meeting links for scheduled interviews.
                </p>
              </div>
              <Button variant="outline" className="w-full">Connect</Button>
            </GlassCard>
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
