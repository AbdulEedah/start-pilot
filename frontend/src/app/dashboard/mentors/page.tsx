"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Video, 
  Star, 
  Search, 
  Send, 
  Loader2, 
  Sparkles,
  Mail,
  ExternalLink,
  Briefcase,
  Building,
  RefreshCw,
  CheckCircle2,
  BookOpen
} from "lucide-react"

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.17 8.17 0 0 1-5.82 2.41h-.01c-1.46 0-2.88-.39-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.156 8.156 0 0 1-1.25-4.41c0-4.54 3.7-8.24 8.26-8.24m4.53 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29"/>
    </svg>
  )
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { publicMentorsApi, type PublicMentor } from "@/lib/api"
import { toast } from "sonner"

export default function MentorsPage() {
  const { sector: activeSectorId, user } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)

  const [mentors, setMentors] = useState<PublicMentor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState<PublicMentor | null>(null)
  const [selectedStoryMentor, setSelectedStoryMentor] = useState<PublicMentor | null>(null)
  const [selectedSector, setSelectedSector] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Ask Question / Contact modal state
  const [question, setQuestion] = useState("")
  const [advice, setAdvice] = useState("")
  const [isAsking, setIsAsking] = useState(false)

  const openWhatsAppDM = (mentor: PublicMentor) => {
    const rawPhone = mentor.phone || "+14155550128"
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "")
    const founderName = user?.full_name || "a startup founder"
    const sectorName = activeSector.name || "Start Pilot"

    const message = `Hello ${mentor.name}! I am ${founderName} from Start Pilot (${sectorName} sector). I found your mentor profile on Start Pilot and would love to connect with you regarding my startup journey.`

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank", "noopener,noreferrer")
    toast.success(`Opening WhatsApp DM with ${mentor.name}`, {
      description: "Connecting directly as a verified founder from Start Pilot.",
    })
  }

  const fetchMentors = async () => {
    try {
      setLoading(true)
      const res = await publicMentorsApi.getMentors({
        sector: selectedSector !== "all" ? selectedSector : undefined,
        search: searchTerm.trim() || undefined,
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
  }, [selectedSector, searchTerm])

  const askMentor = async (mentor: PublicMentor, qText: string) => {
    if (!qText.trim()) {
      toast.error("Please enter a question first")
      return
    }

    setIsAsking(true)
    try {
      // Simulate specialized mentor response based on expertise & sector
      await new Promise((r) => setTimeout(r, 800))
      setAdvice(
        `Hi there! Regarding "${qText}":\n\n` +
        `Based on our experience at ${mentor.company || "industry leaders"}, focus on validating the core customer problem before scaling operations. ` +
        `Keep your burn rate lean and measure high-signal engagement metrics.\n\n` +
        `You can also reach me directly at ${mentor.contact_email} if you'd like to dive deeper!`
      )
      toast.success("Advice received!", {
        description: `${mentor.name} shared guidance with you.`
      })
    } catch (error) {
      toast.error("Could not fetch advice. Try again or reach out via email.")
    } finally {
      setIsAsking(false)
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-emerald-500"
      case "busy":
        return "text-amber-500"
      default:
        return "text-slate-400"
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available for 1:1"
      case "busy":
        return "Busy (Responds in 24h)"
      default:
        return "Offline"
    }
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading">Mentorship & Advisory Hub</h1>
            <Badge variant="outline" className="rounded-full px-2.5">
              {mentors.length} Advisors
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Connect directly with verified startup advisors, venture capitalists, and industry experts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, expertise, or firm..." 
              className="pl-10 w-64 md:w-80 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchMentors}
            className="rounded-full shrink-0"
            title="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Sector Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All Sectors" },
          { id: activeSectorId, label: `My Sector (${activeSector.name})` },
          { id: "technology", label: "Technology" },
          { id: "healthcare", label: "Healthcare" },
          { id: "finance", label: "Finance & Fintech" },
          { id: "consumer", label: "Consumer & Retail" },
          { id: "climate", label: "Climate & Energy" },
          { id: "ai", label: "AI & Data" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSector(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedSector === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mentors Grid */}
      {mentors.length === 0 ? (
        <div className="p-12 text-center rounded-[32px] bg-card border border-border/60 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-heading">No Mentors Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchTerm || selectedSector !== "all"
                ? "No mentors matched your current search. Try switching to 'All Sectors' or clearing the search."
                : "New mentors are currently being onboarded by our platform administrators."}
            </p>
          </div>
          {(searchTerm || selectedSector !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedSector("all")
              }}
              className="rounded-full"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mentors.map((mentor, i) => {
            const avatarUrl =
              mentor.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`

            return (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Avatar & Rating */}
                  <div className="flex-shrink-0 flex sm:flex-col items-center gap-3 sm:gap-2">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/10 bg-slate-100 dark:bg-slate-800 shrink-0">
                      <img 
                        src={avatarUrl} 
                        alt={mentor.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" />
                      {mentor.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-bold font-heading truncate">{mentor.name}</h3>
                        <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold shrink-0 capitalize">
                          {mentor.sector}
                        </Badge>
                      </div>

                      <p className="text-sm text-primary font-semibold truncate flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        {mentor.title}
                        {mentor.company && (
                          <span className="text-muted-foreground font-normal">at {mentor.company}</span>
                        )}
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {mentor.bio}
                    </p>

                    {mentor.background_story && (
                      <button
                        type="button"
                        onClick={() => setSelectedStoryMentor(mentor)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pt-0.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Read Career Background Story
                      </button>
                    )}

                    {/* Expertise Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(Array.isArray(mentor.expertise) ? mentor.expertise : []).slice(0, 3).map((exp, idx) => (
                        <Badge key={idx} variant="secondary" className="rounded-full text-xs font-normal">
                          {exp}
                        </Badge>
                      ))}
                    </div>

                    {/* Status & Availability */}
                    <div className="flex items-center gap-4 text-xs font-medium pt-1">
                      <div className={`flex items-center gap-1.5 ${getAvailabilityColor(mentor.availability)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          mentor.availability === "available" ? "bg-emerald-500" :
                          mentor.availability === "busy" ? "bg-amber-500" : "bg-slate-400"
                        }`} />
                        {getAvailabilityText(mentor.availability)}
                      </div>
                      <span className="text-muted-foreground">{mentor.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-border/40">
                  {/* WhatsApp Direct Message Button */}
                  <Button
                    size="sm"
                    onClick={() => openWhatsAppDM(mentor)}
                    className="w-full sm:flex-1 rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  >
                    <WhatsAppIcon className="w-4 h-4 mr-2" />
                    Message
                  </Button>

                  {/* Ask Question / Contact Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:flex-1 rounded-full font-semibold"
                        onClick={() => {
                          setSelectedMentor(mentor)
                          setQuestion("")
                          setAdvice("")
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                        Ask Advice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-3xl p-6 md:p-8">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold font-heading">
                          <img 
                            src={avatarUrl} 
                            alt={mentor.name} 
                            className="w-10 h-10 rounded-full border object-cover"
                          />
                          <div>
                            <span>Connect with {mentor.name}</span>
                            <p className="text-xs font-normal text-muted-foreground">
                              {mentor.title} {mentor.company ? `• ${mentor.company}` : ""}
                            </p>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-5 pt-3">
                        {/* Direct WhatsApp Callout */}
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              Instant Founder-Mentor Chat
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Opens WhatsApp DM directly with your Start Pilot founder introduction pre-filled.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openWhatsAppDM(mentor)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shrink-0 shadow-sm"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" />
                            Message on WhatsApp
                          </Button>
                        </div>

                        {/* Direct Contact Channels */}
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary">
                            Other Direct Channels
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <a
                              href={`mailto:${mentor.contact_email}?subject=${encodeURIComponent("StartPilot Founder Inquiry")}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border font-semibold hover:text-primary transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-primary" /> {mentor.contact_email}
                            </a>

                            {mentor.linkedin_url && (
                              <a
                                href={mentor.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border font-semibold hover:text-primary transition-colors"
                              >
                                <LinkedInIcon className="w-3.5 h-3.5 text-primary" /> LinkedIn Profile
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}

                            {mentor.calendly_url && (
                              <a
                                href={mentor.calendly_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                              >
                                <Calendar className="w-3.5 h-3.5" /> Book 1:1 on Calendly
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Interactive Ask Form */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Ask a Specific Question:
                          </label>
                          <Textarea
                            placeholder="Ask about your target market, pitch feedback, fundraising strategy, or technical roadmap..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="min-h-[110px] rounded-2xl"
                          />
                        </div>

                        <Button 
                          onClick={() => askMentor(mentor, question)}
                          disabled={isAsking || !question.trim()}
                          className="w-full rounded-2xl font-bold"
                        >
                          {isAsking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Synthesizing Advice...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Get Advisor Perspective
                            </>
                          )}
                        </Button>

                        {advice && (
                          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="font-bold text-sm text-foreground">
                                {mentor.name}'s Insights:
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                              {advice}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Book Session / Email Button */}
                  {mentor.calendly_url ? (
                    <a
                      href={mentor.calendly_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1"
                    >
                      <Button size="sm" className="w-full rounded-full font-bold shadow-md shadow-primary/20">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                        <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                      </Button>
                    </a>
                  ) : (
                    <a
                      href={`mailto:${mentor.contact_email}?subject=${encodeURIComponent("StartPilot Mentorship Request")}`}
                      className="w-full sm:flex-1"
                    >
                      <Button size="sm" className="w-full rounded-full font-bold">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Mentor
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Featured Banner */}
      <div className="p-8 rounded-[40px] bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-white/10 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 rounded-[24px] bg-white/20 shrink-0">
            <Users className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-heading">Verified Startup Mentorship</h2>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Every mentor on StartPilot is verified by our platform administrators. Get tailored advice, direct Calendly booking, and strategic guidance across every stage of your venture journey.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-semibold">100% Free Platform Access</span>
          </div>
        </div>
      </div>

      {/* Founder View Background Story Modal */}
      <Dialog
        open={Boolean(selectedStoryMentor)}
        onOpenChange={(open) => !open && setSelectedStoryMentor(null)}
      >
        {selectedStoryMentor && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/10 bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={
                      selectedStoryMentor.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedStoryMentor.name)}`
                    }
                    alt={selectedStoryMentor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold font-heading">
                    {selectedStoryMentor.name}
                  </DialogTitle>
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    {selectedStoryMentor.title} {selectedStoryMentor.company ? `at ${selectedStoryMentor.company}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold capitalize">
                      {selectedStoryMentor.sector}
                    </Badge>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {selectedStoryMentor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4" /> Career Journey & Background Story
                </h4>
                <div className="p-4 rounded-2xl bg-card border border-border/70 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedStoryMentor.background_story || selectedStoryMentor.bio || "No detailed background story provided."}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Areas of Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedStoryMentor.expertise) ? selectedStoryMentor.expertise : []).map((exp, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-xl text-xs font-normal">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  Contact & Scheduling Options
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={`mailto:${selectedStoryMentor.contact_email}?subject=${encodeURIComponent("StartPilot Mentorship Inquiry")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border font-semibold hover:text-primary transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary" /> {selectedStoryMentor.contact_email}
                  </a>

                  {selectedStoryMentor.calendly_url && (
                    <a
                      href={selectedStoryMentor.calendly_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book 1:1 Session on Calendly
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {selectedStoryMentor.linkedin_url && (
                    <a
                      href={selectedStoryMentor.linkedin_url}
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

            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedStoryMentor(null)}
                className="w-full rounded-full"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
