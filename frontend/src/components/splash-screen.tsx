"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Rocket } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isShaking] = useState(true)
  const [isIgnited] = useState(true)
  const [isLaunching, setIsLaunching] = useState(false)
  const [sparks, setSparks] = useState<{ id: number; left: number; delay: number }[]>([])

  useEffect(() => {
    // Sparks particle system triggers immediately
    const sparkInterval = setInterval(() => {
      setSparks((prev) => [
        ...prev.slice(-20),
        {
          id: Math.random(),
          left: Math.random() * 40 - 20, // offset from center
          delay: Math.random() * 0.4
        }
      ])
    }, 60) // faster sparks for high-fidelity fire ignition

    // Start liftoff launch sequence after 1s
    const launchTimer = setTimeout(() => {
      setIsLaunching(true)
      clearInterval(sparkInterval)
      
      // End splash screen when rocket flies off-screen
      const endTimer = setTimeout(() => {
        onComplete()
      }, 850)
      
      return () => clearTimeout(endTimer)
    }, 1000)

    return () => {
      clearInterval(sparkInterval)
      clearTimeout(launchTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Background Deep Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px] animate-plasma-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-[60vw] h-[60vw] rounded-full bg-violet-600/5 blur-[150px] animate-plasma-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      {/* Animation Rocket Area */}
      <div className="relative flex flex-col items-center justify-center h-[350px]">
        <motion.div
          animate={
            isLaunching
              ? {
                  y: -1000,
                  scale: 0.7,
                  transition: { duration: 0.85, ease: [0.36, 0.07, 0.19, 0.97] }
                }
              : {}
          }
          className="relative"
        >
          {/* Main Launch Container with shared layout transition to top header */}
          <motion.div
            layoutId="main-rocket"
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 18
            }}
            className={`relative z-55 flex items-center justify-center w-24 h-24 bg-primary rounded-[28px] shadow-2xl shadow-primary/30 ${
              isShaking && !isLaunching ? "animate-rocket-shake" : ""
            }`}
          >
            <Rocket className="w-12 h-12 text-primary-foreground transform -rotate-45" />

            {/* Glowing Engine Thruster Flare */}
            {isIgnited && (
              <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 w-10 h-20 origin-top pointer-events-none">
                <div className="w-full h-full bg-gradient-to-b from-orange-500 via-rose-500 to-transparent rounded-full animate-flame-pulse opacity-90 blur-[1px]" />
                <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-white rounded-full opacity-80 blur-[2px]" />
              </div>
            )}
          </motion.div>

          {/* Sparks Particle System */}
          {isIgnited && !isLaunching && (
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-20 h-40 pointer-events-none overflow-hidden">
              {sparks.map((spark) => (
                <div
                  key={spark.id}
                  className="absolute bottom-0 w-1 h-1 bg-amber-400 rounded-full"
                  style={{
                    left: `calc(50% + ${spark.left}px)`,
                    animation: "spark-float 0.8s forwards linear",
                    animationDelay: `${spark.delay}s`
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Circular Launchpad Base Glow */}
        <div className="absolute bottom-12 w-48 h-8 bg-primary/10 blur-xl rounded-full scale-y-[0.3]" />
      </div>
    </div>
  )
}
