/**
 * Preference Database Management
 *
 * This module handles the storage and management of user preferences
 * generated through chat interactions. Preferences are stored as a
 * nested JSON structure and can be updated in real-time.
 */

export interface PreferenceData {
  // Core behavioral patterns (general across all domains)
  communication_style?: {
    formality?: "formal" | "casual" | "mixed"
    directness?: "direct" | "diplomatic" | "balanced"
    tone?: "friendly" | "professional" | "assertive"
  }
  decision_making?: {
    risk_tolerance?: "conservative" | "moderate" | "aggressive"
    information_needs?: "minimal" | "standard" | "comprehensive"
    consultation_style?: "independent" | "collaborative" | "consensus"
  }
  values?: {
    sustainability?: "high" | "medium" | "low"
    innovation?: "cutting_edge" | "proven" | "conservative"
    transparency?: "full" | "standard" | "minimal"
  }
  
  // Negotiation-specific preferences (legacy support)
  negotiation_priorities?: {
    price_sensitivity?: "high" | "medium" | "low"
    timeline_flexibility?: "rigid" | "flexible" | "very_flexible"
    quality_importance?: "critical" | "important" | "moderate"
    relationship_focus?: "transactional" | "partnership" | "long_term"
  }
  constraints?: {
    budget_range?: string
    timeline?: string
    technical_requirements?: string[]
    compliance_needs?: string[]
  }

  // Dynamic domain-specific preferences (new flexible system)
  domains?: {
    furniture?: {
      style_preferences?: string[]
      material_preferences?: string[]
      size_constraints?: string
      color_preferences?: string[]
      functionality_priorities?: string[]
      budget_range?: string
      room_types?: string[]
      brand_preferences?: string[]
      quality_vs_price?: "quality_focused" | "price_focused" | "balanced"
      sustainability_importance?: "high" | "medium" | "low"
    }
    food?: {
      dietary_restrictions?: string[]
      cuisine_preferences?: string[]
      spice_tolerance?: "none" | "mild" | "medium" | "high" | "extreme"
      cooking_skill_level?: "beginner" | "intermediate" | "advanced"
      meal_prep_time?: "quick" | "moderate" | "long"
      health_priorities?: string[]
      budget_consciousness?: "high" | "medium" | "low"
    }
    travel?: {
      preferred_destinations?: string[]
      travel_style?: "budget" | "luxury" | "mid_range" | "adventure" | "relaxation"
      group_size_preference?: "solo" | "couple" | "small_group" | "large_group"
      accommodation_type?: string[]
      activity_preferences?: string[]
      season_preferences?: string[]
    }
    technology?: {
      device_preferences?: string[]
      platform_preferences?: string[]
      feature_priorities?: string[]
      privacy_concerns?: "high" | "medium" | "low"
      early_adopter?: boolean
      brand_loyalty?: string[]
    }
    // Dynamic - new domains can be added as conversations evolve
    [key: string]: Record<string, any>
  }

  // Conversation insights and patterns
  conversation_patterns?: {
    topics_of_interest?: string[]
    frequently_mentioned_brands?: string[]
    decision_triggers?: string[]
    pain_points?: string[]
    goals_mentioned?: string[]
    past_experiences?: string[]
  }

  last_updated?: string
  version?: string
}

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
let preferences: PreferenceData = {}

// Subscribers for real-time updates
type PreferenceSubscriber = (preferences: PreferenceData) => void
const subscribers: Set<PreferenceSubscriber> = new Set()

/**
 * Deep merge helper function to properly combine nested objects and arrays
 */
function deepMerge(target: any, source: any): any {
  if (!source) return target
  if (!target) return source
  
  // Handle arrays - concatenate and deduplicate
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...new Set([...target, ...source])]
  }
  
  // Handle objects - recursive merge
  if (typeof target === 'object' && typeof source === 'object' && !Array.isArray(target) && !Array.isArray(source)) {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (key in result) {
          result[key] = deepMerge(result[key], source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }
  
  // For primitives and type mismatches, source overwrites target
  return source
}

/**
 * Updates the preference database with new data
 * This function is called by the AI chat system when preferences are extracted
 */
export function updatePreferences(updates: Partial<PreferenceData>): void {
  // Deep merge the updates with existing preferences
  preferences = deepMerge(preferences, updates)
  preferences.last_updated = new Date().toISOString()
  preferences.version = (preferences.version || "1.0.0")

  // Notify all subscribers of the update
  subscribers.forEach((subscriber) => subscriber(preferences))

  console.log("[Preferences] Updated:", updates)
  console.log("[Preferences] Merged result:", preferences)
}

/**
 * Retrieves the current preference data
 */
export function getPreferences(): PreferenceData {
  return { ...preferences }
}

/**
 * Subscribes to preference updates for real-time UI updates
 */
export function subscribeToPreferences(callback: PreferenceSubscriber): () => void {
  subscribers.add(callback)

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback)
  }
}

