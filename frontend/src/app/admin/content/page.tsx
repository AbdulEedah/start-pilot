"use client"

import { motion } from "framer-motion"
import { 
  LayoutGrid, 
  BookOpen, 
  Wrench, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const SECTORS = [
  { name: "FinTech", status: "Active", resources: 12 },
  { name: "AI & ML", status: "Active", resources: 18 },
  { name: "HealthTech", status: "Draft", resources: 0 },
]

const RESOURCES = [
  { name: "The Lean Startup", type: "Book", category: "Strategy" },
  { name: "Figma", type: "Tool", category: "Design" },
  { name: "Zero to One", type: "Book", category: "Vision" },
]

export default function ContentManagementPage() {
  return (
    <div className="p-8 space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading">Content Management</h1>
        <p className="text-muted-foreground">Manage platform data, sectors, and resource library.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" /> Sectors
          </h2>
          <Button size="sm" className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Sector
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTORS.map((sector, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{sector.name}</h3>
                <Badge variant={sector.status === 'Active' ? 'default' : 'outline'} className="rounded-full text-[10px]">
                  {sector.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{sector.resources} active resources</p>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="icon" className="rounded-full"><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-500" /> Recommendations
          </h2>
          <Button size="sm" className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Resource
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESOURCES.map((res, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  res.type === 'Book' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {res.type === 'Book' ? <BookOpen className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-sm">{res.name}</p>
                  <p className="text-xs text-muted-foreground">{res.category}</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="rounded-full"><Edit2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
