"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

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

const backgroundSchema = z.object({
  story: z.string().min(20, "Please tell us a bit more about your background"),
  problem: z.string().min(20, "Please describe the problem in more detail"),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  experience: z.string().min(5, "Please specify your experience level"),
  skills: z.string().min(5, "Please list your key skills"),
  resources: z.string().min(5, "Please list your available resources"),
})

interface BackgroundFormProps {
  onBack: () => void
  onSubmit: (data: z.infer<typeof backgroundSchema>) => void
}

export function BackgroundForm({ onBack, onSubmit }: BackgroundFormProps) {
  const form = useForm<z.infer<typeof backgroundSchema>>({
    resolver: zodResolver(backgroundSchema),
    defaultValues: {
      story: "",
      problem: "",
      country: "",
      state: "",
      city: "",
      experience: "",
      skills: "",
      resources: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <FormField
          control={form.control}
          name="story"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Background Story</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your journey, what led you here?" 
                  className="min-h-[100px] resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>What makes you the right person to build this?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>The Problem You're Solving</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is the core pain point you want to address?" 
                  className="min-h-[100px] resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="USA" {...field} />
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
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="CA" {...field} />
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
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Existing Experience</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 5 years in Sales, First-time founder" {...field} />
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
              <FormLabel>Key Skills</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Coding, Marketing, Product Design" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resources"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Resources</FormLabel>
              <FormControl>
                <Input placeholder="e.g. $5k savings, Small team, Partnership" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" className="flex-[2]">
            Continue to AI Chat
          </Button>
        </div>
      </form>
    </Form>
  )
}
