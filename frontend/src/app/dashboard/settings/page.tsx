"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Lock, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Layers 
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, sector: activeSectorId, updateUser } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)

  const [name, setName] = useState(user?.full_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser({ full_name: name, email })
    setIsSaved(true)
    toast.success("Profile updated successfully")
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading">Account & Sector Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account profile, preferences, and active startup sector focus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settings Sections */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Sector Lock Card */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg font-heading">Active Sector Lock</h2>
                  <p className="text-xs text-muted-foreground">Your venture's active industry context</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeSector.badgeColor} flex items-center gap-1.5`}>
                <Lock className="w-3.5 h-3.5" />
                {activeSector.name} Locked
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-accent/40 border border-border/60 space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">Strict 1 Account = 1 Sector Policy</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Start Pilot permanently binds each founder account and email to their chosen industry (<strong className="text-foreground">{activeSector.name}</strong>). To guarantee authentic data integrity, tailored milestone roadmaps, and domain-specialized AI intelligence, sector switching is permanently locked once onboarding is completed.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
              <div>
                <p className="text-xs font-bold text-foreground">Want to launch a venture in another industry?</p>
                <p className="text-xs text-muted-foreground">Each account is tied to one sector only. Please register a separate account with a new email to build in a different sector.</p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-muted border text-xs font-semibold text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Sector Permanently Locked</span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg font-heading">Personal Profile</h2>
                <p className="text-xs text-muted-foreground">Update your founder identity details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <Input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@example.com"
                  type="email"
                  className="rounded-xl"
                />
              </div>

              <Button type="submit" className="rounded-xl gap-2">
                {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null}
                {isSaved ? "Saved!" : "Save Changes"}
              </Button>
            </form>
          </div>

        </div>

        {/* Right Column: Sector Info Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-4 shadow-xs">
            <h3 className="font-bold font-heading text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              {activeSector.name} Summary
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-accent/50 flex justify-between items-center">
                <span className="text-muted-foreground">Total TAM</span>
                <span className="font-bold">{activeSector.marketSize}</span>
              </div>
              <div className="p-3 rounded-xl bg-accent/50 flex justify-between items-center">
                <span className="text-muted-foreground">Target Audience</span>
                <span className="font-bold text-right max-w-[150px] truncate">{activeSector.targetAudience}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-muted-foreground mb-2">Key Metric Focus</p>
              <div className="space-y-1.5">
                {activeSector.keyMetrics.slice(0, 3).map((metric, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
