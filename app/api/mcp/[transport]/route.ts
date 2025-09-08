/**
 * MCP (Model Context Protocol) API Route
 * 
 * Provides minimal, robust HCP functionality through MCP tools for AI agent integration.
 * Focused on context access, authority management, and permission escalation.
 */

import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { hcp } from '@/lib/hcp/core'
import { grantAuthority } from '@/lib/hcp/grant-authority'
import type { HCPContext, Permission } from '@/lib/hcp/types'

const handler = createMcpHandler(
  (server) => {
    // Get Context Tool - Returns context filtered by grant of authority
    server.tool(
      'getContext',
      'Retrieve user context data filtered by granted permissions. Only returns fields where read permission is "Allow".',
      {
        fields: z
          .array(z.string())
          .optional()
          .describe('Optional list of specific field paths to retrieve (e.g., ["preferences.theme", "profile.name"]). If not provided, returns all allowed fields.')
      },
      async ({ fields }) => {
        try {
          const fullContext = hcp.getContext()
          const authority = grantAuthority.getAuthority()
          
          // Helper function to filter context based on permissions
          const filterContextByPermissions = (
            _context: HCPContext,
            requestedFields?: string[]
          ): HCPContext => {
            const filtered: HCPContext = {}
            const allKeys = hcp.getAllKeys()
            
            // Determine which keys to check
            const keysToCheck = requestedFields || allKeys
            
            for (const key of keysToCheck) {
              const permission = authority.permissions[key]
              
              // Only include fields with explicit "Allow" read permission
              if (permission && permission.read === 'Allow') {
                const value = hcp.getValueAtPath(key)
                if (value !== undefined) {
                  // Reconstruct nested structure
                  const keyParts = key.split('.')
                  let current = filtered
                  
                  for (let i = 0; i < keyParts.length - 1; i++) {
                    const part = keyParts[i]
                    if (!current[part]) {
                      current[part] = {}
                    }
                    current = current[part] as HCPContext
                  }
                  
                  current[keyParts[keyParts.length - 1]] = value
                }
              }
            }
            
            return filtered
          }
          
          const filteredContext = filterContextByPermissions(fullContext, fields)
          
          // Include metadata about what was accessed
          const accessedFields = fields || Object.keys(authority.permissions).filter(
            key => authority.permissions[key]?.read === 'Allow'
          )
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                context: filteredContext,
                metadata: {
                  accessed_at: new Date().toISOString(),
                  fields_accessed: accessedFields,
                  total_fields_available: hcp.getAllKeys().length,
                  fields_with_permission: accessedFields.length
                }
              }, null, 2)
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

    // Get Authority Tool - Returns current permissions with field descriptions
    server.tool(
      'get_authority',
      'Retrieve the current grant of authority showing field-level permissions and descriptions',
      {},
      async () => {
        try {
          const authority = grantAuthority.getAuthority()
          const allKeys = hcp.getAllKeys()
          
          // Enhance authority with field descriptions and current values
          const enhancedAuthority = {
            permissions: {} as Record<string, {
              permission: Permission,
              description: string,
              currentValueType: string,
              hasValue: boolean
            }>,
            metadata: authority.metadata,
            summary: {
              total_fields: allKeys.length,
              allowed_read: 0,
              allowed_write: 0,
              ask_permission: 0,
              denied: 0
            }
          }
          
          // Add descriptions and analyze permissions
          for (const key of allKeys) {
            const permission = authority.permissions[key] || { read: 'Never', write: 'Never' }
            const value = hcp.getValueAtPath(key)
            const hasValue = value !== undefined
            
            // Generate description based on key structure
            let description = key
            if (key.includes('preferences')) {
              description = `User preference: ${key.split('.').pop()}`
            } else if (key.includes('profile')) {
              description = `Profile information: ${key.split('.').pop()}`
            } else if (key.includes('settings')) {
              description = `System setting: ${key.split('.').pop()}`
            } else if (key.includes('history')) {
              description = `Historical data: ${key.split('.').pop()}`
            }
            
            enhancedAuthority.permissions[key] = {
              permission,
              description,
              currentValueType: hasValue ? typeof value : 'undefined',
              hasValue
            }
            
            // Update summary
            if (permission.read === 'Allow') enhancedAuthority.summary.allowed_read++
            if (permission.write === 'Allow') enhancedAuthority.summary.allowed_write++
            if (permission.read === 'Ask' || permission.write === 'Ask') {
              enhancedAuthority.summary.ask_permission++
            }
            if (permission.read === 'Never' && permission.write === 'Never') {
              enhancedAuthority.summary.denied++
            }
          }
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(enhancedAuthority, null, 2)
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

    // Escalate Authority Tool - Request elevated permissions for specific fields
    server.tool(
      'escalate_authority',
      'Request escalation of permissions for specific fields. Use this when you need access to fields currently restricted.',
      {
        escalations: z
          .array(z.object({
            field: z
              .string()
              .describe('The field path to escalate permissions for (e.g., "preferences.theme")'),
            permission: z
              .object({
                read: z
                  .enum(['Allow', 'Ask', 'Never'])
                  .optional()
                  .describe('Requested read permission level'),
                write: z
                  .enum(['Allow', 'Ask', 'Never'])
                  .optional()
                  .describe('Requested write permission level')
              })
              .describe('The permission levels being requested'),
            justification: z
              .string()
              .describe('Explanation of why this escalation is needed')
          }))
          .describe('List of permission escalation requests'),
        context: z
          .string()
          .optional()
          .describe('Overall context for why these escalations are being requested')
      },
      async ({ escalations, context }) => {
        try {
          const results: Array<{
            field: string,
            status: 'approved' | 'pending' | 'denied',
            previous: Permission,
            requested: Partial<Permission>,
            current: Permission,
            reason?: string
          }> = []
          
          for (const escalation of escalations) {
            const previousPermission = grantAuthority.getPermission(escalation.field)
            
            // Determine if escalation should be approved
            // In production, this would involve user confirmation or policy checks
            let status: 'approved' | 'pending' | 'denied' = 'pending'
            let reason = ''
            
            // Simple heuristic for demo: 
            // - Allow escalation from Never to Ask
            // - Allow escalation from Ask to Allow if justification is provided
            // - Deny escalation to write on sensitive fields
            const isSensitiveField = escalation.field.includes('password') || 
                                   escalation.field.includes('secret') || 
                                   escalation.field.includes('private')
            
            if (isSensitiveField && escalation.permission.write === 'Allow') {
              status = 'denied'
              reason = 'Cannot grant write access to sensitive fields'
            } else if (escalation.justification && escalation.justification.length > 10) {
              // If good justification provided, approve the escalation
              status = 'approved'
              
              // Apply the escalation
              const newPermission: Permission = {
                read: escalation.permission.read || previousPermission.read,
                write: escalation.permission.write || previousPermission.write
              }
              grantAuthority.setPermission(escalation.field, newPermission)
              reason = 'Escalation approved based on justification'
            } else {
              status = 'pending'
              reason = 'Requires user confirmation'
            }
            
            results.push({
              field: escalation.field,
              status,
              previous: previousPermission,
              requested: escalation.permission,
              current: grantAuthority.getPermission(escalation.field),
              reason
            })
          }
          
          // Update authority metadata
          const authority = grantAuthority.getAuthority()
          if (authority.metadata) {
            authority.metadata.updated_at = new Date().toISOString()
            if (context) {
              authority.metadata.context = context
            }
          }
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                escalation_results: results,
                metadata: {
                  processed_at: new Date().toISOString(),
                  total_requests: escalations.length,
                  approved: results.filter(r => r.status === 'approved').length,
                  pending: results.filter(r => r.status === 'pending').length,
                  denied: results.filter(r => r.status === 'denied').length,
                  context
                }
              }, null, 2)
            }]
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error processing escalation: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          }
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