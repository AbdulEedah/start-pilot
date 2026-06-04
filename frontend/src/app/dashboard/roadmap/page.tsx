"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  Flag, 
  Rocket, 
  Target, 
  TrendingUp, 
  FileText,
  Download,
  Plus,
  Loader2,
  WifiOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { offlineAI } from "@/lib/offline-ai"
import { offlineStorage, Roadmap, RoadmapItem, StartupIdea } from "@/lib/offline-storage"
import { useOffline } from "@/components/offline-provider"

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useOffline()

  useEffect(() => {
    loadRoadmap()
  }, [])

  const loadRoadmap = async () => {
    try {
      const roadmaps = await offlineStorage.getAll<Roadmap>('roadmaps')
      const userRoadmap = roadmaps.find(r => r.id === 'current')
      
      if (userRoadmap) {
        setRoadmap(userRoadmap)
      }
    } catch (error) {
      console.error('Failed to load roadmap:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRoadmap = async () => {
    setIsGenerating(true)
    
    try {
      // Create a sample startup idea for roadmap generation
      const sampleIdea: StartupIdea = {
        id: 'current',
        title: 'AI-Powered Startup Platform',
        description: 'A platform that helps entrepreneurs validate and build their startup ideas using AI guidance',
        sector: 'SaaS',
        stage: 'idea',
        validationScore: 75,
        marketSize: '$15.3B',
        competition: ['Lean Canvas', 'Business Model Canvas', 'Strategyzer'],
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const roadmapGeneration = await offlineAI.generateRoadmap(sampleIdea)
      
      const newRoadmap: Roadmap = {
        id: 'current',
        startupId: 'current',
        title: 'AI-Powered Startup Platform Roadmap',
        items: roadmapGeneration.items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await offlineStorage.save('roadmaps', newRoadmap)
      setRoadmap(newRoadmap)
      
      toast.success("Roadmap generated!", {
        description: "Your personalized startup roadmap is ready"
      })
    } catch (error) {
      console.error('Failed to generate roadmap:', error)
      toast.error("Failed to generate roadmap", {
        description: "Please try again"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const updateItemStatus = async (itemId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (!roadmap) return

    const updatedItems = roadmap.items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    )

    const updatedRoadmap: Roadmap = {
      ...roadmap,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    }

    try {
      await offlineStorage.save('roadmaps', updatedRoadmap)
      setRoadmap(updatedRoadmap)
      
      toast.success("Progress updated!", {
        description: `Task marked as ${newStatus}`
      })
    } catch (error) {
      console.error('Failed to update roadmap:', error)
      toast.error("Failed to update progress")
    }
  }

  const handleExport = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Generating your Startup Blueprint PDF...',
      success: 'Blueprint Downloaded Successfully!',
      error: 'Failed to generate PDF',
    })
  }

  const groupItemsByCategory = (items: RoadmapItem[]) => {
    const groups: { [key: string]: RoadmapItem[] } = {}
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product': return <Rocket className="w-4 h-4" />
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      case 'funding': return <Target className="w-4 h-4" />
      case 'team': return <Flag className="w-4 h-4" />
      case 'legal': return <FileText className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'low': return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading">Generate Your Startup Roadmap</h2>
            <p className="text-muted-foreground max-w-md">
              Let our AI create a personalized roadmap based on your startup idea and goals.
            </p>
          </div>
          <Button 
            onClick={generateRoadmap} 
            disabled={isGenerating}
            className="rounded-full shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Roadmap...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Roadmap
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  const groupedItems = groupItemsByCategory(roadmap.items)

  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading">Startup Roadmap</h1>
            <WifiOff className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-muted-foreground">Your step-by-step path from idea to scale.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={generateRoadmap} 
            disabled={isGenerating}
            className="rounded-full"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
          <Button onClick={handleExport} className="rounded-full shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" />
            Export Blueprint
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-6">
              {getCategoryIcon(category)}
              <h2 className="text-xl font-bold font-heading capitalize">{category}</h2>
              <div className="text-xs text-muted-foreground">
                {items.filter(i => i.status === 'completed').length}/{items.length} completed
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === 'completed' ? 'bg-primary/5 border-primary/20' :
                    item.status === 'in-progress' ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-accent/50 border-border/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => {
                            const nextStatus = item.status === 'pending' ? 'in-progress' :
                                             item.status === 'in-progress' ? 'completed' : 'pending'
                            updateItemStatus(item.id, nextStatus)
                          }}
                        >
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </Button>
                        <h3 className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground pl-9">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 pl-9">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timeframe}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-primary">Overall Progress</h3>
            <p className="text-sm text-muted-foreground">
              {roadmap.items.filter(i => i.status === 'completed').length} of {roadmap.items.length} tasks completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round((roadmap.items.filter(i => i.status === 'completed').length / roadmap.items.length) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-accent rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ 
              width: `${(roadmap.items.filter(i => i.status === 'completed').length / roadmap.items.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  )
}
