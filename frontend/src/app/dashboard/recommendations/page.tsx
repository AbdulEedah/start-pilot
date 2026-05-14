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
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const MOCK_RECOMMENDATIONS = {
  books: [
    { title: "The Lean Startup", author: "Eric Ries", category: "Strategy", desc: "How constant innovation creates radically successful businesses.", icon: BookOpen },
    { title: "Zero to One", author: "Peter Thiel", category: "Strategy", desc: "Notes on startups, or how to build the future.", icon: BookOpen },
    { title: "Hard Thing About Hard Things", author: "Ben Horowitz", category: "Leadership", desc: "Building a business when there are no easy answers.", icon: BookOpen },
  ],
  movies: [
    { title: "The Social Network", type: "Movie", desc: "The story of how Facebook was founded.", icon: Film },
    { title: "General Magic", type: "Documentary", desc: "The most important company you've never heard of.", icon: Film },
    { title: "Silicon Cowboys", type: "Documentary", desc: "The story of Compaq and its battle against IBM.", icon: Film },
  ],
  tools: [
    { name: "Figma", category: "Design", desc: "The collaborative interface design tool.", link: "https://figma.com", icon: Wrench },
    { name: "Notion", category: "Productivity", desc: "The all-in-one workspace for your notes and tasks.", link: "https://notion.so", icon: Wrench },
    { name: "Google Forms", category: "Validation", desc: "Quickly create surveys to validate your idea.", link: "https://forms.google.com", icon: Wrench },
  ]
}

const MOCK_QUOTES = [
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" }
]

export default function RecommendationsPage() {
  const [quote, setQuote] = useState(MOCK_QUOTES[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshQuote = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const nextQuote = MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)]
      setQuote(nextQuote)
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading">Personalized Recommendations</h1>
        <p className="text-muted-foreground">Hand-picked resources based on your sector and stage.</p>
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
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="movies">Movies & Docs</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_RECOMMENDATIONS.books.map((book, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold uppercase mb-2">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> AI PICK
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

        <TabsContent value="movies" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_RECOMMENDATIONS.movies.map((movie, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                <Film className="w-5 h-5 text-violet-500" />
              </div>
              <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{movie.type}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{movie.desc}</p>
              <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-accent rounded-full">
                Watch Trailer <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_RECOMMENDATIONS.tools.map((tool, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-lg mb-1">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{tool.category}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{tool.desc}</p>
              <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-accent rounded-full" asChild>
                <a href={tool.link} target="_blank">Open Tool <ExternalLink className="w-4 h-4" /></a>
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
