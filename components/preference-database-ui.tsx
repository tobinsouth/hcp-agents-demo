"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getPreferences, subscribeToPreferences, type PreferenceData } from "@/lib/preferences"
import { Database, RefreshCw } from "lucide-react"

export function PreferenceDatabaseUI() {
  const [preferences, setPreferences] = useState<PreferenceData>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    // Fetch preferences immediately
    fetchPreferences()

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchPreferences, 2000)

    // Subscribe to local preference updates (for immediate feedback)
    const unsubscribe = subscribeToPreferences((newPreferences) => {
      setPreferences(newPreferences)
      setLastUpdated(new Date())
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences')
      if (response.ok) {
        const data = await response.json()
        if (JSON.stringify(data) !== JSON.stringify(preferences)) {
          setPreferences(data)
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  if (!preferences || Object.keys(preferences).length === 0) {
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Live Database</span>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          <div className="text-center">
            <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No preferences generated yet</p>
            <p className="text-sm">Start chatting to populate the database</p>
          </div>
        </div>
      </div>
    )
  }

  const renderPreferenceSection = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{title}</h4>
        <div className="space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-xs">
              <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
              <Badge variant="outline" className="text-xs">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDomainSection = (domain: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null
    
    return (
      <div className="space-y-2" key={domain}>
        <h4 className="font-medium text-sm text-blue-600 capitalize">{domain} Preferences</h4>
        <div className="space-y-1 pl-2 border-l-2 border-blue-200">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-xs">
              <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
              <Badge variant="secondary" className="text-xs">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header with last updated */}
      <div className="flex items-center justify-between flex-shrink-0">
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

      {/* Organized Preference Display */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-6 pr-4">
          {/* Core Behavioral Patterns */}
          {renderPreferenceSection("Communication Style", preferences.communication_style)}
          {renderPreferenceSection("Decision Making", preferences.decision_making)}
          {renderPreferenceSection("Values", preferences.values)}
          
          {/* Domain-Specific Preferences */}
          {preferences.domains && Object.keys(preferences.domains).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Domain-Specific Preferences</h3>
              {Object.entries(preferences.domains).map(([domain, data]) => 
                renderDomainSection(domain, data)
              )}
            </div>
          )}
          
          {/* Conversation Patterns */}
          {renderPreferenceSection("Conversation Insights", preferences.conversation_patterns)}
          
          {/* Legacy Support */}
          {renderPreferenceSection("Negotiation Priorities", preferences.negotiation_priorities)}
          {renderPreferenceSection("Constraints", preferences.constraints)}
          
          {/* Raw JSON Toggle */}
          <details className="mt-6">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Show Raw JSON
            </summary>
            <Card className="p-4 bg-muted/50 mt-2">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                {JSON.stringify(preferences, null, 2)}
              </pre>
            </Card>
          </details>
        </div>
      </ScrollArea>
    </div>
  )
}
