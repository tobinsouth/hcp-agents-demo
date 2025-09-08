/**
 * Human Context Protocol (HCP) Type Definitions - Simplified
 */

// ============================================================================
// Core Types
// ============================================================================

export interface HCPContext {
  [key: string]: any
}

export type PermissionValue = 'Allow' | 'Ask' | 'Never' | string

export interface Permission {
  read: PermissionValue
  write: PermissionValue
}

export interface GrantOfAuthority {
  permissions: Record<string, Permission>
  metadata?: {
    created_at: string
    updated_at: string
    agent_id?: string
    context?: string
  }
}

export interface AgentContext {
  context: string
  agent_id?: string
  purpose?: string
  timestamp?: string
}

// ============================================================================
// API Types  
// ============================================================================

export interface HCPAPIRequest {
  action: string
  data?: any
  agentContext?: AgentContext
}

export interface HCPAPIResponse {
  success: boolean
  data?: any
  error?: string
}