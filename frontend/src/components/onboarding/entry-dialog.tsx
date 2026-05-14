"use client"

import { Rocket, Building2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EntryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EntryDialog({ isOpen, onOpenChange }: EntryDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border/50">
        <div className="p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold font-heading mb-2">
              Tell us about your startup
            </DialogTitle>
            <DialogDescription className="text-lg">
              Are you just starting or have you already started building?
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 pt-4">
          <button
            onClick={() => router.push("/onboarding")}
            className="group relative flex flex-col items-start p-6 text-left border-2 border-transparent bg-background rounded-3xl transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-center justify-center w-12 h-12 mb-6 bg-primary/10 rounded-2xl border border-primary/20 transition-transform group-hover:scale-110">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">New Builder</h3>
            <p className="text-sm text-muted-foreground mb-6">
              I have a raw idea and need help with validation and roadmap.
            </p>
            <div className="mt-auto flex items-center text-sm font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => router.push("/coming-soon")}
            className="group relative flex flex-col items-start p-6 text-left border-2 border-transparent bg-background rounded-3xl transition-all hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="flex items-center justify-center w-12 h-12 mb-6 bg-violet-500/10 rounded-2xl border border-violet-500/20 transition-transform group-hover:scale-110">
              <Building2 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">Existing Builder</h3>
            <p className="text-sm text-muted-foreground mb-6">
              I'm already building and looking for growth and scaling tools.
            </p>
            <div className="mt-auto flex items-center text-sm font-bold text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
              Coming Soon <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </button>
        </div>

        <div className="bg-muted/30 p-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Not sure? <Button variant="link" className="h-auto p-0 text-xs">Speak with an advisor</Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
