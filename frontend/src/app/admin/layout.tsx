"use client"

import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  FileText, 
  LayoutGrid, 
  LogOut, 
  Bell,
  Settings
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: "Platform Analytics", href: "/admin/analytics", icon: LayoutGrid },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Content Control", href: "/admin/content", icon: FileText },
    { label: "System Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b bg-primary/5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold font-heading text-primary">Admin Center</span>
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

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <Link href="/dashboard" className="p-2 text-slate-400 hover:text-primary transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-white dark:bg-slate-900 px-8 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            {navItems.find(i => i.href === pathname)?.label || "Administration"}
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
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

function Button({ className, variant, size, ...props }: any) {
  // Simple local button to avoid imports in layout
  return <button className={`inline-flex items-center justify-center rounded-lg ${className}`} {...props} />
}
