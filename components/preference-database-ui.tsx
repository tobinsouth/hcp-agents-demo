"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getPreferences, subscribeToPreferences, type PreferenceData } from "@/lib/preferences"
import { Database, RefreshCw } from "lucide-react"

export function PreferenceDatabaseUI() {
  const [preferences, setPreferences] = useState<PreferenceData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    // Load initial preferences
    setPreferences(getPreferences())

    // Subscribe to preference updates
    const unsubscribe = subscribeToPreferences((newPreferences) => {
      setPreferences(newPreferences)
      setLastUpdated(new Date())
    })

    return unsubscribe
  }, [])

  if (!preferences) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No preferences generated yet</p>
          <p className="text-sm">Start chatting to populate the database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">Live Database</span>
        </div>
        {lastUpdated && (
          <Badge variant="secondary" className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            Updated {lastUpdated.toLocaleTimeString()}
          </Badge>
        )}
      </div>

      {/* JSON Display */}
      <ScrollArea className="h-[350px]">
        <Card className="p-4 bg-muted/50">
          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </Card>
      </ScrollArea>
    </div>
  )
}
