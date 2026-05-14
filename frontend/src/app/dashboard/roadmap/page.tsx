"use client"

import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  Flag, 
  Rocket, 
  Target, 
  TrendingUp, 
  FileText,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const ROADMAP_STAGES = [
  {
    id: 1,
    title: "Phase 1: Foundation & Ideation",
    status: "completed",
    items: [
      "Problem-Solution Fit Validation",
      "Sector-Specific Market Analysis",
      "Core Value Proposition Defined",
      "Initial Founder Background Audit"
    ]
  },
  {
    id: 2,
    title: "Phase 2: MVP Development",
    status: "current",
    items: [
      "Define Minimum Viable Product scope",
      "Select Tech Stack (Next.js, Tailwind, Supabase)",
      "Develop Core Functional Prototype",
      "Set up Landing Page for Early Access"
    ]
  },
  {
    id: 3,
    title: "Phase 3: Market Validation",
    status: "upcoming",
    items: [
      "Launch Pilot Program to 10 Beta Users",
      "Collect Feedback & Iterate MVP",
      "Define Key Performance Indicators (KPIs)",
      "Initial Unit Economics Analysis"
    ]
  },
  {
    id: 4,
    title: "Phase 4: Growth & Scaling",
    status: "upcoming",
    items: [
      "Optimize Conversion Funnel",
      "Establish Strategic Partnerships",
      "Prepare Investor Pitch Deck",
      "Scale Infrastructure for 1000+ Users"
    ]
  }
]

export default function RoadmapPage() {
  const handleExport = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Generating your Startup Blueprint PDF...',
      success: 'BluePrint Downloaded Successfully!',
      error: 'Failed to generate PDF',
    })
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading">Startup Roadmap</h1>
          <p className="text-muted-foreground">Your step-by-step path from idea to scale.</p>
        </div>
        <Button onClick={handleExport} className="rounded-full shadow-lg shadow-primary/20">
          <Download className="mr-2 h-4 w-4" />
          Export Blueprint
        </Button>
      </div>

      <div className="max-w-4xl relative mt-12">
        {/* Connection Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -z-10" />

        <div className="space-y-12">
          {ROADMAP_STAGES.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-16"
            >
              {/* Stage Indicator */}
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center border-4 bg-background ${
                stage.status === 'completed' ? 'border-primary text-primary' :
                stage.status === 'current' ? 'border-primary text-primary animate-pulse' :
                'border-border text-muted-foreground'
              }`}>
                {stage.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : stage.status === 'current' ? (
                  <Rocket className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>

              <div className={`p-8 rounded-[32px] border transition-all ${
                stage.status === 'current' ? 'bg-card border-primary/50 shadow-xl shadow-primary/10' : 'bg-card/50 border-border/50'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold font-heading">{stage.title}</h2>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    stage.status === 'completed' ? 'bg-primary/10 text-primary' :
                    stage.status === 'current' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-accent text-muted-foreground'
                  }`}>
                    {stage.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stage.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm">
                      <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${
                        stage.status === 'completed' ? 'bg-primary/10 border-primary text-primary' : 'border-border'
                      }`}>
                        {stage.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={stage.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {stage.status === 'current' && (
                  <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <p className="text-sm font-medium">Ready to start Phase 2 tasks?</p>
                    </div>
                    <Button size="sm" className="rounded-full">Get Guidance</Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Milestone */}
      <div className="max-w-4xl flex justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent border border-border flex items-center justify-center">
            <Flag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Destination: Series A Funding</p>
        </div>
      </div>
    </div>
  )
}
