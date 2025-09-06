/**
 * HCP Plugin System
 * 
 * Provides extensibility hooks for the HCP system
 */

import type { 
  HCPPlugin, 
  HCPMiddleware, 
  HCPAccessRequest, 
  HCPClient, 
  HCPContext,
  HCPAuthority 
} from './types'

// ============================================================================
// Plugin Creation Helpers
// ============================================================================

/**
 * Create a new HCP plugin
 */
export function createPlugin(config: {
  id: string
  name: string
  version: string
  description?: string
  capabilities?: {
    [capabilityName: string]: (request: HCPAccessRequest, context: HCPContext, client: HCPClient) => Promise<any>
  }
  transformers?: {
    context?: (context: any, client: HCPClient) => any
    request?: (request: HCPAccessRequest) => HCPAccessRequest
    response?: (response: any) => any
  }
  validators?: {
    [dataType: string]: (data: any) => boolean
  }
  hooks?: {
    onInit?: (manager: any) => void
    onDestroy?: () => void
    onContextUpdate?: (context: HCPContext) => void
    onAuthorityUpdate?: (authority: HCPAuthority) => void
    onClientAccess?: (clientId: string, action: string) => void
  }
}): HCPPlugin {
  const plugin: HCPPlugin = {
    id: config.id,
    name: config.name,
    version: config.version,
    description: config.description
  }

  // Add initialize hook
  if (config.hooks?.onInit) {
    plugin.initialize = config.hooks.onInit
  }

  // Add destroy hook
  if (config.hooks?.onDestroy) {
    plugin.destroy = config.hooks.onDestroy
  }

  // Add capability execution
  if (config.capabilities) {
    plugin.execute = async (request, context, client) => {
      const capability = config.capabilities![request.capability!]
      if (!capability) {
        throw new Error(`Unknown capability: ${request.capability}`)
      }
      return await capability(request, context, client)
    }
  }

  // Add context transformation
  if (config.transformers?.context) {
    plugin.transformContext = config.transformers.context
  }

  // Add validation
  if (config.validators) {
    plugin.validateData = (data, schema) => {
      const validator = config.validators![schema || 'default']
      if (!validator) {
        return true // No validator, assume valid
      }
      return validator(data)
    }
  }

  return plugin
}

/**
 * Create middleware for request processing
 */
export function createMiddleware(
  handler: (
    request: HCPAccessRequest,
    client: HCPClient,
    context: HCPContext,
    authority: HCPAuthority
  ) => Promise<{
    allowed: boolean
    reason?: string
    modifiedRequest?: HCPAccessRequest
  }>
): HCPMiddleware {
  return handler
}

// ============================================================================
// Built-in Plugins
// ============================================================================

/**
 * Rate limiting plugin
 */
export const rateLimitPlugin = createPlugin({
  id: 'rate-limit',
  name: 'Rate Limiting Plugin',
  version: '1.0.0',
  description: 'Provides rate limiting for HCP access',
  hooks: {
    onInit: (manager) => {
      const limits = new Map<string, { count: number; resetTime: number }>()
      
      manager.use(createMiddleware(async (request, client) => {
        const key = `${client.id}:${request.action}`
        const now = Date.now()
        const limit = limits.get(key)
        
        if (!limit || limit.resetTime < now) {
          // Reset limit
          limits.set(key, {
            count: 1,
            resetTime: now + 60000 // 1 minute window
          })
          return { allowed: true }
        }
        
        if (limit.count >= 100) { // 100 requests per minute
          return {
            allowed: false,
            reason: 'Rate limit exceeded'
          }
        }
        
        limit.count++
        return { allowed: true }
      }))
    }
  }
})

/**
 * Encryption plugin for sensitive data
 */
export const encryptionPlugin = createPlugin({
  id: 'encryption',
  name: 'Encryption Plugin',
  version: '1.0.0',
  description: 'Encrypts sensitive context data',
  transformers: {
    context: (context, client) => {
      // In production, this would use actual encryption
      // For demo, we'll just mark sensitive fields
      const encrypted = { ...context }
      
      if (encrypted.identity && !client.metadata?.trusted) {
        encrypted.identity = { encrypted: true }
      }
      
      return encrypted
    }
  }
})

/**
 * Audit enhancement plugin
 */
