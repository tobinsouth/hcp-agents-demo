"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Archive, RefreshCw, CircleDot, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Simple inline expandable text component
const ExpandableText = ({ text, className }: { text: string, className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLongText = text.length > 80
  const truncatedText = isLongText ? text.slice(0, 80) + '...' : text
  
  if (!isLongText) {
    return (
      <Badge variant="outline" className="text-xs bg-muted/50">
        {text}
      </Badge>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer w-full inline-block",
          isExpanded ? "whitespace-pre-wrap leading-relaxed p-3 text-left" : "truncate"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className={cn("flex items-center gap-1", isExpanded && "block")}>
          <span className={cn(!isExpanded && "truncate flex-1")}>
            {isExpanded ? text : truncatedText}
          </span>
          {!isExpanded && (
            <MoreHorizontal className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-60" />
          )}
        </div>
      </Badge>
    </div>
  )
}

export function PreferenceDatabaseUI() {
  const [context, setContext] = useState<any>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    // Fetch context once on mount
    fetchContext()

    // Set up polling for updates (every 2 seconds)
    const interval = setInterval(fetchContext, 2000)

    return () => {
      clearInterval(interval)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContext = async () => {
    try {
      const response = await fetch('/api/hcp?endpoint=context')
      if (response.ok) {
        const data = await response.json()
        if (JSON.stringify(data) !== JSON.stringify(context)) {
          setContext(data)
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching context:', error)
    }
  }

  if (!context || Object.keys(context).length === 0) {
    return (
      <div className="flex flex-col h-full p-4">
        
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
            <p className="text-muted-foreground mb-2">No context captured yet</p>
            <p className="text-sm text-muted-foreground/70">Start interacting to build your context</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderContextSection = (title: string, data: any, index: number = 0) => {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return null
    
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
            {typeof data === 'object' && !Array.isArray(data) ? (
              Object.entries(data).map(([key, value], entryIndex) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (index * 0.1) + (entryIndex * 0.05) }}
                  className="flex flex-col gap-1 text-sm group"
                >
                  <span className="capitalize text-muted-foreground group-hover:text-foreground transition-colors text-xs">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <ExpandableText 
                    text={typeof value === 'object' && value !== null
                      ? JSON.stringify(value, null, 2)
                      : Array.isArray(value) 
                        ? value.join(', ') 
                        : String(value)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-sm text-muted-foreground"
              >
                {Array.isArray(data) ? data.join(', ') : String(data)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4">

      {/* Context Display */}
      <ScrollArea className="flex-1 min-h-0">
        <motion.div 
          className="space-y-6 pr-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Display all top-level context sections */}
          {Object.entries(context).map(([key, value], index) => 
            renderContextSection(
              key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), 
              value, 
              index
            )
          )}
          
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
                {JSON.stringify(context, null, 2)}
              </pre>
            </Card>
          </motion.details>
          
          {/* Last updated and refresh at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-6 pt-4 border-t border-border/30"
          >
            <AnimatePresence>
              {lastUpdated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="secondary" className="text-xs">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchContext}
              className="h-7 px-2"
              title="Refresh context"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </motion.div>
        </motion.div>
      </ScrollArea>
    </div>
  )
}