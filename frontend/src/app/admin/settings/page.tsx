"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Shield, 
  Key, 
  Globe, 
  Database,
  Lock,
  Zap,
  Save,
  RefreshCw,
  Server,
  Cpu,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { adminApi, type AdminSettingsResponse } from "@/lib/api"
import { toast } from "sonner"

const DEFAULT_SETTINGS: AdminSettingsResponse = {
  settings: {
    platform_name: "Start Pilot",
    support_email: "support@startpilot.io",
    maintenance_mode: false,
    enforce_mfa: true,
    rate_limiting: true,
    session_timeout_hours: 2,
  },
  system: {
    database: "Online (PostgreSQL / SQLite Local)",
    ai_engine: "Google Gemini 3.5 Flash Active",
    celery: "Eager / Background Workers Ready",
    api_version: "v1.2.0",
  },
}

export default function AdminSettingsPage() {
  const [data, setData] = useState<AdminSettingsResponse>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"general" | "security" | "system">("general")

  // Form fields state
  const [platformName, setPlatformName] = useState("Start Pilot")
  const [supportEmail, setSupportEmail] = useState("support@startpilot.io")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [enforceMfa, setEnforceMfa] = useState(true)
  const [rateLimiting, setRateLimiting] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState(2)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getSettings()
      if (res && res.settings) {
        setData(res)
        setPlatformName(res.settings.platform_name || "Start Pilot")
        setSupportEmail(res.settings.support_email || "support@startpilot.io")
        setMaintenanceMode(Boolean(res.settings.maintenance_mode))
        setEnforceMfa(Boolean(res.settings.enforce_mfa))
        setRateLimiting(Boolean(res.settings.rate_limiting))
        setSessionTimeout(Number(res.settings.session_timeout_hours) || 2)
      }
    } catch (error) {
      console.warn("Using default settings fallback:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await adminApi.saveSettings({
        platform_name: platformName,
        support_email: supportEmail,
        maintenance_mode: maintenanceMode,
        enforce_mfa: enforceMfa,
        rate_limiting: rateLimiting,
        session_timeout_hours: sessionTimeout,
      })
      toast.success("Settings updated successfully", {
        description: "Global configurations and platform security protocols have been refreshed.",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to persist settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-5xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
              System Settings
            </h1>
            <Badge variant="outline" className="rounded-full text-xs">
              Config Center
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage global parameters, AI copilot parameters, and platform security protocols.
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="rounded-full px-6 shadow-lg shadow-primary/20 gap-2 self-start sm:self-auto"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {[
            { id: "general", label: "General & Branding", icon: Settings },
            { id: "security", label: "Security & Access", icon: Shield },
            { id: "system", label: "System Health & Engine", icon: Server },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mt-6 space-y-2">
            <p className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> StartPilot Engine
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All administrative changes apply across both the Django REST API cluster and Next.js frontend clients in real time.
            </p>
          </div>
        </div>

        {/* Tab Form Areas */}
        <div className="md:col-span-2 space-y-8">
          {/* General Tab */}
          {activeTab === "general" && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold font-heading">Platform Identity & Operations</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Platform Public Name
                  </label>
                  <Input 
                    value={platformName} 
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="rounded-xl h-11" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Support & Escalation Email
                  </label>
                  <Input 
                    type="email"
                    value={supportEmail} 
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="rounded-xl h-11" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border">
                  <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                      Maintenance Mode
                      {maintenanceMode && (
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Restrict standard founder access while deploying updates or database migrations.
                    </p>
                  </div>
                  <Switch 
                    checked={maintenanceMode} 
                    onCheckedChange={setMaintenanceMode} 
                  />
                </div>
              </div>
            </section>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-3">
                <Lock className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold font-heading">Security & Access Protocols</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border">
                  <div>
                    <p className="font-bold text-sm">Enforce Staff MFA</p>
                    <p className="text-xs text-muted-foreground">Require two-step verification for all staff and admin logins.</p>
                  </div>
                  <Switch 
                    checked={enforceMfa} 
                    onCheckedChange={setEnforceMfa} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border">
                  <div>
                    <p className="font-bold text-sm">API Rate Limiting</p>
                    <p className="text-xs text-muted-foreground">Protect AI generation endpoints and login against brute force abuse.</p>
                  </div>
                  <Switch 
                    checked={rateLimiting} 
                    onCheckedChange={setRateLimiting} 
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Session Timeout (Hours)</p>
                      <p className="text-xs text-muted-foreground">Automatically invalidate JWT refresh tokens after inactivity.</p>
                    </div>
                    <span className="font-mono font-bold text-primary text-sm">{sessionTimeout} hrs</span>
                  </div>
                  <Input 
                    type="number" 
                    min={1} 
                    max={24} 
                    value={sessionTimeout} 
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="rounded-xl w-32"
                  />
                </div>
              </div>
            </section>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-3">
                <Server className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold font-heading">System Health & Infrastructure</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Database Layer", value: data.system.database, icon: Database, status: "Healthy" },
                  { label: "AI Model Provider", value: data.system.ai_engine, icon: Cpu, status: "Online" },
                  { label: "Background Tasks", value: data.system.celery, icon: Zap, status: "Ready" },
                  { label: "Core API Version", value: data.system.api_version, icon: CheckCircle2, status: "Current" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <item.icon className="w-4 h-4 text-primary" />
                        {item.label}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-3">
                <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Connected Integrations</p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="px-3 py-1.5 rounded-xl bg-violet-500/10 text-violet-600 border border-violet-500/20">
                    Google Gemini 3.5 Flash
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Django REST Framework
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    SQLite Database
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
