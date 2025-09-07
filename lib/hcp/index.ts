/**
 * Human Context Protocol (HCP) - Simplified
 * 
 * Main entry point for the HCP library
 */

// Core exports
export { hcp, getHCP, HCPManager } from './core'
export { grantAuthority, GrantAuthorityManager } from './grant-authority'
export { agentContext, AgentContextManager } from './agent-context'

// API exports
export { createHCPRoute, createHCPAPIHandler } from './api'

// Demo data exports
export { DEMO_CONTEXT, DEMO_PERMISSIONS, loadDemoData } from './demo-data'

// Type exports
export type {
  HCPContext,
  PermissionValue,
  Permission,
  GrantOfAuthority,
  AgentContext,
  HCPAPIRequest,
  HCPAPIResponse
} from './types'

// Default export
import { hcp } from './core'
export default hcp