import { NextResponse } from "next/server"
import { 
  getFilteredHumanContext,
  updateHumanContext,
  getAccessLog,
  clearHumanContext,
  getContextCompleteness
} from "@/lib/hcp"

export async function GET(req: Request) {
  try {
    // Get the human context for the chat UI client
    const context = await getFilteredHumanContext("claude-assistant")
    
    return NextResponse.json(context)
  } catch (error) {
    console.error("[HumanContext API] Error fetching context:", error)
    return NextResponse.json(
      { error: "Failed to fetch human context" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, data, clientId = "claude-assistant" } = body

    switch (action) {
      case "update":
        await updateHumanContext(data, clientId, true)
        return NextResponse.json({ success: true, message: "Context updated" })
      
      case "clear":
        clearHumanContext()
        return NextResponse.json({ success: true, message: "Context cleared" })
      
      case "get-log":
        const log = getAccessLog()
        return NextResponse.json({ log })
      
      case "get-completeness":
        const context = await getFilteredHumanContext(clientId)
        const completeness = getContextCompleteness(context as any)
        return NextResponse.json({ completeness })
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("[HumanContext API] Error processing request:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
