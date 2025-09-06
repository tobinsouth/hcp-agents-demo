/**
 * MCP (Model Context Protocol) Transport Route
 * 
 * This endpoint exposes all HCP functionality as MCP-compatible tools
 * that can be consumed by any MCP client (Claude Desktop, CLI tools, etc.)
 */

import { createMcpHandler } from "mcp-handler"
import { z } from "zod"
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
} from "@/lib/hcp/adapters"
import { hcp } from "@/lib/hcp/core"
import type { HCPAccessRequest } from "@/lib/hcp/types"

// Create the MCP handler with all HCP tools
const handler = createMcpHandler(
  (server) => {
    // ========================================================================
    // Context Management Tools
    // ========================================================================

    server.tool(
      "hcp_get_context",
      "Get the full or filtered human context based on client access",
      {
        clientId: z.string().default("system").describe("Client ID for access control"),
        filtered: z.boolean().default(false).describe("Whether to apply access filters")
      },
      async (params) => {
        const context = params.filtered && params.clientId !== "system"
          ? await getFilteredHumanContext(params.clientId)
          : await getHumanContext(params.clientId)
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(context, null, 2)
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_update_context",
      "Update the human context with new data",
      {
        data: z.record(z.any()).describe("Context data to update"),
        clientId: z.string().default("system").describe("Client ID making the update"),
        merge: z.boolean().default(true).describe("Whether to merge with existing data")
      },
      async (params) => {
        await updateHumanContext(params.data, params.clientId, params.merge)
        return {
          content: [
            {
              type: "text",
              text: "Context updated successfully"
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_clear_context",
      "Clear all human context data",
      {},
      async () => {
        clearHumanContext()
        return {
          content: [
            {
              type: "text",
              text: "Context cleared successfully"
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_get_context_completeness",
      "Get completeness metrics for the human context",
      {
        clientId: z.string().default("system").describe("Client ID for access control")
      },
      async (params) => {
        const context = await getFilteredHumanContext(params.clientId)
        const completeness = getContextCompleteness(context)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(completeness, null, 2)
            }
          ]
        }
      }
    )

    // ========================================================================
    // Preference Management Tools
    // ========================================================================

    server.tool(
      "hcp_get_preferences",
      "Get user preferences",
      {},
      async () => {
        const preferences = getPreferences()
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(preferences, null, 2)
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_update_preferences",
      "Update user preferences",
      {
        preferences: z.record(z.any()).describe("Preferences to update")
      },
      async (params) => {
        updatePreferences(params.preferences)
        return {
          content: [
            {
              type: "text",
              text: "Preferences updated successfully"
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_get_filtered_preferences",
      "Get filtered preferences based on client access",
      {
        clientId: z.string().describe("Client ID for access control")
      },
      async (params) => {
        const fullPreferences = getPreferences()
        const filtered = await getFilteredPreferences(params.clientId, fullPreferences)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(filtered, null, 2)
            }
          ]
        }
      }
    )

    // ========================================================================
    // Grant Authority Management Tools
    // ========================================================================

    server.tool(
      "hcp_get_authority",
      "Get the current grant of authority configuration",
      {},
      async () => {
        const authority = getGrantAuthority()
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(authority, null, 2)
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_update_authority",
      "Update the grant of authority configuration",
      {
        authority: z.object({
          version: z.string().optional(),
          authorizedClients: z.array(z.any()).optional(),
          autonomySettings: z.any().optional(),
          globalRestrictions: z.array(z.string()).optional(),
          lastUpdated: z.string().optional(),
          auditLog: z.array(z.any()).optional()
        }).describe("Authority configuration to update")
      },
      async (params) => {
        updateGrantAuthority(params.authority)
        return {
          content: [
            {
              type: "text",
              text: "Grant authority updated successfully"
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_reset_authority",
      "Reset grant authority to default state",
      {},
      async () => {
        resetGrantAuthority()
        return {
          content: [
            {
              type: "text",
              text: "Grant authority reset successfully"
            }
          ]
        }
      }
    )

    // ========================================================================
    // Client Management Tools
    // ========================================================================

    server.tool(
      "hcp_add_client",
      "Add an authorized client with specific permissions",
      {
        clientId: z.string().describe("Unique identifier for the client"),
        name: z.string().describe("Human-readable name for the client"),
        permissions: z.array(z.string()).describe("List of permissions/sections the client can access"),
        expiresAt: z.string().optional().describe("Expiration date in ISO format")
      },
      async (params) => {
        addAuthorizedClient(params)
        return {
          content: [
            {
              type: "text",
              text: `Client ${params.clientId} added successfully`
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_remove_client",
      "Remove an authorized client",
      {
        clientId: z.string().describe("Client ID to remove")
      },
      async (params) => {
        removeAuthorizedClient(params.clientId)
        return {
          content: [
            {
              type: "text",
              text: `Client ${params.clientId} removed successfully`
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_check_access",
      "Check if a client has access to a specific section",
      {
        clientId: z.string().describe("Client ID to check"),
        section: z.string().describe("Section to check access for")
      },
      async (params) => {
        const hasAccess = await checkClientAccess(params.clientId, params.section)
        return {
          content: [
            {
              type: "text",
              text: `Client ${params.clientId} ${hasAccess ? "has" : "does not have"} access to ${params.section}`
            }
          ]
        }
      }
    )

    // ========================================================================
    // Autonomy Settings Tools
    // ========================================================================

    server.tool(
      "hcp_update_autonomy",
      "Update autonomy settings for AI agents",
      {
        settings: z.object({
          level: z.enum(["high", "medium", "low", "none"]).optional(),
          allowedActions: z.array(z.string()).optional(),
          requireConfirmation: z.array(z.string()).optional(),
          maxAutonomousTasks: z.number().optional()
        }).describe("Autonomy settings to update")
      },
      async (params) => {
        updateAutonomySettings(params.settings)
        return {
          content: [
            {
              type: "text",
              text: "Autonomy settings updated successfully"
            }
          ]
        }
      }
    )

    // ========================================================================
    // Audit and Logging Tools
    // ========================================================================

    server.tool(
      "hcp_get_access_log",
      "Get the access audit log",
      {
        limit: z.number().default(100).describe("Maximum number of entries to return"),
        clientId: z.string().optional().describe("Filter by specific client ID")
      },
      async (params) => {
        const log = getAccessLog()
        let filteredLog = log
        
        if (params.clientId) {
          filteredLog = log.filter(entry => entry.clientId === params.clientId)
        }
        
        filteredLog = filteredLog.slice(-params.limit)
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(filteredLog, null, 2)
            }
          ]
        }
      }
    )

    // ========================================================================
    // Advanced HCP Access Tool
    // ========================================================================

    server.tool(
      "hcp_access",
      "Direct HCP access for advanced operations",
      {
        clientId: z.string().default("system").describe("Client making the request"),
        action: z.enum(["read", "write", "execute"]).describe("Action to perform"),
        sections: z.array(z.string()).optional().describe("Specific sections to access"),
        data: z.record(z.any()).optional().describe("Data for write operations"),
        capability: z.string().optional().describe("Specific capability to execute"),
        metadata: z.record(z.any()).optional().describe("Additional metadata")
      },
      async (params) => {
        const request: HCPAccessRequest = {
          clientId: params.clientId,
          action: params.action,
          sections: params.sections,
          data: params.data,
          capability: params.capability,
          metadata: params.metadata,
          timestamp: new Date().toISOString()
        }
        
        const response = await hcp.accessContext(request)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        }
      }
    )

    // ========================================================================
    // Demo Data Tools
    // ========================================================================

    server.tool(
      "hcp_load_demo",
      "Load demo data for testing",
      {
        scenario: z.enum(["empty", "basic", "complete", "developer", "creative", "analyst"])
          .describe("Demo scenario to load")
      },
      async (params) => {
        const result = await hcp.loadDemoData(params.scenario)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      }
    )

    server.tool(
      "hcp_get_demo_summary",
      "Get a summary of available demo scenarios",
      {},
      async () => {
        const { getDemoSummary } = await import("@/lib/hcp/demo-data")
        const summary = getDemoSummary()
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2)
            }
          ]
        }
      }
    )

    // ========================================================================
    // System Information Tools
    // ========================================================================

    server.tool(
      "hcp_health",
      "Check HCP system health",
      {},
      async () => {
        const health = {
          status: "healthy",
          version: hcp.getContext("system").version,
          timestamp: new Date().toISOString(),
          capabilities: {
            context: true,
            preferences: true,
            authority: true,
            audit: true,
            plugins: []  // Plugin capabilities would be listed here if available
          }
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(health, null, 2)
            }
          ]
        }
      }
    )

    // ========================================================================
    // Analytics Tools (if available)
    // ========================================================================

    server.tool(
      "hcp_get_analytics",
      "Get system analytics and usage metrics",
      {},
      async () => {
        try {
          const request: HCPAccessRequest = {
            clientId: "system",
            action: "execute",
            capability: "get-analytics",
            timestamp: new Date().toISOString()
          }
          
          const response = await hcp.accessContext(request)
          if (response.success) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(response.data, null, 2)
                }
              ]
            }
          }
          return {
            content: [
              {
                type: "text",
                text: "Analytics not available"
              }
            ]
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching analytics: ${error instanceof Error ? error.message : "Unknown error"}`
              }
            ]
          }
        }
      }
    )

    // Server information would be provided here if supported
  },
  undefined, // No server options needed
  {
    // Handler configuration
    basePath: "/api/mcp"
    // No Redis configuration for now - just basic transport
  }
)

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST }