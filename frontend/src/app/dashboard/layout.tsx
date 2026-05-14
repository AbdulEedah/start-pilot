"use client"

import { Rocket, MessageSquare, LayoutDashboard, Settings, LogOut, Sparkles, Cpu, Presentation, TrendingUp, Target, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/30 backdrop-blur-md hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold font-heading">Start Pilot</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <Link 
            href="/dashboard/chat" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/chat" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Copilot
          </Link>
          <Link 
            href="/dashboard/pitch" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/pitch" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <Presentation className="w-4 h-4" />
            AI Pitching
          </Link>
          <Link 
            href="/dashboard/roadmap" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/roadmap" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Roadmap
          </Link>
          <Link 
            href="/dashboard/recommendations" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/recommendations" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Recommendations
          </Link>
          <Link 
            href="/dashboard/mentors" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/mentors" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <Users className="w-4 h-4" />
            Mentorship
          </Link>
          <Link 
            href="/dashboard/tools" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/tools" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Tools Hub
          </Link>
          <Link 
            href="/dashboard/pricing" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/dashboard/pricing" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
            }`}
          >
            <Target className="w-4 h-4 text-amber-500" />
            Pricing & Pro
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <Link href="/" className="p-2 text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Free Plan</p>
            <p className="text-xs text-muted-foreground mb-3">3/5 ideas validated</p>
            <div className="w-full h-1 bg-accent rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/5" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
