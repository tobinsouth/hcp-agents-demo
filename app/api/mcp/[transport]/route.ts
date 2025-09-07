/**
 * MCP Transport Route - Stub
 * 
 * Temporarily disabled during HCP simplification.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: "MCP transport endpoint temporarily disabled during system simplification"
  }, { status: 503 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: "MCP transport endpoint temporarily disabled during system simplification"
  }, { status: 503 })
}