/**
 * Preference Database Management
 *
 * This module handles the storage and management of user preferences
 * generated through chat interactions. Preferences are stored as a
 * nested JSON structure and can be updated in real-time.
 */

export interface PreferenceData {
  communication_style?: {
    formality?: "formal" | "casual" | "mixed"
    directness?: "direct" | "diplomatic" | "balanced"
    tone?: "friendly" | "professional" | "assertive"
  }
  negotiation_priorities?: {
    price_sensitivity?: "high" | "medium" | "low"
    timeline_flexibility?: "rigid" | "flexible" | "very_flexible"
    quality_importance?: "critical" | "important" | "moderate"
    relationship_focus?: "transactional" | "partnership" | "long_term"
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
  constraints?: {
    budget_range?: string
    timeline?: string
    technical_requirements?: string[]
    compliance_needs?: string[]
  }
  last_updated?: string
}

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
let preferences: PreferenceData = {}

// Subscribers for real-time updates
type PreferenceSubscriber = (preferences: PreferenceData) => void
const subscribers: Set<PreferenceSubscriber> = new Set()

/**
 * Updates the preference database with new data
 * This function is called by the AI chat system when preferences are extracted
 */
export function updatePreferences(updates: Partial<PreferenceData>): void {
  // Deep merge the updates with existing preferences
  preferences = {
    ...preferences,
    ...updates,
    last_updated: new Date().toISOString(),
  }

  // Notify all subscribers of the update
  subscribers.forEach((subscriber) => subscriber(preferences))

  console.log("[Preferences] Updated:", updates)
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
 * Function schema for AI model to call when updating preferences
 * This is used by the chat API to structure preference updates
 */
export const updatePreferencesSchema = {
  name: "update_preferences",
  description: "Update user preferences based on chat conversation",
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
      negotiation_priorities: {
        type: "object",
        properties: {
          price_sensitivity: { type: "string", enum: ["high", "medium", "low"] },
          timeline_flexibility: { type: "string", enum: ["rigid", "flexible", "very_flexible"] },
          quality_importance: { type: "string", enum: ["critical", "important", "moderate"] },
          relationship_focus: { type: "string", enum: ["transactional", "partnership", "long_term"] },
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
