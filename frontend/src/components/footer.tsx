"use client"

import Link from "next/link"
import { Rocket, Mail, Globe } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="py-24 bg-card border-t border-border/50">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-left mb-24">
          
          {/* Resources */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Resources</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/documentation" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/sector-guides" className="hover:text-primary transition-colors">
                  Sector Guides
                </Link>
              </li>
              <li>
                <Link href="/startup-blog" className="hover:text-primary transition-colors">
                  Startup Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation/api" className="hover:text-primary transition-colors">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Company</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Platform</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-primary transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/documentation/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm uppercase tracking-widest text-primary">Connect</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="https://twitter.com/startpilot" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://linkedin.com/company/startpilot" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="https://github.com/startpilot" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="mb-8" />
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">Start Pilot</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}