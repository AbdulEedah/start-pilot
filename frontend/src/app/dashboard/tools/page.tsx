"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Palette, 
  TrendingUp, 
  BrainCircuit, 
  Clock,
  Sparkles,
  Bell,
  CheckCircle2,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const tools = [
  {
    id: "research",
    name: "AI Research Assistant",
    desc: "Market research, competitor analysis, and trend discovery fine-tuned for your chosen sector.",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    features: ["Competitor Mapping", "Trend Detection", "Market Sizing"]
  },
  {
    id: "design",
    name: "AI Design Assistant",
    desc: "Branding suggestions, UI inspiration, and design direction tailored to your startup's aesthetic.",
    icon: Palette,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    features: ["Color Palettes", "UI Audits", "Branding Strategy"]
  },
  {
    id: "strategy",
    name: "AI Strategy Assistant",
    desc: "Startup strategy, scaling guidance, business modeling, and unit economics validation.",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    features: ["Business Canvas", "Pivot Analysis", "Scaling Roadmap"]
  },
  {
    id: "recommendations",
    name: "AI Recommendation Assistant",
    desc: "Personalized startup guidance, curated resources, and tailored learning paths for founders.",
    icon: BrainCircuit,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    features: ["Personalized Books", "Learning Paths", "Tool Stacks"]
  }
]

export default function AIHubPage() {
  const [waitlist, setWaitlist] = useState<Record<string, boolean>>({})

  const handleNotifyMe = (toolId: string, toolName: string) => {
    setWaitlist((prev) => ({ ...prev, [toolId]: true }))
    toast.success("Added to Early Access!", {
      description: `You will receive an email notification as soon as ${toolName} launches.`,
    })
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading">AI Tools Hub</h1>
            <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Feature Coming Soon
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Specialized AI assistants to help you build, validate, and scale. Currently under active development.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => handleNotifyMe("all", "AI Tools Hub")}
          className="self-start md:self-auto rounded-full gap-2 border-primary/20 hover:bg-primary/10"
        >
          <Bell className="w-4 h-4 text-primary" />
          Notify Me on Release
        </Button>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-amber-800 dark:text-amber-300">Under Construction</p>
          <p className="text-muted-foreground">
            The AI Tools Hub is being built with sector-specific agent engines. In the meantime, use your <strong>AI Copilot</strong> for all strategic, validation, and roadmap queries!
          </p>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => {
          const isSignedUp = waitlist[tool.id] || waitlist["all"]

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-[32px] bg-card border border-border/50 hover:border-primary/40 transition-all shadow-sm flex flex-col relative overflow-hidden"
            >
              {/* Coming soon watermark badge */}
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent text-muted-foreground border border-border/60">
                  Coming Soon
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${tool.bg} ${tool.color}`}>
                  <tool.icon className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-2xl font-bold font-heading mb-2 flex items-center gap-2">
                {tool.name}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{tool.desc}</p>

              <div className="space-y-2 mb-8">
                {tool.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                    <div className={`w-1.5 h-1.5 rounded-full ${tool.color.replace('text-', 'bg-')}`} />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleNotifyMe(tool.id, tool.name)}
                disabled={isSignedUp}
                variant={isSignedUp ? "outline" : "default"}
                className="mt-auto w-full rounded-full h-11 group font-semibold"
              >
                {isSignedUp ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    On Early Access List
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me When Available
                  </>
                )}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Hero-like Feature Section */}
      <div className="p-10 rounded-[36px] bg-accent/30 border border-border/60 relative overflow-hidden text-center">
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" /> FEATURE COMING SOON
          </div>
          <h2 className="text-3xl font-bold font-heading">The AI Startup Laboratory</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Run simulations of your business model, pitch to AI angel investors, and stress-test your 
            product-market fit in a safe, data-driven sandbox. Launching in the next Start Pilot major update.
          </p>
          <div className="pt-2">
            <Button 
              size="default" 
              onClick={() => handleNotifyMe("lab", "The AI Startup Laboratory")}
              className="rounded-full px-8 shadow-lg shadow-primary/20"
            >
              <Bell className="w-4 h-4 mr-2" />
              Join Laboratory Waitlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
