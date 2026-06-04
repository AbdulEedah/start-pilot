"use client"

import { useEffect, useState } from "react"
import { Rocket, Target, Zap, Clock, WifiOff, MessageSquare, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useOffline } from "@/components/offline-provider"
import { offlineStorage, ChatSession, Roadmap } from "@/lib/offline-storage"

export default function DashboardPage() {
  const { user } = useOffline()
  const [stats, setStats] = useState({
    chatSessions: 0,
    roadmapProgress: 0,
    totalTasks: 0,
    completedTasks: 0
  })

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const chatSessions = await offlineStorage.getAll<ChatSession>('chatSessions')
      const roadmaps = await offlineStorage.getAll<Roadmap>('roadmaps')
      
      let totalTasks = 0
      let completedTasks = 0
      
      roadmaps.forEach(roadmap => {
        totalTasks += roadmap.items.length
        completedTasks += roadmap.items.filter(item => item.status === 'completed').length
      })

      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      setStats({
        chatSessions: chatSessions.length,
        roadmapProgress: progress,
        totalTasks,
        completedTasks
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
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
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold font-heading">
            {getGreeting()}, {user?.name || 'Founder'}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-medium">
            <WifiOff className="w-3 h-3" />
            Offline Mode
          </div>
        </div>
        <p className="text-muted-foreground">Here's what's happening with your startup today - completely offline and private.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Roadmap Progress</h3>
            <p className="text-sm text-muted-foreground">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
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
            <h3 className="font-bold">AI Conversations</h3>
            <p className="text-sm text-muted-foreground">{stats.chatSessions} active sessions</p>
          </div>
          <Link href="/dashboard/chat">
            <Button variant="outline" size="sm" className="w-full rounded-full">
              Continue Chat
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold">Offline Features</h3>
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

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { 
              icon: MessageSquare, 
              text: "Started AI conversation about market validation", 
              time: "2 hours ago",
              color: "text-primary"
            },
            { 
              icon: TrendingUp, 
              text: "Generated startup roadmap with 7 milestones", 
              time: "3 hours ago",
              color: "text-violet-500"
            },
            { 
              icon: Users, 
              text: "Asked mentor about fundraising strategy", 
              time: "1 day ago",
              color: "text-emerald-500"
            },
            { 
              icon: WifiOff, 
              text: "Switched to offline mode for privacy", 
              time: "2 days ago",
              color: "text-orange-500"
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Benefits */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
            <WifiOff className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-900 dark:text-orange-100">100% Offline & Private</h3>
            <p className="text-sm text-orange-700 dark:text-orange-200">
              Your startup ideas, conversations, and data never leave your device. Work with complete privacy and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
