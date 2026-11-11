"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SectorSelection } from "@/components/onboarding/sector-selection"
import { BackgroundForm } from "@/components/onboarding/background-form"
import { 
  Rocket, 
  ArrowLeft, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Send, 
  Bot, 
  User as UserIcon, 
  CheckCircle2, 
  Database,
  Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { setStoredSector, getStoredSector, getSectorDetails } from "@/lib/sector-utils"
import { useAuth } from "@/components/auth-provider"
import { savePendingOnboarding, getPendingOnboarding, clearPendingOnboarding } from "@/lib/onboarding-storage"
import { profilesApi } from "@/lib/api/profiles"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { PendingOnboardingData } from "@/lib/onboarding-storage"

interface ChatTurn {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState<"sector" | "background">("sector")
  const [mode, setMode] = useState<"form" | "chat">("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDbSaved, setIsDbSaved] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [sessionId, setSessionId] = useState<string>("")
  const [formData, setFormData] = useState({
    sector: "technology",
    background: {} as Record<string, string>,
  })

  // Onboarding Chat State
  const [chatMessages, setChatMessages] = useState<ChatTurn[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Initialize session ID and pre-populate if existing
  useEffect(() => {
    const existing = getPendingOnboarding()
    if (existing?.session_id) {
      setSessionId(existing.session_id)
    } else {
      const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session_${Date.now()}`
      setSessionId(newId)
    }

    if (existing?.sector) {
      setFormData((prev) => ({ ...prev, sector: existing.sector, background: existing.background || {} }))
    } else {
      const storedSec = getStoredSector()
      if (storedSec) {
        setFormData((prev) => ({ ...prev, sector: storedSec }))
      }
    }

    if (existing?.chat_messages && existing.chat_messages.length > 0) {
      setChatMessages(existing.chat_messages as ChatTurn[])
    } else {
      const initialSectorName = getSectorDetails(existing?.sector || "technology").name
      setChatMessages([
        {
          role: "assistant",
          content: `Welcome founder! I'm your Start Pilot AI Copilot for the ${initialSectorName} sector. Tell me about your startup idea, the core problem you're tackling, or ask for guidance on refining your business model before you register.`,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }, [])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const submitPendingOnboarding = useCallback(async (pending: PendingOnboardingData) => {
    try {
      const skillsRaw = pending.background.skills || ""
      const skillsList = typeof skillsRaw === "string" 
        ? skillsRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
        : []

      const profilePayload = {
        sector: pending.sector,
        background_story: pending.background.story || "",
        problem: pending.background.problem || "",
        country: pending.background.country || "Global",
        state: pending.background.state || "",
        city: pending.background.city || "",
        existing_experience: pending.background.experience || "",
        key_skills: skillsList,
        available_resources: {
          financial: { capital: 0, savings: 0 },
          human: { team_size: 1, cofounders: 0 },
          assets: { office_space: false, equipment: false },
          time: { hours_per_week: 40 },
        },
        team_status: "solo",
        time_commitment: "full",
      }

      await profilesApi.patchProfile(profilePayload)
      await profilesApi.completeOnboarding()

      clearPendingOnboarding()

      toast.success("Onboarding complete!", {
        description: "Your validation report and roadmap are being generated.",
      })

      router.push("/dashboard")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save onboarding data. Please try again."
      toast.error("Onboarding failed", { description: message })
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated && user) {
      const pending = getPendingOnboarding()
      if (pending && pending.background && pending.background.problem) {
        submitPendingOnboarding(pending)
      }
    }
  }, [isAuthenticated, user, submitPendingOnboarding])

  const handleSectorSelect = async (sector: string) => {
    setStoredSector(sector)
    setFormData((prev) => ({ ...prev, sector }))

    // Update greeting in chat
    const secName = getSectorDetails(sector).name
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Great choice! Focusing on the ${secName} sector. Let's outline the core problem you are solving and your background.`,
        timestamp: new Date().toISOString(),
      },
    ])

    // Save initial state to DB
    try {
      await profilesApi.saveOnboardingSession({
        session_id: sessionId,
        sector,
        form_data: formData.background,
        chat_messages: chatMessages,
      })
      setIsDbSaved(true)
    } catch (e) {
      console.warn("DB save on sector select:", e)
    }

    if (isAuthenticated) {
      try {
        await profilesApi.patchProfile({ sector })
      } catch (error) {
        console.error("Failed to save sector to backend:", error)
      }
      setStep("background")
    } else {
      savePendingOnboarding({
        session_id: sessionId,
        sector,
        background: formData.background,
        chat_messages: chatMessages,
      })
      setStep("background")
    }
  }

  // Handle Onboarding Chat Interaction
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return

    const userTurn: ChatTurn = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    }

    const updated = [...chatMessages, userTurn]
    setChatMessages(updated)
    setChatInput("")
    setIsAiTyping(true)

    // Simulate AI response tailored to sector
    setTimeout(async () => {
      const sec = getSectorDetails(formData.sector)
      let aiReply = ""
      const lower = userTurn.content.toLowerCase()

      if (lower.includes("problem") || lower.includes("pain")) {
        aiReply = `Understood. In ${sec.name}, solving this specific pain point gives you an immediate competitive wedge. Have you tested whether customers are currently paying for legacy workarounds?`
      } else if (lower.includes("customer") || lower.includes("market") || lower.includes("target")) {
        aiReply = `Great focus. For ${sec.name}, your initial target market should be tightly defined (e.g. 50-100 target accounts). We'll benchmark this against our TAM estimate of ${sec.marketSize}.`
      } else if (lower.includes("revenue") || lower.includes("pricing") || lower.includes("charge")) {
        aiReply = `Monetization is key. In ${sec.name}, successful startups often leverage usage-based pricing or annual pilot contracts. We will validate this in your roadmap.`
      } else {
        aiReply = `Excellent input! I have incorporated this into your venture context for ${sec.name}. Everything you share here is continuously synced to your database session so nothing is lost.`
      }

      const fullTurn: ChatTurn = {
        role: "assistant",
        content: aiReply,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updated, fullTurn]
      setChatMessages(finalMessages)
      setIsAiTyping(false)

      // Auto-save chat history to DB
      try {
        await profilesApi.saveOnboardingSession({
          session_id: sessionId,
          sector: formData.sector,
          form_data: formData.background,
          chat_messages: finalMessages,
        })
        setIsDbSaved(true)
      } catch (e) {
        console.warn("Could not sync chat turn to DB:", e)
      }
    }, 800)
  }

  const handleBackgroundSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true)
    setFormData((prev) => ({ ...prev, background: data }))

    const onboardingData: PendingOnboardingData = {
      session_id: sessionId,
      sector: formData.sector,
      background: data,
      chat_messages: chatMessages,
    }

    // Save all onboarding chat and answers to the database before registration!
    try {
      const saveRes = await profilesApi.saveOnboardingSession({
        session_id: sessionId,
        sector: formData.sector,
        form_data: data,
        chat_messages: chatMessages,
      })
      if (saveRes && saveRes.session_id) {
        onboardingData.session_id = saveRes.session_id
      }
      setIsDbSaved(true)
      toast.success("Saved to database", {
        description: "Your complete onboarding chat & venture details are securely stored in the DB.",
      })
    } catch (e) {
      console.warn("Failed saving onboarding session to backend DB:", e)
    }

    if (!isAuthenticated) {
      savePendingOnboarding(onboardingData)
      toast.info("Please create an account to finalize setup", {
        description: "Your onboarding session is saved in the database. Register to unlock your dashboard.",
      })
      router.push("/register")
      setIsSubmitting(false)
      return
    }

    try {
      const skillsRaw = data.skills || ""
      const skillsList = typeof skillsRaw === "string" 
        ? skillsRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
        : []

      const profilePayload = {
        sector: onboardingData.sector,
        background_story: data.story,
        problem: data.problem,
        country: data.country,
        state: data.state,
        city: data.city,
        existing_experience: data.experience,
        key_skills: skillsList,
        available_resources: {
          financial: { capital: 0, savings: 0 },
          human: { team_size: 1, cofounders: 0 },
          assets: { office_space: false, equipment: false },
          time: { hours_per_week: 40 },
        },
        team_status: "solo",
        time_commitment: "full",
      }

      await profilesApi.patchProfile(profilePayload)
      await profilesApi.completeOnboarding()

      toast.success("Onboarding complete!", {
        description: "Your validation report and roadmap are being generated.",
      })

      router.push("/dashboard")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save onboarding data. Please try again."
      toast.error("Onboarding failed", { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeSector = getSectorDetails(formData.sector)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold font-heading leading-tight">Start Pilot Onboarding</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Database className="w-2.5 h-2.5 text-emerald-500" />
                {isDbSaved ? "DB Synced & Secured" : "Live Session Active"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:block">
              Step {step === "sector" ? "1" : "2"} of 2
            </div>
            <div className="w-28 sm:w-36 h-2 bg-accent rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary" 
                animate={{ width: step === "sector" ? "50%" : "100%" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        {/* Navigation Step-Back Controls */}
        <div className="mb-6 flex items-center justify-between">
          {step === "sector" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/?builder=select")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Builder Type (New vs Existing)
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("sector")}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sector Selection ({activeSector.name})
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30">
              Sector: {activeSector.name}
            </Badge>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "sector" ? (
            <motion.div
              key="sector"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h1 className="text-3xl font-bold font-heading">Which sector is your startup in?</h1>
                <p className="text-muted-foreground text-sm">
                  Select the primary industry that best represents your vision. You can always step back if you change your mind.
                </p>
              </div>

              <SectorSelection onSelect={handleSectorSelect} selectedSector={formData.sector} />
            </motion.div>
          ) : (
            <motion.div
              key="background"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Sector Locked: {activeSector.name}
                </div>
                <h1 className="text-3xl font-bold font-heading">Tell us about your venture</h1>
                <p className="text-muted-foreground text-sm">
                  Fill in your details below or chat with our AI Copilot to refine your problem statement. All responses are saved to the database before proceeding to register.
                </p>
              </div>

              {/* Mode Switcher: Form vs AI Onboarding Chat */}
              <div className="flex justify-center">
                <div className="p-1 rounded-full bg-muted/60 border border-border/50 inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMode("form")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                      mode === "form" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Venture Questionnaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("chat")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                      mode === "chat" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> AI Onboarding Chat
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>
                </div>
              </div>

              {mode === "form" ? (
                <div className="space-y-4">
                  <BackgroundForm 
                    onBack={() => setStep("sector")} 
                    onSubmit={handleBackgroundSubmit}
                    isSubmitting={isSubmitting}
                    initialValues={formData.background as any}
                  />
                </div>
              ) : (
                /* Interactive Onboarding Chat with Copilot */
                <div className="max-w-2xl mx-auto rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xl flex flex-col h-[520px]">
                  <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-heading">Onboarding AI Copilot</h4>
                        <p className="text-[10px] text-muted-foreground">Active in {activeSector.name} Sector</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> DB Auto-Saved
                    </Badge>
                  </div>

                  {/* Chat Messages */}
                  <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2.5 max-w-[85%] ${
                          msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {msg.role === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-muted/70 text-foreground rounded-tl-none border border-border/40"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        AI Copilot is thinking...
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t bg-background/80 flex items-center gap-2">
                    <Input
                      placeholder={`Discuss your ${activeSector.name} venture or problem statement...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendChatMessage()
                        }
                      }}
                      className="text-xs h-10 rounded-xl"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim() || isAiTyping}
                      className="rounded-xl px-4"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Switch to Form to finalize */}
                  <div className="p-3 bg-muted/40 border-t border-border/40 text-center flex items-center justify-between text-xs px-4">
                    <span className="text-muted-foreground text-[11px]">
                      Ready to finalize your venture info?
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setMode("form")}
                      className="text-xs text-primary font-bold p-0 h-auto"
                    >
                      Switch to Questionnaire & Save →
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
