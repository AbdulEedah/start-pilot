"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: Date
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Hello! I'm your Start Pilot AI Copilot. I've seen your background and your interest in this sector. Let's start by diving into the problem you're solving. What exactly inspired this idea?",
    timestamp: new Date(),
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Mock AI Response with streaming effect
    setTimeout(() => {
      const aiId = (Date.now() + 1).toString()
      const aiResponse = generateMockResponse(input, messages.length)
      
      let currentText = ""
      const words = aiResponse.split(" ")
      
      setMessages((prev) => [...prev, { id: aiId, role: "ai", content: "", timestamp: new Date() }])
      
      let wordIndex = 0
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex]
          setMessages((prev) => 
            prev.map((msg) => msg.id === aiId ? { ...msg, content: currentText } : msg)
          )
          wordIndex++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 50)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="p-6 border-b flex items-center justify-between bg-card/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold font-heading leading-none">Startup Copilot</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Online & Analyzing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Analyze Viability
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-accent" : "bg-primary"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-card border border-border/50 rounded-tl-none"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-[10px] opacity-50 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border/50 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t bg-card/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input 
            placeholder="Type your answer or ask a question..." 
            className="h-12 px-6 rounded-full border-border/50 focus-visible:ring-primary/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg shadow-primary/20"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
          AI-Powered Startup Guidance — 5 Credits Remaining
        </p>
      </div>
    </div>
  )
}

function generateMockResponse(userInput: string, messageCount: number): string {
  const responses = [
    "That's a powerful insight. Given the current market trends, how do you see this problem evolving over the next 2-3 years? Who is feeling this pain the most right now?",
    "Interesting. Many founders overlook the operational complexity here. Have you considered how you'll handle the logistics of the initial pilot? What's your 'Stage 0' move?",
    "I've analyzed similar models in this sector. The biggest risk is usually customer acquisition cost. How do you plan to reach your first 10 paying customers without a large marketing budget?",
    "Based on our conversation, I'm detecting a strong value proposition. However, the 'existing experience' you mentioned could be leveraged more. How can we integrate your specific skills into the core product?",
    "Great. Let's talk about validation. If I gave you a small budget to test this today, what's the one metric you'd track to prove people actually want this?",
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}
