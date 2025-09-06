import { getPreferences } from "@/lib/hcp"
import { NextResponse } from "next/server"

export async function GET() {
  const preferences = getPreferences()
  return NextResponse.json(preferences)
}