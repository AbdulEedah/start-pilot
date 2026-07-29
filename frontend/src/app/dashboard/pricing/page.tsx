"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Zap, Sparkles, Rocket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

const PLANS = [
  {
    name: "Starter",
    price: { monthly: "$0", yearly: "$0" },
    desc: "Perfect for testing your first startup idea.",
    features: [
      "5 AI Validation Sessions",
      "Basic Startup Roadmap",
      "Standard Resource Hub",
      "Community Support"
    ],
    cta: "Current Plan",
    premium: false
  },
  {
    name: "Pro Pilot",
    price: { monthly: "$29", yearly: "$290" },
    desc: "For serious founders building multiple ventures.",
    features: [
      "Unlimited AI Validation",
      "Detailed 'Blueprint' PDF Exports",
      "Specialized AI Tools Hub",
      "Advanced Strategy Assistant",
      "Priority Email Support"
    ],
    cta: "Upgrade to Pro",
    premium: true
  },
  {
    name: "Enterprise",
    price: { monthly: "$99", yearly: "$990" },
    desc: "Custom solutions for incubators and accelerators.",
    features: [
      "White-label Reports",
      "Multi-user Teams",
      "Custom AI Training",
      "Dedicated Mentor Access",
      "API Access"
    ],
    cta: "Contact Sales",
    premium: false
  }
]

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleUpgrade = (planName: string) => {
    setIsLoading(planName)
    // Mock Stripe Checkout
    setTimeout(() => {
      setIsLoading(null)
      toast.success(`Welcome to ${planName}!`, {
        description: "Your pro features are now unlocked.",
      })
    }, 2000)
  }

  return (
    <div className="p-8 space-y-12 overflow-y-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-heading">Elevate your startup journey</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose the plan that fits your ambition. From raw ideation to investor-ready ventures.
        </p>

        <div className="flex justify-center pt-4">
          <Tabs value={billing} onValueChange={(v) => setBilling(v as any)} className="w-48">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="monthly" className="rounded-full">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="rounded-full">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-[40px] border flex flex-col ${
              plan.premium 
                ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-105 z-10" 
                : "bg-card border-border/50"
            }`}
          >
            {plan.premium && (
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold font-heading mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{billing === 'monthly' ? plan.price.monthly : plan.price.yearly}</span>
                <span className="text-sm opacity-60">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <p className={`text-sm ${plan.premium ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.desc}
              </p>
            </div>

            <div className="space-y-4 mb-12">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-center gap-3 text-sm">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    plan.premium ? "bg-white/20" : "bg-primary/10"
                  }`}>
                    <Check className={`w-3 h-3 ${plan.premium ? "text-white" : "text-primary"}`} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              disabled={isLoading !== null || plan.name === "Starter"}
              onClick={() => handleUpgrade(plan.name)}
              className={`mt-auto h-12 rounded-full font-bold transition-all ${
                plan.premium 
                  ? "bg-white text-primary hover:bg-white/90 shadow-lg" 
                  : "bg-accent text-foreground hover:bg-accent/80"
              }`}
            >
              {isLoading === plan.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Trust Section */}
      <div className="text-center pt-12 text-sm text-muted-foreground space-y-4">
        <p>Join 10,000+ founders worldwide. Secure payments with Stripe.</p>
        <div className="flex justify-center gap-8 opacity-50 grayscale contrast-200">
          <span className="font-bold tracking-tighter">STRIPE</span>
          <span className="font-bold tracking-tighter">VISA</span>
          <span className="font-bold tracking-tighter">MASTERCARD</span>
          <span className="font-bold tracking-tighter">APPLE PAY</span>
        </div>
      </div>
    </div>
  )
}
