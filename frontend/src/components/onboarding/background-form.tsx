"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  ArrowLeft, 
  Loader2, 
  Rocket, 
  Target, 
  Users, 
  MapPin, 
  Clock, 
  Sparkles, 
  DollarSign, 
  Lock, 
  CheckCircle2,
  Lightbulb,
  Building2,
  ShieldCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const backgroundSchema = z.object({
  startup_name: z.string().min(2, "Please provide your startup name or working title (min 2 characters)"),
  elevator_pitch: z.string().min(10, "Please provide a concise one-sentence pitch (min 10 characters)"),
  problem: z.string().min(20, "Please describe the problem in more detail (min 20 characters so AI can accurately evaluate it)"),
  solution: z.string().min(20, "Please outline your proposed solution and core wedge (min 20 characters)"),
  target_audience: z.string().min(10, "Please specify who your initial target customer or buyer is (min 10 characters)"),
  story: z.string().min(20, "Please tell us a bit more about your founder story and what led you here (min 20 characters)"),
  experience: z.string().min(3, "Please specify your background or domain experience"),
  skills: z.string().min(3, "Please list key skills (e.g. Sales, Python, Marketing)"),
  team_status: z.enum(["solo", "cofounder", "small_team", "medium_team", "large_team"], {
    message: "Please select your team composition",
  }),
  time_commitment: z.enum(["full", "part", "evening", "weekend"], {
    message: "Please select your weekly time commitment",
  }),
  stage: z.string().min(2, "Please select your current venture stage"),
  country: z.string().min(2, "Country is required"),
  state: z.string().optional(),
  city: z.string().min(2, "City is required"),
  capital: z.string().optional(),
  resources: z.string().optional(),
})

export type BackgroundFormData = z.infer<typeof backgroundSchema>

interface BackgroundFormProps {
  onBack: () => void
  onSubmit: (data: BackgroundFormData) => void
  isSubmitting?: boolean
  initialValues?: Partial<BackgroundFormData>
  isEditing?: boolean
  lockedSectorName?: string
}

