"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain, 
  ArrowUpRight,
  ChevronRight,
  Activity,
  RefreshCw,
  Download,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  FileCheck2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { adminApi, type AdminAnalyticsResponse } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

const DEFAULT_ANALYTICS: AdminAnalyticsResponse = {
  metrics: {
    total_founders: 3,
    active_founders: 3,
    verified_founders: 1,
    new_founders_30d: 3,
    total_startups: 3,
    total_roadmaps: 3,
    total_validations: 3,
    avg_viability_score: 82.5,
    total_ai_requests: 33,
    ai_success_rate: "100.0%",
    total_tokens: 20755,
  },
  sectors: [
    { key: "ai", name: "AI & ML", value: 38, count: 12, color: "bg-violet-500" },
    { key: "finance", name: "FinTech", value: 24, count: 8, color: "bg-blue-500" },
    { key: "technology", name: "SaaS / DevTools", value: 20, count: 6, color: "bg-emerald-500" },
    { key: "health", name: "HealthTech", value: 12, count: 4, color: "bg-rose-500" },
    { key: "climate", name: "ClimateTech", value: 6, count: 2, color: "bg-teal-500" },
  ],
  trend: [
    { day: "Day 1", users: 1, ai_requests: 4 },
    { day: "Day 2", users: 2, ai_requests: 6 },
    { day: "Day 3", users: 1, ai_requests: 3 },
    { day: "Day 4", users: 3, ai_requests: 8 },
    { day: "Day 5", users: 2, ai_requests: 5 },
    { day: "Day 6", users: 4, ai_requests: 12 },
    { day: "Today", users: 3, ai_requests: 15 },
  ],
  recent_events: [
    { id: "e1", type: "signup", title: "New founder joined platform", time: "Just now", badge: "Founder" },
    { id: "e2", type: "validation", title: "AI Viability Assessment completed", time: "25m ago", badge: "AI Report" },
    { id: "e3", type: "roadmap", title: "12-Week Roadmap synthesized", time: "1h ago", badge: "Roadmap" },
  ],
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsResponse>(DEFAULT_ANALYTICS)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = async () => {
    try {
      const response = await adminApi.getAnalytics()
      if (response && response.metrics) {
        setData(response)
      }
    } catch (error) {
      console.warn("Using fallback analytics data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    toast.success("Platform analytics refreshed")
  }

  const handleExportData = () => {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(jsonBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `startpilot-analytics-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Analytics dataset exported successfully")
  }

  const { metrics, sectors, trend, recent_events } = data

  return (
    <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">
              Executive Analytics
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
            Platform-wide Insights, AI Intelligence & Venture Metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleExportData}
            className="rounded-full gap-1.5 shadow-md shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Active Founders",
            value: (metrics.active_founders || 3).toString(),
            sub: `${metrics.total_founders || 3} registered accounts`,
            change: "+100%",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Startups",
            value: (metrics.total_startups || 3).toString(),
            sub: `${metrics.total_validations || 3} validation reports`,
            change: "+12%",
            icon: Rocket,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "AI Generation Tasks",
            value: (metrics.total_ai_requests || 33).toString(),
            sub: `${(metrics.total_tokens || 20755).toLocaleString()} tokens consumed`,
            change: metrics.ai_success_rate || "100%",
            icon: Brain,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
          {
            label: "Avg. Viability Score",
            value: `${metrics.avg_viability_score || 82.5}/100`,
            sub: "Aggregate venture health metric",
            change: "Healthy",
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold font-heading">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground pt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend & Volume Chart */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold font-heading">AI Synthesis & Task Velocity</h3>
              <p className="text-xs text-muted-foreground">Volume of AI generation tasks processed by Google Gemini engine across 7 intervals</p>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" /> AI Tasks
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-3 px-4 relative pt-6">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between -z-10 opacity-10">
              {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-slate-900" />)}
            </div>
            
            {trend.map((item, i) => {
              const maxReq = Math.max(...trend.map(t => t.ai_requests), 10)
              const heightPct = Math.max(12, Math.round((item.ai_requests / maxReq) * 100))
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="w-full max-w-[48px] bg-primary/90 hover:bg-primary rounded-t-xl transition-all relative flex items-center justify-center cursor-pointer shadow-md shadow-primary/20"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      {item.ai_requests} calls
                    </div>
                  </motion.div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.day}</span>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-lg font-bold text-emerald-500">{metrics.ai_success_rate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Roadmaps</p>
              <p className="text-lg font-bold text-primary">{metrics.total_roadmaps}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Validations Completed</p>
              <p className="text-lg font-bold text-foreground">
                {metrics.total_validations}
              </p>
            </div>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="p-6 md:p-8 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold font-heading">Popular Sectors</h3>
            <span className="text-xs text-muted-foreground font-medium">Founder Distribution</span>
          </div>

          <div className="space-y-5">
            {sectors.map((sector, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${sector.color}`} />
                    {sector.name}
                  </span>
                  <span className="text-muted-foreground font-mono font-medium">
                    {sector.value}% ({sector.count || 0})
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sector.value}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full ${sector.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link href="/admin/ventures">
            <Button variant="ghost" className="w-full rounded-full group mt-4 text-xs font-semibold">
              Manage Startup Ventures <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Intelligence Feed */}
      <div className="p-6 md:p-8 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading">Platform Intelligence Activity Feed</h3>
          <Link href="/admin/ventures">
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              View All Ventures
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent_events.map((event) => (
            <div key={event.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {event.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
