"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  Search,
  Plus,
  Mail,
  Calendar,
  Phone,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  UserX,
  X,
  Sparkles,
  Building,
  Briefcase,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { adminApi, type AdminMentor } from "@/lib/api"
import { toast } from "sonner"

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

const SECTORS = [
  { value: "all", label: "All Sectors" },
  { value: "technology", label: "Technology & Software" },
  { value: "healthcare", label: "Healthcare & Biotech" },
  { value: "finance", label: "Fintech & Banking" },
  { value: "consumer", label: "E-Commerce & Retail" },
  { value: "climate", label: "Climate & Cleantech" },
  { value: "media", label: "Media & Creator Economy" },
  { value: "ai", label: "Artificial Intelligence" },
]

const FORM_SECTIONS = [
  { id: 1, label: "Identity & Role", icon: Briefcase },
  { id: 2, label: "Background Story", icon: BookOpen },
  { id: 3, label: "Expertise & Advisory", icon: Tag },
  { id: 4, label: "Contact & Booking", icon: Calendar },
  { id: 5, label: "Administration", icon: ShieldCheck },
]

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<AdminMentor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<AdminMentor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentSection, setCurrentSection] = useState(1)

  // View Story Modal State
  const [storyModalMentor, setStoryModalMentor] = useState<AdminMentor | null>(null)

  // Form Fields (all manual, no hardcoded defaults)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    avatar: "",
    sector: "technology",
    bio: "",
    background_story: "",
    expertise: "",
    experience_years: "",
    rating: 5.0,
    availability: "available" as "available" | "busy" | "offline",
    contact_email: "",
    linkedin_url: "",
    calendly_url: "",
    phone: "",
    notes: "",
    is_active: true,
  })

  const fetchMentors = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getMentors({
        search: search.trim() || undefined,
        sector: sectorFilter !== "all" ? sectorFilter : undefined,
        availability: availabilityFilter !== "all" ? availabilityFilter : undefined,
      })
      if (res && res.mentors) {
        setMentors(res.mentors)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load mentors directory")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors()
    }, 250)
    return () => clearTimeout(timer)
  }, [search, sectorFilter, availabilityFilter])

  const openCreateDialog = () => {
    setEditingMentor(null)
    setCurrentSection(1)
    setFormData({
      name: "",
      title: "",
      company: "",
      avatar: "",
      sector: "technology",
      bio: "",
      background_story: "",
      expertise: "",
      experience_years: "",
      rating: 5.0,
      availability: "available",
      contact_email: "",
      linkedin_url: "",
      calendly_url: "",
      phone: "",
      notes: "",
      is_active: true,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (mentor: AdminMentor) => {
    setEditingMentor(mentor)
    setCurrentSection(1)
    setFormData({
      name: mentor.name || "",
      title: mentor.title || "",
      company: mentor.company || "",
      avatar: mentor.avatar || "",
      sector: mentor.sector || "technology",
      bio: mentor.bio || "",
      background_story: mentor.background_story || "",
      expertise: Array.isArray(mentor.expertise) ? mentor.expertise.join(", ") : mentor.expertise || "",
      experience_years: mentor.experience_years || "",
      rating: mentor.rating || 5.0,
      availability: mentor.availability || "available",
      contact_email: mentor.contact_email || "",
      linkedin_url: mentor.linkedin_url || "",
      calendly_url: mentor.calendly_url || "",
      phone: mentor.phone || "",
      notes: mentor.notes || "",
      is_active: mentor.is_active ?? true,
    })
    setDialogOpen(true)
  }

  const handleSaveMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.title.trim() || !formData.contact_email.trim()) {
      toast.error("Mentor Name, Title, and Contact Email are required.")
      setCurrentSection(1)
      return
    }

    try {
      setSubmitting(true)
      const payload: any = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        company: formData.company.trim(),
        avatar: formData.avatar.trim(),
        sector: formData.sector,
        bio: formData.bio.trim(),
        background_story: formData.background_story.trim(),
        expertise: formData.expertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience_years: formData.experience_years.trim(),
        rating: Number(formData.rating) || 5.0,
        availability: formData.availability,
        contact_email: formData.contact_email.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        calendly_url: formData.calendly_url.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim(),
        is_active: formData.is_active,
      }

      if (editingMentor) {
        await adminApi.updateMentor(editingMentor.id, payload)
        toast.success(`Mentor ${payload.name} updated successfully.`)
      } else {
        await adminApi.createMentor(payload)
        toast.success(`New mentor ${payload.name} added to the platform.`)
      }

      setDialogOpen(false)
      fetchMentors()
    } catch (error: any) {
      toast.error(error.message || "Failed to save mentor profile.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMentor = async (mentor: AdminMentor) => {
    if (!confirm(`Are you sure you want to remove ${mentor.name} from the mentor network?`)) {
      return
    }

    try {
      await adminApi.deleteMentor(mentor.id)
      setMentors((prev) => prev.filter((m) => m.id !== mentor.id))
      toast.success(`Mentor ${mentor.name} removed.`)
    } catch (error: any) {
      toast.error(error.message || "Could not delete mentor.")
    }
  }

  const handleQuickAvailabilityChange = async (mentor: AdminMentor, newStatus: "available" | "busy" | "offline") => {
    try {
      await adminApi.updateMentor(mentor.id, { availability: newStatus })
      setMentors((prev) =>
        prev.map((m) => (m.id === mentor.id ? { ...m, availability: newStatus } : m))
      )
      toast.success(`${mentor.name}'s status updated to ${newStatus}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update availability")
    }
  }

  const availableCount = mentors.filter((m) => m.availability === "available").length

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading">Mentors & Advisors Hub</h1>
            <Badge variant="outline" className="rounded-full px-2.5">
              {mentors.length} Profiles
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Super Admins and Staff Admins have full control to manually input, edit, and organize verified mentors with structured background stories and direct contact channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMentors}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={openCreateDialog}
            className="rounded-full gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Mentor
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Mentors</p>
            <p className="text-2xl font-bold font-heading">{mentors.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Available Now</p>
            <p className="text-2xl font-bold font-heading text-emerald-600">{availableCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Direct Booking Enabled</p>
            <p className="text-2xl font-bold font-heading">
              {mentors.filter((m) => Boolean(m.calendly_url)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by mentor name, firm, title, or email..."
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
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SECTORS.map((sec) => (
              <option key={sec.value} value={sec.value}>
                {sec.label}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Availability</option>
            <option value="available">Available Now</option>
            <option value="busy">Busy (24h turnaround)</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Mentors Grid */}
      {mentors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-heading">No Mentors In Directory</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {search || sectorFilter !== "all"
                ? "No mentors matched your current filters. Try resetting the search or category."
                : "No mentors currently exist. As an Administrator, you can add verified industry leaders manually with their complete background stories."}
            </p>
          </div>
          <Button onClick={openCreateDialog} className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> Add First Mentor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const avatarUrl =
              mentor.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`

            const createdDateStr = mentor.created_at
              ? new Date(mentor.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null

            return (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Top Row: Avatar & Actions */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/10 bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img
                          src={avatarUrl}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold font-heading text-base truncate">{mentor.name}</h3>
                        <p className="text-xs text-primary font-semibold truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          {mentor.title}
                        </p>
                        {mentor.company && (
                          <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                            <Building className="w-3 h-3 shrink-0" />
                            {mentor.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full -mr-2">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs text-muted-foreground font-bold">
                            Mentor Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(mentor)}
                            className="rounded-xl cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2 text-primary" /> Edit Sections
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setStoryModalMentor(mentor)}
                            className="rounded-xl cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4 mr-2 text-violet-500" /> View Full Story
                          </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                            Set Availability
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleQuickAvailabilityChange(mentor, "available")}
                            className="rounded-xl cursor-pointer text-emerald-600"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Available Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuickAvailabilityChange(mentor, "busy")}
                            className="rounded-xl cursor-pointer text-amber-600"
                          >
                            <Clock className="w-3.5 h-3.5 mr-2" /> Busy (24h)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQuickAvailabilityChange(mentor, "offline")}
                            className="rounded-xl cursor-pointer text-slate-500"
                          >
                            <UserX className="w-3.5 h-3.5 mr-2" /> Offline
                          </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteMentor(mentor)}
                          className="rounded-xl cursor-pointer text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Mentor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Badges: Sector, Rating, Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        mentor.availability === "available"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : mentor.availability === "busy"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          mentor.availability === "available"
                            ? "bg-emerald-500"
                            : mentor.availability === "busy"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {mentor.availability === "available"
                        ? "Available"
                        : mentor.availability === "busy"
                        ? "Busy"
                        : "Offline"}
                    </span>

                    <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold capitalize">
                      {mentor.sector}
                    </Badge>

                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1 ml-auto">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {mentor.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Bio & Background Story Button */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {mentor.bio || "No summary provided."}
                    </p>

                    {mentor.background_story && (
                      <button
                        onClick={() => setStoryModalMentor(mentor)}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" /> Read Career Background Story
                      </button>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(Array.isArray(mentor.expertise) ? mentor.expertise : []).slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg"
                      >
                        {exp}
                      </span>
                    ))}
                    {(Array.isArray(mentor.expertise) ? mentor.expertise.length : 0) > 3 && (
                      <span className="text-[10px] font-bold text-muted-foreground px-1 py-0.5">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: Contact Details & Founder Channels */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1 truncate max-w-[180px]">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> {mentor.contact_email}
                    </span>
                    <span className="text-[10px] shrink-0">
                      {mentor.experience_years ? mentor.experience_years : createdDateStr ? `Added ${createdDateStr}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {mentor.calendly_url ? (
                      <a
                        href={mentor.calendly_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book Session
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ) : (
                      <a
                        href={`mailto:${mentor.contact_email}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> Direct Email
                      </a>
                    )}

                    {mentor.linkedin_url && (
                      <a
                        href={mentor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <LinkedInIcon className="w-4 h-4" />
                      </a>
                    )}

                    {mentor.phone && (
                      <a
                        href={`tel:${mentor.phone}`}
                        className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Phone/WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Mentor Dialog — Structured In 5 Clear Sections */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold font-heading">
              {editingMentor ? `Edit Mentor: ${editingMentor.name}` : "Add Verified Advisor (Sections)"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Super Admins and Admins can manually provide all identity details, in-depth background story, and booking links.
            </DialogDescription>
          </DialogHeader>

          {/* Section Indicator Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 pt-2">
            {FORM_SECTIONS.map((sec) => {
              const Icon = sec.icon
              const isActive = currentSection === sec.id
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setCurrentSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.id}. {sec.label}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSaveMentor} className="space-y-6 pt-3">
            {/* SECTION 1: Identity & Role */}
            {currentSection === 1 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Section 1: Enter the advisor's verified identity, official title, and current organization.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Elena Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Professional Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Venture Partner / Ex-CTO"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Company / Firm / Fund
                    </label>
                    <Input
                      placeholder="e.g. Sequoia Capital / Independent"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Primary Sector Focus
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {SECTORS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Avatar Image URL (Optional)
                  </label>
                  <Input
                    placeholder="https://... (leave empty to use generated avatar)"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: Background Story & Executive Bio */}
            {currentSection === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Section 2: Provide the mentor's complete career background story, milestones, and quick summary.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Comprehensive Background Story & Career Journey
                  </label>
                  <Textarea
                    placeholder="Describe their origins, past companies founded or scaled, notable investment exits, leadership milestones, and what makes their journey impactful for founders..."
                    rows={6}
                    value={formData.background_story}
                    onChange={(e) => setFormData({ ...formData, background_story: e.target.value })}
                    className="rounded-2xl resize-none text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Founders can read this story to understand the advisor's depth before reaching out.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Short Bio / Summary (Card Elevator Pitch)
                  </label>
                  <Textarea
                    placeholder="1-2 sentences summarizing their focus area for the mentor directory cards..."
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="rounded-2xl resize-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Industry Experience / Tenure (e.g. 12 years, 15+ years)
                  </label>
                  <Input
                    placeholder="e.g. 14 years in VC & Enterprise Tech"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: Expertise & Advisory Details */}
            {currentSection === 3 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                  <Tag className="w-4 h-4 shrink-0" />
                  <span>Section 3: Outline their core advisory domains, rating, and availability status.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Domains of Expertise (Comma-separated)
                  </label>
                  <Input
                    placeholder="e.g. Seed Fundraising, Go-to-Market, AI Architecture, Term Sheets"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Founder Satisfaction Rating (0.0 - 5.0)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Initial Availability Status
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: e.target.value as "available" | "busy" | "offline",
                        })
                      }
                      className="w-full h-10 px-3 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="available">Available Now</option>
                      <option value="busy">Busy (24h response)</option>
                      <option value="offline">Currently Offline</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Direct Contact & Scheduling */}
            {currentSection === 4 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Section 4: Direct channels for founders to contact the mentor or schedule 1:1 sessions.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-primary" /> Direct Contact Email *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="e.g. mentor@domain.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Calendly / Booking URL
                    </label>
                    <Input
                      placeholder="https://calendly.com/your-username/30min"
                      value={formData.calendly_url}
                      onChange={(e) => setFormData({ ...formData, calendly_url: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <LinkedInIcon className="w-3.5 h-3.5 text-primary" /> LinkedIn Profile URL
                    </label>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-primary" /> Direct Phone / WhatsApp
                    </label>
                    <Input
                      placeholder="+1 (415) 555-0100"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: Internal Moderation & Admin Settings */}
            {currentSection === 5 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Section 5: Private notes and visibility settings (only visible to Admins and Super Admins).</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Internal Admin Notes
                  </label>
                  <Textarea
                    placeholder="Private notes (e.g., introduction preferred via email first, confirmed partner agreement, onboarded by Admin X)..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-2xl resize-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border">
                  <div>
                    <p className="font-bold text-sm">Active & Published Status</p>
                    <p className="text-xs text-muted-foreground">
                      When active, this mentor is immediately visible to founders in the Mentorship Hub.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Stepper Footer Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={currentSection === 1}
                onClick={() => setCurrentSection((prev) => Math.max(1, prev - 1))}
                className="rounded-xl gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Section
              </Button>

              <div className="flex items-center gap-2">
                {currentSection < 5 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentSection((prev) => Math.min(5, prev + 1))}
                    className="rounded-xl gap-1.5"
                  >
                    Next Section <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting} className="rounded-xl font-bold gap-1.5">
                    {submitting ? "Saving..." : editingMentor ? "Save Changes" : "Create Mentor Profile"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Background Story Modal */}
      <Dialog open={Boolean(storyModalMentor)} onOpenChange={(open) => !open && setStoryModalMentor(null)}>
        {storyModalMentor && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/10 bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={
                      storyModalMentor.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(storyModalMentor.name)}`
                    }
                    alt={storyModalMentor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold font-heading">
                    {storyModalMentor.name}
                  </DialogTitle>
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    {storyModalMentor.title} {storyModalMentor.company ? `at ${storyModalMentor.company}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold capitalize">
                      {storyModalMentor.sector}
                    </Badge>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {storyModalMentor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4" /> Complete Career Background Story
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {storyModalMentor.background_story || storyModalMentor.bio || "No background story provided yet."}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Advisory Focus Areas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(storyModalMentor.expertise) ? storyModalMentor.expertise : []).map((exp, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-xl text-xs font-normal">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  Direct Founder Channels
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={`mailto:${storyModalMentor.contact_email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border font-semibold hover:text-primary transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary" /> {storyModalMentor.contact_email}
                  </a>

                  {storyModalMentor.calendly_url && (
                    <a
                      href={storyModalMentor.calendly_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book on Calendly
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {storyModalMentor.linkedin_url && (
                    <a
                      href={storyModalMentor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border font-semibold hover:text-primary transition-colors"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5 text-primary" /> LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStoryModalMentor(null)} className="rounded-2xl w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
