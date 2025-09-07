/**
 * HCP API Handlers - Simplified
 * 
 * Provides HTTP API handlers for the simplified HCP system
 */

import { NextRequest, NextResponse } from 'next/server'
import { hcp } from './core'
import { grantAuthority } from './grant-authority'
import { agentContext } from './agent-context'
import type { HCPAPIRequest, HCPAPIResponse, AgentContext } from './types'

// Ensure instances are initialized when the API is accessed
const ensureInitialized = () => {
  // Just accessing the instances will trigger their initialization
  hcp.getContext()
  grantAuthority.getAuthority()
}

/**
 * Create a unified HCP API handler for Next.js
 */
export function createHCPAPIHandler() {
  return {
    /**
     * Handle GET requests
     */
    async GET(request: NextRequest): Promise<NextResponse> {
      // Ensure demo data is initialized
      ensureInitialized()
      
      const { searchParams } = new URL(request.url)
      const endpoint = searchParams.get('endpoint') || 'context'

      try {
        switch (endpoint) {
          case 'context': {
            // Get the full HCP context
            const context = hcp.getContext()
            return NextResponse.json(context)
          }

          case 'authority': {
            // Get the current grant of authority with stored permissions
            const authority = grantAuthority.getAuthority()
            const policy = grantAuthority.getDefaultPolicy()
            
            // Include both stored and effective permissions
            const enhancedAuthority = {
              ...authority,
              defaultPolicy: policy,
              // Keep stored permissions as-is for display
              storedPermissions: authority.permissions
            }
            return NextResponse.json(enhancedAuthority)
          }

          case 'agent-context': {
            // Generate an agent context
            const agent_id = searchParams.get('agent_id') || undefined
            const purpose = searchParams.get('purpose') || undefined
            const includeUserContext = searchParams.get('includeUserContext') === 'true'
            
            const context = agentContext.generateAgentContext({
              agent_id,
              purpose,
              includeUserContext
            })
            
            return NextResponse.json(context)
          }

          case 'context-keys': {
            // Get all available context keys
            const keys = hcp.getAllKeys()
            return NextResponse.json({ keys })
          }

          case 'permission': {
            // Get permission for a specific key
            const key = searchParams.get('key')
            if (!key) {
              return NextResponse.json(
                { error: 'Key parameter required' },
                { status: 400 }
              )
            }
            const permission = grantAuthority.getPermission(key)
            return NextResponse.json(permission)
          }

          case 'default-policy': {
            // Get the default policy
            const policy = grantAuthority.getDefaultPolicy()
            return NextResponse.json({ policy })
          }

          case 'health': {
            return NextResponse.json({
              status: 'healthy',
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
      // Ensure demo data is initialized
      ensureInitialized()
      
      try {
        const body: HCPAPIRequest = await request.json()
        const { action, data, agentContext: agentCtx } = body

        switch (action) {
          // Context operations
          case 'update-context': {
            hcp.updateContext(data)
            return NextResponse.json({ success: true, message: 'Context updated' })
          }

          case 'set-context': {
            hcp.setContext(data)
            return NextResponse.json({ success: true, message: 'Context set' })
          }

          case 'clear-context': {
            hcp.clearContext()
            return NextResponse.json({ success: true, message: 'Context cleared' })
          }

          case 'set-value': {
            const { path, value } = data
            hcp.setValueAtPath(path, value)
            return NextResponse.json({ success: true, message: 'Value set' })
          }

          // Authority operations
          case 'set-authority': {
            grantAuthority.setAuthority(data)
            return NextResponse.json({ success: true, message: 'Authority set' })
          }

          case 'set-permission': {
            const { key, permission } = data
            grantAuthority.setPermission(key, permission)
            return NextResponse.json({ success: true, message: 'Permission set' })
          }

          case 'set-read-permission': {
            const { key, value } = data
            grantAuthority.setReadPermission(key, value)
            return NextResponse.json({ success: true, message: 'Read permission set' })
          }

          case 'set-write-permission': {
            const { key, value } = data
            grantAuthority.setWritePermission(key, value)
            return NextResponse.json({ success: true, message: 'Write permission set' })
          }

          case 'initialize-permissions': {
            grantAuthority.initializeDefaultPermissions()
            return NextResponse.json({ success: true, message: 'Default permissions initialized' })
          }

          case 'set-default-policy': {
            const { policy } = data
            if (!['share-everything', 'ask-permission', 'allow-list'].includes(policy)) {
              return NextResponse.json(
                { error: 'Invalid policy. Must be: share-everything, ask-permission, or allow-list' },
                { status: 400 }
              )
            }
            grantAuthority.setDefaultPolicy(policy)
            return NextResponse.json({ success: true, message: 'Default policy set' })
          }

          case 'clear-authority': {
            grantAuthority.clearAuthority()
            return NextResponse.json({ success: true, message: 'Authority cleared' })
          }

          // Agent context operations
          case 'generate-agent-authority': {
            if (!agentCtx) {
              return NextResponse.json(
                { error: 'Agent context required' },
                { status: 400 }
              )
            }
            const authority = grantAuthority.generateAuthorityForAgent(agentCtx)
            return NextResponse.json({ success: true, authority })
          }

          case 'generate-context-from-keys': {
            const { keys, agent_id } = data
            const context = agentContext.generateContextFromKeys(keys, agent_id)
            return NextResponse.json({ success: true, context })
          }

          case 'parse-agent-intent': {
            const { context } = data
            const intent = agentContext.parseAgentIntent(context)
            return NextResponse.json({ success: true, intent })
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
    }
  }
}

/**
 * Create a complete HCP API route handler for Next.js App Router
 */
export function createHCPRoute() {
  const handler = createHCPAPIHandler()
  return {
    GET: handler.GET,
    POST: handler.POST
  }
}