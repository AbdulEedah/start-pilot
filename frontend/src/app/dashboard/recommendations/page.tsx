"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  Film, 
  Wrench, 
  Quote, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Star,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOffline } from "@/components/offline-provider"
import { getSectorDetails } from "@/lib/sector-utils"

const MOCK_MOVIES = [
  { title: "The Social Network", type: "Movie", desc: "The foundational story of scaling digital network effects." },
  { title: "General Magic", type: "Documentary", desc: "The tech pioneers who envisioned modern mobile computing." },
  { title: "Silicon Cowboys", type: "Documentary", desc: "Building portable computing to challenge industry giants." },
]

const MOCK_QUOTES = [
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" }
]

export default function RecommendationsPage() {
  const { sector: activeSectorId } = useOffline()
  const activeSector = getSectorDetails(activeSectorId)

  const [quote, setQuote] = useState(MOCK_QUOTES[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshQuote = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const nextQuote = MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)]
      setQuote(nextQuote)
      setIsRefreshing(false)
    }, 400)
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold font-heading">Personalized Recommendations</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeSector.badgeColor}`}>
            {activeSector.name}
          </span>
        </div>
        <p className="text-muted-foreground">Hand-picked resources, books, and tools for founders in <strong className="text-foreground">{activeSector.name}</strong>.</p>
      </div>

      {/* Quotes Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[32px] bg-primary text-primary-foreground relative overflow-hidden group shadow-xl shadow-primary/20"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-white/10 rounded-full blur-[100px]" />
        <Quote className="w-12 h-12 mb-6 opacity-20" />
        <div className="relative z-10 space-y-4">
          <p className="text-2xl font-medium leading-relaxed italic">"{quote.text}"</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">— {quote.author}</p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/10 text-white"
              onClick={refreshQuote}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="books">Sector Books</TabsTrigger>
          <TabsTrigger value="tools">Sector Tools</TabsTrigger>
          <TabsTrigger value="movies">Movies & Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSector.recommendedBooks.map((book, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold uppercase mb-2">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {activeSector.name} PICK
              </div>
              <h3 className="font-bold text-lg mb-1">{book.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{book.author} • {book.category}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{book.desc}</p>
              <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-accent rounded-full">
                Learn more <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSector.recommendedTools.map((tool, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase mb-2">
                <Sparkles className="w-3 h-3" /> ESSENTIAL TOOL
              </div>
              <h3 className="font-bold text-lg mb-1">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{tool.category}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{tool.desc}</p>
              <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-accent rounded-full" asChild>
                <a href={tool.link} target="_blank" rel="noreferrer">Open Tool <ExternalLink className="w-4 h-4" /></a>
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="movies" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_MOVIES.map((movie, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                <Film className="w-5 h-5 text-violet-500" />
              </div>
              <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{movie.type}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{movie.desc}</p>
              <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-accent rounded-full">
                Watch Insights <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
