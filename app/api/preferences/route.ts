import { getPreferences } from "@/lib/preferences"
import { NextResponse } from "next/server"

export async function GET() {
  const preferences = getPreferences()
  return NextResponse.json(preferences)
}