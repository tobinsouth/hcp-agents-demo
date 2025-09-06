/**
 * MCP (Model Context Protocol) API Route
 * 
 * This endpoint exposes all HCP functionality as MCP-compatible tools
 * that can be consumed by any MCP client (Claude Desktop, CLI tools, etc.)
 * 
 * Implements JSON-RPC 2.0 specification for MCP compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
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

// Define the MCP tool schemas
const MCP_TOOLS = [
  {
    name: "hcp_get_context",
    description: "Get the full or filtered human context based on client access",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", default: "system", description: "Client ID for access control" },
        filtered: { type: "boolean", default: false, description: "Whether to apply access filters" }
      }
    }
  },
  {
    name: "hcp_update_context",
    description: "Update the human context with new data",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "object", description: "Context data to update" },
        clientId: { type: "string", default: "system", description: "Client ID making the update" },
        merge: { type: "boolean", default: true, description: "Whether to merge with existing data" }
      },
      required: ["data"]
    }
  },
  {
    name: "hcp_clear_context",
    description: "Clear all human context data",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "hcp_get_context_completeness",
    description: "Get completeness metrics for the human context",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", default: "system", description: "Client ID for access control" }
      }
    }
  },
  {
    name: "hcp_get_preferences",
    description: "Get user preferences",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "hcp_update_preferences",
    description: "Update user preferences",
    inputSchema: {
      type: "object",
      properties: {
        preferences: { type: "object", description: "Preferences to update" }
      },
      required: ["preferences"]
    }
  },
  {
    name: "hcp_get_filtered_preferences",
    description: "Get filtered preferences based on client access",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Client ID for access control" }
      },
      required: ["clientId"]
    }
  },
  {
    name: "hcp_get_authority",
    description: "Get the current grant of authority configuration",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "hcp_update_authority",
    description: "Update the grant of authority configuration",
    inputSchema: {
      type: "object",
      properties: {
        authority: {
          type: "object",
          properties: {
            version: { type: "string" },
            authorizedClients: { type: "array" },
            autonomySettings: { type: "object" },
            globalRestrictions: { type: "array", items: { type: "string" } },
            lastUpdated: { type: "string" },
            auditLog: { type: "array" }
          },
          description: "Authority configuration to update"
        }
      },
      required: ["authority"]
    }
  },
  {
    name: "hcp_reset_authority",
    description: "Reset grant authority to default state",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "hcp_add_client",
    description: "Add an authorized client with specific permissions",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Unique identifier for the client" },
        name: { type: "string", description: "Human-readable name for the client" },
        permissions: { type: "array", items: { type: "string" }, description: "List of permissions/sections the client can access" },
        expiresAt: { type: "string", description: "Expiration date in ISO format" }
      },
      required: ["clientId", "name", "permissions"]
    }
  },
  {
    name: "hcp_remove_client",
    description: "Remove an authorized client",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Client ID to remove" }
      },
      required: ["clientId"]
    }
  },
  {
    name: "hcp_check_access",
    description: "Check if a client has access to a specific section",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Client ID to check" },
        section: { type: "string", description: "Section to check access for" }
      },
      required: ["clientId", "section"]
    }
  },
  {
    name: "hcp_update_autonomy",
    description: "Update autonomy settings for AI agents",
    inputSchema: {
      type: "object",
      properties: {
        settings: {
          type: "object",
          properties: {
            level: { type: "string", enum: ["high", "medium", "low", "none"] },
            allowedActions: { type: "array", items: { type: "string" } },
            requireConfirmation: { type: "array", items: { type: "string" } },
            maxAutonomousTasks: { type: "number" }
          },
          description: "Autonomy settings to update"
        }
      },
      required: ["settings"]
    }
  },
  {
    name: "hcp_get_access_log",
    description: "Get the access audit log",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 100, description: "Maximum number of entries to return" },
        clientId: { type: "string", description: "Filter by specific client ID" }
      }
    }
  },
  {
    name: "hcp_access",
    description: "Direct HCP access for advanced operations",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", default: "system", description: "Client making the request" },
        action: { type: "string", enum: ["read", "write", "execute"], description: "Action to perform" },
        sections: { type: "array", items: { type: "string" }, description: "Specific sections to access" },
        data: { type: "object", description: "Data for write operations" },
        capability: { type: "string", description: "Specific capability to execute" },
        metadata: { type: "object", description: "Additional metadata" }
      },
      required: ["action"]
    }
  },
  {
    name: "hcp_load_demo",
    description: "Load demo data for testing",
    inputSchema: {
      type: "object",
      properties: {
        scenario: {
          type: "string",
          enum: ["empty", "basic", "complete", "developer", "creative", "analyst"],
          description: "Demo scenario to load"
        }
      },
      required: ["scenario"]
    }
  },
  {
    name: "hcp_get_demo_summary",
    description: "Get a summary of available demo scenarios",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "hcp_health",
    description: "Check HCP system health",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "hcp_get_analytics",
    description: "Get system analytics and usage metrics",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
]

// Tool execution handlers
async function executeTool(name: string, params: any): Promise<any> {
  switch (name) {
    case "hcp_get_context": {
      const context = params.filtered && params.clientId !== "system"
        ? await getFilteredHumanContext(params.clientId || "system")
        : await getHumanContext(params.clientId || "system")
      return context
    }

    case "hcp_update_context": {
      await updateHumanContext(params.data, params.clientId || "system", params.merge !== false)
      return { success: true, message: "Context updated successfully" }
    }

    case "hcp_clear_context": {
      clearHumanContext()
      return { success: true, message: "Context cleared successfully" }
    }

    case "hcp_get_context_completeness": {
      const context = await getFilteredHumanContext(params.clientId || "system")
      const completeness = getContextCompleteness(context)
      return completeness
    }

    case "hcp_get_preferences": {
      return getPreferences()
    }

    case "hcp_update_preferences": {
      updatePreferences(params.preferences)
      return { success: true, message: "Preferences updated successfully" }
    }

    case "hcp_get_filtered_preferences": {
      const fullPreferences = getPreferences()
      return await getFilteredPreferences(params.clientId, fullPreferences)
    }

    case "hcp_get_authority": {
      return getGrantAuthority()
    }

    case "hcp_update_authority": {
      updateGrantAuthority(params.authority)
      return { success: true, message: "Grant authority updated successfully" }
    }

    case "hcp_reset_authority": {
      resetGrantAuthority()
      return { success: true, message: "Grant authority reset successfully" }
    }

    case "hcp_add_client": {
      addAuthorizedClient(params)
      return { success: true, message: `Client ${params.clientId} added successfully` }
    }

    case "hcp_remove_client": {
      removeAuthorizedClient(params.clientId)
      return { success: true, message: `Client ${params.clientId} removed successfully` }
    }

    case "hcp_check_access": {
      const hasAccess = await checkClientAccess(params.clientId, params.section)
      return { hasAccess, clientId: params.clientId, section: params.section }
    }

    case "hcp_update_autonomy": {
      updateAutonomySettings(params.settings)
      return { success: true, message: "Autonomy settings updated successfully" }
    }

    case "hcp_get_access_log": {
      const log = getAccessLog()
      let filteredLog = log
      
      if (params.clientId) {
        filteredLog = log.filter((entry: any) => entry.clientId === params.clientId)
      }
      
      filteredLog = filteredLog.slice(-(params.limit || 100))
      return { log: filteredLog }
    }

    case "hcp_access": {
      const request: HCPAccessRequest = {
        clientId: params.clientId || "system",
        action: params.action,
        sections: params.sections,
        data: params.data,
        capability: params.capability,
        metadata: params.metadata,
        timestamp: new Date().toISOString()
      }
      
      return await hcp.accessContext(request)
    }

    case "hcp_load_demo": {
      return await hcp.loadDemoData(params.scenario)
    }

    case "hcp_get_demo_summary": {
      const { getDemoSummary } = await import("@/lib/hcp/demo-data")
      return getDemoSummary()
    }

    case "hcp_health": {
      return {
        status: "healthy",
        version: hcp.getContext("system").version,
        timestamp: new Date().toISOString(),
        capabilities: {
          context: true,
          preferences: true,
          authority: true,
          audit: true,
          plugins: []
        }
      }
    }

    case "hcp_get_analytics": {
      try {
        const request: HCPAccessRequest = {
          clientId: "system",
          action: "execute",
          capability: "get-analytics",
          timestamp: new Date().toISOString()
        }
        
        const response = await hcp.accessContext(request)
        if (response.success) {
          return response.data
        }
        return { error: "Analytics not available" }
      } catch (error) {
        return { error: `Error fetching analytics: ${error instanceof Error ? error.message : "Unknown error"}` }
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// Handle JSON-RPC 2.0 requests
async function handleJsonRpc(request: any): Promise<any> {
  const { jsonrpc, id, method, params } = request

  if (jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: id || null,
      error: {
        code: -32600,
        message: "Invalid Request"
      }
    }
  }

  try {
    switch (method) {
      case "initialize": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: "HCP MCP Server",
              version: "1.0.0"
            },
            capabilities: {
              tools: {}
            }
          }
        }
      }

      case "tools/list": {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        }
      }

      case "tools/call": {
        if (!params || !params.name) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: "Invalid params: tool name required"
            }
          }
        }

        try {
          const result = await executeTool(params.name, params.arguments || {})
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          }
        } catch (error) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32603,
              message: `Tool execution error: ${error instanceof Error ? error.message : "Unknown error"}`
            }
          }
        }
      }

      default: {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: "Method not found"
          }
        }
      }
    }
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: `Internal error: ${error instanceof Error ? error.message : "Unknown error"}`
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle single request or batch
    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map(handleJsonRpc))
      return NextResponse.json(responses)
    } else {
      const response = await handleJsonRpc(body)
      return NextResponse.json(response)
    }
  } catch (error) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error"
      }
    })
  }
}

export async function GET() {
  return NextResponse.json({
    name: "HCP MCP Server",
    version: "1.0.0",
    description: "Model Context Protocol server for Human Context Protocol operations",
    endpoints: {
      jsonrpc: "/api/mcp",
      methods: ["initialize", "tools/list", "tools/call"]
    },
    tools: MCP_TOOLS.length,
    example: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    }
  })
}