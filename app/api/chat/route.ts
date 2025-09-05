import { streamText, generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { getPreferences, updatePreferences } from "@/lib/preferences"
import { 
  getFilteredHumanContext, 
  updateHumanContext, 
  extractContextFromConversation,
  getContextSummary,
  type HumanContext 
} from "@/lib/human-context"

async function extractPreferencesAndContext(messages: any[]) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  const currentPreferences = getPreferences()
  const currentContext = getFilteredHumanContext("chat-system")
  
  try {
    console.log("[Context] Starting preference and context extraction...")
    
    // Extract preferences (existing logic)
    const prefResult = await generateText({
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

    console.log("[Preferences] Extracted text:", prefResult.text)
    
    try {
      // Parse and update preferences
      const extractedPrefs = JSON.parse(prefResult.text)
      
      if (Object.keys(extractedPrefs).length > 0) {
        updatePreferences(extractedPrefs)
        console.log("[Preferences] Updated preference database with:", extractedPrefs)
      }
    } catch (parseError) {
      console.error("[Preferences] Error parsing JSON:", parseError)
    }

    // Extract human context using AI
    const contextResult = await generateText({
      model: openrouter.chat("openai/gpt-4o-mini"),
      system: `You are a human context analyst. Analyze the conversation to extract comprehensive human context information.

Extract information about:
1. Behavioral patterns (interaction style, learning style, work patterns)
2. Cognitive preferences (problem-solving approach, detail orientation, planning horizon)
3. Task preferences (automation comfort, delegation style, feedback preference)
4. Communication patterns (response length preference, formality level)
5. Topics of interest and expertise areas

Return a JSON object with extracted context. Be specific and detailed.

Example structure:
{
  "behavioral_patterns": {
    "interaction_style": {
      "response_length": "detailed",
      "humor_appreciation": "moderate",
      "formality_level": 7
    }
  },
  "cognitive_preferences": {
    "problem_solving_approach": "systematic",
    "detail_orientation": "high"
  },
  "interaction_history": {
    "topics_discussed": [
      {"topic": "furniture", "frequency": 3, "sentiment": "positive"}
    ]
  }
}`,
      messages: [
        {
          role: "user",
          content: `Current context: ${JSON.stringify(currentContext, null, 2)}

Recent conversation: ${JSON.stringify(messages.slice(-6), null, 2)}

Extract human context information from this conversation. Return a valid JSON object.`
        }
      ]
    })

    console.log("[Context] Extracted context:", contextResult.text)
    
    try {
      // Parse and update human context
      const extractedContext = JSON.parse(contextResult.text)
      
      if (Object.keys(extractedContext).length > 0) {
        updateHumanContext(extractedContext, "chat-system", true)
        console.log("[Context] Updated human context with:", extractedContext)
      }
    } catch (parseError) {
      console.error("[Context] Error parsing context JSON:", parseError)
    }

    // Also do simple extraction from conversation patterns
    const simpleContext = await extractContextFromConversation(messages, "chat-system")
    if (Object.keys(simpleContext).length > 0) {
      updateHumanContext(simpleContext, "chat-system", true)
      console.log("[Context] Updated with simple extraction:", simpleContext)
    }

  } catch (error) {
    console.error("[Context] Error extracting preferences and context:", error)
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
    
    // Get the current human context for the chat client
    const humanContext = getFilteredHumanContext("claude-assistant")
    const contextSummary = getContextSummary(humanContext)
    
    console.log("[Chat] Using human context:", contextSummary)
    
    // Build a context-aware system prompt
    const systemPrompt = `You are a helpful assistant that engages in natural conversation while being attentive to user preferences and needs.

IMPORTANT: You have access to the user's human context data, which helps you personalize responses.

Current Human Context Summary:
${contextSummary}

Detailed Context:
${JSON.stringify(humanContext, null, 2)}

Use this context to:
1. Adapt your communication style to match their preferences
2. Reference their interests and past topics naturally
3. Provide examples relevant to their domains of interest
4. Respect their cognitive and task preferences
5. Build on previous interactions to show continuity

Be conversational and helpful. Ask follow-up questions when appropriate to better understand the user's preferences, needs, and decision-making style. Pay attention to:
- What they like and dislike
- How they make decisions
- Their values and priorities
- Domain-specific preferences (furniture, food, travel, technology, etc.)
- Past experiences and pain points

Don't be too obvious about collecting preferences - just have natural conversations that reveal these insights.

When you learn something new about the user, acknowledge it subtly to show you're paying attention.`

    const result = streamText({
      model: openrouter.chat("openai/gpt-4o"),
      system: systemPrompt,
      messages,
    })

    // Extract preferences and context asynchronously after starting the stream
    // This happens in parallel with the response streaming
    extractPreferencesAndContext(messages).catch(error => {
      console.error("[Context] Background context extraction failed:", error)
    })

    console.log("[Chat] StreamText result created with human context, returning response")
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[Chat] API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
