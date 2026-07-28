"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, Loader2, ChevronRight, Layers, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { offlineAI } from "@/lib/offline-ai"
import { offlineStorage, ChatMessage, ChatSession } from "@/lib/offline-storage"
import { useOffline } from "@/components/offline-provider"
import { getSectorDetails, SECTORS } from "@/lib/sector-utils"
import { toast } from "sonner"

export default function ChatPage() {
  const { user, sector: activeSectorId, changeSector } = useOffline()
  const sectorDetails = getSectorDetails(activeSectorId)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
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
    loadChatSession()
  }, [activeSectorId])

  const loadChatSession = async () => {
    try {
      const activeDetails = getSectorDetails(activeSectorId)
      const initialSectorMessage: ChatMessage = {
        id: "1",
        role: "assistant",
        content: activeDetails.copilotGreeting,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'general',
          confidence: 0.98
        }
      }

      const sessions = await offlineStorage.getAll<ChatSession>('chatSessions')
      let session = sessions.find(s => s.type === 'general')
      
      if (!session) {
        session = {
          id: generateId(),
          title: `${activeDetails.name} AI Copilot Chat`,
          messages: [initialSectorMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: 'general'
        }
        await offlineStorage.save('chatSessions', session)
        setMessages([initialSectorMessage])
      } else {
        // If initial message in session, update first message with sector greeting if user hasn't chatted much
        if (session.messages.length <= 1) {
          session.messages = [initialSectorMessage]
        }
        setMessages(session.messages)
      }
      
      setCurrentSession(session)
    } catch (error) {
      console.error('Failed to load chat session:', error)
    }
  }

  const saveSession = async (updatedMessages: ChatMessage[]) => {
    if (!currentSession) return

    const updatedSession: ChatSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    }

    try {
      await offlineStorage.save('chatSessions', updatedSession)
      setCurrentSession(updatedSession)
    } catch (error) {
      console.error('Failed to save chat session:', error)
    }
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const sendMessageText = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      const aiResponse = await offlineAI.getChatResponse(textToSend, { 
        messages: updatedMessages,
        sector: activeSectorId 
      })
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'general',
          confidence: aiResponse.confidence,
          sources: aiResponse.sources
        }
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      await saveSession(finalMessages)
      
    } catch (error) {
      console.error('Failed to get AI response:', error)
      toast.error("Failed to get AI response", {
        description: "Please try again"
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => sendMessageText(input)

  const handleAnalyzeViability = async () => {
    if (isTyping) return

    setIsTyping(true)
    
    try {
      const response = await offlineAI.getChatResponse(
        `Please evaluate the viability and market potential for my ${sectorDetails.name} venture.`,
        { messages, type: 'validation', sector: activeSectorId }
      )

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'validation',
          confidence: response.confidence,
          sources: response.sources
        }
      }

      const updatedMessages = [...messages, aiMessage]
      setMessages(updatedMessages)
      await saveSession(updatedMessages)
      
    } catch (error) {
      console.error('Failed to analyze viability:', error)
      toast.error("Failed to analyze viability", {
        description: "Please try again"
      })
    } finally {
      setIsTyping(false)
    }
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
              <h2 className="font-bold font-heading leading-none">AI Copilot Vibe</h2>
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
          {/* Sector Switcher Dropdown */}
          <div className="flex items-center gap-1 bg-accent/50 p-1 rounded-full border border-border/50">
            <Layers className="w-3.5 h-3.5 ml-2 text-muted-foreground" />
            <select
              value={activeSectorId}
              onChange={(e) => {
                changeSector(e.target.value)
                toast.success(`Switched sector to ${SECTORS[e.target.value]?.name}`)
              }}
              className="bg-transparent text-xs font-semibold px-2 py-1 focus:outline-none cursor-pointer"
            >
              {Object.values(SECTORS).map((s) => (
                <option key={s.id} value={s.id} className="bg-popover text-popover-foreground">
                  {s.name}
                </option>
              ))}
            </select>
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
                  {message.metadata?.confidence && (
                    <div className="mt-2 text-xs opacity-60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Confidence: {Math.round(message.metadata.confidence * 100)}% ({sectorDetails.name})
                    </div>
                  )}
                  <span className="text-[10px] opacity-50 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
