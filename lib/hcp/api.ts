/**
 * HCP API Handlers
 * 
 * Provides HTTP and WebSocket API handlers for the HCP system
 */

import { NextRequest, NextResponse } from 'next/server'
import { hcp } from './core'
import type { HCPAPIRequest, HCPAPIResponse, HCPAccessRequest } from './types'
import { 
  getPreferences,
  updatePreferences,
  getHumanContext,
  getFilteredHumanContext,
  updateHumanContext,
  clearHumanContext,
  getAccessLog,
  getContextCompleteness,
  getGrantAuthority,
  updateGrantAuthority,
  addAuthorizedClient,
  removeAuthorizedClient,
  updateAutonomySettings,
  checkClientAccess,
  getFilteredPreferences,
  resetGrantAuthority
} from './adapters'

// ============================================================================
// HTTP API Handler
// ============================================================================

/**
 * Create a unified HCP API handler for Next.js
 */
export function createHCPAPIHandler() {
  return {
    /**
     * Handle GET requests
     */
    async GET(request: NextRequest): Promise<NextResponse> {
      const { searchParams } = new URL(request.url)
      const endpoint = searchParams.get('endpoint') || 'context'
      const clientId = searchParams.get('clientId') || 'system'
      const action = searchParams.get('action')

      try {
        switch (endpoint) {
          case 'context': {
            if (action === 'completeness') {
              const context = await getFilteredHumanContext(clientId)
              const completeness = getContextCompleteness(context)
              return NextResponse.json({ completeness })
            }
            
            const context = clientId === 'system' 
              ? await getHumanContext(clientId)
              : await getFilteredHumanContext(clientId)
            return NextResponse.json(context)
          }

          case 'preferences': {
            const preferences = getPreferences()
            return NextResponse.json(preferences)
          }

          case 'authority': {
            if (action === 'check-access') {
              const section = searchParams.get('section')
              if (section) {
                const hasAccess = await checkClientAccess(clientId, section)
                return NextResponse.json({ hasAccess })
              }
            }
            
            if (action === 'filtered-preferences') {
              const fullPreferences = getPreferences()
              const filtered = await getFilteredPreferences(clientId, fullPreferences)
              return NextResponse.json(filtered)
            }
            
            const authority = getGrantAuthority()
            return NextResponse.json(authority)
          }

          case 'audit': {
            const log = getAccessLog()
            return NextResponse.json({ log })
          }

          case 'analytics': {
            // Access analytics through plugin capability
            const request: HCPAccessRequest = {
              clientId: 'system',
              action: 'execute',
              capability: 'get-analytics',
              timestamp: new Date().toISOString()
            }
            
            const response = await hcp.accessContext(request)
            if (response.success) {
              return NextResponse.json(response.data)
            }
            return NextResponse.json({ error: 'Analytics not available' }, { status: 500 })
          }

          case 'health': {
            return NextResponse.json({
              status: 'healthy',
              version: hcp.getContext('system').version,
              timestamp: new Date().toISOString()
            })
          }

          default:
            return NextResponse.json(
              { error: `Unknown endpoint: ${endpoint}` },
              { status: 400 }
            )
        }
      } catch (error) {
        console.error(`[HCP API] Error in GET ${endpoint}:`, error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500 }
        )
      }
    },

    /**
     * Handle POST requests
     */
    async POST(request: NextRequest): Promise<NextResponse> {
      try {
        const body: HCPAPIRequest = await request.json()
        const { action, clientId = 'system', data, options } = body

        switch (action) {
          // Context operations
          case 'update-context': {
            await updateHumanContext(data, clientId, options?.merge !== false)
            return NextResponse.json({ success: true, message: 'Context updated' })
          }

          case 'clear-context': {
            clearHumanContext()
            return NextResponse.json({ success: true, message: 'Context cleared' })
          }

          // Preference operations
          case 'update-preferences': {
            updatePreferences(data)
            return NextResponse.json({ success: true, message: 'Preferences updated' })
          }

          // Authority operations
          case 'update-authority': {
            updateGrantAuthority(data)
            return NextResponse.json({ success: true })
          }

          case 'add-client': {
            addAuthorizedClient(data)
            return NextResponse.json({ success: true })
          }

          case 'remove-client': {
            removeAuthorizedClient(data.clientId)
            return NextResponse.json({ success: true })
          }

          case 'update-autonomy': {
            updateAutonomySettings(data)
            return NextResponse.json({ success: true })
          }

          case 'reset-authority': {
            resetGrantAuthority()
            return NextResponse.json({ success: true })
          }

          // Demo operations
          case 'load-demo': {
            const { scenario } = data
            const result = await hcp.loadDemoData(scenario)
            return NextResponse.json(result)
          }

          case 'get-demo-summary': {
            const { getDemoSummary } = await import('./demo-data')
            const summary = getDemoSummary()
            return NextResponse.json(summary)
          }

          // Plugin operations
          case 'register-plugin': {
            const { pluginId } = data
            // Load and register plugin dynamically
            // This is simplified - in production, you'd have proper plugin loading
            return NextResponse.json({ 
              success: false, 
              error: 'Dynamic plugin loading not implemented' 
            })
          }

          // Direct HCP access (for advanced use cases)
          case 'access': {
            const accessRequest: HCPAccessRequest = {
              clientId,
              action: data.accessAction || 'read',
              sections: data.sections,
              data: data.accessData,
              capability: data.capability,
              metadata: data.metadata,
              timestamp: new Date().toISOString()
            }
            
            const response = await hcp.accessContext(accessRequest)
            return NextResponse.json(response)
          }

          default:
            return NextResponse.json(
              { error: `Unknown action: ${action}` },
              { status: 400 }
            )
        }
      } catch (error) {
        console.error('[HCP API] Error in POST:', error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500 }
        )
      }
    },

    /**
     * Handle DELETE requests
     */
    async DELETE(request: NextRequest): Promise<NextResponse> {
      const { searchParams } = new URL(request.url)
      const clientId = searchParams.get('clientId')

      try {
        if (clientId) {
          removeAuthorizedClient(clientId)
          return NextResponse.json({ success: true })
        }

        return NextResponse.json(
          { error: 'Client ID required' },
          { status: 400 }
        )
      } catch (error) {
        console.error('[HCP API] Error in DELETE:', error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

// ============================================================================
// WebSocket Handler
// ============================================================================

/**
 * Create a WebSocket handler for real-time HCP updates
 */
export function createHCPWebSocketHandler() {
  return {
    /**
     * Handle WebSocket connection
     */
    onConnection(ws: any, request: any) {
      const url = new URL(request.url, `http://${request.headers.host}`)
      const clientId = url.searchParams.get('clientId') || 'anonymous'
      
      console.log(`[HCP WebSocket] Client connected: ${clientId}`)

      // Subscribe to HCP events
      const handlers = {
        contextUpdated: (event: any) => {
          ws.send(JSON.stringify({
            type: 'context-update',
            data: event,
            timestamp: new Date().toISOString()
          }))
        },
        authorityGranted: (event: any) => {
          ws.send(JSON.stringify({
            type: 'authority-granted',
            data: event,
            timestamp: new Date().toISOString()
          }))
        },
        authorityRevoked: (event: any) => {
          ws.send(JSON.stringify({
            type: 'authority-revoked',
            data: event,
            timestamp: new Date().toISOString()
          }))
        },
        access: (event: any) => {
          if (event.clientId === clientId || clientId === 'system') {
            ws.send(JSON.stringify({
              type: 'access',
              data: event,
              timestamp: new Date().toISOString()
            }))
          }
        },
        accessDenied: (event: any) => {
          if (event.clientId === clientId || clientId === 'system') {
            ws.send(JSON.stringify({
              type: 'access-denied',
              data: event,
              timestamp: new Date().toISOString()
            }))
          }
        }
      }

      // Register event handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        hcp.on(event, handler)
      })

      // Handle incoming messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message)
          
          switch (data.type) {
            case 'subscribe': {
              // Client wants to subscribe to specific events
              ws.send(JSON.stringify({
                type: 'subscribed',
                events: data.events || Object.keys(handlers),
                timestamp: new Date().toISOString()
              }))
              break
            }

            case 'access': {
              // Client wants to access context
              const request: HCPAccessRequest = {
                clientId,
                action: data.action || 'read',
                sections: data.sections,
                data: data.data,
                capability: data.capability,
                metadata: data.metadata,
                timestamp: new Date().toISOString()
              }
              
              const response = await hcp.accessContext(request)
              ws.send(JSON.stringify({
                type: 'access-response',
                requestId: data.requestId,
                response,
                timestamp: new Date().toISOString()
              }))
              break
            }

            case 'ping': {
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }))
              break
            }

            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: `Unknown message type: ${data.type}`,
                timestamp: new Date().toISOString()
              }))
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Invalid message',
            timestamp: new Date().toISOString()
          }))
        }
      })

      // Handle disconnection
      ws.on('close', () => {
        console.log(`[HCP WebSocket] Client disconnected: ${clientId}`)
        
        // Unregister event handlers
        Object.entries(handlers).forEach(([event, handler]) => {
          hcp.off(event, handler)
        })
      })

      // Send initial state
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString()
      }))
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a complete HCP API route handler for Next.js App Router
 */
export function createHCPRoute() {
  const handler = createHCPAPIHandler()
  return {
    GET: handler.GET,
    POST: handler.POST,
    DELETE: handler.DELETE
  }
}

/**
 * Create middleware for HCP authentication
 */
export function createHCPAuthMiddleware(options?: {
  requireAuth?: boolean
  allowedClients?: string[]
}) {
  return async (request: NextRequest) => {
    const clientId = request.headers.get('x-hcp-client-id') || 'anonymous'
    
    if (options?.requireAuth && clientId === 'anonymous') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (options?.allowedClients && !options.allowedClients.includes(clientId)) {
      return NextResponse.json(
        { error: 'Client not authorized' },
        { status: 403 }
      )
    }
    
    // Add client ID to request for downstream use
    const headers = new Headers(request.headers)
    headers.set('x-hcp-client-id', clientId)
    
    return NextResponse.next({
      request: {
        headers
      }
    })
  }
}