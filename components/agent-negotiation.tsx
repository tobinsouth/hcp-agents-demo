"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PreferenceDatabaseUI } from "./preference-database-ui"
import { ChevronLeft, ChevronRight, Play, Square, Settings, User } from "lucide-react"
import { startNegotiation, type NegotiationMessage } from "@/lib/negotiation/negotiation-manager"

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
    <div className="flex h-[600px] gap-4">
      {/* Left Sidebar - My Agent */}
      <Collapsible open={!leftCollapsed} onOpenChange={(open) => setLeftCollapsed(!open)}>
        <div className="flex h-full">
          <CollapsibleContent className="w-80 h-full">
            <Card className="h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  My Agent
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">System Prompt</label>
                  <Textarea
                    value={myAgentSystemPrompt}
                    onChange={(e) => setMyAgentSystemPrompt(e.target.value)}
                    disabled={isNegotiating}
                    rows={6}
                    className="text-xs mb-4"
                  />
                </div>
                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-2 block">Preference Database</label>
                  <PreferenceDatabaseUI />
                </div>
              </div>
            </Card>
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-full w-6 px-0 hover:bg-accent"
            >
              {leftCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </Collapsible>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Context Input and Controls */}
        <Card className="p-4 mb-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Negotiation Context</label>
              <Textarea
                placeholder="Describe the negotiation scenario (e.g., 'Negotiate the purchase of dining room chairs...')"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                disabled={isNegotiating}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleStartNegotiation}
                disabled={isNegotiating || !contextInput.trim()}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Negotiation
              </Button>
              {isNegotiating && (
                <Button onClick={handleStopNegotiation} variant="destructive" className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Negotiation Messages */}
        <Card className="flex-1 p-4">
          <ScrollArea className="h-full">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No negotiation in progress</p>
                  <p className="text-sm">Enter context and click "Start Negotiation"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.agent === "my_agent" ? "justify-start" : "justify-end"}`}
                  >
                    <Card
                      className={`p-3 max-w-[80%] ${
                        message.agent === "my_agent" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {message.agent === "my_agent" ? "My Agent" : "Opponent Agent"} • Turn {message.turn}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </Card>
                  </div>
                ))}
                {isNegotiating && (
                  <div className="text-center text-muted-foreground">
                    <div className="animate-pulse">Negotiating...</div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      {/* Right Sidebar - Opponent Agent */}
      <Collapsible open={!rightCollapsed} onOpenChange={(open) => setRightCollapsed(!open)}>
        <div className="flex h-full">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-full w-6 px-0 hover:bg-accent"
            >
              {rightCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="w-80 h-full">
            <Card className="h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Opponent Agent
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isNegotiating}>
                    <SelectTrigger>
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
                    className="text-xs"
                  />
                </div>
              </div>
            </Card>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
