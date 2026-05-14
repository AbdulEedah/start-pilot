"use client"

import { motion } from "framer-motion"
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const STATS = [
  { label: "Total Revenue", value: "$12,450", change: "+12.5%", trend: "up", icon: DollarSign },
  { label: "Active Subs", value: "842", change: "+8.2%", trend: "up", icon: Users },
  { label: "Churn Rate", value: "2.4%", change: "-0.5%", trend: "down", icon: TrendingUp },
]

const TRANSACTIONS = [
  { id: "TX1001", user: "Sarah Jenkins", amount: "$29.00", status: "Success", date: "2026-05-12" },
  { id: "TX1002", user: "Alex Rivera", amount: "$99.00", status: "Success", date: "2026-05-11" },
  { id: "TX1003", user: "David Chen", amount: "$29.00", status: "Failed", date: "2026-05-11" },
  { id: "TX1004", user: "Emma Wilson", amount: "$29.00", status: "Success", date: "2026-05-10" },
]

export default function SubscriptionManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor revenue, manage plans, and track payments.</p>
        </div>
        <Button variant="outline" className="rounded-full">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-3xl font-bold font-heading">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">Recent Transactions</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                  <TableCell className="font-bold text-sm">{tx.user}</TableCell>
                  <TableCell className="font-medium">{tx.amount}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'Success' ? 'default' : 'destructive'} className="rounded-full text-[10px] uppercase">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="rounded-full">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
