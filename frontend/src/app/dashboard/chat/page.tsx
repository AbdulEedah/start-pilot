"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, Loader2, ChevronRight, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { offlineAI } from "@/lib/offline-ai"
import { offlineStorage, ChatMessage, ChatSession } from "@/lib/offline-storage"
import { useOffline } from "@/components/offline-provider"
import { toast } from "sonner"

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your Start Pilot AI Copilot. I'm running completely offline to ensure your startup ideas stay private and secure. Let's start by diving into the problem you're solving. What exactly inspired this idea?",
    timestamp: new Date().toISOString(),
    metadata: {
      type: 'general',
      confidence: 0.95
    }
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const { user } = useOffline()
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
    // Load or create chat session
    loadChatSession()
  }, [])

  const loadChatSession = async () => {
    try {
      const sessions = await offlineStorage.getAll<ChatSession>('chatSessions')
      let session = sessions.find(s => s.type === 'general')
      
      if (!session) {
        // Create new session
        session = {
          id: generateId(),
          title: 'AI Copilot Chat',
          messages: INITIAL_MESSAGES,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: 'general'
        }
        await offlineStorage.save('chatSessions', session)
      }
      
      setCurrentSession(session)
      setMessages(session.messages)
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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      // Get AI response
      const aiResponse = await offlineAI.getChatResponse(input, { messages: updatedMessages })
      
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

  const handleAnalyzeViability = async () => {
    if (isTyping) return

    setIsTyping(true)
    
    try {
      const context = messages.slice(-5).map(m => m.content).join('\n')
      const response = await offlineAI.getChatResponse(
        "Please analyze the viability of my startup idea based on our conversation so far.",
        { messages, type: 'validation' }
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
      <div className="p-6 border-b flex items-center justify-between bg-card/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold font-heading leading-none">Startup Copilot</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-orange-500" />
              Offline Mode - Private & Secure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                    <div className="mt-2 text-xs opacity-60">
                      Confidence: {Math.round(message.metadata.confidence * 100)}%
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
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
          Offline AI-Powered Startup Guidance — Unlimited Usage
        </p>
      </div>
    </div>
  )
}
