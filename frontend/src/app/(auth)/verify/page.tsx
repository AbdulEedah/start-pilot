"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const router = useRouter()

  useEffect(() => {
    // Mock verification process
    const timer = setTimeout(() => {
      setStatus("success")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center py-12">
      {status === "verifying" ? (
        <>
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <h1 className="text-2xl font-bold font-heading">Verifying your email...</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your account details.
          </p>
        </>
      ) : status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-heading">Email Verified!</h1>
            <p className="text-muted-foreground">
              Your account has been successfully verified. You can now access all features.
            </p>
          </div>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-lg font-bold shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all group w-full"
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="text-destructive font-bold">Error verifying email</div>
          <Button variant="outline" onClick={() => setStatus("verifying")}>Try again</Button>
        </>
      )}
    </div>
  )
}
