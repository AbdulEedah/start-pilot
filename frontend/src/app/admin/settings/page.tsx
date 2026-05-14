"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Shield, 
  Key, 
  Globe, 
  Bell, 
  Database,
  Lock,
  Zap,
  Save,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Settings updated successfully", {
        description: "Global platform configurations have been refreshed."
      })
    }, 1500)
  }

  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">System Settings</h1>
          <p className="text-muted-foreground font-medium">Manage platform-wide configurations and security protocols.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-8 shadow-lg shadow-primary/20">
          {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Nav */}
        <div className="space-y-2">
          {[
            { label: "General", icon: Settings, active: true },
            { label: "Security", icon: Shield },
            { label: "API & Integrations", icon: Key },
            { label: "Database", icon: Database },
            { label: "Notifications", icon: Bell },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                item.active 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="md:col-span-2 space-y-8">
          {/* Platform Config */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Platform Configuration
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Platform Name</label>
                <Input defaultValue="Start Pilot" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Support Email</label>
                <Input defaultValue="support@startpilot.ai" className="rounded-xl h-12" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <p className="font-bold text-sm">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Restrict user access while performing updates.</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>

          {/* Security Center */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" /> Security Center
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <p className="font-bold text-sm">Enforce MFA</p>
                  <p className="text-xs text-muted-foreground">Require Multi-Factor Authentication for all admins.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <p className="font-bold text-sm">Rate Limiting</p>
                  <p className="text-xs text-muted-foreground">Protect APIs from brute-force and DDoS attacks.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <p className="font-bold text-sm">Session Timeout</p>
                  <p className="text-xs text-muted-foreground">Automatically log out users after 2 hours of inactivity.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          {/* API Management */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> API Management
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">OpenAI API Key</label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••••••••••••••••••" className="rounded-xl h-12 flex-1" disabled />
                  <Button variant="outline" className="rounded-xl h-12">Rotate Key</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Stripe Secret Key</label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••••••••••••••••••" className="rounded-xl h-12 flex-1" disabled />
                  <Button variant="outline" className="rounded-xl h-12">Rotate Key</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
