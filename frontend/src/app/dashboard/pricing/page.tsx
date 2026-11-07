"use client"

import { Check, Sparkles, Rocket, ArrowRight, ShieldCheck, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPricingPage() {
  const features = [
    "Unlimited AI Startup Concept Validations",
    "Tailored 12-Week Execution Roadmap",
    "AI Pitch Deck Coach & Slide Scoring",
    "Direct Access to Verified Mentors & Calendly Booking",
    "Sector Insights & Curated Resource Library",
    "Interactive Strategy Chat & Growth Recommendations"
  ]

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> 100% Free Access Enabled
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-heading">Platform Access & Status</h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          StartPilot is completely free during our founder beta. There are no payment plans, paywalls, or credit card requirements.
        </p>
      </div>

      <Card className="rounded-[32px] border-2 border-primary/20 shadow-xl overflow-hidden bg-card">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-bold font-heading">Founder Beta Tier</CardTitle>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className="text-5xl font-extrabold text-primary font-heading">$0</span>
            <span className="text-muted-foreground text-sm font-semibold">/ All Features Included</span>
          </div>
          <CardDescription className="text-xs pt-2">
            Your account has full unrestricted access to the StartPilot startup acceleration engine.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> All AI tools, roadmaps, and mentor networks are active and unlocked.
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What's Unlocked On Your Account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full rounded-full font-bold shadow-md shadow-primary/20">
                <Rocket className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/mentors" className="flex-1">
              <Button variant="outline" className="w-full rounded-full font-semibold">
                Explore Mentors & Advisors
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
