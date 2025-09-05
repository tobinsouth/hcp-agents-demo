/**
 * Grant of Authority Management
 *
 * This module handles the storage and management of authority grants
 * that control how and where human context is used by AI agents.
 * It defines which clients can access context data and what level
 * of autonomy they have when acting on behalf of the user.
 */

export type AutonomyLevel = "high_security" | "balanced" | "max_autonomy" | "custom"

export interface ContextSection {
  communication_style?: boolean
  decision_making?: boolean
  values?: boolean
  negotiation_priorities?: boolean
  constraints?: boolean
  domains?: {
    [domainName: string]: boolean
  }
  conversation_patterns?: boolean
}

export interface ClientAccess {
  clientId: string
  clientName: string
  clientType: "ai_assistant" | "agent" | "service" | "application"
  description?: string
  allowedSections: ContextSection
  restrictions?: string[]
  expiresAt?: string
  createdAt: string
  lastAccessed?: string
  accessCount?: number
}

export interface AutonomySettings {
  level: AutonomyLevel
  customSettings?: string
  requiresApproval?: {
    financial?: boolean
    legal?: boolean
    medical?: boolean
    personal_data?: boolean
    threshold_amount?: number
  }
  notificationPreferences?: {
    before_action?: boolean
    after_action?: boolean
    summary_frequency?: "immediate" | "hourly" | "daily" | "weekly"
  }
}

export interface GrantAuthority {
  version: string
  authorizedClients: ClientAccess[]
  autonomySettings: AutonomySettings
  globalRestrictions?: string[]
  lastUpdated: string
  auditLog?: AuditEntry[]
}

export interface AuditEntry {
  timestamp: string
  action: "grant_added" | "grant_revoked" | "settings_changed" | "access_attempt"
  clientId?: string
  details: string
  success: boolean
}

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
let grantAuthority: GrantAuthority = {
  version: "1.0.0",
  authorizedClients: [
    {
      clientId: "claude-assistant",
      clientName: "Claude AI Assistant",
      clientType: "ai_assistant",
      description: "Primary AI assistant for general tasks",
      allowedSections: {
        communication_style: true,
        decision_making: true,
        values: true,
        conversation_patterns: true,
        domains: {
          furniture: true,
          food: true,
          travel: true,
          technology: true
        }
      },
      createdAt: new Date().toISOString(),
      accessCount: 0
    },
    {
      clientId: "shopping-agent",
      clientName: "Shopping Agent",
      clientType: "agent",
      description: "Specialized agent for e-commerce negotiations",
      allowedSections: {
        negotiation_priorities: true,
        constraints: true,
        values: true,
        domains: {
          furniture: true,
          technology: true
        }
      },
      restrictions: ["Cannot access personal conversation patterns"],
      createdAt: new Date().toISOString(),
      accessCount: 0
    }
  ],
  autonomySettings: {
    level: "balanced",
    requiresApproval: {
      financial: true,
      legal: true,
      medical: true,
      personal_data: false,
      threshold_amount: 500
    },
    notificationPreferences: {
      before_action: false,
      after_action: true,
      summary_frequency: "daily"
    }
  },
  globalRestrictions: [
    "No sharing of context with third parties without explicit consent",
    "Must respect data retention policies",
    "Cannot modify core preference data without user confirmation"
  ],
  lastUpdated: new Date().toISOString(),
  auditLog: []
}

// Subscribers for real-time updates
type AuthoritySubscriber = (authority: GrantAuthority) => void
const subscribers: Set<AuthoritySubscriber> = new Set()

/**
 * Updates the grant authority configuration
 */
export function updateGrantAuthority(updates: Partial<GrantAuthority>): void {
  grantAuthority = {
    ...grantAuthority,
    ...updates,
    lastUpdated: new Date().toISOString(),
    version: grantAuthority.version
  }

  // Add audit log entry
  if (grantAuthority.auditLog) {
    grantAuthority.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "settings_changed",
      details: "Grant authority settings updated",
      success: true
    })
  }

  // Notify all subscribers of the update
  subscribers.forEach((subscriber) => subscriber(grantAuthority))

  console.log("[GrantAuthority] Updated:", updates)
}

/**
 * Adds a new authorized client
 */
export function addAuthorizedClient(client: ClientAccess): void {
  const existingIndex = grantAuthority.authorizedClients.findIndex(
    c => c.clientId === client.clientId
  )

  if (existingIndex >= 0) {
    // Update existing client
    grantAuthority.authorizedClients[existingIndex] = client
  } else {
    // Add new client
    grantAuthority.authorizedClients.push(client)
  }

  grantAuthority.lastUpdated = new Date().toISOString()

  // Add audit log entry
  if (grantAuthority.auditLog) {
    grantAuthority.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "grant_added",
      clientId: client.clientId,
      details: `Authorized client ${client.clientName}`,
      success: true
    })
  }

  // Notify subscribers
  subscribers.forEach((subscriber) => subscriber(grantAuthority))

  console.log("[GrantAuthority] Client added:", client.clientName)
}

