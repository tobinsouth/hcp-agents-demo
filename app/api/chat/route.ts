import { streamText, tool } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { updatePreferences, updatePreferencesSchema } from "@/lib/preferences"
import { z } from "zod"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const openai = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  })

  try {
    console.log("[v0] Processing chat request with messages:", messages)
    console.log("[v0] API Key present:", !!process.env.OPENROUTER_API_KEY)
    
    // Test direct OpenRouter API call
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Negotiation Demo",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant that learns about user preferences through conversation. Based on what users tell you about their needs, preferences, and decision-making style, extract and note this information. Look for clues about communication style (formal/casual, direct/diplomatic), negotiation priorities (price vs quality, timelines), decision-making approach, values, and constraints. Be conversational and helpful while gathering this information naturally." },
          ...messages
        ],
        stream: false
      })
    })
    
    const data = await openRouterResponse.json()
    console.log("[v0] OpenRouter response:", data)
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return new Response(data.choices[0].message.content, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      })
    } else {
      throw new Error("Invalid response from OpenRouter: " + JSON.stringify(data))
    }
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
