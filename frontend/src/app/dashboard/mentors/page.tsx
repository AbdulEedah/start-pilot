"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Video, 
  MapPin, 
  Star, 
  ChevronRight,
  Search,
  Filter,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const MENTORS = [
  {
    id: 1,
    name: "Alex Rivera",
    sector: "FinTech",
    expertise: "Scaling, Series A, Product Strategy",
    bio: "Former VP of Product at a top-tier neobank. Helped scale from 0 to 1M users.",
    availability: "Available tomorrow",
    rating: 4.9,
    reviews: 124
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    sector: "AI & ML",
    expertise: "Technical Architecture, Research, Ethics",
    bio: "PhD in Neural Networks. Advisory board for multiple AI unicorns.",
    availability: "Available next week",
    rating: 5.0,
    reviews: 89
  },
  {
    id: 3,
    name: "Marcus Thorne",
    sector: "SaaS",
    expertise: "Go-to-Market, Sales, Customer Success",
    bio: "Built and exited 3 B2B SaaS companies. Expertise in bottom-up growth.",
    availability: "Available today",
    rating: 4.8,
    reviews: 210
  }
]

export default function MentorsPage() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading">Mentorship Hub</h1>
          <p className="text-muted-foreground">Connect with world-class experts in your sector.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search expertise..." className="pl-10 w-64 rounded-full" />
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MENTORS.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all shadow-sm flex flex-col md:flex-row gap-6"
          >
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/10">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} 
                  alt={mentor.name} 
                  className="w-full h-full bg-slate-100"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-1 text-sm font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {mentor.rating}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-heading">{mentor.name}</h3>
                  <Badge variant="secondary" className="rounded-full">{mentor.sector}</Badge>
                </div>
                <p className="text-sm text-primary font-medium mt-1">{mentor.expertise}</p>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>

              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {mentor.availability}
                </div>
                <div className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  Video Call
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-full group relative overflow-hidden">
                  <span className="group-hover:opacity-0 transition-opacity">Message</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground">
                    <Lock className="w-3.5 h-3.5 mr-2" /> Pro Only
                  </div>
                </Button>
                <Button size="sm" className="flex-1 rounded-full">
                  Book Session
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Insight Section */}
      <div className="p-8 rounded-[40px] bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-white/10 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 rounded-[24px] bg-white/20">
            <Users className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-heading">Need a specific technical review?</h2>
            <p className="text-primary-foreground/80">
              Our network of 500+ specialized mentors covers everything from biotech regulation to blockchain infrastructure.
            </p>
          </div>
          <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
            Request Custom Mentor
          </Button>
        </div>
      </div>
    </div>
  )
}
