"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PreferenceDatabaseUI } from "./preference-database-ui"
import { ChevronLeft, ChevronRight, Play, Square, Network, User, Bot } from "lucide-react"
import { startNegotiation, type NegotiationMessage } from "@/lib/negotiation/negotiation-manager"
import { motion, AnimatePresence } from "framer-motion"

const OPENROUTER_MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (Default)" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B" },
]

export function AgentNegotiation() {
  const [leftCollapsed, setLeftCollapsed] = useState(true)
  const [rightCollapsed, setRightCollapsed] = useState(true)
  const [contextInput, setContextInput] = useState(
    "Negotiate the purchase of dining room chairs. The buyer is looking for modern, sustainable chairs in earthy tones with green accents for their home office. They value quality and sustainability but are price-conscious.",
  )
  const [opponentSystemPrompt, setOpponentSystemPrompt] = useState(
    "You are a furniture salesperson specializing in dining room furniture. Your goal is to upsell the customer by highlighting premium features, extended warranties, and complementary items like cushions or chair sets. Emphasize quality, craftsmanship, and long-term value. Be persuasive but not pushy.",
  )
  const [myAgentSystemPrompt, setMyAgentSystemPrompt] = useState(
    "You are negotiating on behalf of a buyer looking for dining room chairs. Use the preference database to guide your negotiation - the buyer values sustainability, natural materials, and earthy colors with green accents. Find the best price while ensuring the furniture meets the preferences for quality, style, and eco-friendliness. Be firm on requirements but flexible on price within reason.",
  )
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini")
  const [isNegotiating, setIsNegotiating] = useState(false)
  const [messages, setMessages] = useState<NegotiationMessage[]>([])

  const handleStartNegotiation = async () => {
    if (!contextInput.trim()) return

    setIsNegotiating(true)
    setMessages([])

    try {
      await startNegotiation({
        context: contextInput,
        opponentSystemPrompt: opponentSystemPrompt,
        opponentModel: selectedModel,
        myAgentSystemPrompt: myAgentSystemPrompt,
        onMessage: (message) => {
          setMessages((prev) => [...prev, message])
        },
        onComplete: () => {
          setIsNegotiating(false)
        },
      })
    } catch (error) {
      console.error("Negotiation error:", error)
      setIsNegotiating(false)
    }
  }

  const handleStopNegotiation = () => {
    setIsNegotiating(false)
    // TODO: Implement stop logic
  }

  return (
    <div className="flex h-[600px] gap-4 p-4">
      {/* Left Sidebar - My Agent */}
      <Collapsible open={!leftCollapsed} onOpenChange={(open) => setLeftCollapsed(!open)}>
        <div className="flex h-full">
          <CollapsibleContent className="w-80 h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col bg-card/80 backdrop-blur-md">
                <div className="flex items-center gap-3 p-4 pb-0 flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Your Agent</h3>
                </div>
                <ScrollArea className="flex-1 min-h-0 p-4 pt-4">
                  <div className="space-y-4 pr-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">System Prompt</label>
                      <Textarea
                        value={myAgentSystemPrompt}
                        onChange={(e) => setMyAgentSystemPrompt(e.target.value)}
                        disabled={isNegotiating}
                        rows={6}
                        className="text-xs bg-muted/30 border-border/50"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div className="border-t border-border/30 pt-4">
                      <label className="text-sm font-medium mb-3 block">Context Database</label>
                      <div className="h-96 bg-muted/20 rounded-lg overflow-hidden">
                        <PreferenceDatabaseUI />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </Card>
            </motion.div>
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-full w-8 px-0 hover:bg-accent/50 rounded-lg border border-border/30"
              >
                <motion.div
                  animate={{ rotate: leftCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </CollapsibleTrigger>
        </div>
      </Collapsible>

      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Context Input and Controls */}
        <Card className="p-6 mb-4 bg-card/80 backdrop-blur-md border-border/50">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Network className="w-4 h-4 text-primary" />
                Negotiation Scenario
              </label>
              <Textarea
                placeholder="Describe the negotiation scenario (e.g., 'Negotiate the purchase of dining room chairs...')"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                disabled={isNegotiating}
                rows={3}
                className="bg-muted/30 border-border/50 focus:bg-background/50 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleStartNegotiation}
                  disabled={isNegotiating || !contextInput.trim()}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Play className="w-4 h-4" />
                  Start Negotiation
                </Button>
              </motion.div>
              <AnimatePresence>
                {isNegotiating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button onClick={handleStopNegotiation} variant="destructive" className="flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      Stop
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Negotiation Messages */}
        <Card className="flex-1 p-6 min-h-0 bg-card/50 backdrop-blur-sm border-border/50">
          <ScrollArea className="h-full">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Network className="w-8 h-8 text-primary" />
                    </div>
                  </motion.div>
                  <p className="text-muted-foreground">Ready to simulate agent-to-agent negotiation</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Your preferences will guide the conversation</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex gap-3 ${message.agent === "my_agent" ? "justify-start" : "justify-end"}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${message.agent === "my_agent" ? "flex-row" : "flex-row-reverse"}`}>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            message.agent === "my_agent" 
                              ? "bg-primary/10" 
                              : "bg-muted"
                          }`}
                        >
                          {message.agent === "my_agent" ? (
                            <User className="w-4 h-4 text-primary" />
                          ) : (
                            <Bot className="w-4 h-4 text-muted-foreground" />
                          )}
                        </motion.div>
                        <Card
                          className={`px-4 py-3 border-0 shadow-sm ${
                            message.agent === "my_agent" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-card/70 backdrop-blur-sm"
                          }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {message.agent === "my_agent" ? "Your Agent" : "Opponent"} • Round {message.turn}
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </Card>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <AnimatePresence>
                  {isNegotiating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sm text-muted-foreground"
                      >
                        Agents are negotiating...
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </Card>
      </motion.div>

      {/* Right Sidebar - Opponent Agent */}
      <Collapsible open={!rightCollapsed} onOpenChange={(open) => setRightCollapsed(!open)}>
        <div className="flex h-full">
          <CollapsibleTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-full w-8 px-0 hover:bg-accent/50 rounded-lg border border-border/30"
              >
                <motion.div
                  animate={{ rotate: rightCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </CollapsibleTrigger>
          <CollapsibleContent className="w-80 h-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col bg-card/80 backdrop-blur-md">
                <div className="flex items-center gap-3 p-4 pb-0 flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Opponent Agent</h3>
                </div>
                <ScrollArea className="flex-1 min-h-0 p-4 pt-4">
                  <div className="space-y-4 pr-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">AI Model</label>
                      <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isNegotiating}>
                        <SelectTrigger className="bg-muted/30 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPENROUTER_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">System Prompt</label>
                      <Textarea
                        value={opponentSystemPrompt}
                        onChange={(e) => setOpponentSystemPrompt(e.target.value)}
                        disabled={isNegotiating}
                        rows={8}
                        className="text-xs bg-muted/30 border-border/50"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </Card>
            </motion.div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
