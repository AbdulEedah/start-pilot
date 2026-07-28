"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Rocket, 
  Users, 
  Target, 
  Lightbulb, 
  Award, 
  Heart,
  ArrowRight,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"

const team = [
  {
    name: "Alex Chen",
    role: "Co-Founder & CEO",
    bio: "Former VP of Product at Stripe. Built and scaled 3 successful startups. Passionate about democratizing entrepreneurship through AI.",
    image: "/team/alex-chen.jpg",
    links: {
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Sarah Rodriguez", 
    role: "Co-Founder & CTO",
    bio: "Ex-Google AI Research. PhD in Machine Learning from Stanford. Leading the development of our proprietary AI guidance engine.",
    image: "/team/sarah-rodriguez.jpg",
    links: {
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Marcus Thompson",
    role: "Head of Product",
    bio: "Product leader from Airbnb and Uber. Expert in user experience design and product-market fit strategies.",
    image: "/team/marcus-thompson.jpg",
    links: {
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Emma Park",
    role: "Head of Growth",
    bio: "Growth hacker who scaled 5 startups from zero to Series B. Specializes in founder-market fit and community building.",
    image: "/team/emma-park.jpg",
    links: {
      linkedin: "#",
      twitter: "#"
    }
  }
]

const values = [
  {
    icon: Target,
    title: "Founder-First",
    description: "Every decision we make is centered around what's best for founders. We eat our own dog food and understand the entrepreneurial journey firsthand."
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Innovation",
    description: "We believe artificial intelligence should augment human creativity, not replace it. Our AI helps founders make better decisions faster."
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "The best insights come from peer learning. We foster a community where founders support and learn from each other."
  },
  {
    icon: Heart,
    title: "Radical Transparency",
    description: "We share our learnings, failures, and successes openly. Transparency builds trust and drives better outcomes for everyone."
  }
]

const milestones = [
  {
    year: "2023",
    title: "The Beginning",
    description: "Started as a side project between two frustrated founders who couldn't find quality startup guidance."
  },
  {
    year: "2024", 
    title: "Seed Funding",
    description: "Raised $2.5M from top-tier VCs including Andreessen Horowitz and Y Combinator partners."
  },
  {
    year: "2025",
    title: "AI Breakthrough",
    description: "Launched proprietary AI mentor system trained on 10,000+ successful startup journeys."
  },
  {
    year: "2026",
    title: "Scale & Impact",
    description: "Supporting 10,000+ founders across 50+ countries with $500M+ in collective funding raised."
  }
]

export default function AboutPage() {
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
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Our Story
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl font-heading mb-6"
            >
              Building the future of entrepreneurship
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 leading-relaxed"
            >
              We're on a mission to democratize startup success by giving every founder 
              access to world-class guidance, insights, and community support.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold font-heading mb-6">
                Why we started Start Pilot
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  After building multiple startups ourselves, we noticed a critical gap in the entrepreneurial ecosystem. 
                  Great ideas were dying not because they lacked potential, but because founders lacked access to the right guidance at the right time.
                </p>
                <p>
                  Traditional startup accelerators serve only a tiny fraction of founders. Business schools teach theory, not practice. 
                  Most founding teams are left to figure it out alone, making costly mistakes that could have been avoided.
                </p>
                <p>
                  We believe every founder deserves access to world-class mentorship, proven frameworks, and a community of peers. 
                  That's why we built Start Pilot – to democratize startup success through AI-powered guidance.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-violet-500/20 border border-border/50">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4 text-muted-foreground/60">
                    <Target className="w-16 h-16 mx-auto" />
                    <span className="text-sm font-medium">Mission Vision Image</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-accent/30">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className="p-8 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              From side project to startup revolution
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 + 1.1 }}
                  className="relative flex items-start gap-8"
                >
                  {/* Timeline Dot */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 relative z-10">
                    {milestone.year.slice(-2)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                      <h3 className="text-2xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-accent/30">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Meet the Team
            </h2>
            <p className="text-xl text-muted-foreground">
              The founders and leaders building the future of entrepreneurship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 1.9 }}
                className="bg-card border border-border/50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{member.bio}</p>
                    
                    <div className="flex gap-3">
                      {member.links.linkedin && (
                        <Link href={member.links.linkedin}>
                          <Button variant="outline" size="sm">
                            <Globe className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      {member.links.twitter && (
                        <Link href={member.links.twitter}>
                          <Button variant="outline" size="sm">
                            <Globe className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      {member.links.github && (
                        <Link href={member.links.github}>
                          <Button variant="outline" size="sm">
                            <Globe className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border/50">
        <div className="px-6 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3 }}
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Join us on this journey
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Whether you're a founder, investor, or just passionate about entrepreneurship, we'd love to connect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="rounded-full">
                  Start Building
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="rounded-full">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="outline" size="lg" className="rounded-full">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}