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
  User as UserIcon
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
              <TableHead className="w-[280px]">User & Identity</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Role & Privileges</TableHead>
              <TableHead>Sector / Startup</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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

                    {/* Sector */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Rocket className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-semibold capitalize">
                          {user.sector || "Not started"}
                        </span>
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
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Startup Sector</p>
                  <p className="font-semibold capitalize">{selectedUser.sector || "Unspecified"}</p>
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
    </div>
  )
}
