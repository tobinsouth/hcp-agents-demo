import { streamText, generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

// Simple wrapper functions for the HCP API
async function getContext() {
  const response = await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/hcp?endpoint=context')
  if (response.ok) {
    return await response.json()
  }
  return {}
}

async function updateContext(data: any) {
  await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/hcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update-context',
      data
    })
  })
}

async function extractPreferencesAndContext(messages: any[]) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  const currentContext = await getContext()
  
  try {
    console.log("[Context] Starting preference and context extraction...")
    
    // Extract preferences
    const prefResult = await generateText({
      model: openrouter.chat("openai/gpt-4o-mini"),
      system: `You are a preference extraction specialist. Analyze the chat conversation and extract user preferences.

IMPORTANT: The preferences you return will be MERGED with existing preferences, not replaced. Return only NEW information or UPDATES to existing information.

Current context is shown below. Return only NEW information or UPDATES to existing information.
${JSON.stringify(currentContext, null, 2)}

Return a JSON object with any preferences or context information you can extract from the conversation.`,
      messages,
    })

    const preferences = JSON.parse(prefResult.text || "{}")
    console.log("[Context] Extracted preferences:", preferences)

    if (Object.keys(preferences).length > 0) {
      await updateContext(preferences)
      console.log("[Context] Updated context with new preferences")
    }

    // Extract behavioral context
    const contextResult = await generateText({
      model: openrouter.chat("openai/gpt-4o-mini"),
      system: `You are a behavioral analysis specialist. Analyze the conversation to understand user behavior patterns and interaction style.

Extract behavioral insights such as:
- Communication patterns (formality, directness, detail level)
- Decision-making style (analytical, intuitive, collaborative)
- Information processing preferences
- Domain expertise indicators
- Interaction patterns

Current context: ${JSON.stringify(currentContext, null, 2)}

Return a JSON object with behavioral insights. Structure it under a "behavioral" key with appropriate sub-categories.`,
      messages,
    })

    const behavioralContext = JSON.parse(contextResult.text || "{}")
    console.log("[Context] Extracted behavioral context:", behavioralContext)

    if (Object.keys(behavioralContext).length > 0) {
      await updateContext(behavioralContext)
      console.log("[Context] Updated context with behavioral insights")
    }

    return { preferences, behavioralContext }
  } catch (error) {
    console.error("[Context] Error extracting context:", error)
    return { preferences: {}, behavioralContext: {} }
  }
}

export async function POST(request: Request) {
  const { messages } = await request.json()

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  // Get current context for the AI
  const currentContext = await getContext()
  
  // Build context-aware system prompt
  const contextSummary = currentContext && Object.keys(currentContext).length > 0
    ? `User Context Available:
${JSON.stringify(currentContext, null, 2)}

Use this context to personalize your responses when relevant.`
    : "No user context available yet."

  const systemPrompt = `You are a helpful AI assistant engaged in building understanding of the user through natural conversation.

${contextSummary}

Guidelines:
- Be conversational and natural
- Pay attention to user preferences and communication style
- Adapt your responses based on the context you learn
- Help the user explore topics they're interested in
- Build context through organic conversation rather than direct questioning`

  // Extract context in the background (don't await)
  if (messages.length >= 2) {
    extractPreferencesAndContext(messages).catch(error => {
      console.error("[Context] Background extraction error:", error)
    })
  }

  // Stream the response
  const result = streamText({
    model: openrouter.chat("openai/gpt-4o-mini"),
    system: systemPrompt,
    messages,
    temperature: 0.85,
    maxRetries: 2,
  })

  return result.toTextStreamResponse()
}