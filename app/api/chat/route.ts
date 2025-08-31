import { streamText, generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { getPreferences, updatePreferences } from "@/lib/preferences"

async function extractPreferences(messages: any[]) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  const currentPreferences = getPreferences()
  
  try {
    console.log("[Preferences] Starting preference extraction...")
    
    const result = await generateText({
      model: openrouter.chat("openai/gpt-4o-mini"),
      system: `You are a preference extraction specialist. Analyze the chat conversation and extract user preferences.

IMPORTANT: The preferences you return will be MERGED with existing preferences, not replaced. Arrays will be concatenated and deduplicated. Objects will be deep merged.

Current preferences are shown below. Return only NEW information or UPDATES to existing information.

Look for:
- Communication style and behavioral patterns
- Decision-making preferences
- Personal values and priorities  
- Domain-specific preferences (furniture, food, travel, technology, etc.)
- Brand preferences, past experiences, pain points
- Budget considerations and constraints

For domains, be creative but logical. Examples:
- If they mention furniture styles, ADD to the "furniture" domain
- If they talk about food preferences, ADD to the "food" domain
- If they discuss travel, ADD to the "travel" domain

Return ONLY a valid JSON object with the NEW information that should be merged into the preference database. Include only fields that have new information to add or update. 

Example output:
{
  "domains": {
    "furniture": {
      "style_preferences": ["modern", "minimalist"],
      "material_preferences": ["bamboo", "recycled wood"],
      "budget_range": "$5000"
    }
  },
  "values": {
    "sustainability": "high"
  }
}`,
      messages: [
        {
          role: "user",
          content: `Current preferences: ${JSON.stringify(currentPreferences, null, 2)}

Recent conversation: ${JSON.stringify(messages.slice(-6), null, 2)}

Extract only NEW preference information from this conversation. Return a valid JSON object.`
        }
      ]
    })

    console.log("[Preferences] Extracted text:", result.text)
    
    try {
      // Parse the JSON response
      const extractedPrefs = JSON.parse(result.text)
      
      if (Object.keys(extractedPrefs).length > 0) {
        updatePreferences(extractedPrefs)
        console.log("[Preferences] Updated preference database with:", extractedPrefs)
      } else {
        console.log("[Preferences] No new preferences found")
      }
    } catch (parseError) {
      console.error("[Preferences] Error parsing JSON:", parseError)
      console.log("[Preferences] Raw response:", result.text)
    }
  } catch (error) {
    console.error("[Preferences] Error extracting preferences:", error)
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  try {
    console.log("[Chat] Processing chat request with messages:", messages)
    console.log("[Chat] API Key present:", !!process.env.OPENROUTER_API_KEY)
    
    const result = streamText({
      model: openrouter.chat("openai/gpt-4o"),
      system: `You are a helpful assistant that engages in natural conversation while being attentive to user preferences and needs.

Be conversational and helpful. Ask follow-up questions when appropriate to better understand the user's preferences, needs, and decision-making style. Pay attention to:
- What they like and dislike
- How they make decisions
- Their values and priorities
- Domain-specific preferences (furniture, food, travel, technology, etc.)
- Past experiences and pain points

Don't be too obvious about collecting preferences - just have natural conversations that reveal these insights.`,
      messages,
    })

    // Extract preferences asynchronously after starting the stream
    // This happens in parallel with the response streaming
    extractPreferences(messages).catch(error => {
      console.error("[Preferences] Background preference extraction failed:", error)
    })

    console.log("[Chat] StreamText result created, returning response")
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[Chat] API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
