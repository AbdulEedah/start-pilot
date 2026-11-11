"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Rocket, 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Sparkles, 
  Cpu, 
  Presentation, 
  TrendingUp, 
  Target, 
  Users,
  Menu,
  X,
  Lock,
  RotateCcw,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, sector: activeSectorId, logout } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auto-close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Protect all dashboard routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/dashboard/roadmap", label: "Roadmap", icon: TrendingUp },
    { href: "/dashboard/mentors", label: "Mentor", icon: Users },
    { href: "/dashboard/pitch", label: "Pitch", icon: Presentation },
    { href: "/dashboard/recommendations", label: "Recommendation", icon: Sparkles },
    { href: "/dashboard/tools", label: "AI Tool Hub", icon: Cpu, badge: "Soon" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ...(user?.is_staff
      ? [{ href: "/admin", label: "Admin Center", icon: ShieldCheck, extra: "text-primary font-bold" }]
      : []),
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
            <Rocket className="w-6 h-6 text-primary animate-bounce" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      
      {/* Mobile Top Header (Visible on screens smaller than md) */}
      <header className="md:hidden h-16 border-b bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold font-heading text-lg">Start Pilot</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeSector.badgeColor} flex items-center gap-1`}>
            <Lock className="w-2.5 h-2.5" />
            {activeSector.name}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu navigation"
            className="rounded-xl border border-border/60"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
          >
            {/* User & Sector Header */}
            <div className="p-4 rounded-2xl bg-card border border-border/80 mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{user?.full_name || 'Founder'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link 
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20"
              >
                <RotateCcw className="w-3 h-3" />
                Change Sector
              </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.extra || ""}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-4 border-t space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Appearance</span>
                <ThemeToggle />
              </div>

              <Button
                variant="outline"
                className="w-full rounded-2xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-card/30 backdrop-blur-md hidden md:flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold font-heading text-lg">Start Pilot</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href 
                  ? "bg-primary/10 text-primary border border-primary/20 font-bold" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.extra || ""}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* User Info */}
          <div className="px-2">
            <p className="text-xs font-medium text-foreground">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Founder Workspace
              </p>
              <Link href="/onboarding" className="text-[10px] font-semibold text-muted-foreground hover:text-primary underline">
                Sector Lock
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Focus: <strong className="text-foreground">{activeSector.name}</strong></p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