/**
 * Removes an authorized client
 */
export function removeAuthorizedClient(clientId: string): void {
  const client = grantAuthority.authorizedClients.find(c => c.clientId === clientId)
  
  grantAuthority.authorizedClients = grantAuthority.authorizedClients.filter(
    c => c.clientId !== clientId
  )

  grantAuthority.lastUpdated = new Date().toISOString()

  // Add audit log entry
  if (grantAuthority.auditLog && client) {
    grantAuthority.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "grant_revoked",
      clientId: clientId,
      details: `Revoked access for ${client.clientName}`,
      success: true
    })
  }

  // Notify subscribers
  subscribers.forEach((subscriber) => subscriber(grantAuthority))

  console.log("[GrantAuthority] Client removed:", clientId)
}

/**
 * Updates autonomy settings
 */
export function updateAutonomySettings(settings: AutonomySettings): void {
  grantAuthority.autonomySettings = settings
  grantAuthority.lastUpdated = new Date().toISOString()

  // Add audit log entry
  if (grantAuthority.auditLog) {
    grantAuthority.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "settings_changed",
      details: `Autonomy level changed to ${settings.level}`,
      success: true
    })
  }

  // Notify subscribers
  subscribers.forEach((subscriber) => subscriber(grantAuthority))

  console.log("[GrantAuthority] Autonomy settings updated:", settings.level)
}

/**
 * Checks if a client has access to a specific section
 */
export function checkClientAccess(clientId: string, section: keyof ContextSection): boolean {
  const client = grantAuthority.authorizedClients.find(c => c.clientId === clientId)
  
  if (!client) {
    console.log("[GrantAuthority] Access denied: Client not found")
    return false
  }

  // Check expiration
  if (client.expiresAt && new Date(client.expiresAt) < new Date()) {
    console.log("[GrantAuthority] Access denied: Client authorization expired")
    return false
  }

  // Update access metrics
  client.lastAccessed = new Date().toISOString()
  client.accessCount = (client.accessCount || 0) + 1

  // Check section access
  const hasAccess = client.allowedSections[section] === true

  // Add audit log entry
  if (grantAuthority.auditLog) {
    grantAuthority.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "access_attempt",
      clientId: clientId,
      details: `Access ${hasAccess ? 'granted' : 'denied'} for section: ${section}`,
      success: hasAccess
    })
  }

  console.log(`[GrantAuthority] Access ${hasAccess ? 'granted' : 'denied'} for ${client.clientName} to ${section}`)
  
  return hasAccess
}

/**
 * Retrieves the current grant authority configuration
 */
export function getGrantAuthority(): GrantAuthority {
  return { ...grantAuthority }
}

/**
 * Subscribes to grant authority updates for real-time UI updates
 */
export function subscribeToGrantAuthority(callback: AuthoritySubscriber): () => void {
  subscribers.add(callback)

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback)
  }
}

/**
 * Gets filtered preferences based on client access rights
 */
export function getFilteredPreferences(clientId: string, fullPreferences: any): any {
  const client = grantAuthority.authorizedClients.find(c => c.clientId === clientId)
  
  if (!client) {
    return {}
  }

  const filtered: any = {}

  // Filter based on allowed sections
  if (client.allowedSections.communication_style && fullPreferences.communication_style) {
    filtered.communication_style = fullPreferences.communication_style
  }
  if (client.allowedSections.decision_making && fullPreferences.decision_making) {
    filtered.decision_making = fullPreferences.decision_making
  }
  if (client.allowedSections.values && fullPreferences.values) {
    filtered.values = fullPreferences.values
  }
  if (client.allowedSections.negotiation_priorities && fullPreferences.negotiation_priorities) {
    filtered.negotiation_priorities = fullPreferences.negotiation_priorities
  }
  if (client.allowedSections.constraints && fullPreferences.constraints) {
    filtered.constraints = fullPreferences.constraints
  }
  if (client.allowedSections.conversation_patterns && fullPreferences.conversation_patterns) {
    filtered.conversation_patterns = fullPreferences.conversation_patterns
  }

  // Filter domains
  if (client.allowedSections.domains && fullPreferences.domains) {
    filtered.domains = {}
    for (const [domain, allowed] of Object.entries(client.allowedSections.domains)) {
      if (allowed && fullPreferences.domains[domain]) {
        filtered.domains[domain] = fullPreferences.domains[domain]
      }
    }
  }

  return filtered
}

/**
 * Resets grant authority to default settings (useful for demo reset)
 */
export function resetGrantAuthority(): void {
  grantAuthority = {
    version: "1.0.0",
    authorizedClients: [],
    autonomySettings: {
      level: "balanced"
    },
    lastUpdated: new Date().toISOString(),
    auditLog: []
  }
  
  subscribers.forEach((subscriber) => subscriber(grantAuthority))
}