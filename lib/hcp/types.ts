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
    
    // Approval requirements by category
    require_approval: {
      financial: boolean
      legal: boolean
      medical: boolean
      personal_data: boolean
      location_tracking: boolean
      third_party_sharing: boolean
      ai_training: boolean  // Using data for AI model training
      advertising: boolean  // Using data for advertising
      threshold_amount?: number
    }
    
    // Notification preferences
    notification_preferences: {
      before_action: boolean
      after_action: boolean
      on_grant_expiry: boolean
      on_suspicious_activity: boolean
      on_threshold_reached: boolean
      summary_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly'
      notification_channels?: ('email' | 'sms' | 'push' | 'in_app')[]
    }
    
    // Global limits
    global_limits?: {
      max_clients?: number
      max_grants_per_client?: number
      max_daily_spend?: number
      max_monthly_spend?: number
      blacklisted_domains?: string[]
      whitelisted_domains?: string[]
    }
    
    // Privacy settings
    privacy_settings?: {
      data_minimization: boolean  // Only share minimum required data
      purpose_limitation: boolean  // Enforce purpose restrictions
      consent_required: boolean  // Require explicit consent
      right_to_deletion: boolean  // Support deletion requests
      data_portability: boolean  // Support data export
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
  type: 'time' | 'location' | 'client_type' | 'amount' | 'frequency' | 'data_type' | 'risk_score' | 'custom'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex'
  value: any
  field?: string
  description?: string  // Human-readable condition description
}

export interface HCPGrant {
  // Core identifiers
  grant_id?: string
  client_id: string
  granted_by?: string  // Who authorized this grant
  purpose?: string  // Human-readable purpose
  
  // Temporal constraints
  granted_at: string
  expires_at?: string
  valid_times?: {  // Time windows when grant is active
    days?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
    hours?: { start: string; end: string }  // e.g., "09:00"-"17:00"
    timezone?: string
  }
  
  // Access permissions
  allowed_sections: string[]
  allowed_actions: ('read' | 'write' | 'execute' | 'delegate')[]
  
  // Financial constraints
  financial_limits?: {
    per_transaction?: number
    daily_limit?: number
    monthly_limit?: number
    total_limit?: number
    currency?: string
    payment_methods?: string[]  // ['credit_card', 'bank_transfer', 'digital_wallet']
    require_2fa_above?: number  // Amount above which 2FA is required
  }
  
  // Operational constraints
  operation_limits?: {
    max_requests_per_hour?: number
    max_requests_per_day?: number
    max_data_size_mb?: number
    allowed_operations?: string[]  // Specific operations this grant allows
    denied_operations?: string[]  // Explicitly denied operations
  }
  
  // Geographic constraints
  geographic_limits?: {
    allowed_countries?: string[]
    denied_countries?: string[]
    allowed_regions?: string[]
    ip_whitelist?: string[]
    ip_blacklist?: string[]
  }
  
  // Data handling rules
  data_handling?: {
    retention_days?: number  // How long client can retain data
    deletion_required?: boolean  // Must delete after use
    aggregation_allowed?: boolean  // Can aggregate with other data
    sharing_allowed?: boolean  // Can share with third parties
    third_party_whitelist?: string[]  // Allowed third parties
    encryption_required?: boolean
    anonymization_required?: boolean
  }
  
  // Approval and notification rules
  approval_requirements?: {
    pre_approval?: boolean  // Require approval before action
    post_notification?: boolean  // Notify after action
    approval_threshold?: number  // Amount/risk level requiring approval
    approvers?: string[]  // List of approver IDs
    auto_approve_below?: number  // Auto-approve below this amount
  }
  
  // Audit and compliance
  audit_requirements?: {
    log_all_access?: boolean
    log_data_accessed?: boolean  // Log actual data, not just metadata
    compliance_frameworks?: string[]  // ['GDPR', 'CCPA', 'HIPAA']
    audit_retention_days?: number
    real_time_monitoring?: boolean
  }
  
  // Conditional rules
  conditions?: HCPCondition[]
  
  // Restrictions and notes
  restrictions?: string[]  // Human-readable restrictions
  
  // Revocation conditions
  revocation_conditions?: {
    on_breach?: boolean  // Revoke on any policy breach
    on_suspicious_activity?: boolean
    on_data_leak?: boolean
    on_third_party_sharing?: boolean
    max_violations?: number  // Number of violations before auto-revoke
  }
  
  // Grant metadata
  metadata?: {
    grant_type?: 'temporary' | 'permanent' | 'recurring' | 'one_time'
    risk_level?: 'low' | 'medium' | 'high' | 'critical'
    trust_score?: number  // 0-100
    review_required?: boolean
    last_reviewed?: string
    next_review?: string
    tags?: string[]
    [key: string]: any
  }
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