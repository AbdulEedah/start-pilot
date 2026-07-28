"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Rocket, 
  TrendingUp,
  Bookmark,
  Share2,
  MessageSquare,
  Search,
  Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const featuredPost = {
  id: "ai-startup-landscape-2026",
  title: "The AI Startup Landscape in 2026: Opportunities and Challenges",
  excerpt: "A comprehensive analysis of the current AI market, emerging trends, and strategic insights for founders looking to build in the artificial intelligence space.",
  author: {
    name: "Sarah Chen", 
    role: "AI Strategy Lead",
    avatar: "/avatars/sarah-chen.jpg"
  },
  publishedAt: "2026-05-28",
  readTime: "12 min read",
  category: "Industry Analysis",
  tags: ["AI", "Market Analysis", "Strategy"],
  image: "/blog/ai-landscape-2026.jpg",
  featured: true
}

const blogPosts = [
  {
    id: "fundraising-mistakes",
    title: "5 Critical Fundraising Mistakes That Kill Startups",
    excerpt: "Learn from the most common pitfalls that prevent startups from securing investment.",
    author: {
      name: "Marcus Thorne",
      role: "Investment Partner",
      avatar: "/avatars/marcus-thorne.jpg"
    },
    publishedAt: "2026-05-25",
    readTime: "8 min read",
    category: "Fundraising",
    tags: ["Fundraising", "Investment", "Strategy"],
    image: "/blog/fundraising-mistakes.jpg"
  },
  {
    id: "mvp-validation-framework",
    title: "The Ultimate MVP Validation Framework",
    excerpt: "Step-by-step guide to validating your MVP with real users and data-driven insights.",
    author: {
      name: "Alex Rodriguez",
      role: "Product Strategist", 
      avatar: "/avatars/alex-rodriguez.jpg"
    },
    publishedAt: "2026-05-22",
    readTime: "10 min read",
    category: "Product Development",
    tags: ["MVP", "Validation", "Product"],
    image: "/blog/mvp-validation.jpg"
  },
  {
    id: "technical-cofounder-guide",
    title: "Finding and Vetting a Technical Co-founder",
    excerpt: "Essential strategies for non-technical founders to find and evaluate technical partners.",
    author: {
      name: "Emma Park",
      role: "Startup Mentor",
      avatar: "/avatars/emma-park.jpg"
    },
    publishedAt: "2026-05-20",
    readTime: "7 min read",
    category: "Team Building",
    tags: ["Co-founder", "Technical", "Hiring"],
    image: "/blog/technical-cofounder.jpg"
  },
  {
    id: "saas-pricing-strategy",
    title: "SaaS Pricing Psychology: What Actually Converts",
    excerpt: "Data-driven insights on SaaS pricing models that maximize conversion and revenue.",
    author: {
      name: "David Kim",
      role: "Revenue Strategist",
      avatar: "/avatars/david-kim.jpg"
    },
    publishedAt: "2026-05-18",
    readTime: "9 min read",
    category: "SaaS",
    tags: ["SaaS", "Pricing", "Revenue"],
    image: "/blog/saas-pricing.jpg"
  },
  {
    id: "startup-legal-basics",
    title: "Startup Legal Basics: What Every Founder Needs to Know",
    excerpt: "Essential legal considerations for early-stage startups to avoid costly mistakes.",
    author: {
      name: "Jennifer Walsh",
      role: "Startup Attorney",
      avatar: "/avatars/jennifer-walsh.jpg"
    },
    publishedAt: "2026-05-15",
    readTime: "11 min read",
    category: "Legal",
    tags: ["Legal", "Compliance", "Incorporation"],
    image: "/blog/startup-legal.jpg"
  },
  {
    id: "customer-discovery-playbook",
    title: "Customer Discovery Playbook for B2B Startups", 
    excerpt: "Proven methodologies for understanding your target market and customer needs.",
    author: {
      name: "Rachel Foster",
      role: "Growth Consultant",
      avatar: "/avatars/rachel-foster.jpg"
    },
    publishedAt: "2026-05-12",
    readTime: "13 min read",
    category: "Customer Development",
    tags: ["Customer Discovery", "B2B", "Research"],
    image: "/blog/customer-discovery.jpg"
  }
]

const categories = [
  "All", "Industry Analysis", "Fundraising", "Product Development", 
  "Team Building", "SaaS", "Legal", "Customer Development"
]

export default function StartupBlogPage() {
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
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Startup Insights & Strategy
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl font-heading mb-6"
            >
              The Startup Blog
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 leading-relaxed"
            >
              Strategic insights, practical guides, and real stories from successful founders 
              and industry experts to accelerate your startup journey.
            </motion.p>

            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button size="lg" className="h-12 px-8">
                Search
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border/50 bg-accent/30">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {categories.map((category) => (
              <Badge 
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              Featured Article
            </Badge>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="w-fit">
                  {featuredPost.category}
                </Badge>
                
                <h2 className="text-4xl font-bold font-heading leading-tight">
                  {featuredPost.title}
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>May 28, 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {featuredPost.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Link href={`/startup-blog/${featuredPost.id}`}>
                    <Button size="lg" className="group">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-accent/50 border border-border/50">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                    <div className="text-center space-y-4 text-muted-foreground/60">
                      <TrendingUp className="w-16 h-16 mx-auto" />
                      <span className="text-sm font-medium">Featured Article Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-accent/30">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold font-heading mb-4">
              Latest Articles
            </h2>
            <p className="text-muted-foreground">
              Stay up-to-date with the latest startup strategies and insights
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="aspect-[16/10] bg-accent/50 relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                    <div className="text-center space-y-2 text-muted-foreground/40">
                      <TrendingUp className="w-8 h-8 mx-auto" />
                      <span className="text-xs">Article Image</span>
                    </div>
                  </div>
                  <Badge 
                    className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm"
                    variant="secondary"
                  >
                    {post.category}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Link href={`/startup-blog/${post.id}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                        Read More
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" className="rounded-full">
              Load More Articles
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Never miss an insight
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get the latest startup strategies and insights delivered to your inbox
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input 
                placeholder="Enter your email..." 
                className="flex-1 h-12 text-base"
              />
              <Button size="lg" className="h-12 px-8">
                Subscribe
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Join 10,000+ founders getting weekly insights. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}