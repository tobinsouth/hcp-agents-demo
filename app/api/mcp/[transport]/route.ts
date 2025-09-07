/**
 * MCP (Model Context Protocol) API Route
 * 
 * Exposes HCP functionality through MCP tools for AI agent integration.
 * This simple implementation provides access to context, authority, and permissions.
 */

import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { hcp } from '@/lib/hcp/core'
import { grantAuthority } from '@/lib/hcp/grant-authority'
import { agentContext } from '@/lib/hcp/agent-context'

const handler = createMcpHandler(
  (server) => {
    // Get User Context Tool
    server.tool(
      'get_user_context',
      'Retrieve the current user context containing preferences, values, and behavioral patterns',
      {
        keys: z
          .array(z.string())
          .optional()
          .describe('Optional list of specific context keys to retrieve. If not provided, returns full context.')
      },
      async ({ keys }) => {
        try {
          const context = hcp.getContext()
          
          // Filter context if specific keys requested
          if (keys && keys.length > 0) {
            const filtered: any = {}
            for (const key of keys) {
              if (key in context) {
                filtered[key] = context[key]
              }
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(filtered, null, 2)
              }]
            }
          }
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(context, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error retrieving context: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // Get Grant of Authority Tool
    server.tool(
      'get_authority',
      'Retrieve the current grant of authority showing what permissions are granted',
      {},
      async () => {
        try {
          const authority = grantAuthority.getAuthority()
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(authority, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error retrieving authority: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // Check Permission Tool
    server.tool(
      'check_permission',
      'Check the permission level for a specific context key',
      {
        key: z
          .string()
          .describe('The context key to check permissions for')
      },
      async ({ key }) => {
        try {
          const permission = grantAuthority.getPermission(key)
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(permission, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error checking permission: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // Generate Agent Context Tool
    server.tool(
      'generate_agent_context',
      'Generate a context object for a specific agent with appropriate permissions',
      {
        agent_id: z
          .string()
          .optional()
          .describe('The ID of the agent requesting context'),
        purpose: z
          .string()
          .optional()
          .describe('The purpose for which the agent needs context'),
        includeUserContext: z
          .boolean()
          .optional()
          .default(true)
          .describe('Whether to include user context in the response')
      },
      async ({ agent_id, purpose, includeUserContext }) => {
        try {
          const context = agentContext.generateAgentContext({
            agent_id,
            purpose,
            includeUserContext
          })
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(context, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error generating agent context: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // Update Context Tool
    server.tool(
      'update_context',
      'Update specific values in the user context (requires write permissions)',
      {
        updates: z
          .record(z.any())
          .describe('An object containing the key-value pairs to update in the context')
      },
      async ({ updates }) => {
        try {
          hcp.updateContext(updates)
          return {
            content: [{
              type: 'text',
              text: 'Context updated successfully'
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error updating context: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // Set Permission Tool
    server.tool(
      'set_permission',
      'Set the permission level for a specific context key',
      {
        key: z
          .string()
          .describe('The context key to set permissions for'),
        permission: z
          .object({
            read: z.enum(['Allow', 'Ask', 'Never']).describe('Read permission level'),
            write: z.enum(['Allow', 'Ask', 'Never']).describe('Write permission level')
          })
          .describe('The permission object specifying access levels')
      },
      async ({ key, permission }) => {
        try {
          grantAuthority.setPermission(key, permission)
          return {
            content: [{
              type: 'text',
              text: `Permission for "${key}" updated successfully`
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error setting permission: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // List Available Context Keys Tool
    server.tool(
      'list_context_keys',
      'List all available context keys in the system',
      {},
      async () => {
        try {
          const keys = hcp.getAllKeys()
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ keys }, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error listing keys: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
        }
      }
    )

    // Health Check Tool
    server.tool(
      'health_check',
      'Check if the HCP system is healthy and operational',
      {},
      async () => {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'healthy',
              service: 'HCP MCP Adapter',
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        }
      }
    )
  },
  {},  // Server options (empty for now)
  {
    // Runtime configuration
    basePath: '/api/mcp',  // Must match the directory structure
    verboseLogs: true
  }
)

export { handler as GET, handler as POST }