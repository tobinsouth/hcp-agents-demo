"use client"
import { Card } from "@/components/ui/card"
import { ChatComponent } from "@/components/chat-component"
import { PreferenceDatabaseUI } from "@/components/preference-database-ui"
import { AgentNegotiation } from "@/components/agent-negotiation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-4xl font-bold text-foreground">AI Agent Negotiation Demo</h1>
          <p className="text-muted-foreground text-lg">Chat to generate preferences, then watch AI agents negotiate</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8 pb-8">
            {/* Top Row: Chat and Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
              <Card className="p-6 flex flex-col overflow-hidden">
                <h2 className="text-2xl font-semibold mb-4 flex-shrink-0">Chat Interface</h2>
                <div className="flex-1 overflow-hidden">
                  <ChatComponent />
                </div>
              </Card>

              <Card className="p-6 flex flex-col overflow-hidden">
                <h2 className="text-2xl font-semibold mb-4 flex-shrink-0">Preference Database</h2>
                <div className="flex-1 overflow-hidden">
                  <PreferenceDatabaseUI />
                </div>
              </Card>
            </div>

            {/* Bottom Row: Agent Negotiation */}
            <Card className="p-6 flex flex-col min-h-[400px]">
              <h2 className="text-2xl font-semibold mb-4 flex-shrink-0">Agent-to-Agent Negotiation</h2>
              <div className="flex-1 overflow-hidden">
                <AgentNegotiation />
              </div>
            </Card>
        </div>
      </div>
    </div>
  )
}
