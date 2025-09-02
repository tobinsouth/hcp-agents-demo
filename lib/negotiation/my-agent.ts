/**
 * My Agent - Represents the user's negotiating agent
 *
 * This agent uses the user's preferences from the preference database
 * to inform its negotiation strategy and responses.
 */

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getPreferences } from "../preferences"

interface MyAgentInput {
  context: string
  conversationHistory: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

/**
 * Generates a negotiation response from my agent based on user preferences
 */
export async function myAgent(input: MyAgentInput): Promise<string> {
  const { context, conversationHistory } = input
  const preferences = getPreferences()

  // Build system prompt based on user preferences
  const systemPrompt = buildSystemPrompt(preferences, context)

  const openaiClient = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  })

  try {
    const { text } = await generateText({
      model: openaiClient("openai/gpt-4o"),
      system: systemPrompt,
      messages: conversationHistory,
    })

    return text
  } catch (error) {
    console.error("My agent error:", error)
    return "I need a moment to consider this proposal. Could you clarify your position?"
  }
}

/**
 * Builds a system prompt based on user preferences
 */
function buildSystemPrompt(preferences: any, context: string): string {
  let prompt = `You are negotiating on behalf of your client in this scenario: ${context}\n\n`

  prompt += "Your negotiation approach should be guided by these client preferences:\n\n"

  // Communication style
  if (preferences.communication_style) {
    const { formality, directness, tone } = preferences.communication_style
    prompt += `Communication Style:\n`
    if (formality) prompt += `- Use ${formality} language\n`
    if (directness) prompt += `- Be ${directness} in your approach\n`
    if (tone) prompt += `- Maintain a ${tone} tone\n`
    prompt += "\n"
  }

  // Negotiation priorities
  if (preferences.negotiation_priorities) {
    const { price_sensitivity, timeline_flexibility, quality_importance, relationship_focus } =
      preferences.negotiation_priorities
    prompt += `Negotiation Priorities:\n`
    if (price_sensitivity) prompt += `- Price sensitivity: ${price_sensitivity}\n`
    if (timeline_flexibility) prompt += `- Timeline flexibility: ${timeline_flexibility}\n`
    if (quality_importance) prompt += `- Quality importance: ${quality_importance}\n`
    if (relationship_focus) prompt += `- Relationship focus: ${relationship_focus}\n`
    prompt += "\n"
  }

  // Decision making
  if (preferences.decision_making) {
    const { risk_tolerance, information_needs } = preferences.decision_making
    prompt += `Decision Making:\n`
    if (risk_tolerance) prompt += `- Risk tolerance: ${risk_tolerance}\n`
    if (information_needs) prompt += `- Information needs: ${information_needs}\n`
    prompt += "\n"
  }

  // Values
  if (preferences.values) {
    const { sustainability, innovation, transparency } = preferences.values
    prompt += `Values:\n`
    if (sustainability) prompt += `- Sustainability importance: ${sustainability}\n`
    if (innovation) prompt += `- Innovation preference: ${innovation}\n`
    if (transparency) prompt += `- Transparency level: ${transparency}\n`
    prompt += "\n"
  }

  // Constraints
  if (preferences.constraints) {
    const { budget_range, timeline, technical_requirements } = preferences.constraints
    prompt += `Constraints:\n`
    if (budget_range) prompt += `- Budget: ${budget_range}\n`
    if (timeline) prompt += `- Timeline: ${timeline}\n`
    if (technical_requirements?.length) {
      prompt += `- Technical requirements: ${technical_requirements.join(", ")}\n`
    }
    prompt += "\n"
  }

  prompt += `Keep responses concise but substantive. Focus on finding mutually beneficial solutions while protecting your client's interests. Be strategic and professional.`

  return prompt
}
