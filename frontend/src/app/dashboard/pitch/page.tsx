"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Presentation, 
  Mic2, 
  ShieldAlert, 
  Trophy, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Download,
  Play,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Upload,
  FileText,
  Loader2,
  Lock,
  Clock,
  BellRing
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"

const PITCH_TYPES = [
  {
    id: "investor",
    title: "Investor Pitch",
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "A comprehensive 10-20 minute narrative designed to secure venture capital or angel investment.",
    guidelines: [
      {
        title: "The Vision & Hook",
        content: "Open with a bold statement that captures the scale of the opportunity. Investors want to see that you're building a category-defining company, not just a feature.",
        proTip: "Try to describe your business in one sentence that a 10-year-old could understand."
      },
      {
        title: "The Hard Truth (Problem)",
        content: "Quantify the pain point. Use data to show why current solutions are failing and what the economic impact of that failure is.",
        proTip: "The bigger the problem, the bigger the potential exit."
      },
      {
        title: "The Secret Sauce (Solution)",
        content: "Explain your unique advantage. Is it a proprietary algorithm, a network effect, or a breakthrough in hardware?",
        proTip: "Focus on 'How it works' for only 20% of this section. Focus on 'Why it's better' for 80%."
      },
      {
        title: "The Engine (Business Model)",
        content: "Be crystal clear on how you make money. Unit economics, CAC/LTV projections, and your sales strategy are key here.",
        proTip: "Investors look for scalability. Show how $1 in turns into $5 out."
      },
      {
        title: "The Team & Roadmap",
        content: "Why are you the only people in the world who can build this? Highlight domain expertise and your next 18 months of milestones.",
        proTip: "Founders are the most important part of a seed round. Sell yourselves."
      }
    ]
  },
  {
    id: "elevator",
    title: "Elevator Pitch",
    icon: Mic2,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description: "A 30-60 second summary designed to spark curiosity and get a follow-up meeting.",
    guidelines: [
      {
        title: "The One-Sentence Hook",
        content: "Start with a question or a shocking fact. You have 7 seconds to win their attention before they tune out.",
        proTip: "Avoid 'We are the X of Y' unless it's genuinely helpful."
      },
      {
        title: "The Problem & Solution",
        content: "State the problem and your solution in two short sentences. Connect them with a 'But we...' transition.",
        proTip: "Focus on the 'Aha!' moment where the value becomes obvious."
      },
      {
        title: "The Traction",
        content: "Mention one impressive metric. 'We have 10k users' or 'We just signed our first Fortune 500 client.'",
        proTip: "Numbers stick. Vague promises of 'growth' don't."
      },
      {
        title: "The Call to Action",
        content: "Never end without an 'Ask'. Whether it's a meeting or a follow-up email, be specific and direct.",
        proTip: "Ask for a card or a specific meeting time, not a check."
      }
    ]
  },
  {
    id: "presentation",
    title: "Presentation Pitch",
    icon: Presentation,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Visual storytelling for demo days, conferences, or large audience presentations.",
    guidelines: [
      {
        title: "The Rule of One",
        content: "Each slide should convey exactly one idea. If you have three points, use three separate slides.",
        proTip: "If they are reading your slides, they aren't listening to you. Keep text minimal."
      },
      {
        title: "Emotional Resonance",
        content: "Humans remember stories, not spreadsheets. Use a customer persona to narrate the user journey.",
        proTip: "Use 'Meet Sarah' instead of 'Our Primary Target Demographic'."
      },
      {
        title: "The Demo / Visuals",
        content: "If you have a product, show it. A 30-second video of the product in action is worth 10 static slides.",
        proTip: "Never rely on live internet for a stage demo. Always have a recorded backup."
      },
      {
        title: "The Finale",
        content: "End on a high note. Reiterate the vision and leave your contact info or a QR code on the screen.",
        proTip: "The last slide is what stays up during Q&A. Make sure it's your best one."
      }
    ]
  }
]

