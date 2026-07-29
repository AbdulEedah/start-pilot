"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Rocket, 
  Zap,
  ArrowRight,
  Building,
  Cpu,
  Heart,
  ShoppingCart,
  Gamepad2,
  Leaf
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const sectors = [
  {
    id: "saas",
    name: "SaaS & Enterprise",
    description: "Build scalable software solutions for businesses",
    icon: Building,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    market: "$623B",
    growth: "+22%",
    timeToMarket: "6-12 months",
    funding: "$2.5M avg seed",
    highlights: [
      "Recurring revenue model",
      "High scalability potential", 
      "Strong investor interest",
      "Clear monetization path"
    ],
    challenges: [
      "High customer acquisition cost",
      "Long sales cycles",
      "Technical complexity",
      "Market saturation"
    ]
  },
  {
    id: "fintech",
    name: "FinTech & Payments",
    description: "Revolutionize financial services and payment systems",
    icon: DollarSign,
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    market: "$324B",
    growth: "+25%",
    timeToMarket: "12-18 months",
    funding: "$4.2M avg seed",
    highlights: [
      "Massive market opportunity",
      "High transaction volumes",
      "Strong regulatory moats",
      "Global scalability"
    ],
    challenges: [
      "Heavy regulatory compliance",
      "Security requirements",
      "Banking partnerships",
      "Customer trust building"
    ]
  },
  {
    id: "ai",
    name: "AI & Machine Learning",
    description: "Harness artificial intelligence for breakthrough innovation",
    icon: Cpu,
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    market: "$184B",
    growth: "+38%",
    timeToMarket: "8-15 months",
    funding: "$3.8M avg seed",
    highlights: [
      "Explosive market growth",
      "High differentiation potential",
      "Strong talent demand",
      "Cross-industry applications"
    ],
    challenges: [
      "Technical talent shortage",
      "High compute costs",
      "Model accuracy issues",
      "Ethical considerations"
    ]
  },
  {
    id: "healthcare",
    name: "HealthTech & Biotech",
    description: "Transform healthcare with digital innovation",
    icon: Heart,
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-500/30",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-500/10",
    market: "$659B",
    growth: "+15%",
    timeToMarket: "18-36 months",
    funding: "$5.1M avg seed",
    highlights: [
      "Essential market need",
      "High impact potential",
      "Government support",
      "Aging population trends"
    ],
    challenges: [
      "Strict regulations (FDA/HIPAA)",
      "Long development cycles",
      "Clinical trial requirements",
      "Insurance reimbursement"
    ]
  },
  {
    id: "ecommerce",
    name: "E-commerce & Retail",
    description: "Build the future of online commerce and retail",
    icon: ShoppingCart,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    market: "$5.7T",
    growth: "+18%",
    timeToMarket: "4-8 months",
    funding: "$1.8M avg seed",
    highlights: [
      "Proven business model",
      "Fast time to market",
      "Clear metrics and KPIs",
      "Multiple revenue streams"
    ],
    challenges: [
      "High competition",
      "Inventory management",
      "Customer acquisition costs",
      "Logistics complexity"
    ]
  },
  {
    id: "gaming",
    name: "Gaming & Entertainment",
    description: "Create engaging gaming experiences and entertainment platforms",
    icon: Gamepad2,
    color: "from-indigo-500/20 to-blue-500/20",
    borderColor: "border-indigo-500/30",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    market: "$321B",
    growth: "+12%",
    timeToMarket: "12-24 months",
    funding: "$2.1M avg seed",
    highlights: [
      "Global audience reach",
      "High engagement potential",
      "Multiple monetization models",
      "Strong community aspects"
    ],
    challenges: [
      "Hit-driven market",
      "High development costs",
      "Platform dependencies",
      "User retention challenges"
    ]
  }
]

export default function SectorGuidesPage() {
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
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Industry-Specific Guidance
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl font-heading mb-6"
            >
              Sector-specific startup guides
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 leading-relaxed"
            >
              Deep-dive into your industry with tailored roadmaps, market insights, 
              and strategic guidance from successful founders in each sector.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Sector Grid */}
      <section className="py-24">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sectors.map((sector, index) => {
              const IconComponent = sector.icon
              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className={`group relative overflow-hidden rounded-3xl border ${sector.borderColor} bg-gradient-to-br ${sector.color} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
                >
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl ${sector.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className={`w-8 h-8 ${sector.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{sector.name}</h3>
                          <p className="text-muted-foreground">{sector.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Market Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          Market Size
                        </div>
                        <div className="text-2xl font-bold">{sector.market}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          Growth Rate
                        </div>
                        <div className="text-2xl font-bold text-emerald-500">{sector.growth}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="w-4 h-4" />
                          Time to Market
                        </div>
                        <div className="font-semibold">{sector.timeToMarket}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          Avg Seed Funding
                        </div>
                        <div className="font-semibold">{sector.funding}</div>
                      </div>
                    </div>

                    {/* Highlights & Challenges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Key Advantages
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {sector.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-muted-foreground">• {highlight}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Key Challenges
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {sector.challenges.map((challenge, idx) => (
                            <li key={idx} className="text-muted-foreground">• {challenge}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/sector-guides/${sector.id}`}>
                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
                        variant="outline"
                      >
                        Explore {sector.name} Guide
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-24 bg-accent/30 border-t border-border/50">
        <div className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Featured Resources
            </h2>
            <p className="text-xl text-muted-foreground">
              Essential tools and insights for every sector
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <Target className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Market Research Templates</h3>
              <p className="text-muted-foreground mb-6">
                Industry-specific research frameworks and competitor analysis templates
              </p>
              <Link href="/sector-guides/resources/market-research">
                <Button variant="outline" className="w-full">
                  Download Templates
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <Users className="w-12 h-12 text-violet-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Founder Networks</h3>
              <p className="text-muted-foreground mb-6">
                Connect with successful founders and mentors in your industry
              </p>
              <Link href="/sector-guides/networks">
                <Button variant="outline" className="w-full">
                  Join Networks
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
              <TrendingUp className="w-12 h-12 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Industry Reports</h3>
              <p className="text-muted-foreground mb-6">
                Latest trends, funding data, and market insights for each sector
              </p>
              <Link href="/sector-guides/reports">
                <Button variant="outline" className="w-full">
                  View Reports
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="px-6 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-4xl font-bold font-heading mb-4">
              Ready to build in your sector?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get personalized guidance tailored to your industry
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="rounded-full">
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button variant="outline" size="lg" className="rounded-full">
                  Browse Documentation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}