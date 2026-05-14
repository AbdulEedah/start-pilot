import { Rocket, Target, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading">Good morning, Founder</h1>
        <p className="text-muted-foreground">Here's what's happening with your startup today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Idea Status</h3>
            <p className="text-sm text-muted-foreground">Validation in progress</p>
          </div>
          <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[40%]" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h3 className="font-bold">Next Milestone</h3>
            <p className="text-sm text-muted-foreground">Market Research</p>
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-full">View Roadmap</Button>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold">AI Credits</h3>
            <p className="text-sm text-muted-foreground">5 Credits Remaining</p>
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-full">Upgrade</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { icon: Clock, text: "Idea validation session started", time: "2 hours ago" },
            { icon: Rocket, text: "Sector set to Technology", time: "3 hours ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
