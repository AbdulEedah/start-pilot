"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldOff,
  UserX,
  UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const MOCK_USERS = [
  { id: "1", name: "Sarah Jenkins", email: "sarah@ecoflow.com", status: "Active", plan: "Pro Pilot", joined: "2026-05-10" },
  { id: "2", name: "Alex Rivera", email: "alex@fintech.io", status: "Active", plan: "Enterprise", joined: "2026-05-08" },
  { id: "3", name: "David Chen", email: "david@ai-labs.co", status: "Suspended", plan: "Starter", joined: "2026-05-01" },
  { id: "4", name: "Emma Wilson", email: "emma@style.com", status: "Active", plan: "Starter", joined: "2026-04-25" },
  { id: "5", name: "James Bond", email: "007@mi6.gov", status: "Active", plan: "Pro Pilot", joined: "2026-04-20" },
]

export default function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS)

  const handleStatusToggle = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active'
        toast.success(`User ${u.name} is now ${newStatus}`)
        return { ...u, status: newStatus }
      }
      return u
    }))
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading">User Management</h1>
          <p className="text-muted-foreground">Manage accounts, monitor activity, and handle suspensions.</p>
        </div>
        <Button className="rounded-full">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-10 rounded-xl" />
        </div>
        <Button variant="outline" className="rounded-xl">Filters</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.status === 'Active' ? 'default' : 'destructive'}
                    className={`rounded-full text-[10px] uppercase font-bold tracking-widest ${
                      user.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                    }`}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user.plan === 'Enterprise' ? 'bg-violet-500' : 
                      user.plan === 'Pro Pilot' ? 'bg-primary' : 'bg-slate-400'
                    }`} />
                    <span className="text-sm font-medium">{user.plan}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {user.joined}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className={user.status === 'Active' ? 'text-destructive' : 'text-emerald-600'}
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === 'Active' ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" /> Suspend User
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" /> Reactivate User
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border">
        <p className="text-sm text-muted-foreground">Showing 5 of 1,240 users</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="rounded-lg">Previous</Button>
          <Button variant="outline" size="sm" className="rounded-lg">Next</Button>
        </div>
      </div>
    </div>
  )
}
