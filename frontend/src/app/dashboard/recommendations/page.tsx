"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BookOpen, 
  Film, 
  Wrench, 
  Quote, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Star,
  Sparkles,
  CheckCircle2,
  Target,
  Zap,
  Copy,
  Check,
  History,
  Lightbulb,
  Building,
  Loader2,
  Compass,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { 
  recommendationsApi, 
  type DynamicMotivationResponse 
} from "@/lib/api"
import { toast } from "sonner"

// Real-world founder podcast deep dives and historical documentaries
const REAL_FOUNDER_MEDIA = [
  {
    title: "How I Built This with Guy Raz",
    type: "Podcast",
    creator: "NPR",
    desc: "In-depth narrative interviews with iconic founders detailing the raw, unglamorous early days and near-death moments.",
    link: "https://www.npr.org/series/490248027/how-i-built-this",
  },
  {
    title: "Acquired: Every Company Has a Story",
    type: "Podcast",
    creator: "Ben Gilbert & David Rosenthal",
    desc: "Rigorous 3-hour operational playbooks examining how titans like NVIDIA, Costco, Apple, and Hermes built enduring moats.",
    link: "https://www.acquired.fm/",
  },
  {
    title: "General Magic",
    type: "Documentary",
    creator: "Sarah Kerruish & Matt Maude",
    desc: "The true story of the Silicon Valley startup that created the smartphone concept 15 years too early, and the lessons of timing.",
    link: "https://www.generalmagicthemovie.com/",
  },
  {
    title: "YC Startup School Masterclasses",
    type: "Video Series",
    creator: "Y Combinator",
    desc: "Lectures by Paul Graham, Sam Altman, and Dalton Caldwell on finding product-market fit, pricing, and talking to users.",
    link: "https://www.startupschool.org/",
  },
  {
    title: "Something Ventured",
    type: "Documentary",
    creator: "Dan Geller & Dayna Goldfine",
    desc: "The historical founding stories behind Apple, Intel, Cisco, and Atari, and the high-stakes decisions of the 1970s.",
    link: "https://www.somethingventuredmovie.com/",
  },
]

