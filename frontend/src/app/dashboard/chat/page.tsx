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
  const scrollRef = useRef<HTMLDivElement>(null)

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
    await sendMessageText(`Please evaluate the viability and market potential for my ${sectorDetails.name} venture.`)
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
          <div className="flex items-center gap-2 bg-card border border-border/80 px-3 py-1.5 rounded-full shadow-xs">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">
              Sector: <span className="text-primary font-bold">{sectorDetails.name}</span>
            </span>
            <Link
              href="/onboarding"
              className="ml-1 text-[11px] font-medium text-muted-foreground hover:text-primary underline flex items-center gap-1 transition-colors"
              title="To change your sector, you must return to Onboarding"
            >
              <RotateCcw className="w-3 h-3" />
              Change in Onboarding
            </Link>
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

      {/* Sector Quick Prompts */}
      <div className="px-6 pt-2 pb-2 bg-card/10 border-t border-border/30">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Suggested {sectorDetails.name} Prompts:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {sectorDetails.quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => sendMessageText(promptText)}
              disabled={isTyping}
              className="text-xs px-3 py-1.5 rounded-full bg-accent/60 hover:bg-primary/20 hover:text-primary border border-border/40 transition-all shrink-0 flex items-center gap-1"
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


