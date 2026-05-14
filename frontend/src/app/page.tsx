"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowRight, 
  Sparkles, 
  Rocket, 
  Zap, 
  Target, 
  Users, 
  Cpu, 
  ShieldCheck,
  Star,
  Quote
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { EntryDialog } from "@/components/onboarding/entry-dialog"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border/40">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-9 h-9 transition-transform bg-primary rounded-xl group-hover:rotate-12 shadow-lg shadow-primary/20">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading">
              Start Pilot
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#sectors" className="hover:text-primary transition-colors">Sectors</Link>
            <Link href="#mentorship" className="hover:text-primary transition-colors">Mentorship</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Success Stories</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Sign In
            </Link>
            <Button className="rounded-full" onClick={() => setIsEntryDialogOpen(true)}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 pt-24 pb-32 mx-auto text-center max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1 mb-8 border rounded-full bg-accent/50 border-primary/20 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            The AI Copilot for Early-Stage Founders
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mb-6 text-6xl font-bold tracking-tight sm:text-8xl font-heading"
        >
          Build your startup at{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-indigo-400">
            light speed.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mb-12 text-xl leading-relaxed text-muted-foreground"
        >
          The only platform that turns raw ideas into validated, 
          investor-ready ventures using advanced AI guidance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center w-full gap-4 sm:flex-row sm:justify-center"
        >
          <Button size="lg" className="h-14 px-10 rounded-full text-lg group shadow-xl shadow-primary/25" onClick={() => setIsEntryDialogOpen(true)}>
            Start Building Now
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-10 rounded-full text-lg backdrop-blur-sm">
            Watch Demo
          </Button>
        </motion.div>

        {/* Hero Illustration Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative w-full max-w-5xl mt-24 aspect-[2/1] rounded-[40px] overflow-hidden border border-border/50 shadow-2xl bg-gradient-to-b from-accent/50 to-background/50"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground/40">
              <Cpu className="w-16 h-16 animate-pulse" />
              <span className="text-sm font-medium">Interactive AI Dashboard Preview</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-accent/30 border-y border-border/50">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <Target className="w-4 h-4" /> CORE ENGINE
              </div>
              <h2 className="text-4xl font-bold font-heading sm:text-5xl leading-tight">
                AI Startup Guidance <br />that actually understands.
              </h2>
              <p className="text-lg text-muted-foreground">
                Unlike generic LLMs, Start Pilot is trained on thousands of successful startup roadmaps. 
                It identifies market gaps, suggests technical stacks, and validates your unit economics in real-time.
              </p>
              <ul className="space-y-4">
                {[
                  "Dynamic Ideation Workflows",
                  "Real-time Market Gap Analysis",
                  "Automated Tech Stack Recommendation",
                  "Investor-Ready Pitch Decks"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="p-8 aspect-square rounded-3xl bg-card border border-border/50 flex flex-col justify-end shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold">Safe Validation</h4>
                </div>
                <div className="p-8 aspect-square rounded-3xl bg-primary flex flex-col justify-end shadow-xl shadow-primary/20">
                  <Target className="w-8 h-8 text-primary-foreground mb-4" />
                  <h4 className="font-bold text-primary-foreground">Target Focus</h4>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-8 aspect-square rounded-3xl bg-violet-600 flex flex-col justify-end shadow-xl shadow-violet-500/20">
                  <Users className="w-8 h-8 text-white mb-4" />
                  <h4 className="font-bold text-white">Community</h4>
                </div>
                <div className="p-8 aspect-square rounded-3xl bg-card border border-border/50 flex flex-col justify-end shadow-lg">
                  <Cpu className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold">Neural Core</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sector Previews */}
      <section id="sectors" className="py-24">
        <div className="px-6 mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold font-heading mb-16">Ecosystems for every sector.</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { name: "SaaS & Enterprise", image: "/saas.png", color: "from-blue-500/20" },
              { name: "FinTech & Payments", image: "/fintech.png", color: "from-amber-500/20" },
              { name: "AI & Future Tech", image: "/ai.png", color: "from-violet-500/20" }
            ].map((sector, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-[32px] border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${sector.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="p-8">
                  <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden bg-accent/50">
                    <Image 
                      src={sector.image} 
                      alt={sector.name} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-110" 
                    />
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-2">{sector.name}</h3>
                  <p className="text-sm text-muted-foreground">Tailored roadmaps and resources for {sector.name.toLowerCase()} founders.</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentorship Section */}
      <section id="mentorship" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-white/10 rounded-full blur-[120px]" />
        <div className="px-6 mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-bold font-heading mb-8">Mentorship built into the code.</h2>
            <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed">
              Every step you take is reviewed by our AI Mentor, a digital twin of veteran founders and VCs. 
              Get brutally honest feedback on your pitch, your pricing, and your product-market fit.
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Star className="w-8 h-8 mb-4 text-amber-400 fill-amber-400" />
                <h4 className="font-bold mb-2">VC Analysis</h4>
                <p className="text-sm text-primary-foreground/70">Simulate investor meetings and get scored on your pitch readiness.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Target className="w-8 h-8 mb-4 text-emerald-400" />
                <h4 className="font-bold mb-2">Strategic Pivot</h4>
                <p className="text-sm text-primary-foreground/70">When markets change, our AI helps you pivot without losing momentum.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-b border-border/50">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-12">
            <Quote className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold font-heading">Built by founders, for founders.</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                text: "Start Pilot gave me the confidence to quit my job. The validation engine proved my idea was viable before I wrote a single line of code.",
                author: "Sarah Chen",
                role: "Founder, Bloom AI"
              },
              {
                text: "The roadmap generated by Start Pilot was more detailed than the one I paid a consultant $5,000 for. It's a game-changer.",
                author: "Marcus Thorne",
                role: "CEO, Nexus Labs"
              }
            ].map((t, i) => (
              <div key={i} className="p-10 rounded-[32px] border border-border/50 bg-accent/20">
                <p className="text-2xl font-medium mb-8 leading-relaxed italic text-foreground">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {t.author[0]}
                  </div>
                  <div>
                    <h5 className="font-bold">{t.author}</h5>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <footer className="py-24 bg-card">
        <div className="px-6 mx-auto max-w-7xl text-center">
          <h2 className="text-5xl font-bold font-heading mb-8">Ready to fly?</h2>
          <p className="text-xl text-muted-foreground mb-12">Join 10,000+ founders building the future with Start Pilot.</p>
          <Button size="lg" className="h-16 px-12 rounded-full text-xl shadow-2xl shadow-primary/30" onClick={() => setIsEntryDialogOpen(true)}>
            Claim Your Startup Seat
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
          
          <Separator className="my-24" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-left">
            <div className="space-y-4">
              <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">AI Guidance</Link></li>
                <li><Link href="#" className="hover:text-primary">Roadmaps</Link></li>
                <li><Link href="#" className="hover:text-primary">Mentorship</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary">Sector Guides</Link></li>
                <li><Link href="#" className="hover:text-primary">Startup Blog</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Connect</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Twitter</Link></li>
                <li><Link href="#" className="hover:text-primary">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-primary">Discord</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-24 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">Start Pilot</span>
              <span>© 2026. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary">Terms</Link>
              <Link href="#" className="hover:text-primary">Privacy</Link>
              <Link href="#" className="hover:text-primary">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      <EntryDialog isOpen={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen} />
    </div>
  )
}
