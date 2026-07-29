"use client"

import { 
  Cpu, 
  Leaf, 
  Sprout, 
  Factory, 
  Boxes, 
  HeartPulse, 
  GraduationCap, 
  Banknote, 
  BrainCircuit, 
  Truck, 
  Shirt, 
  Users 
} from "lucide-react"
import { motion } from "framer-motion"

const sectors = [
  { id: "technology", name: "Technology", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Software, SaaS, Hardware" },
  { id: "climate", name: "Climate", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Renewables, Carbon, Sustainability" },
  { id: "agriculture", name: "Agriculture", icon: Sprout, color: "text-green-600", bg: "bg-green-600/10", desc: "AgriTech, Food Systems" },
  { id: "manufacturing", name: "Manufacturing", icon: Factory, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Industrial, Smart Factories" },
  { id: "production", name: "Production", icon: Boxes, color: "text-amber-600", bg: "bg-amber-600/10", desc: "Content, Media, Goods" },
  { id: "health", name: "Health", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10", desc: "HealthTech, Bio, Wellness" },
  { id: "education", name: "Education", icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "EdTech, Skills, Learning" },
  { id: "finance", name: "Finance", icon: Banknote, color: "text-cyan-500", bg: "bg-cyan-500/10", desc: "FinTech, Banking, Crypto" },
  { id: "ai", name: "AI", icon: BrainCircuit, color: "text-violet-500", bg: "bg-violet-500/10", desc: "LLMs, Computer Vision, ML" },
  { id: "logistics", name: "Logistics", icon: Truck, color: "text-slate-500", bg: "bg-slate-500/10", desc: "Supply Chain, Delivery" },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "text-pink-500", bg: "bg-pink-500/10", desc: "Apparel, E-commerce" },
  { id: "social-impact", name: "Social Impact", icon: Users, color: "text-teal-500", bg: "bg-teal-500/10", desc: "Non-profit, Community, ESG" },
]

export function SectorSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sectors.map((sector, index) => (
        <motion.button
          key={sector.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(sector.id)}
          className="group flex flex-col items-start p-6 text-left bg-card hover:bg-accent border border-border/50 hover:border-primary/50 rounded-2xl transition-all shadow-sm"
        >
          <div className={`p-3 rounded-xl ${sector.bg} ${sector.color} mb-4 transition-transform group-hover:scale-110`}>
            <sector.icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">{sector.name}</h3>
          <p className="text-sm text-muted-foreground">{sector.desc}</p>
        </motion.button>
      ))}
    </div>
  )
}
