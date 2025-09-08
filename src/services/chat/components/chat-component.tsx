"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/frontend/components/core/ui/button"
import { Input } from "@/frontend/components/core/ui/input"
import { Card } from "@/frontend/components/core/ui/card"
import { ScrollArea } from "@/frontend/components/core/ui/scroll-area"
import { Badge } from "@/frontend/components/core/ui/badge"
import { Send, User, Sparkles, Brain, Database, CheckCircle, Activity, Shield, Lock, Unlock, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  contextAccess?: {
    allowed: string[]
    requested: string[]
    denied: string[]
  }
}

interface PermissionRequest {
  messageId: string
  keys: string[]
}

interface HumanContext {
  behavioral_patterns?: any
  interaction_history?: {
    topics_discussed?: Array<{ topic: string; frequency: number; sentiment: string }>
  }
  preferences?: {
    domains?: Record<string, any>
  }
  metadata?: {
    update_count?: number
  }
}

// Helper function to calculate context completeness
function getContextCompleteness(context: HumanContext): number {
  if (!context) return 0
  
  const sections = [
    context.behavioral_patterns,
    context.interaction_history,
    context.preferences,
    context.metadata
  ]
  
  const filledSections = sections.filter(s => s && Object.keys(s).length > 0).length
  return Math.round((filledSections / sections.length) * 100)
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("What are the different types of washing machines available?")
  const [isLoading, setIsLoading] = useState(false)
  const [humanContext, setHumanContext] = useState<HumanContext | null>(null)
  const [contextCompleteness, setContextCompleteness] = useState(0)
  const [showContextUpdate, setShowContextUpdate] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [expandedContext, setExpandedContext] = useState(false)
  const [approvedPermissions, setApprovedPermissions] = useState<string[]>([])
  const [pendingPermissions, setPendingPermissions] = useState<PermissionRequest[]>([])

  // Fetch initial context on mount
  useEffect(() => {
    const fetchContext = () => {
      fetch("/api/hcp?endpoint=context")
        .then(res => res.json())
        .then(data => {
          setHumanContext(data)
          setContextCompleteness(getContextCompleteness(data))
        })
        .catch(err => console.error("Failed to fetch human context:", err))
    }
    
    fetchContext()
  }, [])

  // Update context when messages change (after user sends a message)
  useEffect(() => {
    if (messages.length === 0) return
    
    // Fetch updated context after a short delay to allow backend processing
    const timeoutId = setTimeout(() => {
      fetch("/api/hcp?endpoint=context")
        .then(res => res.json())
        .then(data => {
          // Only update if the context has actually changed
          const prevUpdateCount = humanContext?.metadata?.update_count || 0
          const newUpdateCount = data?.metadata?.update_count || 0
          
          if (newUpdateCount > prevUpdateCount) {
            setHumanContext(data)
            setContextCompleteness(getContextCompleteness(data))
            setShowContextUpdate(true)
            setLastUpdateTime(new Date())
            
            // Hide the update indicator after 3 seconds
            setTimeout(() => setShowContextUpdate(false), 3000)
          }
        })
        .catch(err => console.error("Failed to fetch human context:", err))
    }, 2000) // Wait 2 seconds after message to check for updates
    
    return () => clearTimeout(timeoutId)
  }, [messages.length, humanContext?.metadata?.update_count]) // Only re-run when number of messages changes

  const handleApprovePermission = (messageId: string, keys: string[]) => {
    setApprovedPermissions(prev => [...prev, ...keys])
    setPendingPermissions(prev => prev.filter(p => p.messageId !== messageId))
    
    // Re-send the last user message with approved permissions
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (lastUserMessage) {
      // Create a new assistant message with approved context
      handleSubmit(null, true)
    }
  }

  const handleDenyPermission = (messageId: string) => {
    setPendingPermissions(prev => prev.filter(p => p.messageId !== messageId))
  }

  const handleSubmit = async (e: React.FormEvent | null, withApprovedPermissions = false) => {
    if (e) e.preventDefault()
    if (!withApprovedPermissions && (!input.trim() || isLoading)) return

    const userMessage: Message = withApprovedPermissions 
      ? messages.filter(m => m.role === 'user').pop()!
      : {
          id: Date.now().toString(),
          role: "user",
          content: input,
        }

    if (!withApprovedPermissions) {
      setMessages((prev) => [...prev, userMessage])
      setInput("")
    }
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.filter(m => !withApprovedPermissions || m !== userMessage).concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          approvedPermissions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        contextAccess: undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false
      let buffer = ""

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          buffer += decoder.decode(value, { stream: true })
          
          // Check for metadata
          const metadataMatch = buffer.match(/\[METADATA\](.*?)\[\/METADATA\]/)
          if (metadataMatch) {
            try {
              const metadata = JSON.parse(metadataMatch[1])
              if (metadata.type === 'context_access') {
                // Update the assistant message with context access info
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id 
                      ? { ...msg, contextAccess: metadata.data }
                      : msg
                  )
                )
                
                // If there are requested permissions, add to pending
                if (metadata.data.requested && metadata.data.requested.length > 0) {
                  setPendingPermissions(prev => [...prev, {
                    messageId: assistantMessage.id,
                    keys: metadata.data.requested
                  }])
                }
              }
            } catch (err) {
              console.error("Failed to parse metadata:", err)
            }
            // Remove metadata from buffer
            buffer = buffer.replace(metadataMatch[0], '')
          }
          
          // Update content with the remaining buffer
          const cleanContent = buffer
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: cleanContent } : msg,
            ),
          )
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 md:p-6">
      {/* Messages */}
      <ScrollArea className="flex-1 mb-3 sm:mb-4 min-h-0">
        <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8 sm:py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              </motion.div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                Imagine this is your favorite chatbot interface—ChatGPT, Claude, or Gemini
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" 
                          ? "bg-primary/10" 
                          : "bg-muted"
                      }`}>
                      {message.role === "user" ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      ) : (
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </motion.div>
                    <Card
                      className={`px-3 py-2 sm:px-4 sm:py-3 border-0 shadow-sm ${
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-card/50 backdrop-blur-sm"
                      }`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Context Access Display */}
                      {message.role === "assistant" && message.contextAccess && (
                        <div className="mt-3 space-y-2">
                          {/* Allowed Context */}
                          {message.contextAccess.allowed.length > 0 && (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                              <Unlock className="h-3 w-3 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-green-700 mb-1">Accessing Context</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.contextAccess.allowed.map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Permission Requests */}
                          {pendingPermissions.find(p => p.messageId === message.id) && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                            >
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-yellow-700 mb-2">Permission Required</p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  The AI needs access to the following context to provide a personalized response:
                                </p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {pendingPermissions.find(p => p.messageId === message.id)?.keys.map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApprovePermission(
                                      message.id, 
                                      pendingPermissions.find(p => p.messageId === message.id)?.keys || []
                                    )}
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                                  >
                                    Allow Access
                                  </Button>
                                  <Button
                                    onClick={() => handleDenyPermission(message.id)}
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-3 text-xs"
                                  >
                                    Deny
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Denied Context */}
                          {message.contextAccess.denied.length > 0 && (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                              <Lock className="h-3 w-3 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-700 mb-1">Access Denied</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.contextAccess.denied.map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs bg-red-500/10 border-red-500/30">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-muted-foreground animate-pulse" />
                  </div>
                  <Card className="px-4 py-3 bg-card/50 backdrop-blur-sm border-0 shadow-sm">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sm text-muted-foreground"
                      >
                        Thinking...
                      </motion.div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="flex gap-2 p-2 sm:p-3 bg-muted/30 rounded-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about washing machines or share your preferences..."
          disabled={isLoading}
          className="flex-1 border-0 bg-background/50 focus:bg-background transition-colors text-sm sm:text-base h-[44px]"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="rounded-lg h-[44px] w-[44px] flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </motion.form>
    </div>
  )
}
