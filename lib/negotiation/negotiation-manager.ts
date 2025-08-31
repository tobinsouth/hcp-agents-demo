/**
 * Negotiation Management System
 *
 * Orchestrates multi-turn negotiations between two AI agents,
 * managing the conversation flow and turn-taking logic.
 */

export interface NegotiationMessage {
  agent: "my_agent" | "opponent_agent"
  content: string
  turn: number
  timestamp: Date
}

export interface NegotiationConfig {
  context: string
  opponentSystemPrompt: string
  opponentModel: string
  maxTurns?: number
  onMessage: (message: NegotiationMessage) => void
  onComplete: () => void
}

/**
 * Starts a negotiation between two AI agents
 */
export async function startNegotiation(config: NegotiationConfig): Promise<void> {
  const { context, opponentSystemPrompt, opponentModel, maxTurns = 10, onMessage, onComplete } = config

  const conversationHistory: NegotiationMessage[] = []
  let currentTurn = 1

  try {
    // Opponent agent's opening move
    const opponentResponse = await fetch("/api/negotiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: "opponent_agent",
        context,
        systemPrompt: opponentSystemPrompt,
        model: opponentModel,
        conversationHistory: [
          {
            role: "user",
            content: `Let's begin negotiating this scenario: ${context}. Please make your opening position.`,
          },
        ],
      }),
    }).then(res => res.json()).then(data => data.text)

    const initialMessage: NegotiationMessage = {
      agent: "opponent_agent",
      content: opponentResponse,
      turn: currentTurn,
      timestamp: new Date(),
    }

    conversationHistory.push(initialMessage)
    onMessage(initialMessage)

    // Continue negotiation until max turns or natural conclusion
    while (currentTurn < maxTurns) {
      currentTurn++

      const isMyAgentTurn = currentTurn % 2 === 0

      let response: string

      if (isMyAgentTurn) {
        // My agent's turn
        const res = await fetch("/api/negotiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "my_agent",
            context,
            conversationHistory: conversationHistory.map((m) => ({
              role: m.agent === "opponent_agent" ? "user" : "assistant",
              content: m.content,
            })),
          }),
        })
        const data = await res.json()
        response = data.text
      } else {
        // Opponent agent's turn
        const res = await fetch("/api/negotiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "opponent_agent",
            context,
            systemPrompt: opponentSystemPrompt,
            model: opponentModel,
            conversationHistory: conversationHistory.map((m) => ({
              role: m.agent === "my_agent" ? "user" : "assistant",
              content: m.content,
            })),
          }),
        })
        const data = await res.json()
        response = data.text
      }

      const message: NegotiationMessage = {
        agent: isMyAgentTurn ? "my_agent" : "opponent_agent",
        content: response,
        turn: currentTurn,
        timestamp: new Date(),
      }

      conversationHistory.push(message)
      onMessage(message)

      // Check for natural conclusion keywords
      if (
        response.toLowerCase().includes("agreement") ||
        response.toLowerCase().includes("deal") ||
        response.toLowerCase().includes("conclude") ||
        response.toLowerCase().includes("accept")
      ) {
        break
      }

      // Add delay between turns for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  } catch (error) {
    console.error("Negotiation error:", error)
  } finally {
    onComplete()
  }
}
