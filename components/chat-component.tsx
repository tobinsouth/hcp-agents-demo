"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("What are the key styles of dining room chairs?")
  const [isLoading, setIsLoading] = useState(false)

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
          placeholder="Ask about furniture or share your preferences..."
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
