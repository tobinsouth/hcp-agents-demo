import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

// Simple wrapper function for getting context
async function getContext() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(baseUrl + '/api/hcp?endpoint=context')
  if (response.ok) {
    return await response.json()
  }
  return {}
}

// Analyze which context fields are likely being used based on the response
function analyzeContextUsage(response: string, contextData: any, scenario: string): string[] {
  const usedFields: string[] = []
  const responseLower = response.toLowerCase()
  
  // Scenario-specific analysis
  if (scenario === 'washing-machine') {
    // Check for housing/space references
    if (responseLower.includes('27') || responseLower.includes('inch') || responseLower.includes('space') || responseLower.includes('closet')) {
      usedFields.push('housing_situation.laundry_constraints')
    }
    if (responseLower.includes('electrical') || responseLower.includes('15-amp') || responseLower.includes('water pressure')) {
      usedFields.push('housing_situation.building_requirements')
    }
    if (responseLower.includes('energy') || responseLower.includes('star') || responseLower.includes('efficient')) {
      usedFields.push('shopping_preferences.brand_preferences')
    }
    if (responseLower.includes('deliver') || responseLower.includes('stairs') || responseLower.includes('install')) {
      usedFields.push('shopping_preferences.delivery_requirements')
    }
    if (responseLower.includes('budget') || responseLower.includes('$') || responseLower.includes('price') || responseLower.includes('cost')) {
      usedFields.push('shopping_preferences.budget')
    }
  } else if (scenario === 'home-loan') {
    // Check for financial references
    if (responseLower.includes('mortgage') || responseLower.includes('6.8%') || responseLower.includes('412') || responseLower.includes('wells fargo')) {
      usedFields.push('financial.current_mortgage')
    }
    if (responseLower.includes('650') || responseLower.includes('redwood') || responseLower.includes('property')) {
      usedFields.push('financial.property_details')
    }
    if (responseLower.includes('payment') || responseLower.includes('2950') || responseLower.includes('2600') || responseLower.includes('cash out')) {
      usedFields.push('financial.financial_goals')
    }
    if (responseLower.includes('credit') || responseLower.includes('785') || responseLower.includes('payment history')) {
      usedFields.push('financial.payment_history')
    }
  } else if (scenario === 'healthcare') {
    // Check for health references
    if (responseLower.includes('bmi') || responseLower.includes('diabetes') || responseLower.includes('a1c') || responseLower.includes('hypertension')) {
      usedFields.push('health.current_conditions')
    }
    if (responseLower.includes('insurance') || responseLower.includes('blue shield') || responseLower.includes('deductible')) {
      usedFields.push('health.insurance_coverage')
    }
    if (responseLower.includes('family history') || responseLower.includes('weight loss')) {
      usedFields.push('health.medical_history')
    }
  }
  
  // Always check for personal info usage
  if (responseLower.includes('bob') || responseLower.includes('north')) {
    usedFields.push('personal.name')
  }
  if (responseLower.includes('stanford') || responseLower.includes('research fellow')) {
    usedFields.push('personal.occupation')
  }
  if (responseLower.includes('san francisco') || responseLower.includes('mission') || responseLower.includes('apartment')) {
    usedFields.push('personal.location')
  }
  
  return [...new Set(usedFields)] // Remove duplicates
}

export async function POST(req: NextRequest) {
  try {
    const { agent, context, systemPrompt, model, conversationHistory, scenario } = await req.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    let finalSystemPrompt: string
    let contextData: any = {}

    if (agent === "my_agent") {
      // Use provided system prompt or build from preferences
      contextData = await getContext()
      if (systemPrompt) {
        finalSystemPrompt = `${systemPrompt}\n\nCurrent Context:\n${JSON.stringify(contextData, null, 2)}\n\nNegotiation Context: ${context}`
      } else {
        finalSystemPrompt = buildMyAgentPrompt(contextData, context)
      }
    } else {
      // Use provided system prompt for opponent
      finalSystemPrompt = `${systemPrompt}\n\nNegotiation Context: ${context}\n\nRespond as the other party in this negotiation. Keep responses concise but substantive.`
    }

    const { text } = await generateText({
      model: openrouter.chat(model || "openai/gpt-4o"),
      system: finalSystemPrompt,
      messages: conversationHistory,
      temperature: 0.7,
    })

    // Analyze context usage for my_agent responses
    let contextUsed: string[] = []
    if (agent === "my_agent") {
      contextUsed = analyzeContextUsage(text, contextData, scenario || 'washing-machine')
    }

    return NextResponse.json({ 
      text,
      contextUsed 
    })
  } catch (error) {
    console.error(`[Negotiate] Error for agent:`, error)
    return NextResponse.json(
      { error: "Failed to generate negotiation response" },
      { status: 500 }
    )
  }
}

function buildMyAgentPrompt(preferences: any, context: string): string {
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

  // Domain-specific preferences (e.g., furniture)
  if (preferences.domains?.furniture) {
    const furniture = preferences.domains.furniture
    prompt += `Furniture Preferences:\n`
    if (furniture.style_preferences?.length) {
      prompt += `- Preferred styles: ${furniture.style_preferences.join(", ")}\n`
    }
    if (furniture.material_preferences?.length) {
      prompt += `- Preferred materials: ${furniture.material_preferences.join(", ")}\n`
    }
    if (furniture.color_preferences?.length) {
      prompt += `- Preferred colors: ${furniture.color_preferences.join(", ")}\n`
    }
    if (furniture.functionality_priorities?.length) {
      prompt += `- Functionality priorities: ${furniture.functionality_priorities.join(", ")}\n`
    }
    if (furniture.room_types?.length) {
      prompt += `- Room types: ${furniture.room_types.join(", ")}\n`
    }
    prompt += "\n"
  }

  prompt += `Keep responses concise but substantive. Focus on finding mutually beneficial solutions while protecting your client's interests. Be strategic and professional.`

  return prompt
}