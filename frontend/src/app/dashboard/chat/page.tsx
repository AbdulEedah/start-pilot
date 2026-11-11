"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Send, Bot, User, Sparkles, Loader2, ArrowUpRight, Lock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { getSectorDetails } from "@/lib/sector-utils"
import { chatApi, type Message } from "@/lib/api/chat"
import { toast } from "sonner"

export default function ChatPage() {
  const { user, isAuthenticated, sector: activeSectorId } = useAuth()
  const sectorDetails = getSectorDetails(activeSectorId)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    `Analyze the viability of my ${sectorDetails.name} venture based on my onboarding details.`,
    `What critical assumptions must I validate first in ${sectorDetails.name}?`,
    `What missing information do you need from me to evaluate my business model?`,
    `How do I run customer discovery interviews for this ${sectorDetails.name} problem?`,
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSuggestedQuestions([
      `Analyze the viability of my ${sectorDetails.name} venture based on my onboarding details.`,
      `What critical assumptions must I validate first in ${sectorDetails.name}?`,
      `What missing information do you need from me to evaluate my business model?`,
      `How do I run customer discovery interviews for this ${sectorDetails.name} problem?`,
    ])
  }, [sectorDetails.name])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isAuthenticated) {
      loadOrCreateConversation()
    }
  }, [isAuthenticated])

  const loadOrCreateConversation = async () => {
    try {
      const conversations = await chatApi.getConversations()
      if (conversations.length > 0) {
        const conv = conversations[0]
        setConversationId(conv.id)
        const history = await chatApi.getMessageHistory(conv.id)
        const messageList = Array.isArray(history) ? history : (Array.isArray((history as any)?.results) ? (history as any).results : []); setMessages(messageList)
      } else {
        // No conversation yet, just show greeting
        setMessages([])
      }
    } catch (error: any) {
      if (error?.status !== 401) {
        console.error('Failed to load conversations:', error)
      }
    }
  }

  const sendMessageText = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now(),
      conversation: conversationId || 0,
      role: "user",
      content: textToSend,
      metadata: null,
      created_at: new Date().toISOString(),
    }

    const currentMessages = Array.isArray(messages) ? messages : []; const updatedMessages = [...currentMessages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      const response = await chatApi.sendMessage({
        conversation_id: conversationId || undefined,
        content: textToSend,
        context: { sector: activeSectorId },
      })

      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      const rawMsg = response.message || (response as any);
      const aiMessage: Message = {
        id: rawMsg?.id || Date.now(),
        conversation: response.conversation_id || rawMsg?.conversation || conversationId || 0,
        role: 'assistant',
        content: rawMsg?.content || '',
        metadata: rawMsg?.metadata || null,
        created_at: rawMsg?.created_at || new Date().toISOString(),
      }

      setMessages([...updatedMessages, aiMessage])

      if (Array.isArray(response.suggested_questions) && response.suggested_questions.length > 0) {
        setSuggestedQuestions(response.suggested_questions)
      } else {
        const msgLower = textToSend.toLowerCase()
        if (msgLower.includes("viability") || msgLower.includes("validate") || msgLower.includes("potential") || msgLower.includes("score")) {
          setSuggestedQuestions([
            `What are the top 3 regulatory or market risks for ${sectorDetails.name}?`,
            `What MVP features are essential to test demand before building full scale?`,
            `What specific questions do you need answered about my target customer?`,
          ])
        } else if (msgLower.includes("mvp") || msgLower.includes("product") || msgLower.includes("build") || msgLower.includes("feature")) {
          setSuggestedQuestions([
            `How do I acquire my first 50 early adopters in ${sectorDetails.name}?`,
            `What monetization model fits this ${sectorDetails.name} solution best?`,
            `Which key metrics should I track during beta testing?`,
          ])
        } else if (msgLower.includes("pitch") || msgLower.includes("deck") || msgLower.includes("investor") || msgLower.includes("raise")) {
          setSuggestedQuestions([
            `What metrics do angel investors look for in ${sectorDetails.name} startups?`,
            `How do I define my startup's unfair advantage or competitive moat?`,
            `Help me craft a 60-second elevator pitch for ${sectorDetails.name} investors.`,
          ])
        } else {
          setSuggestedQuestions([
            `What is the recommended next milestone on my ${sectorDetails.name} roadmap?`,
            `What missing information do you need from me to evaluate my execution?`,
            `How do I calculate customer acquisition cost (CAC) for ${sectorDetails.name}?`,
          ])
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      toast.error("Failed to get AI response", {
        description: (error as any)?.data?.detail || (error as any)?.message || "Please try again"
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => sendMessageText(input)

  const handleAnalyzeViability = async () => {
    if (isTyping) return
    await sendMessageText(
      `Please analyze the viability of my ${sectorDetails.name} venture based on my complete onboarding background, problem statement, location, team, and resources. ` +
      `Evaluate our problem-solution fit and market potential, and if you need any additional information to give an accurate assessment, please ask me directly.`
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="p-6 border-b flex items-center justify-between bg-card/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold font-heading leading-none">AI Copilot</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sectorDetails.badgeColor}`}>
                {sectorDetails.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to {sectorDetails.name} Intelligence Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border/80 px-3 py-1.5 rounded-full shadow-xs" title="1 Account = 1 Sector (Locked)">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">
              Sector: <span className="text-primary font-bold">{sectorDetails.name}</span>
            </span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Permanently Locked
            </span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full gap-2"
            onClick={handleAnalyzeViability}
            disabled={isTyping}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Analyze Viability
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {(!Array.isArray(messages) || messages.length === 0) && !isTyping && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading">Welcome to AI Copilot</h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything about your {sectorDetails.name} startup. I can help with validation, roadmaps, pitch decks, and more.
              </p>
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {(Array.isArray(messages) ? messages : []).map((message) => (
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
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Dynamic Sector & Stage Suggested Questions */}
      <div className="px-6 pt-2 pb-2 bg-card/10 border-t border-border/30">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Suggested {sectorDetails.name} Inquiries (Stage & Chat Adaptive):
        </p>
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {suggestedQuestions.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => sendMessageText(promptText)}
              disabled={isTyping}
              className="text-xs px-3.5 py-1.5 rounded-full bg-accent/60 hover:bg-primary/20 hover:text-primary border border-border/40 transition-all shrink-0 flex items-center gap-1.5 font-medium"
            >
              <span>{promptText}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t bg-card/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input 
            placeholder={`Ask AI Copilot about your ${sectorDetails.name} venture...`} 
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
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
          Start Pilot AI Copilot — Sector: {sectorDetails.name} ({sectorDetails.marketSize} TAM)
        </p>
      </div>
    </div>
  )
}


