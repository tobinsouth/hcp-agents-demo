"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreferenceDatabaseUI } from "./preference-database-ui"
import { Play, Square, Network, User, Bot, Zap, MessageCircle } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("negotiate")

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
  }

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="hidden lg:flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-primary">
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">Your Agent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-border"></div>
            <Zap className="w-5 h-5 text-muted-foreground" />
            <div className="h-px w-8 bg-border"></div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-medium">Opponent Agent</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Your Agent Panel */}
        <motion.div 
          className="w-80 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="flex-1 bg-card/80 backdrop-blur-md border-primary/20">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Your Agent</h3>
                  <p className="text-xs text-muted-foreground">Negotiates for you</p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">System Prompt</label>
                  <Textarea
                    value={myAgentSystemPrompt}
                    onChange={(e) => setMyAgentSystemPrompt(e.target.value)}
                    disabled={isNegotiating}
                    rows={4}
                    className="text-xs bg-muted/30 border-border/50"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <div className="border-t border-border/30 pt-4">
                  <label className="text-sm font-medium mb-3 block">Context Database</label>
                  <div className="h-64 bg-muted/20 rounded-lg overflow-hidden">
                    <PreferenceDatabaseUI />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Central Negotiation Area */}
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Scenario Input */}
          <Card className="p-6 mb-4 bg-card/80 backdrop-blur-md border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Network className="w-5 h-5 text-primary" />
                <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Negotiation Scenario</h3>
              </div>
              <Textarea
                placeholder="Describe the negotiation scenario..."
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                disabled={isNegotiating}
                rows={3}
                className="bg-muted/30 border-border/50"
              />
              <div className="flex gap-3 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleStartNegotiation}
                    disabled={isNegotiating || !contextInput.trim()}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2"
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
                    >
                      <Button onClick={handleStopNegotiation} variant="destructive">
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Card>

          {/* Messages */}
          <Card className="flex-1 p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <ScrollArea className="h-full">
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Network className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-2">Ready for agent negotiation</p>
                    <p className="text-sm text-muted-foreground/70">Configure agents and start scenario</p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${message.agent === "my_agent" ? "justify-start" : "justify-end"}`}
                      >
                        <div className={`flex gap-3 max-w-[85%] ${message.agent === "my_agent" ? "flex-row" : "flex-row-reverse"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            message.agent === "my_agent" ? "bg-primary/10" : "bg-muted"
                          }`}>
                            {message.agent === "my_agent" ? (
                              <User className="w-4 h-4 text-primary" />
                            ) : (
                              <Bot className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <Card className={`px-4 py-3 border-0 ${
                            message.agent === "my_agent" ? "bg-primary text-primary-foreground" : "bg-card/70"
                          }`}>
                            <div className="text-xs opacity-70 mb-1">
                              {message.agent === "my_agent" ? "Your Agent" : "Opponent"} • Round {message.turn}
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </Card>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isNegotiating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className="text-sm text-muted-foreground animate-pulse">
                        Agents are negotiating...
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Opponent Agent Panel */}
        <motion.div 
          className="w-80 flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="flex-1 bg-card/80 backdrop-blur-md border-border/50">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Opponent Agent</h3>
                  <p className="text-xs text-muted-foreground">Negotiates against you</p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
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
      </div>
    </div>
  )

  // Mobile Layout
  const MobileLayout = () => (
    <div className="lg:hidden h-full flex flex-col">
      <div className="grid grid-cols-3 gap-1 mb-4 p-1 bg-muted/50 rounded-lg">
        <Button
          variant={activeTab === "my-agent" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("my-agent")}
          className="flex items-center gap-2 justify-center"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">My Agent</span>
        </Button>
        <Button
          variant={activeTab === "negotiate" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("negotiate")}
          className="flex items-center gap-2 justify-center"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Negotiate</span>
        </Button>
        <Button
          variant={activeTab === "opponent" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("opponent")}
          className="flex items-center gap-2 justify-center"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Opponent</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === "my-agent" && (
          <div className="h-full">
            <Card className="h-full bg-card/80 backdrop-blur-md border-primary/20">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Your Agent</h3>
                    <p className="text-xs text-muted-foreground">Negotiates on your behalf</p>
                  </div>
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-80px)] p-4">
                <div className="space-y-4">
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
                    <div className="h-64 bg-muted/20 rounded-lg overflow-hidden">
                      <PreferenceDatabaseUI />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}

        {activeTab === "negotiate" && (
          <div className="h-full flex flex-col">
            <Card className="p-4 mb-4 bg-card/80 backdrop-blur-md border-border/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Scenario</h3>
                </div>
                <Textarea
                  placeholder="Describe negotiation scenario..."
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  disabled={isNegotiating}
                  rows={3}
                  className="bg-muted/30 border-border/50"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleStartNegotiation}
                    disabled={isNegotiating || !contextInput.trim()}
                    className="bg-primary hover:bg-primary/90 flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                  {isNegotiating && (
                    <Button onClick={handleStopNegotiation} variant="destructive" size="icon">
                      <Square className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card className="flex-1 p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <ScrollArea className="h-full">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Network className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Configure agents in other tabs</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {message.agent === "my_agent" ? (
                            <User className="w-4 h-4 text-primary" />
                          ) : (
                            <Bot className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {message.agent === "my_agent" ? "Your Agent" : "Opponent"} • Round {message.turn}
                          </span>
                        </div>
                        <Card className={`p-3 ${
                          message.agent === "my_agent" ? "bg-primary/10 border-primary/20" : "bg-muted/50"
                        }`}>
                          <p className="text-xs leading-relaxed">{message.content}</p>
                        </Card>
                      </div>
                    ))}
                    {isNegotiating && (
                      <div className="text-center py-4">
                        <div className="text-xs text-muted-foreground animate-pulse">Negotiating...</div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        )}

        {activeTab === "opponent" && (
          <div className="h-full">
            <Card className="h-full bg-card/80 backdrop-blur-md border-border/50">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Bot className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Opponent Agent</h3>
                    <p className="text-xs text-muted-foreground">Negotiates against you</p>
                  </div>
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-80px)] p-4">
                <div className="space-y-4">
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
                      rows={10}
                      className="text-xs bg-muted/30 border-border/50"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-full p-3 sm:p-4 md:p-6">
      <DesktopLayout />
      <MobileLayout />
    </div>
  )
}