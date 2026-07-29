"use client"

import { motion } from "framer-motion"
import { 
  Search, 
  Palette, 
  TrendingUp, 
  BrainCircuit, 
  ArrowRight,
  Cpu,
  Sparkles,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"

const tools = [
  {
    id: "research",
    name: "AI Research Assistant",
    desc: "Market research, competitor analysis, and trend discovery.",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    features: ["Competitor Mapping", "Trend Detection", "Market Sizing"]
  },
  {
    id: "design",
    name: "AI Design Assistant",
    desc: "Branding suggestions, UI inspiration, and design direction.",
    icon: Palette,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    features: ["Color Palettes", "UI Audits", "Branding Strategy"]
  },
  {
    id: "strategy",
    name: "AI Strategy Assistant",
    desc: "Startup strategy, scaling guidance, and business modeling.",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    features: ["Business Canvas", "Pivot Analysis", "Scaling Roadmap"]
  },
  {
    id: "recommendations",
    name: "AI Recommendation Assistant",
    desc: "Personalized startup guidance and learning recommendations.",
    icon: BrainCircuit,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    features: ["Personalized Books", "Learning Paths", "Tool Stacks"]
  }
]

export default function AIHubPage() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading">AI Tools Hub</h1>
        <p className="text-muted-foreground">Specialized AI assistants to help you build and scale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-8 rounded-[32px] bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl ${tool.bg} ${tool.color}`}>
                <tool.icon className="w-8 h-8" />
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-accent flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tool.id}${i}`} alt="Avatar" />
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-bold font-heading mb-3">{tool.name}</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">{tool.desc}</p>

            <div className="space-y-3 mb-8">
              {tool.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium">
                  <div className={`w-1.5 h-1.5 rounded-full ${tool.color.replace('text-', 'bg-')}`} />
                  {feature}
                </div>
              ))}
            </div>

            <Button className="mt-auto w-full rounded-full h-12 group">
              Launch Assistant
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Hero-like Feature Section */}
      <div className="p-12 rounded-[40px] bg-accent/30 border border-border/50 relative overflow-hidden text-center">
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> NEW FEATURE
          </div>
          <h2 className="text-4xl font-bold font-heading">The AI Startup Laboratory</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Run simulations of your business model, pitch to AI investors, and test your 
            product-market fit in a safe, data-driven environment.
          </p>
          <Button size="lg" className="rounded-full px-12 h-14 shadow-xl shadow-primary/20">
            Open Lab
          </Button>
        </div>
      </div>
    </div>
  )
}
