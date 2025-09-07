"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, User, Sparkles, Brain, Database, CheckCircle, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
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
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          console.log("Received chunk:", chunk)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: msg.content + chunk } : msg,
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
      {/* Human Context Status Bar */}
      <div className="mb-3 sm:mb-4">
        <Card className="p-3 bg-card/50 backdrop-blur-sm border-border/40">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedContext(!expandedContext)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Human Context</span>
              </div>
              <Badge variant="outline" className="gap-1">
                <Database className="h-3 w-3" />
                {contextCompleteness}% Complete
              </Badge>
              <AnimatePresence>
                {showContextUpdate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="h-3 w-3" />
                      Context Updated
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Active</span>
              {lastUpdateTime && (
                <>
                  <span>•</span>
                  <span>Last update: {lastUpdateTime.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Context Summary */}
          {humanContext && (
            <div className="mt-2 pt-2 border-t border-border/40">
              <div className="flex flex-wrap gap-2">
                {humanContext.behavioral_patterns?.interaction_style && (
                  <Badge variant="secondary" className="text-xs">
                    {humanContext.behavioral_patterns.interaction_style.response_length} responses
                  </Badge>
                )}
                {humanContext.interaction_history?.topics_discussed && humanContext.interaction_history.topics_discussed.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {humanContext.interaction_history.topics_discussed.length} topics tracked
                  </Badge>
                )}
                {humanContext.preferences?.domains && Object.keys(humanContext.preferences.domains).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(humanContext.preferences.domains).join(", ")}
                  </Badge>
                )}
                {humanContext.metadata?.update_count && (
                  <Badge variant="outline" className="text-xs">
                    {humanContext.metadata.update_count} updates
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Expanded Context Details */}
          <AnimatePresence>
            {expandedContext && humanContext && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
                  {humanContext.behavioral_patterns && (
                    <div>
                      <p className="text-xs font-medium mb-1">Behavioral Patterns</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {humanContext.behavioral_patterns.interaction_style && (
                          <div>• Response preference: {humanContext.behavioral_patterns.interaction_style.response_length}</div>
                        )}
                        {humanContext.behavioral_patterns.interaction_style?.formality_level && (
                          <div>• Formality level: {humanContext.behavioral_patterns.interaction_style.formality_level}/10</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {humanContext.interaction_history?.topics_discussed && humanContext.interaction_history.topics_discussed.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Topics Discussed</p>
                      <div className="flex flex-wrap gap-1">
                        {humanContext.interaction_history.topics_discussed.map((topic, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {topic.topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {humanContext.preferences?.domains && (
                    <div>
                      <p className="text-xs font-medium mb-1">Domain Preferences</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {Object.entries(humanContext.preferences.domains).map(([domain, prefs]) => (
                          <div key={domain}>
                            • {domain}: {Object.keys(prefs as any).length} preferences tracked
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    <p>This context helps the AI understand your preferences and communication style, enabling more personalized and relevant responses.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
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
                      {message.role === "assistant" && humanContext && (
                        <div className="mt-2 pt-2 border-t border-border/20">
                          <div className="flex items-center gap-2 text-xs opacity-60">
                            <Brain className="h-3 w-3" />
                            <span>Using human context</span>
                          </div>
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
