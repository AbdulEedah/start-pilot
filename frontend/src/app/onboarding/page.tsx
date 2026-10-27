"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SectorSelection } from "@/components/onboarding/sector-selection"
import { BackgroundForm } from "@/components/onboarding/background-form"
import { Rocket } from "lucide-react"
import { setStoredSector } from "@/lib/sector-utils"
import { useAuth } from "@/components/auth-provider"
import { savePendingOnboarding, getPendingOnboarding, clearPendingOnboarding } from "@/lib/onboarding-storage"
import { profilesApi } from "@/lib/api/profiles"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { PendingOnboardingData } from "@/lib/onboarding-storage"

export default function OnboardingPage() {
  const [step, setStep] = useState<"sector" | "background">("sector")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    sector: "",
    background: {} as Record<string, string>,
  })

  const submitPendingOnboarding = useCallback(async (pending: PendingOnboardingData) => {
    try {
      const profilePayload = {
        sector: pending.sector,
        background_story: pending.background.story,
        problem: pending.background.problem,
        country: pending.background.country,
        state: pending.background.state,
        city: pending.background.city,
        existing_experience: pending.background.experience,
        key_skills: pending.background.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
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
      if (pending) {
        submitPendingOnboarding(pending)
      }
    }
  }, [isAuthenticated, user, submitPendingOnboarding])

  const redirectToRegister = () => {
    toast.info("Please create an account to continue", {
      description: "Your onboarding data has been saved. Register to complete setup.",
    })
    router.push("/register")
  }

  const handleSectorSelect = async (sector: string) => {
    setStoredSector(sector)
    setFormData((prev) => ({ ...prev, sector }))

    if (isAuthenticated) {
      try {
        await profilesApi.patchProfile({ sector })
      } catch (error) {
        console.error("Failed to save sector to backend:", error)
      }
      setStep("background")
    } else {
      savePendingOnboarding({ sector, background: formData.background })
      setStep("background")
    }
  }

  const handleBackgroundSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true)
    setFormData((prev) => ({ ...prev, background: data }))

    const onboardingData = {
      sector: formData.sector,
      background: data,
    }

    if (!isAuthenticated) {
      savePendingOnboarding(onboardingData)
      redirectToRegister()
      setIsSubmitting(false)
      return
    }

    try {
      const profilePayload = {
        sector: onboardingData.sector,
        background_story: data.story,
        problem: data.problem,
        country: data.country,
        state: data.state,
        city: data.city,
        existing_experience: data.experience,
        key_skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold font-heading">Onboarding</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Step {step === "sector" ? "1" : "2"} of 2
            </div>
            <div className="w-32 h-2 bg-accent rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary" 
                animate={{ width: step === "sector" ? "50%" : "100%" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        <AnimatePresence mode="wait">
          {step === "sector" ? (
            <motion.div
              key="sector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold font-heading">Which sector is your startup in?</h1>
                <p className="text-muted-foreground">Select the industry that best fits your vision.</p>
              </div>
              <SectorSelection onSelect={handleSectorSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold font-heading">Tell us about your venture</h1>
                <p className="text-muted-foreground">Help our AI understand the context of your startup.</p>
              </div>
              <BackgroundForm 
                onBack={() => setStep("sector")} 
                onSubmit={handleBackgroundSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}