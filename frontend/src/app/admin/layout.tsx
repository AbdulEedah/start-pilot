"use client"

import { useState } from "react"
import { 
  ShieldCheck, 
  Users, 
  Rocket, 
  FileText, 
  LayoutGrid, 
  LogOut, 
  Bell,
  Settings,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  GraduationCap
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isStaffOrAdmin =
    Boolean(user?.is_staff) ||
    Boolean(user?.is_superuser) ||
    user?.role === "admin" ||
    user?.role === "super_admin"

  const isSuperAdmin = Boolean(user?.is_superuser) || user?.role === "super_admin"

  const navItems = [
    { label: "Platform Analytics", href: "/admin/analytics", icon: LayoutGrid },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Startup Ventures", href: "/admin/ventures", icon: Rocket },
    { label: "Mentors & Advisors", href: "/admin/mentors", icon: GraduationCap },
    { label: "Content Control", href: "/admin/content", icon: FileText },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6 text-primary animate-bounce" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating Admin Center...
          </p>
        </div>
      </div>
    )
  }

  // Access control: must be authenticated and staff/admin
  if (!isAuthenticated || !user || !isStaffOrAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border rounded-3xl p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-heading">Staff Access Required</h1>
            <p className="text-sm text-muted-foreground">
              You must be logged in as an authorized administrator or super admin to access the StartPilot Command Center.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> User Dashboard
            </Button>
            <Button
              className="flex-1 rounded-2xl"
              onClick={() => router.push("/login")}
            >
              Admin Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const avatarUrl =
    user.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      user.full_name || user.email || "Admin"
    )}`

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Mobile Top Header */}
      <header className="md:hidden h-16 border-b bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold font-heading text-primary text-base">Admin Center</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-white dark:bg-slate-900 flex flex-col p-6 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 mb-4 flex items-center gap-3">
            <img src={avatarUrl} alt={user.full_name || "Admin"} className="w-10 h-10 rounded-full border" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.full_name || "Administrator"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <ThemeToggle />
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary">
              <LogOut className="w-4 h-4" />
              Exit Admin
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Admin Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 hidden md:flex flex-col shrink-0">
        <div className="p-6 flex items-center justify-between border-b bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold font-heading text-primary block leading-none">Admin Center</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isSuperAdmin ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
              }`}>
                {isSuperAdmin ? "Super Admin" : "Staff Admin"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Card & Bottom Controls */}
        <div className="p-4 border-t space-y-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border flex items-center gap-3">
            <img src={avatarUrl} alt={user.full_name || "Admin"} className="w-9 h-9 rounded-full border shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{user.full_name || "Administrator"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider mt-1 ${
                isSuperAdmin
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}>
                {isSuperAdmin ? "Super Admin" : "Staff Admin"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1"
              title="Open Django Admin Site"
            >
              <span>Django DB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link href="/dashboard" className="p-2 text-slate-400 hover:text-primary transition-colors" title="Exit to Founder Dashboard">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-white dark:bg-slate-900 px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">
              {navItems.find(i => i.href === pathname)?.label || "Administration"}
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Live System
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Founder Dashboard
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border overflow-hidden">
              <img src={avatarUrl} alt={user.full_name || "Admin"} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          {children}
        </main>
      </div>
    </div>
  )
}
