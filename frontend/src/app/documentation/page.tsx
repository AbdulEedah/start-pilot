"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Users, 
  Rocket, 
  Search,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border/40">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Rocket className="w-5 h-5 text-primary-foreground transform -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading">Start Pilot</span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 border-b border-border/50">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 px-3 py-1 mb-8 border rounded-full bg-accent/50 border-primary/20 backdrop-blur-sm w-fit mx-auto"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Complete Documentation
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl font-heading mb-6"
            >
              Everything you need to build your startup
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 leading-relaxed"
            >
              Comprehensive guides, tutorials, and resources to help you navigate 
              every stage of your startup journey with Start Pilot.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-lg mx-auto"
            >
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search documentation..." 
                className="pl-10 h-12 text-base"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-24">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Getting Started</h3>
              <p className="text-muted-foreground mb-6">
                Quick setup guide to get you building in minutes
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/documentation/setup" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Initial Setup</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/onboarding" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Platform Onboarding</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/first-project" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Your First Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* AI Guidance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500/30 transition-colors">
                <Lightbulb className="w-6 h-6 text-violet-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Guidance</h3>
              <p className="text-muted-foreground mb-6">
                Learn how to leverage AI for startup success
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/documentation/ai-mentor" className="flex items-center gap-2 text-primary hover:underline">
                    <span>AI Mentor System</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/validation" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Idea Validation</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/market-analysis" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Market Analysis Tools</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Development */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
                <Code className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Development</h3>
              <p className="text-muted-foreground mb-6">
                Technical guides for building your product
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/documentation/tech-stack" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Tech Stack Selection</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/mvp-guide" className="flex items-center gap-2 text-primary hover:underline">
                    <span>MVP Development</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/deployment" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Deployment Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Business Strategy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6 group-hover:bg-amber-500/30 transition-colors">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Business Strategy</h3>
              <p className="text-muted-foreground mb-6">
                Strategic planning and business development
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/documentation/business-model" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Business Model Canvas</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/pitch-deck" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Pitch Deck Creation</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/fundraising" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Fundraising Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* API Reference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                <Code className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">API Reference</h3>
              <p className="text-muted-foreground mb-6">
                Complete API documentation and examples
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/documentation/api/auth" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Authentication</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/api/endpoints" className="flex items-center gap-2 text-primary hover:underline">
                    <span>API Endpoints</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/api/webhooks" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Webhooks</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center mb-6 group-hover:bg-rose-500/30 transition-colors">
                <Users className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Support</h3>
              <p className="text-muted-foreground mb-6">
                Get help and connect with the community
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/documentation/faq" className="flex items-center gap-2 text-primary hover:underline">
                    <span>FAQ</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/documentation/community" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Community Forum</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 text-primary hover:underline">
                    <span>Contact Support</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/30 border-t border-border/50">
        <div className="px-6 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-3xl font-bold font-heading mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our support team is here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="rounded-full">
                  Contact Support
                </Button>
              </Link>
              <Link href="/documentation/community">
                <Button variant="outline" size="lg" className="rounded-full">
                  Join Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}