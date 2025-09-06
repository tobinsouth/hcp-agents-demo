/**
 * HCP Adapters for Backward Compatibility
 * 
 * These adapters maintain compatibility with the existing API structure
 * while using the new unified HCP core library internally.
 */

import { hcp } from './core'
import type { 
  HCPContext, 
  HCPAccessRequest, 
  LegacyPreferenceData,
  LegacyGrantAuthority 
} from './types'
import { DEMO_PREFERENCES, DEMO_CONTEXT, loadDemoData } from './demo-data'

// ============================================================================
// Preferences Adapter (replaces lib/preferences.ts functionality)
// ============================================================================

// Initialize with demo data on first access
let demoDataLoaded = false
let demoDataLoading = false

/**
 * Ensure demo data is loaded
 */
async function ensureDemoData() {
  if (!demoDataLoaded && !demoDataLoading && !hcp.isDemoMode()) {
    demoDataLoading = true
    try {
      await loadDemoData(hcp)
      hcp.setDemoMode(true)
      demoDataLoaded = true
    } catch (error) {
      console.error('[HCP] Failed to load demo data:', error)
    } finally {
      demoDataLoading = false
    }
  }
}

/**
 * Get preferences in legacy format
 */
export function getPreferences(): LegacyPreferenceData {
  // Schedule demo data loading if needed (non-blocking)
  if (!demoDataLoaded && !demoDataLoading && !hcp.isDemoMode()) {
    ensureDemoData().catch(console.error)
  }
  
  const context = hcp.getContext('system') as HCPContext
  
  // If context is empty, return demo preferences
  if (!context.preferences?.communication || Object.keys(context.preferences.communication).length === 0) {
    return DEMO_PREFERENCES
  }
  
  // Transform HCP context to legacy preference format
  return {
    communication_style: context.preferences?.communication || {},
    decision_making: context.preferences?.decision_making || {},
    values: context.preferences?.values || {},
    negotiation_priorities: {
      price_sensitivity: context.preferences?.domains?.negotiation?.price_sensitivity,
      timeline_flexibility: context.preferences?.domains?.negotiation?.timeline_flexibility,
      quality_importance: context.preferences?.domains?.negotiation?.quality_importance,
      relationship_focus: context.preferences?.domains?.negotiation?.relationship_focus
    },
    constraints: context.constraints?.soft || {},
    domains: context.preferences?.domains || {},
    conversation_patterns: context.behavioral?.interaction || {},
    last_updated: context.metadata?.last_updated,
    version: context.version
  }
}

/**
 * Update preferences in legacy format
 */
export function updatePreferences(updates: Partial<LegacyPreferenceData>): void {
  const contextUpdates: any = {
    preferences: {
      communication: updates.communication_style,
      decision_making: updates.decision_making,
      values: updates.values,
      domains: updates.domains
    },
    behavioral: {
      interaction: updates.conversation_patterns
    },
    constraints: {
      soft: updates.constraints
    }
  }
  
  // Handle negotiation priorities as a special domain
  if (updates.negotiation_priorities) {
    if (!contextUpdates.preferences.domains) {
      contextUpdates.preferences.domains = {}
    }
    contextUpdates.preferences.domains.negotiation = updates.negotiation_priorities
  }
  
  hcp.updateContext(contextUpdates, 'preferences-adapter')
}

// Subscriber management for preferences
const preferenceSubscribers = new Set<(prefs: LegacyPreferenceData) => void>()

hcp.on('contextUpdated', () => {
  const prefs = getPreferences()
  preferenceSubscribers.forEach(subscriber => subscriber(prefs))
})

export function subscribeToPreferences(callback: (prefs: LegacyPreferenceData) => void): () => void {
  preferenceSubscribers.add(callback)
  return () => preferenceSubscribers.delete(callback)
}

export function clearPreferences(): void {
  hcp.reset()
}

// ============================================================================
// Human Context Adapter (replaces lib/human-context.ts functionality)
// ============================================================================

/**
 * Get human context for a specific client
 */
