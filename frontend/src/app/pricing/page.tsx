"use client"

import { Check, Sparkles, Rocket, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  const features = [
    "Comprehensive AI Idea Validation & Viability Scoring (0-100)",
    "Adaptive 12-Week Strategic Roadmaps & Task Breakdown",
    "Real-time AI Pitch Deck Analysis & Feedback",
    "Verified Sector-Specific Mentorship & Calendly Booking",
    "Interactive AI Startup Copilot & Strategy Chat",
    "Curated Resource Vault across 6 Industry Sectors",
    "Unlimited Idea Iterations & Strategy Exports",
    "Community & Priority Platform Support"
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Early Access Beta
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
            100% Free Platform Access
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            StartPilot is currently completely free for all founders. No subscription tiers, no hidden credit card charges, no payment barriers.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="relative border-2 border-primary shadow-2xl rounded-3xl overflow-hidden bg-card">
            <div className="bg-primary text-primary-foreground px-6 py-2.5 text-center text-xs font-bold uppercase tracking-widest">
              Full Platform Access • No Payment Required
            </div>

            <CardHeader className="text-center pt-8 pb-4 space-y-3">
              <CardTitle className="text-3xl font-bold font-heading">Founder Beta Edition</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold font-heading text-primary">$0</span>
                <span className="text-muted-foreground font-medium text-lg">/ free forever</span>
              </div>
              <CardDescription className="text-sm max-w-md mx-auto">
                Everything you need to validate your concept, refine your roadmap, and launch your startup.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              <Link href="/register" className="block w-full">
                <Button size="lg" className="w-full rounded-2xl font-bold text-base shadow-lg shadow-primary/20 gap-2">
                  <Rocket className="w-5 h-5" /> Get Started Free Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Included In Your Free Account:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-sm text-foreground/90 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border flex items-center gap-3 text-xs text-muted-foreground">
                <HeartHandshake className="w-5 h-5 text-primary shrink-0" />
                <span>
                  Our mission is empowering entrepreneurs everywhere. We are committed to keeping core tools free for founders.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
