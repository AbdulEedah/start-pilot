"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  UserCheck, 
  ShieldCheck, 
  Rocket,
  Calendar,
  Mail,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: [
      {
        heading: "Account Information",
        text: "When you create an account, we collect your name, email address, and any profile information you choose to provide."
      },
      {
        heading: "Usage Data", 
        text: "We collect information about how you use Start Pilot, including features accessed, time spent, and interaction patterns to improve our service."
      },
      {
        heading: "Device Information",
        text: "We may collect device-specific information such as your IP address, browser type, operating system, and device identifiers."
      },
      {
        heading: "Startup Data",
        text: "Information about your startup projects, business plans, and related content you create within our platform."
      }
    ]
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    content: [
      {
        heading: "Service Provision",
        text: "To provide, maintain, and improve Start Pilot's AI-powered guidance and features."
      },
      {
        heading: "Personalization",
        text: "To customize your experience and provide relevant recommendations based on your startup journey."
      },
      {
        heading: "Communication",
        text: "To send you service updates, newsletters, and important notifications about your account."
      },
      {
        heading: "Analytics & Insights",
        text: "To analyze usage patterns and improve our AI models while maintaining anonymity."
      }
    ]
  },
  {
    id: "data-sharing",
    title: "Data Sharing and Disclosure",
    content: [
      {
        heading: "Service Providers",
        text: "We may share data with trusted third-party service providers who assist in operating our platform, subject to strict confidentiality agreements."
      },
      {
        heading: "Legal Requirements",
        text: "We may disclose information if required by law, regulation, legal process, or governmental request."
      },
      {
        heading: "Business Transfers",
        text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction."
      },
      {
        heading: "With Your Consent",
        text: "We may share information for any other purpose with your explicit consent."
      }
    ]
  },
  {
    id: "data-security",
    title: "Data Security",
    content: [
      {
        heading: "Encryption",
        text: "All data is encrypted in transit and at rest using industry-standard encryption protocols."
      },
      {
        heading: "Access Controls",
        text: "We implement strict access controls and authentication measures to protect your information."
      },
      {
        heading: "Regular Audits",
        text: "Our security practices are regularly audited and updated to meet the highest standards."
      },
      {
        heading: "Incident Response",
        text: "We have comprehensive incident response procedures in case of any security breaches."
      }
    ]
  },
  {
    id: "your-rights",
    title: "Your Rights and Choices",
    content: [
      {
        heading: "Access & Correction",
        text: "You can access and update your personal information through your account settings at any time."
      },
      {
        heading: "Data Portability",
        text: "You have the right to export your data in a machine-readable format."
      },
      {
        heading: "Deletion",
        text: "You can request deletion of your account and associated data, subject to legal retention requirements."
      },
      {
        heading: "Marketing Preferences",
        text: "You can opt out of marketing communications while still receiving essential service updates."
      }
    ]
  },
  {
    id: "cookies-tracking",
    title: "Cookies and Tracking",
    content: [
      {
        heading: "Essential Cookies",
        text: "We use cookies necessary for the platform to function properly, including authentication and security."
      },
      {
        heading: "Analytics Cookies",
        text: "With your consent, we use analytics cookies to understand usage patterns and improve our service."
      },
      {
        heading: "Third-Party Services",
        text: "We may use third-party analytics and marketing services that place their own cookies, subject to their privacy policies."
      },
      {
        heading: "Cookie Management",
        text: "You can manage cookie preferences through your browser settings or our cookie preference center."
      }
    ]
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border/40">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Rocket className="w-5 h-5 text-primary-foreground transform -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading">Start Pilot</span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 border-b border-border/50">
        <div className="px-6 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 px-3 py-1 mb-8 border rounded-full bg-accent/50 border-primary/20 backdrop-blur-sm w-fit mx-auto">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Privacy Policy
              </span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl font-heading mb-6">
              Your privacy matters
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We're committed to protecting your privacy and being transparent about how we collect, 
              use, and protect your information.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last updated: June 1, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Version 2.1</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-accent/30">
        <div className="px-6 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Privacy at a glance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-card border border-border/50 rounded-2xl">
                <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Encrypted</h3>
                <p className="text-sm text-muted-foreground">All data encrypted in transit and at rest</p>
              </div>
              
              <div className="text-center p-6 bg-card border border-border/50 rounded-2xl">
                <Eye className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Transparent</h3>
                <p className="text-sm text-muted-foreground">Clear about what we collect and why</p>
              </div>
              
              <div className="text-center p-6 bg-card border border-border/50 rounded-2xl">
                <UserCheck className="w-8 h-8 text-violet-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Your Control</h3>
                <p className="text-sm text-muted-foreground">You own your data and control its use</p>
              </div>
              
              <div className="text-center p-6 bg-card border border-border/50 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Minimal Data</h3>
                <p className="text-sm text-muted-foreground">We only collect what's necessary</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="px-6 mx-auto max-w-4xl">
          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 p-8 bg-card border border-border/50 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-6">Table of Contents</h2>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section, index) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-primary hover:text-primary/80 text-sm font-medium hover:underline"
                >
                  {index + 1}. {section.title}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-12">
            {sections.map((section, sectionIndex) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 + 0.4 }}
                className="scroll-mt-24"
              >
                <h2 className="text-3xl font-bold mb-8">{section.title}</h2>
                
                <div className="space-y-6">
                  {section.content.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary/20 pl-6">
                      <h3 className="text-xl font-semibold mb-3">{item.heading}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 p-8 bg-primary/10 border border-primary/20 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Questions about this policy?</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, 
                we encourage you to contact us. We're committed to addressing your concerns promptly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button className="w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </Link>
                <Link href="mailto:privacy@startpilot.com">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />
                    privacy@startpilot.com
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Data Protection Rights (GDPR/CCPA) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-12 p-8 bg-card border border-border/50 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Your Data Protection Rights</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">For EU residents (GDPR):</strong> You have rights including access, 
                rectification, erasure, restriction, portability, and objection to processing of your personal data.
              </p>
              <p>
                <strong className="text-foreground">For California residents (CCPA):</strong> You have the right to know, 
                delete, and opt-out of the sale of your personal information.
              </p>
              <p>
                To exercise these rights, please contact us using the information above. We will respond to your 
                request within the timeframes required by applicable law.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}