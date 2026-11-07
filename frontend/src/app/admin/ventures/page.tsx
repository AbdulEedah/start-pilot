"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Rocket, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Layers, 
  Mail, 
  ExternalLink,
  X,
  Compass,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { adminApi, type AdminVenture } from "@/lib/api"
import { toast } from "sonner"

export default function VenturesManagementPage() {
  const [ventures, setVentures] = useState<AdminVenture[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Selected Venture Details Modal
  const [selectedVenture, setSelectedVenture] = useState<AdminVenture | null>(null)
  const [ventureDetail, setVentureDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchVentures = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getVentures({
        search: search.trim() || undefined,
        sector: sectorFilter !== "all" ? sectorFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
      if (res && res.ventures) {
        setVentures(res.ventures)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load ventures")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVentures()
    }, 250)
    return () => clearTimeout(timer)
  }, [search, sectorFilter, statusFilter])

  const handleOpenDetail = async (venture: AdminVenture) => {
    setSelectedVenture(venture)
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const data = await adminApi.getVenture(venture.id)
      setVentureDetail(data)
    } catch (error) {
      console.warn("Could not load deep details:", error)
      setVentureDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Founder,Email,Sector,Status,Viability Score,Roadmap Weeks,Registered"]
        .concat(
          ventures.map(
            (v) =>
              `"${v.founder_name}","${v.founder_email}","${v.sector_display}","${v.generation_status}","${v.viability_score || "N/A"}","${v.roadmap_weeks || "N/A"}","${v.created_at}"`
          )
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `startpilot-ventures-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Ventures dataset exported")
  }

  const completedCount = ventures.filter((v) => v.generation_status === "completed").length
  const processingCount = ventures.filter((v) =>
    ["pending", "processing"].includes(v.generation_status)
  ).length

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading">Startup Ventures Command</h1>
            <Badge variant="outline" className="rounded-full px-2.5">
              {ventures.length} Registered Ventures
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Inspect founder ideas, monitor AI report generation, and track roadmap syntheses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVentures}
            className="rounded-full gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="rounded-full gap-1.5 shadow-md shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5" /> Export Ventures (CSV)
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Ventures</p>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-heading">{ventures.length}</p>
          <p className="text-[11px] text-muted-foreground">Founder projects across all sectors</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Synthesis Done</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-heading">{completedCount}</p>
          <p className="text-[11px] text-muted-foreground">Validation reports & roadmaps generated</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Pipelines</p>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-heading">{processingCount}</p>
          <p className="text-[11px] text-muted-foreground">Synthesizing in Celery/AI worker queue</p>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by founder, email, or startup problem..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl" 
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="rounded-xl w-44 text-xs font-bold">
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="climate">Climate</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl w-40 text-xs font-bold">
            <SelectItem value="all">All AI Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
          </Select>
        </div>
      </div>

      {/* Ventures Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="w-[320px]">Founder & Venture Problem</TableHead>
              <TableHead>Industry Sector</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead>Viability Score</TableHead>
              <TableHead>Roadmap Specs</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {loading ? "Loading ventures..." : "No ventures found matching your criteria."}
                </TableCell>
              </TableRow>
            ) : (
              ventures.map((v) => (
                <TableRow key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-foreground">{v.founder_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {v.founder_email}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 pt-0.5">
                        {v.problem}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-xs font-semibold capitalize">
                      {v.sector_display}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant={v.generation_status === "completed" ? "default" : "outline"}
                      className={`rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        v.generation_status === "completed" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                      }`}
                    >
                      {v.generation_status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {v.viability_score ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {v.viability_score}/100
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {v.roadmap_weeks ? (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> {v.roadmap_weeks} wks ({v.roadmap_tasks} tasks)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not generated</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">{v.created_at}</TableCell>

                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenDetail(v)}
                      className="rounded-full text-xs font-semibold text-primary hover:text-primary gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Venture Detail Modal Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        {selectedVenture && (
          <DialogContent className="rounded-3xl max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-heading text-xl">
                    {selectedVenture.founder_name} &bull; {selectedVenture.sector_display} Venture
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Registered by {selectedVenture.founder_email} on {selectedVenture.created_at}
                  </DialogDescription>
                </div>
                <Badge className="rounded-full text-xs uppercase font-bold">
                  {selectedVenture.generation_status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-3 text-sm">
              {/* Problem & Background */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Target Problem Statement
                </p>
                <p className="text-sm font-medium leading-relaxed">{selectedVenture.problem}</p>
                {selectedVenture.background_story && (
                  <div className="pt-2 border-t mt-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Founder Background</p>
                    <p className="text-xs text-muted-foreground pt-1">{selectedVenture.background_story}</p>
                  </div>
                )}
              </div>

              {/* AI Validation Summary */}
              {ventureDetail?.validation_report ? (
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" /> AI Viability Assessment
                    </span>
                    <span className="text-lg font-bold font-heading text-emerald-600">
                      {ventureDetail.validation_report.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {ventureDetail.validation_report.executive_summary}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border text-center text-xs text-muted-foreground">
                  AI validation report has not been generated for this venture yet.
                </div>
              )}

              {/* Roadmap Summary */}
              {ventureDetail?.roadmap ? (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4" /> Synthesized 12-Week Roadmap
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {ventureDetail.roadmap.total_weeks} Total Weeks
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {ventureDetail.roadmap.categories.map((cat: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs">
                        <p className="font-bold">{cat.name}</p>
                        <p className="text-[11px] text-muted-foreground">{cat.task_count} tasks ({cat.completed_count} done)</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => setDetailOpen(false)}
                className="w-full rounded-2xl"
              >
                Close Inspector
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

