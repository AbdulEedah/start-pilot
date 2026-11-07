"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  LayoutGrid, 
  BookOpen, 
  Wrench, 
  Plus, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  FolderPlus,
  Compass,
  FileCode,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"
import {
  adminApi,
  type AdminContentResponse,
  type AdminResource,
  type AdminSector,
} from "@/lib/api"
import { toast } from "sonner"

const DEFAULT_CONTENT_DATA: AdminContentResponse = {
  sectors: [
    { name: "Technology & Software", code: "technology", status: "Active", founders: 1, resources: 18 },
    { name: "Artificial Intelligence", code: "ai", status: "Active", founders: 1, resources: 24 },
    { name: "Financial Technology", code: "finance", status: "Active", founders: 1, resources: 15 },
    { name: "Climate & Sustainability", code: "climate", status: "Active", founders: 0, resources: 12 },
    { name: "Health & Biotechnology", code: "health", status: "Active", founders: 0, resources: 14 },
    { name: "Education & Learning", code: "education", status: "Active", founders: 0, resources: 10 },
  ],
  resources: [
    { id: "1", name: "The Lean Startup", type: "Book", category: "Strategy", sector: "all", url: "https://theleanstartup.com" },
    { id: "2", name: "Figma for Startups", type: "Tool", category: "Design", sector: "all", url: "https://figma.com" },
    { id: "3", name: "Zero to One", type: "Book", category: "Vision", sector: "all", url: "https://zerotoonebook.com" },
    { id: "4", name: "Stripe Atlas", type: "Tool", category: "Legal & Banking", sector: "finance", url: "https://stripe.com/atlas" },
    { id: "5", name: "Y Combinator Startup School", type: "Guide", category: "Incubation", sector: "all", url: "https://startupschool.org" },
    { id: "6", name: "OpenAI Developer Platform", type: "Tool", category: "AI Engineering", sector: "ai", url: "https://platform.openai.com" },
  ],
}

export default function ContentManagementPage() {
  const [data, setData] = useState<AdminContentResponse>(DEFAULT_CONTENT_DATA)
  const [loading, setLoading] = useState(true)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all")

  // Add Resource Modal
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  const [resourceName, setResourceName] = useState("")
  const [resourceCategory, setResourceCategory] = useState("Strategy")
  const [resourceType, setResourceType] = useState("Tool")
  const [resourceUrl, setResourceUrl] = useState("")
  const [resourceSector, setResourceSector] = useState("all")
  const [submittingResource, setSubmittingResource] = useState(false)

  const fetchContent = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getContent()
      if (res && res.sectors) {
        setData(res)
      }
    } catch (error) {
      console.warn("Using fallback content data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceName.trim()) {
      toast.error("Resource name is required")
      return
    }

    try {
      setSubmittingResource(true)
      const created = await adminApi.addResource({
        name: resourceName.trim(),
        category: resourceCategory.trim(),
        type: resourceType,
        url: resourceUrl.trim(),
        sector: resourceSector,
      })

      setData((prev) => ({
        ...prev,
        resources: [created, ...prev.resources],
      }))

      toast.success(`Resource "${created.name}" added to StartPilot library`)
      setAddResourceOpen(false)
      setResourceName("")
      setResourceUrl("")
    } catch (error: any) {
      toast.error(error.message || "Failed to add resource")
    } finally {
      setSubmittingResource(false)
    }
  }

  const handleDeleteResource = async (resource: AdminResource) => {
    try {
      await adminApi.deleteResource(resource.id)
      setData((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r.id !== resource.id),
      }))
      toast.success(`Removed "${resource.name}"`)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resource")
    }
  }

  const filteredResources = data.resources.filter((r) => {
    if (activeCategoryFilter === "all") return true
    return r.type.toLowerCase() === activeCategoryFilter.toLowerCase()
  })

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "book":
        return <BookOpen className="w-4 h-4 text-violet-500" />
      case "guide":
        return <Compass className="w-4 h-4 text-blue-500" />
      case "template":
        return <FileCode className="w-4 h-4 text-amber-500" />
      case "community":
        return <Users className="w-4 h-4 text-pink-500" />
      default:
        return <Wrench className="w-4 h-4 text-emerald-500" />
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-heading">Content & Ecosystem Library</h1>
          <p className="text-muted-foreground text-sm">
            Curate industry sectors, startup recommendations, and verified founder resources.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchContent}
          className="rounded-full gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Industry Sectors Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-heading">Industry Sectors</h2>
            <Badge variant="outline" className="rounded-full text-xs">
              {data.sectors.length} Active Tracks
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.sectors.map((sector, i) => (
            <motion.div 
              key={sector.code || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base">{sector.name}</h3>
                  <Badge variant="default" className="rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">
                    {sector.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sector key: <code className="text-primary font-mono">{sector.code}</code>
                </p>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {sector.founders} {sector.founders === 1 ? "registered startup" : "registered startups"}
                </span>
                <span>{sector.resources} guides & tools</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations & Resource Library */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-bold font-heading">Curated Recommendations</h2>
            <Badge variant="outline" className="rounded-full text-xs">
              {data.resources.length}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {["all", "tool", "book", "guide"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveCategoryFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeCategoryFilter === filter
                      ? "bg-white dark:bg-slate-900 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <Button 
              size="sm" 
              onClick={() => setAddResourceOpen(true)}
              className="rounded-full gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" /> Add Resource
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div 
              key={res.id} 
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex items-center justify-between group hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {getResourceIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{res.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{res.category} • <span className="font-medium text-foreground">{res.type}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-primary transition-colors"
                    title="Open external link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteResource(res)}
                  className="rounded-full text-muted-foreground hover:text-destructive"
                  title="Remove resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Resource Dialog Modal */}
      <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Add Founder Resource</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a book, tool, or guide to the founder recommendation directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddResource} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Resource Name
              </label>
              <Input
                placeholder="e.g. Stripe Atlas, Pitch deck template"
                required
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Type
                </label>
                <Select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="rounded-xl">
                  <SelectItem value="Tool">Tool</SelectItem>
                  <SelectItem value="Book">Book</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Template">Template</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Category
                </label>
                <Input
                  placeholder="e.g. Legal, Design"
                  value={resourceCategory}
                  onChange={(e) => setResourceCategory(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Target Sector
              </label>
              <Select value={resourceSector} onChange={(e) => setResourceSector(e.target.value)} className="rounded-xl">
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="climate">Climate</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Website / Reference URL
              </label>
              <Input
                type="url"
                placeholder="https://..."
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddResourceOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingResource}
                className="rounded-xl"
              >
                {submittingResource ? "Saving..." : "Add to Library"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
