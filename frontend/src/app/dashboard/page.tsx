"use client"

import { useEffect, useState } from "react"
import { Rocket, Target, Zap, Clock, MessageSquare, Users, TrendingUp, ShieldCheck, Layers, Sparkles, Lock, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { profilesApi } from "@/lib/api/profiles"

export default function DashboardPage() {
  const { user, isAuthenticated, sector: activeSectorId } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)
  const [stats, setStats] = useState({
    roadmapProgress: 0,
    generationStatus: "pending"
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats()
    }
  }, [isAuthenticated])

  const loadDashboardStats = async () => {
    try {
      const status = await profilesApi.getStatus()
      setStats({
        roadmapProgress: status.onboarding_completed ? 100 : 0,
        generationStatus: status.generation_status
      })
    } catch (error: any) {
      if (error?.status !== 401) {
        console.error('Failed to load dashboard stats:', error)
      }
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold font-heading">
              {getGreeting()}, {user?.full_name || 'Founder'}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeSector.badgeColor} flex items-center gap-1.5`}>
              <Lock className="w-3 h-3 text-muted-foreground" />
              {activeSector.name} Sector
            </span>
          </div>
          <p className="text-muted-foreground">
            Here's what's happening with your <strong className="text-foreground">{activeSector.name}</strong> venture today.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="self-start md:self-auto text-xs font-semibold text-muted-foreground hover:text-primary border border-border/80 hover:border-primary/40 px-3 py-2 rounded-xl flex items-center gap-2 bg-card/50 transition-colors shadow-xs"
          title="To change your sector, you must return to Onboarding"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Change Sector (via Onboarding)
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Onboarding Status</h3>
            <p className="text-sm text-muted-foreground">
              {stats.generationStatus === "completed" ? "All set!" : stats.generationStatus === "generating" ? "Generating..." : "Pending"}
            </p>
          </div>
          <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${stats.roadmapProgress}%` }}
            />
          </div>
          <p className="text-xs text-primary font-medium">{stats.roadmapProgress}% Complete</p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-bold">AI Copilot</h3>
            <p className="text-sm text-muted-foreground">Get startup advice</p>
          </div>
          <Link href="/dashboard/chat">
            <Button variant="outline" size="sm" className="w-full rounded-full">
              Start Chat
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold">Active Sector</h3>
            <p className="text-sm text-muted-foreground">{activeSector.name}</p>
          </div>
          <div className="text-xs text-amber-600 font-medium">
            TAM: {activeSector.marketSize}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold">Platform Status</h3>
            <p className="text-sm text-muted-foreground">Unlimited usage</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            All systems active
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/chat">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-medium">Ask AI Copilot</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Get instant startup advice</p>
            </div>
          </Link>

          <Link href="/dashboard/roadmap">
            <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 hover:bg-violet-500/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                <span className="font-medium">View Roadmap</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Track your progress</p>
            </div>
          </Link>

          <Link href="/dashboard/pitch">
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Practice Pitch</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Perfect your presentation</p>
            </div>
          </Link>

          <Link href="/dashboard/mentors">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Ask Mentors</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Get expert advice</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Live & Connected Platform Benefits */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Real-Time & Secure Platform</h3>
            <p className="text-sm text-muted-foreground">
              Your startup workspace is active with continuous AI insights, enterprise-grade encryption, and live market intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