export const auditPlugin = createPlugin({
  id: 'audit-enhanced',
  name: 'Enhanced Audit Plugin',
  version: '1.0.0',
  description: 'Provides enhanced audit logging',
  hooks: {
    onClientAccess: (clientId, action) => {
      // In production, this would send to external audit system
      console.log(`[AUDIT] Client ${clientId} performed ${action} at ${new Date().toISOString()}`)
    }
  }
})

/**
 * Schema validation plugin
 */
export const schemaValidationPlugin = createPlugin({
  id: 'schema-validation',
  name: 'Schema Validation Plugin',
  version: '1.0.0',
  description: 'Validates data against schemas',
  validators: {
    preferences: (data) => {
      // Validate preferences structure
      if (!data || typeof data !== 'object') return false
      
      const validKeys = ['communication', 'decision_making', 'values', 'domains']
      const keys = Object.keys(data)
      
      return keys.every(key => validKeys.includes(key))
    },
    identity: (data) => {
      // Validate identity structure
      if (!data || typeof data !== 'object') return false
      
      // Check for required fields
      if (data.name && typeof data.name !== 'string') return false
      if (data.role && typeof data.role !== 'string') return false
      
      return true
    }
  }
})

/**
 * Caching plugin for performance
 */
export const cachingPlugin = createPlugin({
  id: 'caching',
  name: 'Caching Plugin',
  version: '1.0.0',
  description: 'Caches frequently accessed context data',
  hooks: {
    onInit: (manager) => {
      const cache = new Map<string, { data: any; expiry: number }>()
      
      // Override context getter with cached version
      const originalAccessContext = manager.accessContext.bind(manager)
      
      manager.accessContext = async (request: HCPAccessRequest) => {
        if (request.action === 'read') {
          const cacheKey = `${request.clientId}:${JSON.stringify(request.sections)}`
          const cached = cache.get(cacheKey)
          
          if (cached && cached.expiry > Date.now()) {
            return {
              success: true,
              data: cached.data,
              metadata: {
                client_id: request.clientId,
                timestamp: new Date().toISOString(),
                cached: true
              }
            }
          }
          
          const response = await originalAccessContext(request)
          
          if (response.success) {
            cache.set(cacheKey, {
              data: response.data,
              expiry: Date.now() + 30000 // 30 second cache
            })
          }
          
          return response
        }
        
        return originalAccessContext(request)
      }
    }
  }
})

/**
 * Analytics plugin
 */
export const analyticsPlugin = createPlugin({
  id: 'analytics',
  name: 'Analytics Plugin',
  version: '1.0.0',
  description: 'Tracks usage analytics',
  hooks: {
    onInit: (manager) => {
      const analytics = {
        totalAccess: 0,
        byClient: new Map<string, number>(),
        byAction: new Map<string, number>(),
        bySections: new Map<string, number>()
      }
      
      manager.on('access', (event: any) => {
        analytics.totalAccess++
        
        // Track by client
        const clientCount = analytics.byClient.get(event.clientId) || 0
        analytics.byClient.set(event.clientId, clientCount + 1)
        
        // Track by action
        const actionCount = analytics.byAction.get(event.action) || 0
        analytics.byAction.set(event.action, actionCount + 1)
      })
      
      // Expose analytics through capability
      manager.registerPlugin(createPlugin({
        id: 'analytics-reporter',
        name: 'Analytics Reporter',
        version: '1.0.0',
        capabilities: {
          'get-analytics': async () => ({
            totalAccess: analytics.totalAccess,
            byClient: Object.fromEntries(analytics.byClient),
            byAction: Object.fromEntries(analytics.byAction)
          })
        }
      }))
    }
  }
})

// ============================================================================
// Plugin Registry
// ============================================================================

/**
 * Default plugins to register
 */
export const defaultPlugins: HCPPlugin[] = [
  rateLimitPlugin,
  auditPlugin,
  cachingPlugin,
  analyticsPlugin
]

/**
 * Security-focused plugins
 */
export const securityPlugins: HCPPlugin[] = [
  encryptionPlugin,
  schemaValidationPlugin
]

/**
 * Get all recommended plugins
 */
export function getRecommendedPlugins(): HCPPlugin[] {
  return [...defaultPlugins, ...securityPlugins]
}