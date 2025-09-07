/**
 * Demo API Route
 * 
 * Provides status and control for demo data
 */

import { NextRequest, NextResponse } from 'next/server'
import { hcp } from '@/lib/hcp/core'
import { grantAuthority } from '@/lib/hcp/grant-authority'
import { DEMO_CONTEXT, DEMO_PERMISSIONS } from '@/lib/hcp/demo-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'status': {
      const context = hcp.getContext()
      const authority = grantAuthority.getAuthority()
      
      return NextResponse.json({
        hasContext: Object.keys(context).length > 0,
        hasPermissions: Object.keys(authority.permissions).length > 0,
        contextKeys: Object.keys(context),
        permissionKeys: Object.keys(authority.permissions).length
      })
    }

    case 'reset': {
      // Reset to demo data
      hcp.setContext(DEMO_CONTEXT)
      grantAuthority.setAuthority({
        permissions: DEMO_PERMISSIONS,
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          context: "Demo configuration reset"
        }
      })
      
      return NextResponse.json({
        success: true,
        message: "Reset to demo data"
      })
    }

    case 'clear': {
      // Clear all data
      hcp.clearContext()
      grantAuthority.clearAuthority()
      
      return NextResponse.json({
        success: true,
        message: "All data cleared"
      })
    }

    default:
      return NextResponse.json({
        error: "Invalid action. Use ?action=status, ?action=reset, or ?action=clear"
      }, { status: 400 })
  }
}