/**
 * Clears all preferences (useful for testing/demo reset)
 */
export function clearPreferences(): void {
  preferences = {}
  subscribers.forEach((subscriber) => subscriber(preferences))
}

/**
 * Creates a flexible preference update function for OpenRouter API calls
 * This allows the AI to extract and structure any type of preferences
 */
export function createPreferenceUpdatePrompt(chatHistory: any[], currentPreferences: PreferenceData): string {
  return `
You are a preference extraction specialist. Analyze the chat conversation and the current preference database, then update the preferences based on new information revealed in the conversation.

Current Preference Database:
${JSON.stringify(currentPreferences, null, 2)}

Chat History:
${JSON.stringify(chatHistory, null, 2)}

Instructions:
1. Look for ANY preferences, opinions, or patterns the user mentions
2. Organize them into the appropriate categories (communication_style, decision_making, values, domains, conversation_patterns)
3. For domain-specific preferences (furniture, food, travel, etc.), create new domain entries as needed
4. Only include new or updated information - don't repeat existing preferences unless they conflict
5. Be creative with domain categorization but keep it logical
6. Return ONLY a valid JSON object that can be merged with existing preferences

Focus on extracting:
- Communication style and behavioral patterns
- Decision-making preferences  
- Personal values and priorities
- Domain-specific preferences (furniture style, food preferences, travel habits, etc.)
- Brand preferences, past experiences, pain points
- Budget considerations and constraints

Return a JSON object with only the NEW or UPDATED preference fields:
`
}

/**
 * Legacy function schema for backward compatibility
 * This is used by the chat API for structured preference updates
 */
export const updatePreferencesSchema = {
  name: "update_preferences",
  description: "Update user preferences based on chat conversation. This is a flexible system that can capture preferences across any domain.",
  parameters: {
    type: "object",
    properties: {
      communication_style: {
        type: "object",
        properties: {
          formality: { type: "string", enum: ["formal", "casual", "mixed"] },
          directness: { type: "string", enum: ["direct", "diplomatic", "balanced"] },
          tone: { type: "string", enum: ["friendly", "professional", "assertive"] },
        },
      },
      decision_making: {
        type: "object",
        properties: {
          risk_tolerance: { type: "string", enum: ["conservative", "moderate", "aggressive"] },
          information_needs: { type: "string", enum: ["minimal", "standard", "comprehensive"] },
          consultation_style: { type: "string", enum: ["independent", "collaborative", "consensus"] },
        },
      },
      values: {
        type: "object",
        properties: {
          sustainability: { type: "string", enum: ["high", "medium", "low"] },
          innovation: { type: "string", enum: ["cutting_edge", "proven", "conservative"] },
          transparency: { type: "string", enum: ["full", "standard", "minimal"] },
        },
      },
      domains: {
        type: "object",
        description: "Domain-specific preferences - can include furniture, food, travel, technology, etc.",
        additionalProperties: {
          type: "object",
          additionalProperties: true
        }
      },
      conversation_patterns: {
        type: "object",
        properties: {
          topics_of_interest: { type: "array", items: { type: "string" } },
          frequently_mentioned_brands: { type: "array", items: { type: "string" } },
          decision_triggers: { type: "array", items: { type: "string" } },
          pain_points: { type: "array", items: { type: "string" } },
          goals_mentioned: { type: "array", items: { type: "string" } },
          past_experiences: { type: "array", items: { type: "string" } },
        },
      },
      negotiation_priorities: {
        type: "object",
        properties: {
          price_sensitivity: { type: "string", enum: ["high", "medium", "low"] },
          timeline_flexibility: { type: "string", enum: ["rigid", "flexible", "very_flexible"] },
          quality_importance: { type: "string", enum: ["critical", "important", "moderate"] },
          relationship_focus: { type: "string", enum: ["transactional", "partnership", "long_term"] },
        },
      },
      constraints: {
        type: "object",
        properties: {
          budget_range: { type: "string" },
          timeline: { type: "string" },
          technical_requirements: { type: "array", items: { type: "string" } },
          compliance_needs: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
}
