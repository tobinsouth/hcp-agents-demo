"use client"

import { useState, useEffect } from "react"
import { Button } from "../core/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../core/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../core/ui/card"
import { Badge } from "../core/ui/badge"
import { Loader2, Database, Trash2, CheckCircle, Info } from "lucide-react"
import { toast } from "sonner"

interface DemoLoaderProps {
  onDataLoaded?: () => void
  compact?: boolean
}

export function DemoLoader({ onDataLoaded, compact = false }: DemoLoaderProps) {
  const [loading, setLoading] = useState(false)
  const [demoStatus, setDemoStatus] = useState<any>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>("")

  useEffect(() => {
    checkDemoStatus()
  }, [])

  const checkDemoStatus = async () => {
    try {
      const response = await fetch("/api/demo?action=status")
      const data = await response.json()
      setDemoStatus(data)
    } catch (error) {
      console.error("Failed to check demo status:", error)
    }
  }

  const loadDemoData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scenario: selectedScenario || undefined,
          reset: true 
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(
          result.message || "Demo data loaded successfully",
          {
            description: `${result.stats?.clients || 0} clients and ${result.stats?.grants || 0} grants configured`,
          }
        )
        await checkDemoStatus()
        onDataLoaded?.()
      } else {
        toast.error("Failed to load demo data", {
          description: result.error || "Unknown error occurred",
        })
      }
    } catch (error) {
      toast.error("Failed to load demo data", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearDemoData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/demo", {
        method: "DELETE",
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success("Demo data cleared", {
          description: "System reset to initial state",
        })
        await checkDemoStatus()
        onDataLoaded?.()
      } else {
        toast.error("Failed to clear demo data")
      }
    } catch (error) {
      toast.error("Failed to clear demo data")
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={loadDemoData}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          <span className="ml-2">Load Demo</span>
        </Button>
        {demoStatus?.demo_mode && (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Demo Active
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data Manager
        </CardTitle>
        <CardDescription>
          Load pre-configured demo data to showcase HCP capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {demoStatus && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 text-sm">
              <span className="text-muted-foreground">Status: </span>
              {demoStatus.demo_mode ? (
                <Badge variant="default" className="ml-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Demo Mode Active
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-1">
                  Clean State
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Scenario Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scenario (Optional)</label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario to load" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default (All Data)</SelectItem>
              <SelectItem value="washingMachine">
                Washing Machine Purchase
              </SelectItem>
              <SelectItem value="furnitureShopping">
                Furniture Shopping
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Scenarios include specific preferences and authority grants
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={loadDemoData}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Load Demo Data
              </>
            )}
          </Button>
          <Button
            onClick={clearDemoData}
            disabled={loading}
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Loads Alex Chen&apos;s profile with sustainability preferences</p>
          <p>• Configures 3 demo clients with different access levels</p>
          <p>• Sets up realistic context for SF-based software developer</p>
        </div>
      </CardContent>
    </Card>
  )
}