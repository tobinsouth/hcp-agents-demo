"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { subscribeToPreferences, type PreferenceData } from "@/lib/preferences"
import { Archive, RefreshCw, CircleDot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function PreferenceDatabaseUI() {
  const [preferences, setPreferences] = useState<PreferenceData>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    // Fetch preferences once on mount
    fetchPreferences()

    // Subscribe to local preference updates (for immediate feedback)
    const unsubscribe = subscribeToPreferences((newPreferences) => {
      setPreferences(newPreferences)
      setLastUpdated(new Date())
    })

    return () => {
      unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-shrink-0 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Archive className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">Preference Database</span>
          </div>
        </motion.div>
        
        {/* Empty state */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center flex-1"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Archive className="w-8 h-8 text-muted-foreground" />
              </div>
            </motion.div>
            <p className="text-muted-foreground mb-2">No preferences captured yet</p>
            <p className="text-sm text-muted-foreground/70">Start chatting to build your context profile</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderPreferenceSection = (title: string, data: any, index: number = 0) => {
    if (!data || Object.keys(data).length === 0) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <CircleDot className="w-3 h-3 text-primary" />
          <h4 className="font-medium text-sm" style={{ fontFamily: 'var(--font-crimson)' }}>{title}</h4>
        </div>
        <div className="space-y-2 pl-5">
          <AnimatePresence>
            {Object.entries(data).map(([key, value], entryIndex) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (index * 0.1) + (entryIndex * 0.05) }}
                className="flex justify-between items-center text-sm group"
              >
                <span className="capitalize text-muted-foreground group-hover:text-foreground transition-colors">
                  {key.replace(/_/g, ' ')}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-xs bg-muted/50 hover:bg-muted transition-colors cursor-default"
                >
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  const renderDomainSection = (domain: string, data: any, index: number = 0) => {
    if (!data || Object.keys(data).length === 0) return null
    
    return (
      <motion.div 
        key={domain}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h4 className="font-medium text-sm capitalize text-primary" style={{ fontFamily: 'var(--font-crimson)' }}>
            {domain} Preferences
          </h4>
        </div>
        <div className="space-y-2 pl-4 border-l border-border/50">
          <AnimatePresence>
            {Object.entries(data).map(([key, value], entryIndex) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (index * 0.1) + (entryIndex * 0.05) }}
                className="flex justify-between items-center text-sm group"
              >
                <span className="capitalize text-muted-foreground group-hover:text-foreground transition-colors">
                  {key.replace(/_/g, ' ')}
                </span>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors cursor-default"
                >
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header with last updated */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-shrink-0 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Archive className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium">Preference Database</span>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {lastUpdated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="secondary" className="text-xs">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchPreferences}
            className="h-7 px-2"
            title="Refresh preferences"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>

      {/* Organized Preference Display */}
      <ScrollArea className="flex-1 min-h-0">
        <motion.div 
          className="space-y-8 pr-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Core Behavioral Patterns */}
          {renderPreferenceSection("Communication Style", preferences.communication_style, 0)}
          {renderPreferenceSection("Decision Making", preferences.decision_making, 1)}
          {renderPreferenceSection("Values", preferences.values, 2)}
          
          {/* Domain-Specific Preferences */}
          {preferences.domains && Object.keys(preferences.domains).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <h3 className="font-semibold" style={{ fontFamily: 'var(--font-crimson)' }}>Domain-Specific</h3>
              </div>
              <div className="space-y-6 pl-4">
                {Object.entries(preferences.domains).map(([domain, data], index) => 
                  renderDomainSection(domain, data, index)
                )}
              </div>
            </motion.div>
          )}
          
          {/* Conversation Patterns */}
          {renderPreferenceSection("Conversation Insights", preferences.conversation_patterns, 3)}
          
          {/* Legacy Support */}
          {renderPreferenceSection("Negotiation Priorities", preferences.negotiation_priorities, 4)}
          {renderPreferenceSection("Constraints", preferences.constraints, 5)}
          
          {/* Raw JSON Toggle */}
          <motion.details 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors mb-3">
              Show Raw JSON
            </summary>
            <Card className="p-4 bg-muted/30 backdrop-blur-sm border-border/50">
              <pre className="text-xs text-foreground/80 whitespace-pre-wrap" style={{ fontFamily: 'var(--font-mono)' }}>
                {JSON.stringify(preferences, null, 2)}
              </pre>
            </Card>
          </motion.details>
        </motion.div>
      </ScrollArea>
    </div>
  )
}
