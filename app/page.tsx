"use client"
import { Card } from "@/components/ui/card"
import { ChatComponent } from "@/components/chat-component"
import { PreferenceDatabaseUI } from "@/components/preference-database-ui"
import { AgentNegotiation } from "@/components/agent-negotiation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">AI Agent Negotiation Demo</h1>
          <p className="text-muted-foreground text-lg">Chat to generate preferences, then watch AI agents negotiate</p>
        </div>

        {/* Top Row: Chat and Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Chat Interface</h2>
            <ChatComponent />
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Preference Database</h2>
            <PreferenceDatabaseUI />
          </Card>
        </div>

        {/* Bottom Row: Agent Negotiation */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Agent-to-Agent Negotiation</h2>
          <AgentNegotiation />
        </Card>
      </div>
    </div>
  )
}