export async function getHumanContext(clientId: string = "system"): Promise<any> {
  await ensureDemoData()
  
  const request: HCPAccessRequest = {
    clientId,
    action: 'read',
    sections: ['*'],
    timestamp: new Date().toISOString()
  }
  
  const response = await hcp.accessContext(request)
  
  if (response.success) {
    return response.data
  }
  
  throw new Error(response.error || 'Failed to access context')
}

/**
 * Get filtered human context based on client permissions
 */
export async function getFilteredHumanContext(clientId: string): Promise<any> {
  await ensureDemoData()
  
  const request: HCPAccessRequest = {
    clientId,
    action: 'read',
    sections: ['*'],  // HCP will filter based on grants
    timestamp: new Date().toISOString()
  }
  
  const response = await hcp.accessContext(request)
  
  if (response.success) {
    // Add legacy preference format to the response
    const context = response.data
    context.preferences = getPreferences()
    return context
  }
  
  return {}
}

/**
 * Update human context
 */
export async function updateHumanContext(
  updates: any,
  clientId: string = "system",
  merge: boolean = true
): Promise<void> {
  const request: HCPAccessRequest = {
    clientId,
    action: 'write',
    data: updates,
    metadata: { merge },
    timestamp: new Date().toISOString()
  }
  
  const response = await hcp.accessContext(request)
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to update context')
  }
}

/**
 * Get access log
 */
export function getAccessLog(): any[] {
  return hcp.getAuditLog()
}

/**
 * Clear human context
 */
export function clearHumanContext(): void {
  hcp.reset()
}

/**
 * Get context completeness score
 */
export function getContextCompleteness(context: any): number {
  const sections = [
    context.identity,
    context.preferences?.communication,
    context.preferences?.decision_making,
    context.preferences?.values,
    context.behavioral?.patterns,
    context.behavioral?.cognitive,
    context.behavioral?.interaction,
    context.capabilities?.technical
  ]
  
  const filledSections = sections.filter(s => s && Object.keys(s).length > 0).length
  return Math.round((filledSections / sections.length) * 100)
}

// Subscriber management for human context
const contextSubscribers = new Set<(context: any) => void>()

hcp.on('contextUpdated', async () => {
  const context = await getHumanContext('system')
  contextSubscribers.forEach(subscriber => subscriber(context))
})

export function subscribeToHumanContext(callback: (context: any) => void): () => void {
  contextSubscribers.add(callback)
  return () => contextSubscribers.delete(callback)
}

// ============================================================================
// Grant Authority Adapter (replaces lib/grant-authority.ts functionality)
// ============================================================================

/**
 * Get grant authority in legacy format
 */
export function getGrantAuthority(): LegacyGrantAuthority {
  const authority = hcp.getAuthority()
  
  // Transform grants Map to array format
  const authorizedClients: any[] = []
  authority.grants.forEach((grant, clientId) => {
    const client = (hcp as any).clients?.get(clientId)
    if (client) {
      authorizedClients.push({
        clientId: client.id,
        clientName: client.name,
        clientType: client.type,
        description: client.description,
        allowedSections: transformSectionsToLegacy(grant.allowed_sections),
        restrictions: grant.restrictions,
        expiresAt: grant.expires_at,
        createdAt: grant.granted_at,
        lastAccessed: client.last_accessed,
        accessCount: client.access_count
      })
    }
  })
  
  return {
    version: authority.version,
    authorizedClients,
    autonomySettings: authority.settings,
    globalRestrictions: [],  // Not directly mapped in new structure
    lastUpdated: authority.metadata.last_updated,
    auditLog: hcp.getAuditLog()
  }
}

/**
 * Update grant authority
 */
export function updateGrantAuthority(updates: Partial<LegacyGrantAuthority>): void {
  if (updates.autonomySettings) {
    updateAutonomySettings(updates.autonomySettings)
  }
  
  if (updates.authorizedClients) {
    // Clear existing grants and add new ones
    updates.authorizedClients.forEach(client => {
      addAuthorizedClient(client)
    })
  }
}

/**
 * Add or update an authorized client
 */
