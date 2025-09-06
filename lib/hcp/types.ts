/**
 * Human Context Protocol (HCP) Type Definitions
 * 
 * Comprehensive type definitions for the HCP system
 */

// ============================================================================
// Core Context Types
// ============================================================================

export interface HCPContext {
  version: string
  
  // Identity information
  identity: {
    name?: string
    role?: string
    organization?: string
    location?: string
    timezone?: string
    language_preferences?: string[]
    [key: string]: any
  }
  
  // User preferences across all dimensions
  preferences: {
    communication: {
      formality?: 'formal' | 'casual' | 'mixed'
      directness?: 'direct' | 'diplomatic' | 'balanced'
      tone?: 'friendly' | 'professional' | 'assertive'
      response_length?: 'concise' | 'detailed' | 'balanced'
      [key: string]: any
    }
    decision_making: {
      risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
      information_needs?: 'minimal' | 'standard' | 'comprehensive'
      consultation_style?: 'independent' | 'collaborative' | 'consensus'
      planning_horizon?: 'short_term' | 'medium_term' | 'long_term'
      [key: string]: any
    }
    values: {
      sustainability?: 'high' | 'medium' | 'low'
      innovation?: 'cutting_edge' | 'proven' | 'conservative'
      transparency?: 'full' | 'standard' | 'minimal'
      [key: string]: any
    }
    domains: {
      [domainName: string]: Record<string, any>
    }
  }
  
  // Behavioral patterns and insights
  behavioral: {
    patterns: {
      interaction_style?: Record<string, any>
      learning_style?: Record<string, any>
      work_patterns?: Record<string, any>
      [key: string]: any
    }
    cognitive: {
      problem_solving_approach?: string
      detail_orientation?: string
      uncertainty_tolerance?: string
      [key: string]: any
    }
    interaction: {
      topics_discussed?: Array<{
        topic: string
        frequency: number
        last_discussed: string
        sentiment: 'positive' | 'neutral' | 'negative'
      }>
      common_questions?: string[]
      preferred_examples?: string[]
      avoided_topics?: string[]
      [key: string]: any
    }
  }
  
  // Capabilities and expertise
  capabilities: {
    technical: {
      domains?: Array<{
        domain: string
        proficiency: 'expert' | 'intermediate' | 'beginner'
        years_experience?: number
      }>
      tools?: string[]
      certifications?: string[]
      [key: string]: any
    }
    domain_expertise: Record<string, any>
    tools: Record<string, any>
  }
  
  // Constraints and boundaries
  constraints: {
    hard: Record<string, any>  // Non-negotiable constraints
    soft: Record<string, any>  // Preferred but flexible constraints
    ethical: Record<string, any>  // Ethical boundaries
  }
  
  // Metadata about the context
  metadata: {
    created_at: string
    last_updated: string
    update_count: number
    confidence_scores: Record<string, number>
    sources: string[]
    [key: string]: any
  }
}

// ============================================================================
// Authority and Access Control Types
// ============================================================================

export interface HCPAuthority {
  version: string
  
  // Access policies
  policies: {
    [policyId: string]: HCPPolicy
  }
  
  // Client-specific grants
  grants: Map<string, HCPGrant>
  
  // Global settings
  settings: {
    autonomy_level: 'high_security' | 'balanced' | 'max_autonomy' | 'custom'
    require_approval: {
      financial: boolean
      legal: boolean
      medical: boolean
      personal_data: boolean
      threshold_amount?: number
    }
    notification_preferences: {
      before_action: boolean
      after_action: boolean
      summary_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    }
    [key: string]: any
  }
  
  metadata: {
    created_at: string
    last_updated: string
    [key: string]: any
  }
}

export interface HCPPolicy {
  id: string
  name: string
  description?: string
  rules: HCPRule[]
  priority: number
  conditions?: HCPCondition[]
}

export interface HCPRule {
  section: string  // Context section or '*' for all
  access: 'allow' | 'deny'
  actions?: ('read' | 'write' | 'execute')[]
  conditions?: HCPCondition[]
}

export interface HCPCondition {
  type: 'time' | 'location' | 'client_type' | 'custom'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in'
  value: any
  field?: string
}

