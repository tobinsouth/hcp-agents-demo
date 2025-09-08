/**
 * Grant of Authority Management
 * 
 * Simple read/write permission management for HCP context keys.
 */

import type { GrantOfAuthority, Permission, PermissionValue, AgentContext } from '../types'
import { hcp } from '../core/core'

/**
 * Grant Authority Manager
 */
export class GrantAuthorityManager {
  private static instance: GrantAuthorityManager
  private authority: GrantOfAuthority
  private initialized: boolean = false
  private defaultPolicy: 'share-everything' | 'ask-permission' | 'allow-list' = 'allow-list'

  private constructor() {
    this.authority = {
      permissions: {},
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GrantAuthorityManager {
    if (!GrantAuthorityManager.instance) {
      GrantAuthorityManager.instance = new GrantAuthorityManager()
      GrantAuthorityManager.instance.initializeDemo()
    }
    return GrantAuthorityManager.instance
  }

  /**
   * Initialize with demo permissions
   */
  private initializeDemo(): void {
    if (!this.initialized) {
      // Lazy load demo data
      import('./demo-data').then(({ DEMO_PERMISSIONS }) => {
        if (Object.keys(this.authority.permissions).length === 0) {
          this.authority.permissions = DEMO_PERMISSIONS
          this.authority.metadata = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            context: "Demo configuration with privacy-conscious defaults"
          }
          console.log('[GrantAuthority] Initialized with demo permissions')
        }
      }).catch(err => {
        console.error('[GrantAuthority] Failed to load demo data:', err)
      })
      this.initialized = true
    }
  }

  /**
   * Get the full grant of authority
   */
  getAuthority(): GrantOfAuthority {
    return { ...this.authority, permissions: { ...this.authority.permissions } }
  }

  /**
   * Set the entire grant of authority
   */
  setAuthority(authority: GrantOfAuthority): void {
    this.authority = {
      ...authority,
      permissions: { ...authority.permissions },
      metadata: {
        created_at: authority.metadata?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        agent_id: authority.metadata?.agent_id,
        context: authority.metadata?.context
      }
    }
  }

  /**
   * Get permission for a specific key (with default policy override)
   */
  getPermission(key: string): Permission {
    // If default policy is set to override, return those values
    if (this.defaultPolicy === 'share-everything') {
      return { read: 'Allow', write: 'Allow' }
    } else if (this.defaultPolicy === 'allow-list') {
      // For allow-list, only return Allow if explicitly set
      const stored = this.authority.permissions[key]
      if (stored && (stored.read === 'Allow' || stored.write === 'Allow')) {
        return stored
      }
      return { read: 'Never', write: 'Never' }
    }
    
    // For 'ask-permission' or if no override, return stored or default
    return this.authority.permissions[key] || this.getDefaultPermissionValues()
  }
  
  /**
   * Get the raw stored permission without policy override
   */
  getStoredPermission(key: string): Permission | undefined {
    return this.authority.permissions[key]
  }

  /**
   * Set permission for a specific key
   */
  setPermission(key: string, permission: Permission): void {
    this.authority.permissions[key] = permission
    if (this.authority.metadata) {
      this.authority.metadata.updated_at = new Date().toISOString()
    }
  }

  /**
   * Set read permission for a key
   */
  setReadPermission(key: string, value: PermissionValue): void {
    const current = this.getPermission(key)
    this.setPermission(key, { ...current, read: value })
  }

  /**
   * Set write permission for a key
   */
  setWritePermission(key: string, value: PermissionValue): void {
    const current = this.getPermission(key)
    this.setPermission(key, { ...current, write: value })
  }

  /**
   * Set the default policy (runtime override, doesn't change stored permissions)
   */
  setDefaultPolicy(policy: 'share-everything' | 'ask-permission' | 'allow-list'): void {
    this.defaultPolicy = policy
    // Don't modify stored permissions - this is just a runtime override
    if (this.authority.metadata) {
      this.authority.metadata.updated_at = new Date().toISOString()
    }
  }

  /**
   * Get the default policy
   */
  getDefaultPolicy(): 'share-everything' | 'ask-permission' | 'allow-list' {
    return this.defaultPolicy
  }

  /**
   * Get default permission values based on the current policy
   */
  private getDefaultPermissionValues(): { read: PermissionValue, write: PermissionValue } {
    switch (this.defaultPolicy) {
      case 'share-everything':
        return { read: 'Allow', write: 'Allow' }
      case 'ask-permission':
        return { read: 'Ask', write: 'Ask' }
      case 'allow-list':
        return { read: 'Never', write: 'Never' }
      default:
        return { read: 'Ask', write: 'Ask' }
    }
  }

  /**
   * Initialize default permissions for all context keys
   */
  initializeDefaultPermissions(): void {
    const keys = hcp.getAllKeys()
    const defaultPerms = this.getDefaultPermissionValues()
    
    for (const key of keys) {
      if (!this.authority.permissions[key]) {
        this.authority.permissions[key] = { ...defaultPerms }
      }
    }
    
    if (this.authority.metadata) {
      this.authority.metadata.updated_at = new Date().toISOString()
    }
  }

  /**
   * Generate grant of authority based on agent context
   */
  generateAuthorityForAgent(agentContext: AgentContext): GrantOfAuthority {
    const keys = hcp.getAllKeys()
    const permissions: Record<string, Permission> = {}
    
    // Parse agent context to determine appropriate permissions
    const contextLower = agentContext.context.toLowerCase()
    
    for (const key of keys) {
      const keyLower = key.toLowerCase()
      
      // Default permissions
      let readPermission: PermissionValue = 'Ask'
      let writePermission: PermissionValue = 'Never'
      
      // Simple heuristics based on agent context
      if (contextLower.includes('read-only') || contextLower.includes('view')) {
        readPermission = 'Allow'
        writePermission = 'Never'
      } else if (contextLower.includes('full access') || contextLower.includes('admin')) {
        readPermission = 'Allow'
        writePermission = 'Allow'
      } else if (contextLower.includes('update') || contextLower.includes('edit')) {
        readPermission = 'Allow'
        writePermission = 'Ask'
      }
      
      // Specific key-based rules
      if (keyLower.includes('sensitive') || keyLower.includes('private') || keyLower.includes('secret')) {
        readPermission = 'Never'
        writePermission = 'Never'
      } else if (keyLower.includes('public') || keyLower.includes('shared')) {
        readPermission = 'Allow'
      }
      
      // Check if context mentions specific keys
      if (contextLower.includes(keyLower)) {
        readPermission = 'Allow'
        if (contextLower.includes('modify ' + keyLower) || contextLower.includes('update ' + keyLower)) {
          writePermission = 'Allow'
        }
      }
      
      permissions[key] = {
        read: readPermission,
        write: writePermission
      }
    }
    
    return {
      permissions,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        agent_id: agentContext.agent_id,
        context: agentContext.context
      }
    }
  }

  /**
   * Check if an operation is allowed for a key
   */
  checkPermission(key: string, operation: 'read' | 'write'): PermissionValue {
    const permission = this.getPermission(key)
    return permission[operation]
  }

  /**
   * Parse permission value (for determining if action is allowed)
   */
  isAllowed(permissionValue: PermissionValue): boolean {
    return permissionValue === 'Allow'
  }

  /**
   * Parse permission value (for determining if confirmation is needed)
   */
  needsConfirmation(permissionValue: PermissionValue): boolean {
    return permissionValue === 'Ask'
  }

  /**
   * Parse permission value (for determining if action is denied)
   */
  isDenied(permissionValue: PermissionValue): boolean {
    return permissionValue === 'Never'
  }

  /**
   * Clear all permissions
   */
  clearAuthority(): void {
    this.authority = {
      permissions: {},
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }
}

// Export singleton instance
export const grantAuthority = GrantAuthorityManager.getInstance()

export default grantAuthority