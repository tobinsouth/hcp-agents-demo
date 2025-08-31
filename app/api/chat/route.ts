import { streamText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  try {
    console.log("[v0] Processing chat request with messages:", messages)
    console.log("[v0] API Key present:", !!process.env.OPENROUTER_API_KEY)
    
    const result = streamText({
      model: openrouter.chat("openai/gpt-4o"),
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
      // Note: Temporarily removed tools due to OpenRouter schema validation issues
      // Will add back preference extraction functionality later
    })

    console.log("[v0] StreamText result created, returning response")
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
