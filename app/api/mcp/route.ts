/**
 * MCP (Model Context Protocol) API Route - Stub
 * 
 * Temporarily disabled during HCP simplification.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: "MCP endpoint temporarily disabled during system simplification"
  }, { status: 503 })
}