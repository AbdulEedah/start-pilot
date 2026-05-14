"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SectorSelection } from "@/components/onboarding/sector-selection"
import { BackgroundForm } from "@/components/onboarding/background-form"
import { Rocket } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState<"sector" | "background">("sector")
  const [formData, setFormData] = useState({
    sector: "",
    background: {},
  })

  const handleSectorSelect = (sector: string) => {
    setFormData({ ...formData, sector })
    setStep("background")
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
                onSubmit={(data) => {
                  console.log("Onboarding Complete:", { ...formData, background: data })
                  window.location.href = "/dashboard/chat"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
