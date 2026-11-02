"use client"

import { useState, useEffect } from "react"
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
  Lock,
  Send,
  Loader2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  bio: string;
  experience: string;
  rating: number;
  availability: 'available' | 'busy' | 'offline';
}
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { toast } from "sonner"

export default function MentorsPage() {
  const { sector: activeSectorId } = useAuth()
  const activeSector = getSectorDetails(activeSectorId)

  const [mentors, setMentors] = useState<Mentor[]>([])
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [question, setQuestion] = useState("")
  const [advice, setAdvice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Load mentors
    const availableMentors: Mentor[] = []
    setMentors(availableMentors)
  }, [activeSectorId])

  const askMentor = async (mentor: Mentor, question: string) => {
    if (!question.trim()) {
      toast.error("Please enter a question first")
      return
    }

    setIsLoading(true)
    
    try {
      setAdvice(`I appreciate your question about "${question}". Please consult an expert mentor in the ${activeSector.name} sector for personalized advice.`)
      
      toast.success("Advice received!", {
        description: `${mentor.name} has provided their insights`
      })
    } catch (error) {
      console.error('Failed to get mentor advice:', error)
      toast.error("Failed to get advice", {
        description: "Please try again"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase())) ||
    mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-emerald-500'
      case 'busy': return 'text-amber-500'
      default: return 'text-emerald-500'
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available now'
      case 'busy': return 'Busy - responds in 24h'
      default: return 'Available now'
    }
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading">Mentorship Hub</h1>
          </div>
          <p className="text-muted-foreground">Connect with world-class experts in your sector in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search expertise..." 
              className="pl-10 w-64 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, i) => (
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
                  src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} 
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
                  <div className="flex gap-2">
                    {mentor.expertise.slice(0, 2).map((exp, idx) => (
                      <Badge key={idx} variant="secondary" className="rounded-full text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-primary font-medium mt-1">{mentor.experience}</p>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className={`flex items-center gap-1 ${getAvailabilityColor(mentor.availability)}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    mentor.availability === 'available' ? 'bg-emerald-500' :
                    mentor.availability === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
                  }`} />
                  {getAvailabilityText(mentor.availability)}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Video className="w-3.5 h-3.5" />
                  AI Mentor
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 rounded-full"
                      onClick={() => {
                        setSelectedMentor(mentor)
                        setQuestion("")
                        setAdvice("")
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <img 
                          src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} 
                          alt={mentor.name} 
                          className="w-10 h-10 rounded-full"
                        />
                        Ask {mentor.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.map((exp, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium">Your Question:</label>
                        <Textarea
                          placeholder="Ask about fundraising, product strategy, technical challenges, or anything related to their expertise..."
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button 
                        onClick={() => askMentor(mentor, question)}
                        disabled={isLoading || !question.trim()}
                        className="w-full rounded-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Getting advice...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Ask {mentor.name}
                          </>
                        )}
                      </Button>

                      {advice && (
                        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-3">
                            <img 
                              src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} 
                              alt={mentor.name} 
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="font-medium text-primary">{mentor.name}'s Advice:</span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{advice}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  size="sm" 
                  className="flex-1 rounded-full"
                >
                  Book Session
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMentors.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No mentors found matching "{searchTerm}"</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm("")}
            className="mt-4 rounded-full"
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Featured Insight Section */}
      <div className="p-8 rounded-[40px] bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-white/10 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 rounded-[24px] bg-white/20">
            <Users className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-heading">AI-Powered Mentorship</h2>
            <p className="text-primary-foreground/80">
              Our AI mentors are trained on insights from 500+ real startup advisors and industry experts. Get personalized advice instantly in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Live & Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
