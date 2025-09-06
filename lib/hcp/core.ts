/**
 * Human Context Protocol (HCP) Core Library
 * 
 * A unified, extensible system for managing human context and authority grants.
 * This library provides strong gatekeeping, standardized APIs, and extensible hooks
 * for managing how AI systems access and use human context.
 * 
 * @module hcp/core
 */

import { EventEmitter } from 'events'
import type { 
  HCPContext, 
  HCPAuthority, 
  HCPClient, 
  HCPAccessRequest,
  HCPAccessResponse,
  HCPAuditEntry,
  HCPPlugin,
  HCPMiddleware
} from './types'

/**
 * Core HCP Manager - Singleton instance that manages all context and authority
 */
export class HCPManager extends EventEmitter {
  private static instance: HCPManager
  private context: HCPContext
  private authority: HCPAuthority
  private clients: Map<string, HCPClient>
  private auditLog: HCPAuditEntry[]
  private plugins: Map<string, HCPPlugin>
  private middleware: HCPMiddleware[]
  private sessionCache: Map<string, any>

  private constructor() {
    super()
    this.context = this.initializeContext()
    this.authority = this.initializeAuthority()
    this.clients = new Map()
    this.auditLog = []
    this.plugins = new Map()
    this.middleware = []
    this.sessionCache = new Map()

    // Initialize default clients
    this.registerDefaultClients()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): HCPManager {
    if (!HCPManager.instance) {
      HCPManager.instance = new HCPManager()
    }
    return HCPManager.instance
  }

  /**
   * Initialize empty context structure
   */
  private initializeContext(): HCPContext {
    return {
      version: '2.0.0',
      identity: {},
      preferences: {
        communication: {},
        decision_making: {},
        values: {},
        domains: {}
      },
      behavioral: {
        patterns: {},
        cognitive: {},
        interaction: {}
      },
      capabilities: {
        technical: {},
        domain_expertise: {},
        tools: {}
      },
      constraints: {
        hard: {},
        soft: {},
        ethical: {}
      },
      metadata: {
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        update_count: 0,
        confidence_scores: {},
        sources: [],
        demo_mode: false
      }
    }
  }

  /**
   * Initialize default authority structure
   */
  private initializeAuthority(): HCPAuthority {
    return {
      version: '2.0.0',
      policies: {
        default: {
          id: 'default',
          name: 'Default Policy',
          rules: [
            { section: '*', access: 'deny', conditions: [] }
          ],
          priority: 0
        }
      },
      grants: new Map(),
      settings: {
        autonomy_level: 'balanced',
        require_approval: {
          financial: true,
          legal: true,
          medical: true,
          personal_data: false,
          threshold_amount: 500
        },
        notification_preferences: {
          before_action: false,
          after_action: true,
          summary_frequency: 'daily'
        }
      },
      metadata: {
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }
    }
  }

  /**
   * Register default system clients
   */
  private registerDefaultClients(): void {
    // System client - full access
    this.registerClient({
      id: 'system',
      name: 'System',
      type: 'system',
      description: 'Core system client with full access',
      capabilities: ['read', 'write', 'execute', 'admin'],
      metadata: {
        created_at: new Date().toISOString(),
        trusted: true
      }
    })

    // Note: Other clients like claude-assistant will be loaded via demo data
  }

