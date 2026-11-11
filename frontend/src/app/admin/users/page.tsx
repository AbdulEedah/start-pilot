"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  RefreshCw,
  Trash2,
  Rocket,
  Activity,
  CheckCircle2,
  X,
  User as UserIcon,
  Zap,
  Lock,
  Ban,
  Plus,
  SlidersHorizontal,
  RotateCcw as ResetIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { adminApi, type AdminUser, type UserRole } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const isCurrentSuper =
    currentUser?.role === "super_admin" || Boolean(currentUser?.is_superuser)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Add User Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState<UserRole>("user")
  const [submittingUser, setSubmittingUser] = useState(false)

  // View User Profile Dialog State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // AI Token Management Dialog State
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false)
  const [tokenUser, setTokenUser] = useState<AdminUser | null>(null)
  const [tokenLimitInput, setTokenLimitInput] = useState<number | string>(100000)
  const [freezeAiInput, setFreezeAiInput] = useState(false)
  const [savingTokens, setSavingTokens] = useState(false)

  const openTokenDialog = (user: AdminUser) => {
    setTokenUser(user)
    setTokenLimitInput(user.token_limit ?? 100000)
    setFreezeAiInput(Boolean(user.ai_access_blocked))
    setTokenDialogOpen(true)
  }

  const handleSaveTokens = async () => {
    if (!tokenUser) return
    const limitNum = Number(tokenLimitInput)
    if (isNaN(limitNum) || limitNum < 0) {
      toast.error("Please enter a valid positive number for token limit (0 for unlimited).")
      return
    }

    try {
      setSavingTokens(true)
      const res = await adminApi.updateUserTokens(tokenUser.id, {
        token_limit: limitNum,
        ai_access_blocked: freezeAiInput,
      })

      setUsers((prev) =>
        prev.map((u) =>
          u.id === tokenUser.id
            ? {
                ...u,
                token_limit: res.token_limit,
                ai_access_blocked: res.ai_access_blocked,
              }
            : u
        )
      )

      setTokenUser((prev) =>
        prev
          ? {
              ...prev,
              token_limit: res.token_limit,
              ai_access_blocked: res.ai_access_blocked,
            }
          : null
      )

      toast.success(`Token quota updated for ${tokenUser.email}`)
      setTokenDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to update user tokens")
    } finally {
      setSavingTokens(false)
    }
  }

  const handleResetUsedTokens = async () => {
    if (!tokenUser) return
    try {
      setSavingTokens(true)
      const res = await adminApi.updateUserTokens(tokenUser.id, { reset_used: true })
      setUsers((prev) =>
        prev.map((u) =>
          u.id === tokenUser.id ? { ...u, tokens_used: res.tokens_used } : u
        )
      )
      setTokenUser((prev) => (prev ? { ...prev, tokens_used: res.tokens_used } : null))
      toast.success(`Consumed tokens for ${tokenUser.email} reset to 0`)
    } catch (error: any) {
      toast.error(error.message || "Failed to reset tokens")
    } finally {
      setSavingTokens(false)
    }
  }

  const handleGrantBonus = async (amount: number) => {
    if (!tokenUser) return
    try {
      setSavingTokens(true)
      const res = await adminApi.updateUserTokens(tokenUser.id, { add_tokens: amount })
      setUsers((prev) =>
        prev.map((u) =>
          u.id === tokenUser.id ? { ...u, token_limit: res.token_limit } : u
        )
      )
      setTokenUser((prev) => (prev ? { ...prev, token_limit: res.token_limit } : null))
      setTokenLimitInput(res.token_limit)
      toast.success(`Granted +${amount.toLocaleString()} bonus tokens to ${tokenUser.email}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to grant bonus tokens")
    } finally {
      setSavingTokens(false)
    }
  }

  const handleSetUnlimited = async () => {
    if (!tokenUser) return
    try {
      setSavingTokens(true)
      const res = await adminApi.updateUserTokens(tokenUser.id, { token_limit: 0 })
      setUsers((prev) =>
        prev.map((u) =>
          u.id === tokenUser.id ? { ...u, token_limit: 0 } : u
        )
      )
      setTokenUser((prev) => (prev ? { ...prev, token_limit: 0 } : null))
      setTokenLimitInput(0)
      toast.success(`Set unlimited token quota for ${tokenUser.email}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to set unlimited quota")
    } finally {
      setSavingTokens(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      if (res && res.users) {
        setUsers(res.users)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 250)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleStatusToggle = async (user: AdminUser) => {
    const willBeActive = user.status !== "Active"
    try {
      await adminApi.updateUser(user.id, { is_active: willBeActive })
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? { ...u, status: willBeActive ? "Active" : "Suspended" }
            : u
        )
      )
      toast.success(`User ${user.name} is now ${willBeActive ? "Active" : "Suspended"}`)
    } catch (error: any) {
      toast.error(error.message || "Could not update user status")
    }
  }

  const handleRoleChange = async (user: AdminUser, newRole: UserRole) => {
    if (newRole === "super_admin" && !isCurrentSuper) {
      toast.error("Only Super Administrators can promote someone to Super Admin.")
      return
    }

    if (user.role === "super_admin" && !isCurrentSuper) {
      toast.error("Only Super Administrators can modify a Super Admin account.")
      return
    }

    try {
      await adminApi.updateUser(user.id, {
        role: newRole,
        is_staff: newRole === "admin" || newRole === "super_admin",
      })

      setUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? {
                ...u,
                role: newRole,
                is_staff: newRole === "admin" || newRole === "super_admin",
                is_superuser: newRole === "super_admin",
              }
            : u
        )
      )

      const roleLabels: Record<UserRole, string> = {
        user: "Founder (User)",
        admin: "Staff Admin",
        super_admin: "Super Admin",
      }

      toast.success(`Role for ${user.name} changed to ${roleLabels[newRole]}`)
    } catch (error: any) {
      toast.error(error.message || "Could not update user role")
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (String(user.id) === String(currentUser?.id)) {
      toast.error("You cannot delete your own administrator account.")
      return
    }

    if (user.role === "super_admin" && !isCurrentSuper) {
      toast.error("Only Super Administrators can delete a Super Admin.")
      return
    }

    if (!confirm(`Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`)) {
      return
    }

    try {
      await adminApi.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      toast.success(`User ${user.email} removed from the platform`)
    } catch (error: any) {
      toast.error(error.message || "Could not delete user")
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail || !newUserPassword) {
      toast.error("Email and password are required")
      return
    }

    if (newUserRole === "super_admin" && !isCurrentSuper) {
      toast.error("Only Super Administrators can create a Super Admin account.")
      return
    }

    try {
      setSubmittingUser(true)
      const created = await adminApi.createUser({
        email: newUserEmail,
        full_name: newUserName,
        password: newUserPassword,
        role: newUserRole,
        is_staff: newUserRole === "admin" || newUserRole === "super_admin",
      })
      toast.success(`User ${created.email} created as ${newUserRole}`)
      setAddDialogOpen(false)
      setNewUserEmail("")
      setNewUserName("")
      setNewUserPassword("")
      setNewUserRole("user")
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || "Could not create user")
    } finally {
      setSubmittingUser(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (statusFilter === "active") return u.status === "Active"
    if (statusFilter === "suspended") return u.status === "Suspended"
    if (statusFilter === "admins") return u.role === "admin"
    if (statusFilter === "super_admins") return u.role === "super_admin" || u.is_superuser
    if (statusFilter === "founders") return u.role === "user" && !u.is_staff && !u.is_superuser
    return true
  })

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading">User Administration</h1>
            <Badge variant="outline" className="rounded-full px-2.5">
              {users.length} Total
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Control accounts across 3 tiers: User (Founders), Admin (Staff), and Super Admin (System Owners).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="rounded-full gap-1.5 shadow-md shadow-primary/20"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add User
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or startup idea..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl" 
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Users" },
            { id: "founders", label: "Founders" },
            { id: "admins", label: "Admins" },
            { id: "super_admins", label: "Super Admins" },
            { id: "active", label: "Active" },
            { id: "suspended", label: "Suspended" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-800/50">
              <TableHead className="w-[260px]">User & Identity</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Role & Privileges</TableHead>
              <TableHead>Sector (Locked)</TableHead>
              <TableHead className="min-w-[190px]">AI Tokens & Quota</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {loading ? "Loading users..." : "No users matched the criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isUserSuper = user.role === "super_admin" || user.is_superuser
                const isUserAdmin = user.role === "admin" || (user.is_staff && !isUserSuper)

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    {/* User & Identity */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border shrink-0">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email)}`} 
                            alt={user.name} 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Account Status */}
                    <TableCell>
                      <Badge 
                        variant={user.status === "Active" ? "default" : "destructive"}
                        className={`rounded-full text-[10px] uppercase font-bold tracking-widest ${
                          user.status === "Active" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>

                    {/* Role (3 Roles: user, admin, super_admin) */}
                    <TableCell>
                      {isUserSuper ? (
                        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20 flex items-center gap-1 w-max">
                          <ShieldCheck className="w-3 h-3 text-violet-500" /> Super Admin
                        </span>
                      ) : isUserAdmin ? (
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1 w-max">
                          <Shield className="w-3 h-3 text-primary" /> Admin (Staff)
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <UserIcon className="w-3 h-3" /> Founder (User)
                        </span>
                      )}
                    </TableCell>

                    {/* Sector (Locked) */}
                    <TableCell>
                      <div className="flex items-center gap-1.5" title="1 Account = 1 Sector (Permanently Bound)">
                        <Lock className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-xs font-semibold capitalize">
                          {user.sector || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>

                    {/* AI Token Usage / Quota */}
                    <TableCell>
                      <div className="space-y-1.5 min-w-[170px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {(user.tokens_used || 0).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            / {user.token_limit === 0 ? "Unlimited" : (user.token_limit || 100000).toLocaleString()}
                          </span>
                        </div>
                        {user.token_limit && user.token_limit > 0 ? (
                          <Progress
                            value={Math.min(100, Math.round(((user.tokens_used || 0) / user.token_limit) * 100))}
                            className="h-1.5 bg-slate-100 dark:bg-slate-800"
                          />
                        ) : (
                          <div className="h-1.5 w-full bg-emerald-500/20 rounded-full" />
                        )}
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {user.ai_access_blocked ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Ban className="w-2.5 h-2.5" /> AI Frozen
                            </span>
                          ) : user.token_limit && user.token_limit > 0 ? (
                            <span className="text-[10px] font-bold text-muted-foreground">
                              {Math.round(((user.tokens_used || 0) / user.token_limit) * 100)}% used
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Unlimited Quota
                            </span>
                          )}
                          <button
                            onClick={() => openTokenDialog(user)}
                            className="text-[11px] font-semibold text-primary hover:underline hover:opacity-80 transition-opacity ml-auto flex items-center gap-1 cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            Manage
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Onboarding Status */}
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          user.onboarding_completed 
                            ? "text-emerald-600 border-emerald-500/20 bg-emerald-500/10" 
                            : "text-amber-600 border-amber-500/20 bg-amber-500/10"
                        }`}
                      >
                        {user.onboarding_completed ? "Onboarded" : "Pending Idea"}
                      </Badge>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {user.joined}
                      </div>
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-bold">Account Management</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user)
                                setViewDialogOpen(true)
                              }}
                              className="rounded-xl cursor-pointer"
                            >
                              <Activity className="w-4 h-4 mr-2 text-primary" /> View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => openTokenDialog(user)}
                              className="rounded-xl cursor-pointer text-amber-600 dark:text-amber-400 font-semibold"
                            >
                              <Zap className="w-4 h-4 mr-2 text-amber-500" /> Control AI Token Quota
                            </DropdownMenuItem>
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator />

                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                              Set Account Role
                            </DropdownMenuLabel>

                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user, "user")}
                              className="rounded-xl cursor-pointer"
                            >
                              <UserIcon className="w-4 h-4 mr-2 text-slate-500" /> Set as User (Founder)
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user, "admin")}
                              className="rounded-xl cursor-pointer"
                            >
                              <Shield className="w-4 h-4 mr-2 text-primary" /> Set as Admin
                            </DropdownMenuItem>

                            {isCurrentSuper && (
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(user, "super_admin")}
                                className="rounded-xl cursor-pointer text-violet-600 font-semibold"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2 text-violet-600" /> Promote to Super Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem 
                            className={`rounded-xl cursor-pointer ${
                              user.status === "Active" ? "text-amber-600" : "text-emerald-600"
                            }`}
                            onClick={() => handleStatusToggle(user)}
                          >
                            {user.status === "Active" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" /> Suspend Account
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" /> Reactivate Account
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            className="text-destructive rounded-xl cursor-pointer"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog Modal */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Create Platform User</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Directly provision an account with one of 3 roles: User, Admin, or Super Admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Full Name
              </label>
              <Input
                placeholder="Jane Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="founder@venture.com"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Password
              </label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Account Role (3 Tiers)
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="user">User (Founder) — Standard Access</option>
                <option value="admin">Admin (Staff) — Management Access</option>
                {isCurrentSuper && (
                  <option value="super_admin">Super Admin — Full System Authority</option>
                )}
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingUser}
                className="rounded-xl"
              >
                {submittingUser ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        {selectedUser && (
          <DialogContent className="rounded-3xl max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      selectedUser.name || selectedUser.email
                    )}`}
                    alt={selectedUser.name}
                  />
                </div>
                <div>
                  <DialogTitle className="font-heading text-lg">{selectedUser.name}</DialogTitle>
                  <DialogDescription className="text-xs">{selectedUser.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-sm">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                  <p className="font-semibold">{selectedUser.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Role</p>
                  <p className="font-semibold capitalize">
                    {selectedUser.role === "super_admin" || selectedUser.is_superuser
                      ? "Super Admin"
                      : selectedUser.role === "admin" || selectedUser.is_staff
                      ? "Admin (Staff)"
                      : "User (Founder)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Startup Sector (Locked)</p>
                  <p className="font-semibold capitalize flex items-center gap-1">
                    <Lock className="w-3 h-3 text-primary" />
                    {selectedUser.sector || "Unspecified"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Viability Score</p>
                  <p className="font-semibold">
                    {selectedUser.viability_score
                      ? `${selectedUser.viability_score}/100`
                      : "Not generated"}
                  </p>
                </div>
              </div>

              {/* AI Token Usage Overview in Details Modal */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    AI Token Quota & Consumption
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewDialogOpen(false)
                      openTokenDialog(selectedUser)
                    }}
                    className="h-7 text-xs rounded-lg gap-1 border-amber-500/30"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    Adjust Quota
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Consumed</span>
                    <strong className="text-foreground">{(selectedUser.tokens_used || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Quota Ceiling</span>
                    <strong className="text-foreground">
                      {selectedUser.token_limit === 0 ? "Unlimited" : (selectedUser.token_limit || 100000).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">AI Access</span>
                    <strong className={selectedUser.ai_access_blocked ? "text-rose-600" : "text-emerald-600"}>
                      {selectedUser.ai_access_blocked ? "Frozen" : "Active"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                <p className="text-xs font-bold text-primary">Founder Status</p>
                <p className="text-sm font-semibold">
                  {selectedUser.onboarding_completed ? "Venture Registered & Active" : "Pending Venture Idea"}
                </p>
                <p className="text-xs text-muted-foreground">Joined StartPilot on {selectedUser.joined}</p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                className="w-full rounded-2xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Manage AI Token Usage & Quota Modal */}
      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        {tokenUser && (
          <DialogContent className="rounded-3xl max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="font-heading text-lg flex items-center gap-2">
                    Manage AI Token Quota
                  </DialogTitle>
                  <DialogDescription className="text-xs flex items-center gap-2 truncate">
                    <span>{tokenUser.email}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground capitalize">
                      <Lock className="w-3 h-3 text-primary" /> {tokenUser.sector || "No sector"}
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Token Stats Cards */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Tokens Consumed</p>
                  <p className="text-base font-extrabold text-foreground">
                    {(tokenUser.tokens_used || 0).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Quota</p>
                  <p className="text-base font-extrabold text-foreground">
                    {tokenUser.token_limit === 0 ? "Unlimited" : (tokenUser.token_limit || 100000).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Remaining</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {tokenUser.token_limit === 0 
                      ? "Unlimited" 
                      : Math.max(0, (tokenUser.token_limit || 100000) - (tokenUser.tokens_used || 0)).toLocaleString()
                    }
                  </p>
                </div>
              </div>

              {/* Quick Bonus Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                  <span>Grant Bonus Tokens</span>
                  <span className="text-[11px] text-muted-foreground normal-case font-normal">Adds directly to user's quota ceiling</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "+10k", amount: 10000 },
                    { label: "+50k", amount: 50000 },
                    { label: "+100k", amount: 100000 },
                    { label: "+250k", amount: 250000 },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGrantBonus(preset.amount)}
                      disabled={savingTokens}
                      className="rounded-xl text-xs font-bold hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Plus className="w-3 h-3 mr-1 text-primary" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Quota Ceiling Input */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Set Custom Token Quota Limit
                  </label>
                  <button
                    type="button"
                    onClick={handleSetUnlimited}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Set Unlimited (0)
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="e.g. 150000 (0 for unlimited)"
                    value={tokenLimitInput}
                    onChange={(e) => setTokenLimitInput(e.target.value)}
                    className="rounded-xl pr-20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    tokens
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Default new accounts start with 100,000 tokens. Enter <strong>0</strong> to grant unrestricted, unlimited usage.
                </p>
              </div>

              {/* Reset Used Tokens Button */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ResetIcon className="w-3.5 h-3.5 text-amber-500" />
                    Reset Consumed Tokens
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Reset this user's consumption count back to 0 tokens used.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetUsedTokens}
                  disabled={savingTokens || (tokenUser.tokens_used || 0) === 0}
                  className="rounded-xl shrink-0 text-xs font-bold border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  Reset to 0
                </Button>
              </div>

              {/* Freeze AI Access Switch */}
              <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                    Freeze / Suspend AI Access
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Instantly block this user from generating prompts or sending chat messages with AI Copilot.
                  </p>
                </div>
                <Switch
                  checked={freezeAiInput}
                  onCheckedChange={setFreezeAiInput}
                  disabled={savingTokens}
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTokenDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveTokens}
                disabled={savingTokens}
                className="rounded-xl shadow-md shadow-primary/20"
              >
                {savingTokens ? "Saving..." : "Save Quota Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
