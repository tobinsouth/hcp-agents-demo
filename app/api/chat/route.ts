import { streamText, generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { hcp } from '@/lib/hcp/core'
import { grantAuthority } from '@/lib/hcp/grant-authority'
import type { PermissionValue } from '@/lib/hcp/types'

// Direct wrapper functions using HCP modules (no HTTP calls)
async function getContext() {
  return hcp.getContext()
}

async function getAuthority() {
  return grantAuthority.getAuthority()
}

async function checkPermission(key: string, operation: 'read' | 'write'): Promise<PermissionValue> {
  return grantAuthority.checkPermission(key, operation)
}

async function updateContext(data: any) {
  // Check write permissions for each key being updated
  const filteredData: any = {}
  const writeAccess = {
    allowed: [] as string[],
    requested: [] as string[],
    denied: [] as string[]
  }
  
  for (const [key, value] of Object.entries(data)) {
    const permission = grantAuthority.checkPermission(key, 'write')
    
    if (grantAuthority.isAllowed(permission)) {
      // Permission granted, include in update
      filteredData[key] = value
      writeAccess.allowed.push(key)
      console.log(`[Context] Write allowed for key: ${key}`)
    } else if (grantAuthority.needsConfirmation(permission)) {
      // Would normally prompt user, but for demo we'll allow with logging
      filteredData[key] = value
      writeAccess.allowed.push(key)
      console.log(`[Context] Write permission requested for key: ${key} (auto-granted for demo)`)
    } else {
      // Permission denied, skip this key
      writeAccess.denied.push(key)
      console.log(`[Context] Write denied for key: ${key}`)
    }
  }
  
  // Only update if we have permitted data
  if (Object.keys(filteredData).length > 0) {
    hcp.updateContext(filteredData)
  }
  
  return writeAccess
}

async function extractPreferencesAndContext(messages: any[]) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  // Get current context with permission filtering
  const fullContext = await getContext()
  const currentContext: any = {}
  
  // Filter context based on read permissions before using it for extraction
  for (const [key, value] of Object.entries(fullContext)) {
    const permission = grantAuthority.checkPermission(key, 'read')
    if (grantAuthority.isAllowed(permission) || grantAuthority.needsConfirmation(permission)) {
      currentContext[key] = value
    }
  }
  
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

    let preferencesWriteAccess = null
    if (Object.keys(preferences).length > 0) {
      preferencesWriteAccess = await updateContext(preferences)
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

    let behavioralWriteAccess = null
    if (Object.keys(behavioralContext).length > 0) {
      behavioralWriteAccess = await updateContext(behavioralContext)
      console.log("[Context] Updated context with behavioral insights")
    }

    // Combine write access information
    const allWriteKeys = [
      ...(preferencesWriteAccess?.allowed || []),
      ...(behavioralWriteAccess?.allowed || [])
    ]
    
    return {
      allowed: allWriteKeys,
      requested: [],
      denied: [
        ...(preferencesWriteAccess?.denied || []),
        ...(behavioralWriteAccess?.denied || [])
      ]
    }
  } catch (error) {
    console.error("[Context] Error extracting context:", error)
    return { allowed: [], requested: [], denied: [] }
  }
}

export async function POST(request: Request) {
  const { messages, approvedPermissions = [] } = await request.json()

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  })

  // Get current context for the AI with permission filtering
  const fullContext = await getContext()
  const authority = await getAuthority()
  
  // Track context access for UI display
  const contextAccess = {
    allowed: [] as string[],
    requested: [] as string[],
    denied: [] as string[]
  }
  
  // Filter context based on read permissions
  const filteredContext: any = {}
  for (const [key, value] of Object.entries(fullContext)) {
    const permission = grantAuthority.checkPermission(key, 'read')
    
    if (grantAuthority.isAllowed(permission)) {
      filteredContext[key] = value
      contextAccess.allowed.push(key)
    } else if (grantAuthority.needsConfirmation(permission)) {
      // Check if user has approved this permission for this session
      if (approvedPermissions.includes(key)) {
        filteredContext[key] = value
        contextAccess.allowed.push(key)
        console.log(`[Context] Read permission approved by user for key: ${key}`)
      } else {
        // Don't include in context, mark as needing approval
        contextAccess.requested.push(key)
        console.log(`[Context] Read permission needed for key: ${key}`)
      }
    } else {
      contextAccess.denied.push(key)
      console.log(`[Context] Read access denied for key: ${key}`)
    }
  }
  
  // Build context-aware system prompt
  const contextSummary = filteredContext && Object.keys(filteredContext).length > 0
    ? `User Context Available (filtered by permissions):
${JSON.stringify(filteredContext, null, 2)}

Use this context to personalize your responses when relevant.`
    : "No accessible user context available."

  const systemPrompt = `You are a helpful AI assistant engaged in building understanding of the user through natural conversation.

${contextSummary}

Guidelines:
- Be conversational and natural
- Pay attention to user preferences and communication style
- Adapt your responses based on the context you learn
- Help the user explore topics they're interested in
- Build context through organic conversation rather than direct questioning`

  // Track write access for context extraction
  let writeAccess: any = null
  
  // Extract context in the background (don't await)
  if (messages.length >= 2) {
    extractPreferencesAndContext(messages).then(result => {
      writeAccess = result
    }).catch(error => {
      console.error("[Context] Background extraction error:", error)
    })
  }

  // Create a custom stream that includes metadata
  const encoder = new TextEncoder()
  const customStream = new ReadableStream({
    async start(controller) {
      // Send context access metadata first
      const metadata = JSON.stringify({
        type: 'context_access',
        data: { ...contextAccess, write: writeAccess }
      })
      controller.enqueue(encoder.encode(`[METADATA]${metadata}[/METADATA]`))
      
      // Then stream the actual response
      const result = streamText({
        model: openrouter.chat("openai/gpt-4o-mini"),
        system: systemPrompt,
        messages,
        temperature: 0.85,
        maxRetries: 2,
      })
      
      const reader = result.toTextStreamResponse().body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
        }
      }
      controller.close()
    }
  })

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}