  /**
   * CORE GATEKEEPER - All context access MUST go through this method
   * This is the central enforcement point for all authority policies
   */
  async accessContext(request: HCPAccessRequest): Promise<HCPAccessResponse> {
    const startTime = Date.now()
    
    try {
      // 1. Validate client
      const client = this.clients.get(request.clientId)
      if (!client) {
        return this.denyAccess(request, 'Client not registered')
      }

      // 2. Check client status
      if (client.status === 'suspended' || client.status === 'revoked') {
        return this.denyAccess(request, `Client status: ${client.status}`)
      }

      // 3. Run middleware chain
      for (const mw of this.middleware) {
        const result = await mw(request, client, this.context, this.authority)
        if (!result.allowed) {
          return this.denyAccess(request, result.reason || 'Middleware denied access')
        }
        // Middleware can modify the request
        if (result.modifiedRequest) {
          request = result.modifiedRequest
        }
      }

      // 4. Check authority grants
      const grant = this.authority.grants.get(request.clientId)
      if (!grant) {
        // Apply default policy
        const defaultPolicy = this.authority.policies.default
        if (!this.evaluatePolicy(defaultPolicy, request)) {
          return this.denyAccess(request, 'No grant found, default policy denies access')
        }
      } else {
        // Check grant expiration
        if (grant.expires_at && new Date(grant.expires_at) < new Date()) {
          return this.denyAccess(request, 'Grant expired')
        }

        // Check grant permissions
        if (!this.evaluateGrant(grant, request)) {
          return this.denyAccess(request, 'Grant does not allow requested access')
        }
      }

      // 5. Apply rate limiting
      if (!this.checkRateLimit(request.clientId, request.action)) {
        return this.denyAccess(request, 'Rate limit exceeded')
      }

      // 6. Execute the access request
      const response = await this.executeAccess(request, client)

      // 7. Log successful access
      this.logAccess({
        timestamp: new Date().toISOString(),
        client_id: request.clientId,
        action: request.action,
        sections: request.sections || [],
        success: true,
        duration_ms: Date.now() - startTime,
        metadata: request.metadata
      })

      // 8. Emit access event
      this.emit('access', {
        clientId: request.clientId,
        action: request.action,
        success: true
      })

      return response

    } catch (error) {
      // Log error
      this.logAccess({
        timestamp: new Date().toISOString(),
        client_id: request.clientId,
        action: request.action,
        sections: request.sections || [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime
      })

      return this.denyAccess(request, 'Internal error during access')
    }
  }

  /**
   * Execute the actual context access
   */
  private async executeAccess(request: HCPAccessRequest, client: HCPClient): Promise<HCPAccessResponse> {
    switch (request.action) {
      case 'read':
        return this.executeRead(request, client)
      case 'write':
        return this.executeWrite(request, client)
      case 'execute':
        return this.executeAction(request, client)
      default:
        return this.denyAccess(request, `Unknown action: ${request.action}`)
    }
  }

  /**
   * Execute read access
   */
  private executeRead(request: HCPAccessRequest, client: HCPClient): HCPAccessResponse {
    const filteredContext = this.filterContext(this.context, request.sections || [])
    
    // Apply client-specific transformations
    const transformed = this.applyClientTransformations(filteredContext, client)
    
    return {
      success: true,
      data: transformed,
      metadata: {
        client_id: client.id,
        timestamp: new Date().toISOString(),
        sections_accessed: request.sections || []
      }
    }
  }

  /**
   * Execute write access
   */
  private executeWrite(request: HCPAccessRequest, client: HCPClient): HCPAccessResponse {
    if (!request.data) {
      return this.denyAccess(request, 'No data provided for write operation')
    }

    // Validate data schema
    if (!this.validateContextData(request.data)) {
      return this.denyAccess(request, 'Invalid data schema')
    }

    // Merge with existing context
    this.mergeContext(request.data, client.id)
    
    // Emit context update event
    this.emit('contextUpdate', {
      clientId: client.id,
      sections: request.sections || [],
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      metadata: {
        client_id: client.id,
        timestamp: new Date().toISOString(),
        sections_updated: request.sections || []
      }
    }
  }

  /**
   * Execute action/capability
   */
  private async executeAction(request: HCPAccessRequest, client: HCPClient): Promise<HCPAccessResponse> {
    if (!request.capability) {
      return this.denyAccess(request, 'No capability specified for execute action')
    }

    // Check if client has the capability
    if (!client.capabilities.includes('execute')) {
      return this.denyAccess(request, 'Client does not have execute capability')
    }

    // Execute through plugin if available
    const plugin = this.plugins.get(request.capability)
    if (plugin && plugin.execute) {
      try {
        const result = await plugin.execute(request, this.context, client)
        return {
          success: true,
          data: result,
          metadata: {
            client_id: client.id,
            capability: request.capability,
            timestamp: new Date().toISOString()
          }
        }
      } catch (error) {
        return this.denyAccess(request, `Plugin execution failed: ${error}`)
      }
    }

    return this.denyAccess(request, `Unknown capability: ${request.capability}`)
  }

  /**
   * Deny access with reason
   */
  private denyAccess(request: HCPAccessRequest, reason: string): HCPAccessResponse {
    this.logAccess({
      timestamp: new Date().toISOString(),
      client_id: request.clientId,
      action: request.action,
      sections: request.sections || [],
      success: false,
      reason,
      metadata: request.metadata
    })

    this.emit('accessDenied', {
      clientId: request.clientId,
      action: request.action,
      reason
    })

    return {
      success: false,
      error: reason,
      metadata: {
        client_id: request.clientId,
        timestamp: new Date().toISOString(),
        reason
      }
    }
  }

  /**
   * Register a new client
   */
  registerClient(client: HCPClient): void {
    this.clients.set(client.id, {
      ...client,
      status: client.status || 'active',
      access_count: 0,
      last_accessed: null
    })

    this.emit('clientRegistered', { clientId: client.id })
  }

  /**
   * Grant authority to a client
   */
  grantAuthority(clientId: string, grant: any): void {
    this.authority.grants.set(clientId, {
      ...grant,
      granted_at: new Date().toISOString()
    })

    this.authority.metadata.last_updated = new Date().toISOString()
    
    this.emit('authorityGranted', { clientId, grant })
  }

  /**
   * Revoke authority from a client
   */
  revokeAuthority(clientId: string): void {
    this.authority.grants.delete(clientId)
    
    this.authority.metadata.last_updated = new Date().toISOString()
    
    this.emit('authorityRevoked', { clientId })
  }

  /**
   * Register a plugin for extensibility
   */
  registerPlugin(plugin: HCPPlugin): void {
    this.plugins.set(plugin.id, plugin)
    
    // Initialize plugin
    if (plugin.initialize) {
      plugin.initialize(this)
    }
    
    this.emit('pluginRegistered', { pluginId: plugin.id })
  }

  /**
   * Add middleware for request processing
   */
  use(middleware: HCPMiddleware): void {
    this.middleware.push(middleware)
  }

  /**
   * Update context with validation
   */
  updateContext(updates: Partial<HCPContext>, source: string = 'system'): void {
    this.mergeContext(updates, source)
  }

  /**
   * Get current context (filtered for caller)
   */
  getContext(clientId: string = 'system'): any {
    // For synchronous access, return the filtered context directly
    // This bypasses the async gatekeeper for internal use only
    if (clientId === 'system') {
      return this.context
    }
    
    // For other clients, return filtered context based on their grants
    const grant = this.authority.grants.get(clientId)
    if (!grant) {
      return {}
    }
    
    return this.filterContext(this.context, grant.allowed_sections)
  }

  /**
   * Get current authority configuration
   */
  getAuthority(): HCPAuthority {
    return { ...this.authority }
  }

  /**
   * Get audit log
   */
  getAuditLog(filter?: { clientId?: string; startDate?: string; endDate?: string }): HCPAuditEntry[] {
    let log = [...this.auditLog]

    if (filter) {
      if (filter.clientId) {
        log = log.filter(entry => entry.client_id === filter.clientId)
      }
      if (filter.startDate) {
        log = log.filter(entry => entry.timestamp >= filter.startDate!)
      }
      if (filter.endDate) {
        log = log.filter(entry => entry.timestamp <= filter.endDate!)
      }
    }

    return log
  }

  /**
   * Clear all context and authority (for testing/reset)
   */
  reset(): void {
    this.context = this.initializeContext()
    this.authority = this.initializeAuthority()
    this.clients.clear()
    this.auditLog = []
    this.sessionCache.clear()
    
    // Re-register default clients
    this.registerDefaultClients()
    
    this.emit('reset')
  }
  
  /**
   * Load demo data into the system
   */
  async loadDemoData(scenario?: string): Promise<any> {
    const { loadDemoData } = await import('./demo-data')
    return loadDemoData(this, scenario as any)
  }
  
  /**
   * Check if demo mode is active
   */
  isDemoMode(): boolean {
    return this.context.metadata?.demo_mode === true
  }
  
  /**
   * Set demo mode flag
   */
  setDemoMode(enabled: boolean): void {
    if (this.context.metadata) {
      this.context.metadata.demo_mode = enabled
    }
  }

  // Private helper methods

  private evaluatePolicy(policy: any, request: HCPAccessRequest): boolean {
    // Simple policy evaluation - can be extended
    for (const rule of policy.rules) {
      if (rule.section === '*' || request.sections?.includes(rule.section)) {
        return rule.access === 'allow'
      }
    }
    return false
  }

  private evaluateGrant(grant: any, request: HCPAccessRequest): boolean {
    // Check if grant allows the requested sections
    if (!request.sections || request.sections.length === 0) return true
    
    for (const section of request.sections) {
      if (!grant.allowed_sections?.includes(section)) {
        return false
      }
    }
    
    return true
  }

  private checkRateLimit(clientId: string, action: string): boolean {
    // Simple rate limiting - can be extended
    const key = `${clientId}:${action}`
    const now = Date.now()
    const window = 60000 // 1 minute window
    const limit = 100 // 100 requests per minute
    
    const requests = this.sessionCache.get(key) || []
    const recentRequests = requests.filter((t: number) => now - t < window)
    
    if (recentRequests.length >= limit) {
      return false
    }
    
    recentRequests.push(now)
    this.sessionCache.set(key, recentRequests)
    
    return true
  }

  private filterContext(context: HCPContext, sections: string[]): any {
    if (sections.includes('*')) return context
    
    const filtered: any = {}
    
    for (const section of sections) {
      const path = section.split('.')
      let source: any = context
      let target: any = filtered
      
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]
        source = source[key]
        if (!source) break
        
        if (!target[key]) target[key] = {}
        target = target[key]
      }
      
      if (source) {
        const lastKey = path[path.length - 1]
        if (source[lastKey] !== undefined) {
          target[lastKey] = source[lastKey]
        }
      }
    }
    
    return filtered
  }