export default function RecommendationsPage() {
  const { sector: activeSectorId, user } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)

  const [data, setData] = useState<DynamicMotivationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [directiveCompleted, setDirectiveCompleted] = useState(false)
  const [showHistoryContext, setShowHistoryContext] = useState(false)

  const loadMotivations = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }

      const res = refresh
        ? await recommendationsApi.refreshMotivations()
        : await recommendationsApi.getMotivations()

      setData(res)
      setDirectiveCompleted(false)
      if (refresh) {
        toast.success("Fresh motivation generated!", {
          description: `Tactical directive loaded from ${res.quote.author} (${res.quote.company}).`,
        })
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load dynamic recommendations")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadMotivations()
  }, [])

  const copyDirective = () => {
    if (!data?.daily_directive) return
    const text = `${data.daily_directive.title}\n\nAction: ${data.daily_directive.action}\nRationale: ${data.daily_directive.rationale}`
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success("Directive copied to clipboard!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const completeDirective = () => {
    setDirectiveCompleted(true)
    toast.success("Action marked as completed!", {
      description: "Great execution velocity. Keep building momentum today.",
    })
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading">Founder Motivations & Directives</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeSector.badgeColor}`}>
              {activeSector.name}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Real-time motivation, tactical directives, and authentic playbooks from verified iconic founders.
          </p>
        </div>

        <Button
          onClick={() => loadMotivations(true)}
          disabled={isRefreshing || loading}
          className="rounded-full font-bold shadow-md shadow-primary/20 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Generating Real-Time Insights..." : "Generate Fresh Motivation"}
        </Button>
      </div>

      {loading ? (
        <div className="p-16 rounded-[32px] bg-card border border-border/60 flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Synthesizing Real Founder Wisdom...</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tailoring real-world lessons and actionable daily directives for your venture in {activeSector.name}.
            </p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Hero Motivation Card (Real Founder Quote) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 md:p-10 rounded-[32px] bg-gradient-to-br from-primary via-primary/95 to-slate-950 text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20 border border-primary/20"
          >
            <div className="absolute top-[-20%] right-[-10%] w-[45%] h-[150%] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[80%] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20 rounded-full text-xs font-bold px-3 py-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Real Founder Wisdom
                  </Badge>
                  <span className="text-xs text-white/70 font-medium">Live Generated for Today</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5"
                  onClick={() => setShowHistoryContext(!showHistoryContext)}
                >
                  <History className="w-3.5 h-3.5" />
                  {showHistoryContext ? "Hide Context" : "The True Story Behind This"}
                </Button>
              </div>

              <div className="space-y-3">
                <Quote className="w-10 h-10 text-white/30" />
                <p className="text-2xl md:text-3xl font-medium leading-relaxed italic tracking-tight font-serif text-white">
                  "{data.quote.text}"
                </p>
              </div>

              <AnimatePresence>
                {showHistoryContext && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-black/25 border border-white/10 text-white/90 text-sm leading-relaxed"
                  >
                    <p className="font-bold text-xs uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" /> Historical Backstory
                    </p>
                    {data.quote.historical_context}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Author Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/15">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-white/25 shrink-0 bg-slate-900 shadow-md">
                    <img
                      src={data.quote.avatar}
                      alt={data.quote.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">{data.quote.author}</h4>
                    <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-white/60" />
                      {data.quote.role} at <strong className="text-white">{data.quote.company}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white border-white/30 rounded-full text-xs capitalize">
                    {data.sector} Sector
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => loadMotivations(true)}
                    disabled={isRefreshing}
                    className="rounded-full font-bold bg-white text-primary hover:bg-white/90 shrink-0 text-xs shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    Next Motivation
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid: Venture Relevance & Tactical Daily Directive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Venture Relevance Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7 p-7 rounded-[28px] bg-card border border-border/60 shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Relevance to Your Venture
                    </span>
                  </div>
                  <Badge variant="outline" className="rounded-full text-xs font-medium">
                    {data.venture_relevance.stage_context}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold font-heading text-foreground leading-snug">
                  {data.venture_relevance.headline}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.venture_relevance.explanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-accent/40 border border-border/50 space-y-1.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" /> Key Strategic Takeaway:
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {data.venture_relevance.actionable_takeaway}
                </p>
              </div>
            </motion.div>

            {/* Right: Today's Tactical Directive */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-5 p-7 rounded-[28px] bg-card border-2 border-primary/20 shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Tactical Daily Directive
                    </span>
                  </div>
                  <Badge className="rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {data.daily_directive.urgency}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-base text-foreground">
                    {data.daily_directive.title}
                  </h4>
                  <p className="text-sm font-medium text-foreground bg-primary/5 p-4 rounded-2xl border border-primary/10 leading-relaxed">
                    "{data.daily_directive.action}"
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Why today: </strong>
                  {data.daily_directive.rationale}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <Button
                  size="sm"
                  onClick={copyDirective}
                  variant="outline"
                  className="rounded-full text-xs font-semibold flex-1"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {isCopied ? "Copied" : "Copy Directive"}
                </Button>

                <Button
                  size="sm"
                  onClick={completeDirective}
                  disabled={directiveCompleted}
                  className={`rounded-full text-xs font-bold flex-1 ${
                    directiveCompleted
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {directiveCompleted ? "Completed Today!" : "Mark as Done"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Real Founder Case Study & Tactical Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[32px] bg-card border border-border/60 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-heading">
                    Real Founder Playbook: {data.case_study.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Documented case study from how {data.quote.author} scaled {data.quote.company}.
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                Authentic Case Study
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Problem Faced */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> The Real-World Crisis
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {data.case_study.problem_faced}
                </p>
              </div>

              {/* Action Taken */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Tactical Action Taken
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {data.case_study.tactical_action}
                </p>
              </div>

              {/* Repeatable Lesson */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> The Repeatable Moat
                </span>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {data.case_study.key_lesson}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Sector Curated Resources Tabs */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-heading">
              Curated Resources for {activeSector.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Hand-picked books, essential software stacks, and founder deep dives.
            </p>
          </div>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="books" className="text-xs font-bold">Verified Books</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs font-bold">Sector Software Tools</TabsTrigger>
            <TabsTrigger value="media" className="text-xs font-bold">Podcasts & Documentaries</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSector.recommendedBooks.map((book, i) => (
              <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-[10px] font-bold uppercase">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {activeSector.name} Essential
                  </div>
                  <h3 className="font-bold text-base leading-snug">{book.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium">By {book.author} • {book.category}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{book.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(book.title + " by " + book.author)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary flex items-center justify-between hover:underline"
                  >
                    Find Book Details <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSector.recommendedTools.map((tool, i) => (
              <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-emerald-500/40 transition-all shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                    <Sparkles className="w-3 h-3" /> Production Tool
                  </div>
                  <h3 className="font-bold text-base">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{tool.category}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{tool.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between hover:underline"
                  >
                    Open Platform <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="media" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REAL_FOUNDER_MEDIA.map((item, i) => (
              <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-violet-500/40 transition-all shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                    <Film className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold uppercase">
                    {item.type}
                  </div>
                  <h3 className="font-bold text-base leading-snug">{item.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium">By {item.creator}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center justify-between hover:underline"
                  >
                    Listen / Watch <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
