/**
 * Human Context Management System
 * 
 * This module manages comprehensive human context data that represents
 * the user's full behavioral, preference, and interaction patterns.
 * It integrates with the grant authority system to control access.
 */

import { getPreferences, type PreferenceData } from './preferences'
import { checkClientAccess, getFilteredPreferences } from './grant-authority'

export interface HumanContext {
  // Identity and Personal Information
  identity?: {
    name?: string
    role?: string
    organization?: string
    timezone?: string
    language_preferences?: string[]
  }

  // Behavioral Patterns
  behavioral_patterns?: {
    interaction_style?: {
      preferred_greeting?: string
      response_length?: "concise" | "detailed" | "balanced"
      humor_appreciation?: "high" | "moderate" | "low"
      formality_level?: number // 1-10 scale
    }
    learning_style?: {
      visual_preference?: boolean
      examples_needed?: "many" | "some" | "few"
      abstraction_level?: "concrete" | "mixed" | "abstract"
    }
    work_patterns?: {
      peak_hours?: string[]
      break_frequency?: "frequent" | "moderate" | "rare"
      multitasking_preference?: boolean
    }
  }

  // Cognitive Preferences
  cognitive_preferences?: {
    problem_solving_approach?: "systematic" | "intuitive" | "hybrid"
    detail_orientation?: "high" | "medium" | "low"
    planning_horizon?: "short_term" | "medium_term" | "long_term"
    uncertainty_tolerance?: "low" | "moderate" | "high"
  }

  // Interaction History
  interaction_history?: {
    topics_discussed?: Array<{
      topic: string
      frequency: number
      last_discussed: string
      sentiment: "positive" | "neutral" | "negative"
    }>
    common_questions?: string[]
    preferred_examples?: string[]
    avoided_topics?: string[]
  }

  // Task Preferences
  task_preferences?: {
    automation_comfort?: "high" | "selective" | "minimal"
    delegation_style?: "detailed_instructions" | "outcome_focused" | "hands_off"
    feedback_preference?: "continuous" | "milestone_based" | "final_only"
    error_tolerance?: "zero_tolerance" | "learning_oriented" | "experimental"
  }

  // Domain Knowledge
  domain_expertise?: {
    technical_areas?: Array<{
      domain: string
      proficiency: "expert" | "intermediate" | "beginner"
      years_experience?: number
    }>
    industry_knowledge?: string[]
    tools_used?: string[]
    certifications?: string[]
  }

  // Communication Metadata
  communication_metadata?: {
    average_session_length?: number
    typical_response_time?: number
    preferred_channels?: string[]
    notification_preferences?: {
      urgency_threshold?: "all" | "important" | "critical"
      quiet_hours?: { start: string; end: string }
    }
  }

  // Preferences (from existing preference system)
  preferences?: PreferenceData

  // Context Metadata
  metadata?: {
    version: string
    created_at: string
    last_updated: string
    update_count: number
    confidence_scores?: {
      [key: string]: number // 0-1 confidence for each section
    }
  }
}

// In-memory storage for demo
let humanContext: HumanContext = {
  metadata: {
    version: "1.0.0",
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    update_count: 0,
    confidence_scores: {}
  }
}

// Subscribers for real-time updates
type ContextSubscriber = (context: HumanContext) => void
const subscribers: Set<ContextSubscriber> = new Set()

// Context access log for audit trail
interface ContextAccessLog {
  timestamp: string
  clientId: string
  action: "read" | "write" | "update"
  sections: string[]
  success: boolean
  filtered?: boolean
}

const accessLog: ContextAccessLog[] = []

/**
 * Deep merge helper (similar to preferences but handles nested arrays better)
 */
