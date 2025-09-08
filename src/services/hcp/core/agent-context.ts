/**
 * Agent Context Management
 * 
 * Generate and manage agent context strings.
 */

import type { AgentContext } from '../types'
import { hcp } from './core'

/**
 * Agent Context Manager
 */
export class AgentContextManager {
  private static instance: AgentContextManager

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AgentContextManager {
    if (!AgentContextManager.instance) {
      AgentContextManager.instance = new AgentContextManager()
    }
    return AgentContextManager.instance
  }

  /**
   * Generate a simple agent context
   */
  generateAgentContext(options?: {
    agent_id?: string
    purpose?: string
    includeUserContext?: boolean
  }): AgentContext {
    const { agent_id, purpose, includeUserContext = false } = options || {}
    
    let contextString = ''
    
    // Build context string based on options and current HCP context
    if (includeUserContext) {
      const userContext = hcp.getContext()
      
      // Extract relevant information from user context
      const contextParts: string[] = []
      
      if (userContext.name) {
        contextParts.push(`User: ${userContext.name}`)
      }
      
      if (userContext.preferences) {
        contextParts.push(`Preferences available`)
      }
      
      if (userContext.capabilities) {
        contextParts.push(`Capabilities defined`)
      }
      
      if (contextParts.length > 0) {
        contextString = contextParts.join(', ')
      }
    }
    
    if (purpose) {
      contextString = contextString 
        ? `${contextString}. Purpose: ${purpose}`
        : `Purpose: ${purpose}`
    }
    
    if (!contextString) {
      contextString = 'General agent context'
    }
    
    return {
      context: contextString,
      agent_id,
      purpose,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Create a context string from specific HCP keys
   */
  generateContextFromKeys(keys: string[], agent_id?: string): AgentContext {
    const contextParts: string[] = []
    
    for (const key of keys) {
      const value = hcp.getValueAtPath(key)
      if (value !== undefined) {
        contextParts.push(`${key}: ${JSON.stringify(value)}`)
      }
    }
    
    const contextString = contextParts.length > 0 
      ? `Agent context with access to: ${contextParts.join(', ')}`
      : 'Agent context with no specific data access'
    
    return {
      context: contextString,
      agent_id,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Parse an agent context string to extract intent
   */
  parseAgentIntent(context: string): {
    requestedKeys: string[]
    operations: ('read' | 'write')[]
    purpose?: string
  } {
    const contextLower = context.toLowerCase()
    const allKeys = hcp.getAllKeys()
    const requestedKeys: string[] = []
    const operations: ('read' | 'write')[] = []
    
    // Check for requested keys
    for (const key of allKeys) {
      if (contextLower.includes(key.toLowerCase())) {
        requestedKeys.push(key)
      }
    }
    
    // Check for operations
    if (contextLower.includes('read') || contextLower.includes('view') || contextLower.includes('access')) {
      operations.push('read')
    }
    
    if (contextLower.includes('write') || contextLower.includes('update') || contextLower.includes('modify') || contextLower.includes('edit')) {
      operations.push('write')
    }
    
    // Default to read if no operations specified
    if (operations.length === 0) {
      operations.push('read')
    }
    
    // Extract purpose if mentioned
    let purpose: string | undefined
    const purposeMatch = context.match(/purpose[:\s]+([^.]+)/i)
    if (purposeMatch) {
      purpose = purposeMatch[1].trim()
    }
    
    return {
      requestedKeys,
      operations,
      purpose
    }
  }

  /**
   * Create a formatted context summary
   */
  createContextSummary(agentContext: AgentContext): string {
    const parts: string[] = []
    
    if (agentContext.agent_id) {
      parts.push(`Agent: ${agentContext.agent_id}`)
    }
    
    if (agentContext.purpose) {
      parts.push(`Purpose: ${agentContext.purpose}`)
    }
    
    parts.push(`Context: ${agentContext.context}`)
    
    if (agentContext.timestamp) {
      parts.push(`Generated: ${new Date(agentContext.timestamp).toLocaleString()}`)
    }
    
    return parts.join('\n')
  }
}

// Export singleton instance
export const agentContext = AgentContextManager.getInstance()

export default agentContext