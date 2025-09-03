"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreferenceDatabaseUI } from "./preference-database-ui"
import { Play, Square, Network, User, Bot, MessageCircle } from "lucide-react"
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
    "You are a furniture salesperson specializing in dining room furniture. Your goal is to upsell the customer by highlighting premium features, extended warranties, and complementary items like cushions or chair sets. Emphasize quality, craftsmanship, and long-term value. Be persuasive but not pushy.\n\nIMPORTANT: Keep responses brief and to the point - aim for 1-2 sentences maximum. Be direct and focused in your negotiations.",
  )
  const [myAgentSystemPrompt, setMyAgentSystemPrompt] = useState(
    "You are negotiating on behalf of a buyer looking for dining room chairs. Use the preference database to guide your negotiation - the buyer values sustainability, natural materials, and earthy colors with green accents. Find the best price while ensuring the furniture meets the preferences for quality, style, and eco-friendliness. Be firm on requirements but flexible on price within reason.\n\nIMPORTANT: Keep responses brief and to the point - aim for 1-2 sentences maximum. Be direct and focused in your negotiations.",
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
  }

  return (
    <div className="h-full py-3 px-1 sm:p-4 md:p-6">
      <Tabs defaultValue="negotiate" className="h-full flex flex-col">
        {/* Responsive TabsList */}
        <div className="flex items-center justify-center mb-4 lg:mb-6">
          <TabsList className="grid grid-cols-3 bg-muted/50 p-1 h-auto">
            <TabsTrigger 
              value="my-agent" 
              className="flex items-center gap-2 lg:gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 lg:px-6"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline lg:inline">My Agent</span>
              <span className="sm:hidden lg:hidden">Mine</span>
            </TabsTrigger>
            <TabsTrigger 
              value="negotiate" 
              className="flex items-center gap-2 lg:gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 lg:px-6"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline lg:inline">Negotiate</span>
              <span className="sm:hidden lg:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="opponent" 
              className="flex items-center gap-2 lg:gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 lg:px-6"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline lg:inline">Opponent</span>
              <span className="sm:hidden lg:hidden">Bot</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Unified Tab Content */}
        <div className="flex-1 min-h-0">
          <TabsContent value="my-agent" className="h-full m-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Card className="h-full bg-card/80 backdrop-blur-md border-primary/20">
                <div className="p-2 sm:p-4 lg:p-6 border-b border-border/50">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold lg:text-xl" style={{ fontFamily: 'var(--font-crimson)' }}>Your Agent</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Negotiates on your behalf using your context</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 sm:p-4 lg:p-6 h-[calc(100%-80px)] lg:h-[calc(100%-100px)] flex flex-col lg:flex-row gap-4 lg:gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 lg:mb-3 block">System Prompt</label>
                      <Textarea
                        value={myAgentSystemPrompt}
                        onChange={(e) => setMyAgentSystemPrompt(e.target.value)}
                        disabled={isNegotiating}
                        rows={6}
                        className="text-xs lg:text-sm bg-muted/30 border-border/50"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>
                  <div className="lg:w-80">
                    <div className="border-t lg:border-t-0 border-border/30 pt-4 lg:pt-0">
                      <label className="text-sm font-medium mb-3 block">Context Database</label>
                      <div className="h-64 lg:h-full bg-muted/20 rounded-lg overflow-hidden">
                        <PreferenceDatabaseUI />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="negotiate" className="h-full m-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col max-w-6xl mx-auto"
            >
              <Card className="p-2 sm:p-4 lg:p-6 mb-4 bg-card/80 backdrop-blur-md border-border/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 lg:gap-4 mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Network className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold lg:text-xl" style={{ fontFamily: 'var(--font-crimson)' }}>Negotiation Scenario</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">✨ Start here - describe what you want to negotiate</p>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Describe the negotiation scenario (e.g., 'Buy sustainable dining chairs for under $800')..."
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    disabled={isNegotiating}
                    rows={3}
                    className="bg-muted/30 border-border/50 text-sm"
                  />
                  <div className="flex gap-2 lg:gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleStartNegotiation}
                        disabled={isNegotiating || !contextInput.trim()}
                        className="bg-primary hover:bg-primary/90 flex-1 lg:flex-none lg:px-6 lg:py-3"
                      >
                        <Play className="w-4 h-4 mr-2" />
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
                          <Button onClick={handleStopNegotiation} variant="destructive" size="icon" className="lg:w-auto lg:px-4">
                            <Square className="w-4 h-4 lg:mr-2" />
                            <span className="hidden lg:inline">Stop</span>
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>

              <Card className="flex-1 p-2 sm:p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <ScrollArea className="h-full">
                  {messages.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Network className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                        </div>
                        <p className="text-sm lg:text-base text-muted-foreground mb-2">Ready for negotiation</p>
                        <p className="text-xs lg:text-sm text-muted-foreground/70">Configure agents in other tabs, then start here</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 lg:space-y-4">
                      <AnimatePresence>
                        {messages.map((message, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`flex gap-3 lg:gap-4 ${message.agent === "my_agent" ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`flex gap-3 max-w-[85%] lg:max-w-[80%] ${message.agent === "my_agent" ? "flex-row" : "flex-row-reverse"}`}>
                              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                message.agent === "my_agent" ? "bg-primary/10" : "bg-muted"
                              }`}>
                                {message.agent === "my_agent" ? (
                                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                ) : (
                                  <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                                )}
                              </div>
                              <Card className={`p-3 lg:px-4 lg:py-3 ${
                                message.agent === "my_agent" ? "bg-primary/10 border-primary/20" : "bg-muted/50"
                              }`}>
                                <div className="text-xs opacity-70 mb-1 lg:block hidden">
                                  {message.agent === "my_agent" ? "Your Agent" : "Opponent"} • Round {message.turn}
                                </div>
                                <div className="flex items-center gap-2 mb-1 lg:hidden">
                                  {message.agent === "my_agent" ? (
                                    <User className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Bot className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {message.agent === "my_agent" ? "Your Agent" : "Opponent"} • Round {message.turn}
                                  </span>
                                </div>
                                <p className="text-xs lg:text-sm leading-relaxed">{message.content}</p>
                              </Card>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {isNegotiating && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-4"
                        >
                          <div className="text-xs lg:text-sm text-muted-foreground animate-pulse">Agents are negotiating...</div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="opponent" className="h-full m-0">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Card className="h-full bg-card/80 backdrop-blur-md border-border/50">
                <div className="p-2 sm:p-4 lg:p-6 border-b border-border/50">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold lg:text-xl" style={{ fontFamily: 'var(--font-crimson)' }}>Opponent Agent</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">AI that negotiates against you</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 sm:p-4 lg:p-6 h-[calc(100%-80px)] lg:h-[calc(100%-100px)] flex flex-col lg:flex-row gap-4 lg:gap-6">
                  <div className="lg:w-80 space-y-4 lg:order-first">
                    <div>
                      <label className="text-sm font-medium mb-2 lg:mb-3 block">AI Model</label>
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
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 lg:mb-3 block">System Prompt</label>
                    <Textarea
                      value={opponentSystemPrompt}
                      onChange={(e) => setOpponentSystemPrompt(e.target.value)}
                      disabled={isNegotiating}
                      rows={10}
                      className="text-xs lg:text-sm bg-muted/30 border-border/50 h-full"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}