export function addAuthorizedClient(client: any): void {
  // Register client if not exists
  hcp.registerClient({
    id: client.clientId,
    name: client.clientName,
    type: client.clientType || 'application',
    description: client.description,
    capabilities: ['read', 'write'],
    metadata: {
      created_at: client.createdAt || new Date().toISOString()
    }
  })
  
  // Grant authority
  hcp.grantAuthority(client.clientId, {
    client_id: client.clientId,
    allowed_sections: transformSectionsFromLegacy(client.allowedSections),
    allowed_actions: ['read', 'write'],
    restrictions: client.restrictions,
    expires_at: client.expiresAt
  })
}

/**
 * Remove an authorized client
 */
export function removeAuthorizedClient(clientId: string): void {
  hcp.revokeAuthority(clientId)
}

/**
 * Update autonomy settings
 */
export function updateAutonomySettings(settings: any): void {
  const authority = hcp.getAuthority()
  authority.settings = { ...authority.settings, ...settings }
  // Note: In the new system, we'd need to expose a method to update settings
  // For now, we'll emit an event
  hcp.emit('authoritySettingsUpdated', settings)
}

/**
 * Check if a client has access to a specific section
 */
export async function checkClientAccess(clientId: string, section: string): Promise<boolean> {
  const request: HCPAccessRequest = {
    clientId,
    action: 'read',
    sections: [section],
    timestamp: new Date().toISOString()
  }
  
  const response = await hcp.accessContext(request)
  return response.success
}

/**
 * Get filtered preferences for a client
 */
export async function getFilteredPreferences(clientId: string, fullPreferences: any): Promise<any> {
  const request: HCPAccessRequest = {
    clientId,
    action: 'read',
    sections: ['preferences'],
    timestamp: new Date().toISOString()
  }
  
  const response = await hcp.accessContext(request)
  
  if (response.success) {
    return response.data.preferences || {}
  }
  
  return {}
}

/**
 * Reset grant authority
 */
export function resetGrantAuthority(): void {
  hcp.reset()
}

// Subscriber management for grant authority
const authoritySubscribers = new Set<(authority: LegacyGrantAuthority) => void>()

hcp.on('authorityGranted', () => {
  const authority = getGrantAuthority()
  authoritySubscribers.forEach(subscriber => subscriber(authority))
})

hcp.on('authorityRevoked', () => {
  const authority = getGrantAuthority()
  authoritySubscribers.forEach(subscriber => subscriber(authority))
})

export function subscribeToGrantAuthority(callback: (authority: LegacyGrantAuthority) => void): () => void {
  authoritySubscribers.add(callback)
  return () => authoritySubscribers.delete(callback)
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformSectionsToLegacy(sections: string[]): any {
  const legacySections: any = {}
  
  sections.forEach(section => {
    const path = section.split('.')
    if (path[0] === 'preferences') {
      if (path[1] === 'communication') {
        legacySections.communication_style = true
      } else if (path[1] === 'decision_making') {
        legacySections.decision_making = true
      } else if (path[1] === 'values') {
        legacySections.values = true
      } else if (path[1] === 'domains') {
        if (!legacySections.domains) legacySections.domains = {}
        if (path[2]) {
          legacySections.domains[path[2]] = true
        }
      }
    } else if (path[0] === 'behavioral' && path[1] === 'interaction') {
      legacySections.conversation_patterns = true
    } else if (path[0] === 'constraints') {
      legacySections.constraints = true
    }
  })
  
  return legacySections
}

function transformSectionsFromLegacy(legacySections: any): string[] {
  const sections: string[] = []
  
  if (legacySections.communication_style) {
    sections.push('preferences.communication')
  }
  if (legacySections.decision_making) {
    sections.push('preferences.decision_making')
  }
  if (legacySections.values) {
    sections.push('preferences.values')
  }
  if (legacySections.conversation_patterns) {
    sections.push('behavioral.interaction')
  }
  if (legacySections.constraints) {
    sections.push('constraints')
  }
  if (legacySections.negotiation_priorities) {
    sections.push('preferences.domains.negotiation')
  }
  if (legacySections.domains) {
    Object.keys(legacySections.domains).forEach(domain => {
      if (legacySections.domains[domain]) {
        sections.push(`preferences.domains.${domain}`)
      }
    })
  }
  
  return sections
}