export default function PitchPage() {
  const { sector: activeSectorId } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)

  const [mode, setMode] = useState<"hub" | "guidelines" | "simulation" | "analyzer">("hub")
  const [activeType, setActiveType] = useState(PITCH_TYPES[0])
  const [currentStep, setCurrentStep] = useState(0)
  const [score, setScore] = useState(0)
  const [simStep, setSimStep] = useState(0)
  const [pitchContent, setPitchContent] = useState("")
  const [analysis, setAnalysis] = useState<{ id: string; content: string; scores: { overall: number }; feedback: { strengths: string[]; weaknesses: string[]; suggestions: string[] } } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isJoinedWaitlist, setIsJoinedWaitlist] = useState(false)

  const handleJoinWaitlist = (featureName: string) => {
    setIsJoinedWaitlist(true)
    toast.success(`Registered for ${featureName} Early Access!`, {
      description: "We'll notify you as soon as the live AI scoring engine is online."
    })
  }

  // AI Pitch Analyzer - Coming Soon Screen
  if (mode === "analyzer") {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-6 border-b flex items-center justify-between">
          <Button variant="ghost" onClick={() => setMode("hub")} className="rounded-full">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Pitch Hub
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h2 className="font-bold text-xl font-heading">AI Pitch Analyzer</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-500 border border-violet-500/20">
              COMING SOON
            </span>
          </div>
          <div className="w-[100px]" />
        </div>

        <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center space-y-8 p-10 rounded-[40px] bg-card border border-border/50 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mx-auto border border-violet-500/20 text-violet-500">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" /> Feature Under Active Fine-Tuning
              </div>
              <h1 className="text-4xl font-bold font-heading">AI Pitch Analyzer is Coming Soon</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our deep neural model for voice, video, and slide deck evaluation in <strong className="text-foreground">{activeSector.name}</strong> is undergoing specialized calibration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-accent/30 border border-border/50 text-left space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-500">Upcoming Features Include:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated slide deck structure and design auditing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sector metric benchmark scoring against {activeSector.competitors[0] || 'incumbents'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time vocal tone, clarity, and delivery pace evaluation
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleJoinWaitlist("AI Pitch Analyzer")}
                className="h-14 px-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-base shadow-xl shadow-violet-500/20"
                disabled={isJoinedWaitlist}
              >
                <BellRing className="mr-2 h-5 w-5" />
                {isJoinedWaitlist ? "Early Access Requested!" : "Notify Me When Live"}
              </Button>
              <Button variant="outline" onClick={() => setMode("guidelines")} className="h-14 px-8 rounded-full">
                Explore Pitch Guidelines
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "guidelines") {
    return (
      <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
          <Button variant="ghost" onClick={() => setMode("hub")} className="text-white hover:bg-white/10 rounded-full">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Hub
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activeType.bgColor}`}>
              <activeType.icon className={`w-5 h-5 ${activeType.color}`} />
            </div>
            <h2 className="font-bold text-xl">{activeType.title} Guidelines ({activeSector.name})</h2>
          </div>
          <div className="w-[100px]" />
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-white/5 p-6 space-y-2 overflow-y-auto hidden md:block">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Pitch Types</p>
            {PITCH_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setActiveType(type)
                  setCurrentStep(0)
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 group ${
                  activeType.id === type.id 
                    ? "bg-white/10 text-white shadow-lg ring-1 ring-white/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <type.icon className={`w-5 h-5 ${activeType.id === type.id ? type.color : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="font-medium">{type.title}</span>
              </button>
            ))}

            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-bold uppercase text-primary tracking-widest">Active Sector Focus</p>
              <p className="text-sm font-semibold text-white">{activeSector.name}</p>
              <p className="text-xs text-slate-400">TAM: {activeSector.marketSize}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold font-heading">{activeType.title}</h1>
                <p className="text-xl text-slate-400 leading-relaxed">{activeType.description}</p>
              </div>

              {/* Sector Specific Tip Highlight */}
              <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                  <Lightbulb className="w-4 h-4" /> Sector-Tailored Pitch Rule ({activeSector.name})
                </div>
                <p className="text-slate-200 text-sm">
                  {activeSector.pitchTips[0]?.content || "Always quantify your metrics and target market."}
                </p>
              </div>

              <div className="space-y-8">
                {activeType.guidelines.map((guide, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={guide.title}
                    className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex gap-6">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold">{guide.title}</h3>
                        <p className="text-slate-300 text-lg leading-relaxed">{guide.content}</p>
                        
                        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                          <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-1" />
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Founder Pro-Tip</p>
                            <p className="text-sm text-slate-400 italic">"{guide.proTip}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pitch Simulator - Coming Soon Screen
  if (mode === "simulation") {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-6 border-b flex items-center justify-between">
          <Button variant="ghost" onClick={() => setMode("hub")} className="rounded-full">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Pitch Hub
          </Button>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary fill-primary" />
            <h2 className="font-bold text-xl font-heading">Pitch Simulator</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              COMING SOON
            </span>
          </div>
          <div className="w-[100px]" />
        </div>

        <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center space-y-8 p-10 rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-primary/20 rounded-full blur-[100px]" />

            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border border-white/20 text-primary">
              <Play className="w-10 h-10 fill-primary" />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" /> Interactive Simulation Engine Launching Soon
              </div>
              <h1 className="text-4xl font-bold font-heading">Pitch Simulator is Coming Soon</h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Practice high-stakes Q&A against customized AI Venture Capitalist personas in <strong className="text-white">{activeSector.name}</strong> before meeting real investors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3 relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Simulator Features In Progress:</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sector VC personalities (Aggressive Partner, Technical Specialist, Impact VC)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tough question pressure-testing for {activeSector.keyMetrics[0]}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Voice & speech feedback with confidence scores
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button 
                onClick={() => handleJoinWaitlist("Pitch Simulator")}
                className="h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-xl shadow-primary/20"
                disabled={isJoinedWaitlist}
              >
                <BellRing className="mr-2 h-5 w-5" />
                {isJoinedWaitlist ? "Early Access Requested!" : "Join Simulator Waitlist"}
              </Button>
              <Button variant="outline" onClick={() => setMode("guidelines")} className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10">
                Read Pitch Guidelines
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-12 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold font-heading tracking-tight">The Art of the Pitch</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeSector.badgeColor}`}>
            Active Sector: {activeSector.name}
          </span>
        </div>
        <p className="text-xl text-muted-foreground">Master your story with industry-standard guidelines tailored to {activeSector.name}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PITCH_TYPES.map((type) => (
          <motion.div 
            key={type.id}
            whileHover={{ y: -8 }}
            className="p-8 rounded-[48px] bg-card border border-border/50 space-y-6 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => {
              setActiveType(type)
              setMode("guidelines")
            }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${type.bgColor} rounded-bl-[100px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className={`w-16 h-16 ${type.bgColor} rounded-[24px] flex items-center justify-center`}>
              <type.icon className={`w-8 h-8 ${type.color}`} />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-bold font-heading">{type.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {type.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
              View Guidelines <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pitch Simulator Card with COMING SOON Badge */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-10 rounded-[48px] bg-slate-900 text-white space-y-8 shadow-2xl relative overflow-hidden group cursor-pointer border border-white/10"
          onClick={() => setMode("simulation")}
        >
          <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 z-20">
            <Lock className="w-3.5 h-3.5" /> COMING SOON
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-primary/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700" />
          <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center">
            <Play className="w-8 h-8 text-primary fill-primary" />
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-bold font-heading">Pitch Simulator</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Pressure-test your pitch against AI venture capitalists in {activeSector.name}. Practice sessions launching soon.
            </p>
          </div>
          <Button className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
            Preview Pitch Simulator
          </Button>
        </motion.div>

        {/* AI Pitch Analyzer Card with COMING SOON Badge */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-10 rounded-[48px] bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 space-y-8 shadow-xl relative overflow-hidden group cursor-pointer"
          onClick={() => setMode("analyzer")}
        >
          <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/40 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 z-20">
            <Lock className="w-3.5 h-3.5" /> COMING SOON
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-violet-500/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700" />
          <div className="w-16 h-16 bg-primary/20 rounded-[24px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-bold font-heading">AI Pitch Analyzer</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Get detailed automated feedback on your pitch deck structure & sector metrics in {activeSector.name}.
            </p>
          </div>
          <Button className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
            Preview AI Pitch Analyzer
          </Button>
        </motion.div>
      </div>

      <div className="p-10 rounded-[48px] bg-accent/30 border border-border/50 flex flex-col justify-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-widest w-fit">
          <Trophy className="w-4 h-4" /> SUCCESS STORY ({activeSector.name})
        </div>
        <h2 className="text-2xl font-bold font-heading leading-tight italic">
          "The pitch guidelines helped me structure my {activeSector.name} narrative around {activeSector.keyMetrics[0]}, giving me the confidence to close our seed round."
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
              alt="Sarah Jenkins" 
              className="w-full h-full bg-white"
            />
          </div>
          <div>
            <p className="font-bold">Sarah Jenkins</p>
            <p className="text-sm text-muted-foreground">Founder in {activeSector.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}