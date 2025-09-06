/**
 * Demo Data API Route
 * 
 * Provides endpoints for loading and managing demo data in the HCP system
 */

import { NextRequest, NextResponse } from 'next/server'
import { hcp, loadDemoData, getDemoSummary, DEMO_SCENARIOS } from '@/lib/hcp'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'summary'

  try {
    switch (action) {
      case 'summary': {
        const summary = getDemoSummary()
        return NextResponse.json({
          ...summary,
          loaded: hcp.isDemoMode(),
          available_scenarios: Object.keys(DEMO_SCENARIOS)
        })
      }

      case 'scenarios': {
        return NextResponse.json({
          scenarios: Object.keys(DEMO_SCENARIOS),
          descriptions: Object.entries(DEMO_SCENARIOS).map(([key, scenario]) => ({
            id: key,
            preferences: Object.keys(scenario.preferences?.domains || {}),
            authority: scenario.authority?.clientId
          }))
        })
      }

      case 'status': {
        return NextResponse.json({
          demo_mode: hcp.isDemoMode(),
          context_version: hcp.getContext('system')?.version,
          clients_count: hcp.getAuditLog().length > 0 ? 'active' : 'minimal'
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Demo API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario, reset = false } = body

    // Reset if requested
    if (reset) {
      hcp.reset()
    }

    // Load demo data
    const result = await loadDemoData(hcp, scenario)
    
    return NextResponse.json({
      ...result,
      demo_mode: hcp.isDemoMode()
    })
  } catch (error) {
    console.error('[Demo API] Error loading demo data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load demo data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Reset to clean state
    hcp.reset()
    
    return NextResponse.json({
      success: true,
      message: 'Demo data cleared',
      demo_mode: false
    })
  } catch (error) {
    console.error('[Demo API] Error clearing demo data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear demo data' },
      { status: 500 }
    )
  }
}