export function BackgroundForm({ 
  onBack, 
  onSubmit, 
  isSubmitting = false, 
  initialValues,
  isEditing = false,
  lockedSectorName
}: BackgroundFormProps) {
  const form = useForm<BackgroundFormData>({
    resolver: zodResolver(backgroundSchema),
    defaultValues: {
      startup_name: initialValues?.startup_name || "",
      elevator_pitch: initialValues?.elevator_pitch || "",
      problem: initialValues?.problem || "",
      solution: initialValues?.solution || "",
      target_audience: initialValues?.target_audience || "",
      story: initialValues?.story || "",
      experience: initialValues?.experience || "",
      skills: initialValues?.skills || "",
      team_status: (initialValues?.team_status as any) || "solo",
      time_commitment: (initialValues?.time_commitment as any) || "full",
      stage: initialValues?.stage || "idea",
      country: initialValues?.country || "",
      state: initialValues?.state || "",
      city: initialValues?.city || "",
      capital: initialValues?.capital || "",
      resources: initialValues?.resources || "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
        
        {/* Sector Status Header Banner */}
        {lockedSectorName && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  Locked Sector: <span className="text-primary font-extrabold capitalize">{lockedSectorName}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  1 Account = 1 Sector. Update your venture questions below to keep your AI Copilot, viability assessment, and roadmap synchronized.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              {isEditing ? "Editing Mode" : "Locked Sector"}
            </span>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 1: VENTURE IDENTITY & ELEVATOR PITCH                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/50 pb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-heading text-base text-foreground">1. Venture Identity & Elevator Pitch</h3>
              <p className="text-xs text-muted-foreground">Define what your startup is called and how you hook customers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="startup_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Startup Name / Working Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. NovaHealth, FleetIQ, EcoStack" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormDescription className="text-[11px]">Working name for your product or venture.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Current Development Stage <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="idea">Idea Stage / Brainstorming</option>
                      <option value="validation">Customer Interviews & Problem Validation</option>
                      <option value="prototype">Prototype / Wireframes in Progress</option>
                      <option value="mvp">Functional MVP / Alpha Testing</option>
                      <option value="revenue">Early Revenue / Active Paying Beta</option>
                    </select>
                  </FormControl>
                  <FormDescription className="text-[11px]">Helps the AI generate realistic timeline milestones.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="elevator_pitch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  One-Line Hook / Elevator Pitch <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. AI copilot for commercial HVAC contractors that cuts emergency dispatch time by 40%." 
                    className="rounded-xl h-11" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  How would you explain your startup to an investor or customer in 10 seconds?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 2: THE PROBLEM, SOLUTION & TARGET AUDIENCE           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/50 pb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-heading text-base text-foreground">2. Problem, Solution & Target Audience</h3>
              <p className="text-xs text-muted-foreground">The commercial engine behind your business model</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="problem"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  The Core Problem Being Solved <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What specific friction, manual chore, or severe bottleneck exists? Who suffers from it and what does it cost them today in wasted time, money, or lost revenue?" 
                    className="min-h-[110px] resize-none rounded-xl" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Minimum 20 characters. Detailed problem statements produce higher-confidence AI viability scores.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solution"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Proposed Solution & Initial Wedge <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What product, workflow software, or tech are you offering? Why will customers switch from legacy workarounds or Excel sheets to your solution?" 
                    className="min-h-[110px] resize-none rounded-xl" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Outline your Minimum Viable Product (MVP) and defensible wedge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Target Customer & First 50 Buyers (ICP) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Operations managers at 20-100 employee cold-storage warehouses; Independent pediatricians." 
                    className="rounded-xl h-11" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Who specifically holds the budget and will sign up for your initial closed beta?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 3: FOUNDER PROFILE, TEAM & SKILLS                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/50 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-heading text-base text-foreground">3. Founder Story, Team & Superpowers</h3>
              <p className="text-xs text-muted-foreground">Founder-market fit is the #1 predictor of early venture resilience</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="story"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Founder Background Story & Inspiration <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What personal frustration, work insight, or domain journey led you to start this? What makes you passionate about dedicating years to this space?" 
                    className="min-h-[100px] resize-none rounded-xl" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  What insider insight or lived experience gives you an advantage?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Domain / Professional Experience <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 7 years in Enterprise B2B Sales, First-time founder" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Key Technical & Business Skills <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Next.js, Python, Cold Outbound, SEO, UI/UX" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormDescription className="text-[11px]">Comma-separated list of superpowers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="team_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Team Composition <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="solo">Solo Founder (actively building)</option>
                      <option value="cofounder">Co-founder Duo (2 core founders)</option>
                      <option value="small_team">Small Team (3-5 members)</option>
                      <option value="medium_team">Medium Team (6-10 people)</option>
                      <option value="large_team">Growth Team (10+ people)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time_commitment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Weekly Time Dedication <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-11 px-3.5 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="full">Full-time (40+ hrs/week dedicated)</option>
                      <option value="part">Part-time (20-40 hrs/week)</option>
                      <option value="evening">Evenings after work (10-20 hrs/week)</option>
                      <option value="weekend">Weekends only (&lt;10 hrs/week)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 4: LOCATION, CAPITAL & RESOURCES                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/50 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-heading text-base text-foreground">4. Market Location & Resources</h3>
              <p className="text-xs text-muted-foreground">Where you are deploying and what resources you bring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Country <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. United States, Nigeria, UK" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    State / Province
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. California, Lagos, Ontario" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    City / Target Hub <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco, London, Lagos" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="capital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Available Budget / Savings ($ USD)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 5000, 15000 (0 if bootstrapped)" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormDescription className="text-[11px]">Optional estimated budget for launch/hosting.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Key Strategic Assets / Network
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 500 industry contacts, Patent, Lab access" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormDescription className="text-[11px]">Any unfair advantages, networks, or data assets.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack} 
            className="flex-1 rounded-xl h-12 text-xs font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isEditing ? "Back to Dashboard" : "Back to Sector Selection"}
          </Button>

          <Button 
            type="submit" 
            className="flex-[2] rounded-xl h-12 text-xs font-bold shadow-md shadow-primary/20" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving Updates..." : "Saving & Finalizing..."}
              </>
            ) : isEditing ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-300" />
                Save & Update Onboarding Details
              </>
            ) : (
              "Save Onboarding & Continue to AI Chat"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
