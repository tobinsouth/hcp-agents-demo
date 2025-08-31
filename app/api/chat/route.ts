import { streamText, tool } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { updatePreferences, updatePreferencesSchema } from "@/lib/preferences"
import { z } from "zod"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const openai = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "AI Negotiation Demo",
    },
  })

  try {
    const result = streamText({
      model: openai("openai/gpt-4o"),
      system: `You are a helpful assistant that learns about user preferences through conversation. 
      
      Based on what users tell you about their needs, preferences, and decision-making style, 
      call the update_preferences function to capture this information in a structured format.
      
      Look for clues about:
      - How they communicate (formal/casual, direct/diplomatic)
      - What they prioritize in negotiations (price, quality, relationships, timelines)
      - How they make decisions (risk tolerance, information needs)
      - Their values (sustainability, innovation, transparency)
      - Any constraints they mention (budget, timeline, requirements)
      
      Be conversational and helpful while gathering this information naturally. Ask follow-up questions
      to better understand their preferences when appropriate.`,
      messages,
      tools: {
        update_preferences: tool({
          description: updatePreferencesSchema.description,
          parameters: z.object({
            communication_style: z
              .object({
                formality: z.enum(["formal", "casual", "mixed"]).optional(),
                directness: z.enum(["direct", "diplomatic", "balanced"]).optional(),
                tone: z.enum(["friendly", "professional", "assertive"]).optional(),
              })
              .optional(),
            negotiation_priorities: z
              .object({
                price_sensitivity: z.enum(["high", "medium", "low"]).optional(),
                timeline_flexibility: z.enum(["rigid", "flexible", "very_flexible"]).optional(),
                quality_importance: z.enum(["critical", "important", "moderate"]).optional(),
                relationship_focus: z.enum(["transactional", "partnership", "long_term"]).optional(),
              })
              .optional(),
            decision_making: z
              .object({
                risk_tolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
                information_needs: z.enum(["minimal", "standard", "comprehensive"]).optional(),
                consultation_style: z.enum(["independent", "collaborative", "consensus"]).optional(),
              })
              .optional(),
            values: z
              .object({
                sustainability: z.enum(["high", "medium", "low"]).optional(),
                innovation: z.enum(["cutting_edge", "proven", "conservative"]).optional(),
                transparency: z.enum(["full", "standard", "minimal"]).optional(),
              })
              .optional(),
            constraints: z
              .object({
                budget_range: z.string().optional(),
                timeline: z.string().optional(),
                technical_requirements: z.array(z.string()).optional(),
                compliance_needs: z.array(z.string()).optional(),
              })
              .optional(),
          }),
          execute: async (preferences) => {
            console.log("[v0] Updating preferences:", preferences)
            updatePreferences(preferences)
            return { success: true, message: "Preferences updated successfully" }
          },
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