function deepMergeContext(target: any, source: any): any {
  if (!source) return target
  if (!target) return source

  // Handle arrays with deduplication for simple values
  if (Array.isArray(target) && Array.isArray(source)) {
    // For arrays of objects, merge by a key if possible
    if (source.length > 0 && typeof source[0] === 'object') {
      return [...target, ...source] // For now, just concatenate
    }
    // For simple arrays, deduplicate
    return [...new Set([...target, ...source])]
  }

  // Handle objects
  if (typeof target === 'object' && typeof source === 'object' && 
      !Array.isArray(target) && !Array.isArray(source)) {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (key in result) {
          result[key] = deepMergeContext(result[key], source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  // For primitives, source overwrites
  return source
}

/**
 * Gets the full human context (for authorized clients)
 */
export function getHumanContext(clientId: string = "system"): HumanContext {
  // Log access attempt
  logAccess(clientId, "read", ["all"], true)

  // Merge current preferences into context
  const currentPreferences = getPreferences()
  
  return {
    ...humanContext,
    preferences: currentPreferences
  }
}

/**
 * Gets filtered human context based on client permissions
 */
export function getFilteredHumanContext(clientId: string): Partial<HumanContext> {
  const fullContext = getHumanContext("system")
  const filtered: Partial<HumanContext> = {}

  // Check each section permission
  const sections = [
    'identity',
    'behavioral_patterns', 
    'cognitive_preferences',
    'interaction_history',
    'task_preferences',
    'domain_expertise',
    'communication_metadata'
  ]

  const allowedSections: string[] = []

  for (const section of sections) {
    // For now, we'll allow all sections for demo
    // In production, this would check grant authority
    if (checkClientAccess(clientId, 'communication_style')) {
      const sectionKey = section as keyof HumanContext
      const sectionData = fullContext[sectionKey]
      if (sectionData !== undefined) {
        (filtered as any)[sectionKey] = sectionData
        allowedSections.push(section)
      }
    }
  }

  // Always include filtered preferences based on grant authority
  filtered.preferences = getFilteredPreferences(clientId, fullContext.preferences || {})
  
  // Include metadata
  filtered.metadata = fullContext.metadata

  logAccess(clientId, "read", allowedSections, true, true)

  return filtered
}

/**
 * Updates the human context with new information
 */
export function updateHumanContext(
  updates: Partial<HumanContext>, 
  clientId: string = "system",
  merge: boolean = true
): void {
  const sections = Object.keys(updates).filter(k => k !== 'metadata')
  
  if (merge) {
    // Deep merge updates
    humanContext = deepMergeContext(humanContext, updates)
  } else {
    // Replace sections
    humanContext = {
      ...humanContext,
      ...updates
    }
  }

  // Update metadata
  humanContext.metadata = {
    version: humanContext.metadata?.version || "1.0.0",
    created_at: humanContext.metadata?.created_at || new Date().toISOString(),
    ...humanContext.metadata,
    last_updated: new Date().toISOString(),
    update_count: (humanContext.metadata?.update_count || 0) + 1
  }

  // Log the update
  logAccess(clientId, "update", sections, true)

  // Notify subscribers
  subscribers.forEach(subscriber => subscriber(humanContext))

  console.log(`[HumanContext] Updated by ${clientId}:`, sections)
}

/**
 * Extracts context from a conversation
 */
export async function extractContextFromConversation(
  messages: any[],
  clientId: string = "chat-system"
): Promise<Partial<HumanContext>> {
  // This is a simplified extraction - in production, this would use AI
  const extracted: Partial<HumanContext> = {}

  // Analyze message patterns
  const userMessages = messages.filter(m => m.role === 'user')
  
  if (userMessages.length > 0) {
    // Calculate average message length
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length
    
    // Determine response length preference
    let responseLength: "concise" | "detailed" | "balanced" = "balanced"
    if (avgLength < 50) responseLength = "concise"
    else if (avgLength > 200) responseLength = "detailed"

    extracted.behavioral_patterns = {
      interaction_style: {
        response_length: responseLength,
        formality_level: analyzeFormality(userMessages)
      }
    }

    // Extract topics
    const topics = extractTopics(userMessages)
    if (topics.length > 0) {
      extracted.interaction_history = {
        topics_discussed: topics.map(topic => ({
          topic,
          frequency: 1,
          last_discussed: new Date().toISOString(),
          sentiment: "neutral" as const
        }))
      }
    }

    // Update communication metadata
    extracted.communication_metadata = {
      average_session_length: messages.length,
      typical_response_time: Date.now() // Simplified
    }
  }

  return extracted
}

/**
 * Analyzes formality level from messages
 */
function analyzeFormality(messages: any[]): number {
  // Simple heuristic - check for formal indicators
  const formalIndicators = ['please', 'thank you', 'could you', 'would you', 'kindly']
  const informalIndicators = ['hey', 'yeah', 'gonna', 'wanna', 'lol', 'btw']
  
  let formalCount = 0
  let informalCount = 0
  
  messages.forEach(msg => {
    const lower = msg.content.toLowerCase()
    formalIndicators.forEach(indicator => {
      if (lower.includes(indicator)) formalCount++
    })
    informalIndicators.forEach(indicator => {
      if (lower.includes(indicator)) informalCount++
    })
  })

  // Return a score from 1-10
  const total = formalCount + informalCount
  if (total === 0) return 5
  
  const formalRatio = formalCount / total
  return Math.round(formalRatio * 10)
}

/**
 * Extracts topics from messages
 */
function extractTopics(messages: any[]): string[] {
  // Simple keyword extraction
  const keywords = new Set<string>()
  const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'in', 'to', 'for', 'of', 'with'])
  
  messages.forEach(msg => {
    // Extract words longer than 4 characters that aren't common
    const words = msg.content.toLowerCase().split(/\s+/)
    words.forEach((word: string) => {
      const cleaned = word.replace(/[^a-z]/g, '')
      if (cleaned.length > 4 && !commonWords.has(cleaned)) {
        keywords.add(cleaned)
      }
    })
  })

  return Array.from(keywords).slice(0, 5) // Return top 5 keywords as topics
}

/**
 * Logs context access for audit trail
 */
function logAccess(
  clientId: string,
  action: "read" | "write" | "update",
  sections: string[],
  success: boolean,
  filtered: boolean = false
): void {
  accessLog.push({
    timestamp: new Date().toISOString(),
    clientId,
    action,
    sections,
    success,
    filtered
  })

  // Keep only last 100 entries
  if (accessLog.length > 100) {
    accessLog.splice(0, accessLog.length - 100)
  }
}

/**
 * Gets the access log for audit purposes
 */
export function getAccessLog(): ContextAccessLog[] {
  return [...accessLog]
}

/**
 * Subscribes to context updates
 */
export function subscribeToHumanContext(callback: ContextSubscriber): () => void {
  subscribers.add(callback)
  
  return () => {
    subscribers.delete(callback)
  }
}

/**
 * Clears human context (for testing/demo reset)
 */
export function clearHumanContext(): void {
  humanContext = {
    metadata: {
      version: "1.0.0",
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      update_count: 0,
      confidence_scores: {}
    }
  }
  
  subscribers.forEach(subscriber => subscriber(humanContext))
}

/**
 * Creates a context summary for display
 */
export function getContextSummary(context: HumanContext): string {
  const sections = []
  
  if (context.identity?.name) {
    sections.push(`Identity: ${context.identity.name}`)
  }
  
  if (context.behavioral_patterns?.interaction_style) {
    const style = context.behavioral_patterns.interaction_style
    sections.push(`Interaction: ${style.response_length} responses, formality level ${style.formality_level}/10`)
  }
  
  if (context.cognitive_preferences) {
    sections.push(`Cognitive: ${context.cognitive_preferences.problem_solving_approach} problem solving`)
  }
  
  if (context.interaction_history?.topics_discussed) {
    const topics = context.interaction_history.topics_discussed.map(t => t.topic).slice(0, 3)
    sections.push(`Recent topics: ${topics.join(', ')}`)
  }
  
  if (context.preferences?.domains) {
    const domains = Object.keys(context.preferences.domains)
    if (domains.length > 0) {
      sections.push(`Domains: ${domains.join(', ')}`)
    }
  }
  
  return sections.join(' | ')
}

/**
 * Calculates context completeness score
 */
export function getContextCompleteness(context: HumanContext): number {
  const sections = [
    context.identity,
    context.behavioral_patterns,
    context.cognitive_preferences,
    context.interaction_history,
    context.task_preferences,
    context.domain_expertise,
    context.communication_metadata,
    context.preferences
  ]
  
  const filledSections = sections.filter(s => s && Object.keys(s).length > 0).length
  return Math.round((filledSections / sections.length) * 100)
}