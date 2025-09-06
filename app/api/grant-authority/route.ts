import { NextRequest, NextResponse } from "next/server"
import {
  getGrantAuthority,
  updateGrantAuthority,
  addAuthorizedClient,
  removeAuthorizedClient,
  updateAutonomySettings,
  checkClientAccess,
  getFilteredPreferences,
  resetGrantAuthority,
  getPreferences
} from "@/lib/hcp"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const clientId = searchParams.get("clientId")

  // Check client access to specific sections
  if (action === "check-access" && clientId) {
    const section = searchParams.get("section")
    if (section) {
      const hasAccess = await checkClientAccess(clientId, section as any)
      return NextResponse.json({ hasAccess })
    }
  }

  // Get filtered preferences for a specific client
  if (action === "filtered-preferences" && clientId) {
    const fullPreferences = getPreferences()
    const filtered = await getFilteredPreferences(clientId, fullPreferences)
    return NextResponse.json(filtered)
  }

  // Default: return full grant authority configuration
  const grantAuthority = getGrantAuthority()
  return NextResponse.json(grantAuthority)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "update":
        // Update entire grant authority configuration
        updateGrantAuthority(body.data)
        return NextResponse.json({ success: true })

      case "add-client":
        // Add or update an authorized client
        addAuthorizedClient(body.client)
        return NextResponse.json({ success: true })

      case "remove-client":
        // Remove an authorized client
        removeAuthorizedClient(body.clientId)
        return NextResponse.json({ success: true })

      case "update-autonomy":
        // Update autonomy settings
        updateAutonomySettings(body.settings)
        return NextResponse.json({ success: true })

      case "reset":
        // Reset to default settings
        resetGrantAuthority()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("[GrantAuthority API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get("clientId")

  if (clientId) {
    removeAuthorizedClient(clientId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json(
    { error: "Client ID required" },
    { status: 400 }
  )
}