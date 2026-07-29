"use client"

import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain, 
  DollarSign, 
  ArrowUpRight,
  ChevronRight,
  PieChart,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"

const ANALYTICS_DATA = {
  revenue: [4500, 5200, 4800, 6100, 5900, 7200, 8400],
  users: [1200, 1450, 1600, 1550, 1900, 2100, 2450],
  sectors: [
    { name: "AI & ML", value: 35, color: "bg-violet-500" },
    { name: "FinTech", value: 25, color: "bg-blue-500" },
    { name: "SaaS", value: 20, color: "bg-emerald-500" },
    { name: "HealthTech", value: 15, color: "bg-rose-500" },
    { name: "Others", value: 5, color: "bg-slate-400" },
  ]
}

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">Executive Analytics</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Platform-wide Insights & Intelligence</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full">Last 30 Days</Button>
          <Button className="rounded-full">Download Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Users", value: "2.4k", change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Revenue", value: "$12.4k", change: "+8%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "AI Requests", value: "45.2k", change: "+24%", icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Conversion", value: "3.2%", change: "+0.4%", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-3xl font-bold font-heading">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-heading">Revenue Growth</h3>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" /> Revenue
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-200 rounded-full" /> Last Month
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between -z-10 opacity-10">
              {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-slate-900" />)}
            </div>
            
            {ANALYTICS_DATA.revenue.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 9000) * 100}%` }}
                  className="w-full max-w-[40px] bg-primary rounded-t-xl group-hover:bg-primary/80 transition-all relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${val}
                  </div>
                </motion.div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-8">
          <h3 className="text-xl font-bold font-heading">Popular Sectors</h3>
          <div className="space-y-6">
            {ANALYTICS_DATA.sectors.map((sector, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{sector.name}</span>
                  <span className="text-muted-foreground">{sector.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sector.value}%` }}
                    className={`h-full ${sector.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full rounded-full group">
            View All Sectors <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
