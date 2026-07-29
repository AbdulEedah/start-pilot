"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  Rocket,
  HelpCircle,
  Users,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

const contactReasons = [
  { value: "support", label: "Technical Support", icon: HelpCircle },
  { value: "partnership", label: "Partnership Inquiry", icon: Briefcase },
  { value: "feedback", label: "Product Feedback", icon: MessageSquare },
  { value: "press", label: "Press & Media", icon: Mail },
  { value: "careers", label: "Careers", icon: Users },
  { value: "other", label: "Other", icon: Mail },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSuccess(true)
      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      })
      
      form.reset()
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again or contact us directly at hello@startpilot.com",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="px-6 mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 px-3 py-1 mb-8 border rounded-full bg-accent/50 border-primary/20 backdrop-blur-sm w-fit mx-auto"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Get In Touch
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl font-heading mb-6"
            >
              We're here to help
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 leading-relaxed"
            >
              Have questions about Start Pilot? Want to partner with us? 
              Or just want to say hello? We'd love to hear from you.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-card border border-border/50 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                
                {isSuccess ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6 animate-bounce" />
                    <h3 className="text-xl font-bold mb-2">Message sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Name & Email Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Company */}
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subject */}
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <SelectTrigger {...field}>
                                <SelectValue placeholder="What can we help you with?" />
                                {contactReasons.map((reason) => (
                                  <SelectItem key={reason.value} value={reason.value}>
                                    {reason.label}
                                  </SelectItem>
                                ))}
                              </SelectTrigger>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Message */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us more about your inquiry..."
                                className="min-h-[120px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-12" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Quick Contact */}
              <div className="bg-accent/30 rounded-3xl p-8 border border-border/50">
                <h3 className="text-2xl font-bold mb-6">Get in touch quickly</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Email Us</p>
                      <Link href="mailto:hello@startpilot.com" className="text-primary hover:underline">
                        hello@startpilot.com
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Live Chat</p>
                      <p className="text-muted-foreground text-sm">Available 24/7 for urgent support</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p className="text-muted-foreground text-sm">We typically respond within 4-6 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Information */}
              <div className="bg-card border border-border/50 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6">Our Offices</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold">San Francisco HQ</p>
                        <p className="text-muted-foreground text-sm">
                          123 Mission Street<br />
                          San Francisco, CA 94105<br />
                          United States
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold">London Office</p>
                        <p className="text-muted-foreground text-sm">
                          45 Shoreditch High Street<br />
                          London E1 6HN<br />
                          United Kingdom
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-3xl p-8 border border-primary/20">
                <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
                <div className="flex gap-4">
                  <Link href="#" className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center hover:bg-accent transition-colors">
                    <Mail className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center hover:bg-accent transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center hover:bg-accent transition-colors">
                    <Mail className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Looking for quick answers?
                </p>
                <Link href="/documentation/faq">
                  <Button variant="outline" size="lg" className="rounded-full">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Browse FAQ
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}