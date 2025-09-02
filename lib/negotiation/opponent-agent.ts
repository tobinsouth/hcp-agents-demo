/**
 * Opponent Agent - Represents the other party in the negotiation
 *
 * This agent uses a configurable system prompt and model selection
 * to simulate different negotiation counterparts.
 */

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

interface OpponentAgentInput {
  context: string
  systemPrompt: string
  model: string
  conversationHistory: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

/**
 * Generates a negotiation response from the opponent agent
 * Uses OpenRouter API for model flexibility
 */
export async function opponentAgent(input: OpponentAgentInput): Promise<string> {
  const { context, systemPrompt, model, conversationHistory } = input

  const fullSystemPrompt = `${systemPrompt}\n\nNegotiation Context: ${context}\n\nRespond as the other party in this negotiation. Keep responses concise but substantive.`

  const openai = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  })

  try {
    const { text } = await generateText({
      model: openai(model),
      system: fullSystemPrompt,
      messages: conversationHistory,
      temperature: 0.7,
    })

    return text
  } catch (error) {
    console.error("Opponent agent error:", error)
    return "I appreciate your proposal. Let me think about how we can find a mutually beneficial arrangement here."
  }
}