  private applyClientTransformations(context: any, _client: HCPClient): any {
    // Apply any client-specific transformations
    // This can be extended with plugins
    return context
  }

  private validateContextData(data: any): boolean {
    // Basic validation - can be extended with schema validation
    return typeof data === 'object' && data !== null
  }

  private mergeContext(updates: any, source: string): void {
    // Deep merge updates into context
    this.deepMerge(this.context, updates)
    
    // Update metadata
    this.context.metadata.last_updated = new Date().toISOString()
    this.context.metadata.update_count++
    
    if (!this.context.metadata.sources.includes(source)) {
      this.context.metadata.sources.push(source)
    }
    
    this.emit('contextUpdated', { source, timestamp: new Date().toISOString() })
  }

  private deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {}
          this.deepMerge(target[key], source[key])
        } else if (Array.isArray(source[key])) {
          if (!target[key]) target[key] = []
          target[key] = [...new Set([...target[key], ...source[key]])]
        } else {
          target[key] = source[key]
        }
      }
    }
    return target
  }

  private logAccess(entry: HCPAuditEntry): void {
    this.auditLog.push(entry)
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000)
    }
    
    // Update client access metrics
    const client = this.clients.get(entry.client_id)
    if (client && entry.success) {
      client.access_count = (client.access_count || 0) + 1
      client.last_accessed = entry.timestamp
    }
  }
}

// Export singleton instance
export const hcp = HCPManager.getInstance()

// Export convenience functions for backward compatibility
export function getHCP(): HCPManager {
  return HCPManager.getInstance()
}

export default hcp