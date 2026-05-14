import { ArrowLeft, Rocket, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-background">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl">
            We're building something big for existing founders.
          </h1>
          <p className="text-lg text-muted-foreground">
            Our platform currently focuses on young entrepreneurs in the ideation phase. 
            Scaling tools for existing startups are coming very soon.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="relative w-full max-w-sm">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Enter your email for early access" className="pl-9 h-11" />
          </div>
          <Button size="lg" className="h-11 rounded-full whitespace-nowrap">
            Notify Me
          </Button>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}