export interface HCPGrant {
  client_id: string
  granted_at: string
  expires_at?: string
  allowed_sections: string[]
  allowed_actions: ('read' | 'write' | 'execute')[]
  restrictions?: string[]
  metadata?: Record<string, any>
}

// ============================================================================
// Client Types
// ============================================================================

export interface HCPClient {
  id: string
  name: string
  type: 'system' | 'ai_assistant' | 'agent' | 'service' | 'application' | 'user'
  description?: string
  capabilities: ('read' | 'write' | 'execute' | 'admin')[]
  status?: 'active' | 'suspended' | 'revoked'
  access_count?: number
  last_accessed?: string | null
  metadata: {
    created_at: string
    trusted?: boolean
    [key: string]: any
  }
}

// ============================================================================
// Access Request/Response Types
// ============================================================================

export interface HCPAccessRequest {
  clientId: string
  action: 'read' | 'write' | 'execute'
  sections?: string[]  // Specific context sections requested
  data?: any  // Data for write operations
  capability?: string  // Specific capability for execute operations
  metadata?: Record<string, any>
  timestamp: string
}

export interface HCPAccessResponse {
  success: boolean
  data?: any
  error?: string
  metadata: {
    client_id: string
    timestamp: string
    sections_accessed?: string[]
    sections_updated?: string[]
    capability?: string
    reason?: string
    [key: string]: any
  }
}

// ============================================================================
// Audit and Monitoring Types
// ============================================================================

export interface HCPAuditEntry {
  timestamp: string
  client_id: string
  action: 'read' | 'write' | 'execute'
  sections: string[]
  success: boolean
  reason?: string
  error?: string
  duration_ms?: number
  metadata?: Record<string, any>
}

// ============================================================================
// Plugin System Types
// ============================================================================

export interface HCPPlugin {
  id: string
  name: string
  version: string
  description?: string
  
  // Lifecycle hooks
  initialize?: (manager: any) => void
  destroy?: () => void
  
  // Capability execution
  execute?: (request: HCPAccessRequest, context: HCPContext, client: HCPClient) => Promise<any>
  
  // Context transformation
  transformContext?: (context: any, client: HCPClient) => any
  
  // Validation
  validateData?: (data: any, schema?: any) => boolean
  
  // Custom middleware
  middleware?: HCPMiddleware
}

export type HCPMiddleware = (
  request: HCPAccessRequest,
  client: HCPClient,
  context: HCPContext,
  authority: HCPAuthority
) => Promise<{
  allowed: boolean
  reason?: string
  modifiedRequest?: HCPAccessRequest
}>

// ============================================================================
// API Types
// ============================================================================

export interface HCPAPIRequest {
  action: string
  clientId?: string
  data?: any
  options?: Record<string, any>
}

export interface HCPAPIResponse {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
}

// ============================================================================
// Event Types
// ============================================================================

export interface HCPEvent {
  type: 'access' | 'accessDenied' | 'contextUpdate' | 'authorityUpdate' | 'clientRegistered' | 'clientRevoked'
  timestamp: string
  data: Record<string, any>
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface HCPConfig {
  storage?: {
    type: 'memory' | 'file' | 'database'
    options?: Record<string, any>
  }
  security?: {
    encryption?: boolean
    key_management?: 'local' | 'kms' | 'vault'
  }
  monitoring?: {
    enabled: boolean
    provider?: 'console' | 'datadog' | 'newrelic' | 'custom'
    options?: Record<string, any>
  }
  plugins?: HCPPlugin[]
  middleware?: HCPMiddleware[]
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

export type Nullable<T> = T | null | undefined

// ============================================================================
// Legacy Compatibility Types (for backward compatibility)
// ============================================================================

export interface LegacyPreferenceData {
  communication_style?: Record<string, any>
  decision_making?: Record<string, any>
  values?: Record<string, any>
  negotiation_priorities?: Record<string, any>
  constraints?: Record<string, any>
  domains?: Record<string, any>
  conversation_patterns?: Record<string, any>
  last_updated?: string
  version?: string
}

export interface LegacyGrantAuthority {
  version: string
  authorizedClients: any[]
  autonomySettings: any
  globalRestrictions?: string[]
  lastUpdated: string
  auditLog?: any[]
}