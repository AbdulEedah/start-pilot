import { Rocket, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Branding Panel (Hidden on small screens) */}
      <div className="relative hidden w-0 flex-1 overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary via-primary/90 to-violet-900/50" />
        
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-400/20 rounded-full blur-[100px]" />

        <div className="relative z-20 flex h-full flex-col p-12 text-white">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="flex items-center justify-center w-10 h-10 transition-transform bg-white/10 backdrop-blur-md rounded-xl group-hover:rotate-12 border border-white/20">
              <Rocket className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading">
              Start Pilot
            </span>
          </Link>

          <div className="mt-auto max-w-xl">
            <div className="flex items-center gap-2 px-3 py-1 mb-6 w-fit border rounded-full bg-white/5 border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span className="text-xs font-medium tracking-wide uppercase text-violet-200">
                Join the next generation of founders
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl mb-6">
              Empowering visionary startups with AI guidance.
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Unlock your potential with our modular startup building tools. 
              From raw ideation to investor-ready roadmaps.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-6 text-white/40 text-sm">
            <span>© 2026 Start Pilot</span>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Auth Form Side */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:flex-none lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>
    </div>
  );
}
