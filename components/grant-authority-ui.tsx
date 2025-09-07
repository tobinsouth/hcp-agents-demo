"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Shield, 
  Lock, 
  Unlock, 
  Settings, 
  RefreshCw,
  Eye,
  Edit,
  Check,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type PermissionValue = 'Allow' | 'Ask' | 'Never' | string

interface Permission {
  read: PermissionValue
  write: PermissionValue
}

interface GrantOfAuthority {
  permissions: Record<string, Permission>
  metadata?: {
    created_at: string
    updated_at: string
    agent_id?: string
    context?: string
  }
}

const permissionColors: Record<string, string> = {
  Allow: "bg-green-500/10 text-green-600 border-green-500/20",
  Ask: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Never: "bg-red-500/10 text-red-600 border-red-500/20",
  default: "bg-blue-500/10 text-blue-600 border-blue-500/20"
}

const permissionIcons: Record<string, React.ReactNode> = {
  Allow: <Unlock className="w-3 h-3" />,
  Ask: <Eye className="w-3 h-3" />,
  Never: <Lock className="w-3 h-3" />,
  default: <Settings className="w-3 h-3" />
}

export function GrantAuthorityUI() {
  const [authority, setAuthority] = useState<GrantOfAuthority | null>(null)
  const [contextKeys, setContextKeys] = useState<string[]>([])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValues, setEditingValues] = useState<Permission | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [currentPolicy, setCurrentPolicy] = useState<string>('allow-list')

  useEffect(() => {
    // Fetch initial data
    fetchAuthority()
    fetchContextKeys()
    fetchDefaultPolicy()

    // Set up polling for updates
    const interval = setInterval(() => {
      fetchAuthority()
      fetchContextKeys()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const fetchAuthority = async () => {
    try {
      const response = await fetch("/api/hcp?endpoint=authority")
      if (response.ok) {
        const data = await response.json()
        setAuthority(data)
        if (data.metadata?.updated_at) {
          setLastUpdated(new Date(data.metadata.updated_at))
        }
      }
    } catch (error) {
      console.error("Error fetching authority:", error)
    }
  }

  const fetchContextKeys = async () => {
    try {
      const response = await fetch("/api/hcp?endpoint=context-keys")
      if (response.ok) {
        const data = await response.json()
        setContextKeys(data.keys || [])
      }
    } catch (error) {
      console.error("Error fetching context keys:", error)
    }
  }

  const fetchDefaultPolicy = async () => {
    try {
      const response = await fetch("/api/hcp?endpoint=default-policy")
      if (response.ok) {
        const data = await response.json()
        setCurrentPolicy(data.policy || 'allow-list')
      }
    } catch (error) {
      console.error("Error fetching default policy:", error)
    }
  }

  const handlePermissionChange = async (key: string, permission: Permission) => {
    try {
      await fetch("/api/hcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-permission",
          data: { key, permission }
        })
      })
      setEditingKey(null)
      setEditingValues(null)
      fetchAuthority()
    } catch (error) {
      console.error("Error updating permission:", error)
    }
  }



  const handlePolicyChange = async (policy: string) => {
    // Update the local state
    setCurrentPolicy(policy)
    
    // Store the policy on the backend (as runtime override only)
    try {
      await fetch("/api/hcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-default-policy",
          data: { policy }
        })
      })
      // Refresh to show the effect of the override
      fetchAuthority()
    } catch (error) {
      console.error("Error setting default policy:", error)
    }
  }

  const startEditing = (key: string) => {
    const current = authority?.permissions[key] || { read: 'Ask', write: 'Ask' }
    setEditingKey(key)
    setEditingValues({ ...current })
  }

  const cancelEditing = () => {
    setEditingKey(null)
    setEditingValues(null)
  }

  const saveEditing = () => {
    if (editingKey && editingValues) {
      handlePermissionChange(editingKey, editingValues)
    }
  }

  if (!authority) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading grant authority...</p>
          </div>
        </div>
      </div>
    )
  }

  const allKeys = [...new Set([...Object.keys(authority.permissions), ...contextKeys])]

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden p-4">

      {/* Permissions List */}
      <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-2 pr-4">
          {/* Default Grant Policy */}
          <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Default Grant of Authority</span>
              </div>
              <Select value={currentPolicy} onValueChange={handlePolicyChange}>
                <SelectTrigger className="w-[220px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="share-everything">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-3 h-3 text-red-500" />
                      <span>Always share everything</span>
                      <span className="text-red-500 text-xs">(dangerous)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ask-permission">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3 text-yellow-500" />
                      <span>Always ask permission</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="allow-list">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-green-500" />
                      <span>Use allow list</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AnimatePresence>
            {allKeys.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No context keys available yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Add data to context to see permissions</p>
                </CardContent>
              </Card>
            ) : (
              allKeys.map((key, index) => {
                const permission = authority.permissions[key] || { read: 'Ask', write: 'Ask' }
                const isEditing = editingKey === key
                
                // Determine if default policy is overriding
                let isOverridden = false
                
                if (currentPolicy === 'share-everything') {
                  isOverridden = permission.read !== 'Allow' || permission.write !== 'Allow'
                } else if (currentPolicy === 'allow-list') {
                  // Only override if not explicitly allowed
                  if (!(permission.read === 'Allow' || permission.write === 'Allow')) {
                    isOverridden = permission.read !== 'Never' || permission.write !== 'Never'
                  }
                }
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className={`hover:shadow-sm transition-shadow relative ${isOverridden ? 'opacity-75' : ''}`}>
                      {isOverridden && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500/50" title="Overridden by default policy" />
                      )}
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{key}</p>
                          </div>
                          
                          {isEditing && editingValues ? (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Select
                                value={editingValues.read}
                                onValueChange={(value) => 
                                  setEditingValues({ ...editingValues, read: value as PermissionValue })
                                }
                              >
                                <SelectTrigger className="w-24 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Allow">Allow</SelectItem>
                                  <SelectItem value="Ask">Ask</SelectItem>
                                  <SelectItem value="Never">Never</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Select
                                value={editingValues.write}
                                onValueChange={(value) => 
                                  setEditingValues({ ...editingValues, write: value as PermissionValue })
                                }
                              >
                                <SelectTrigger className="w-24 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Allow">Allow</SelectItem>
                                  <SelectItem value="Ask">Ask</SelectItem>
                                  <SelectItem value="Never">Never</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <button
                                className="h-8 w-8 sm:h-7 sm:w-7 p-0 min-w-[32px] sm:min-w-0 rounded-lg hover:bg-green-500/10 text-green-600 transition-all duration-200 flex items-center justify-center"
                                onClick={saveEditing}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                className="h-8 w-8 sm:h-7 sm:w-7 p-0 min-w-[32px] sm:min-w-0 rounded-lg hover:bg-red-500/10 text-red-600 transition-all duration-200 flex items-center justify-center"
                                onClick={cancelEditing}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant="outline" 
                                className={`text-xs flex-shrink-0 ${isOverridden ? 'opacity-60' : ''} ${permissionColors[permission.read] || permissionColors.default}`}
                              >
                                {permissionIcons[permission.read] || permissionIcons.default}
                                <span className="ml-1 hidden sm:inline">Read:</span>
                                <span className="ml-1">{permission.read}</span>
                              </Badge>
                              
                              <Badge 
                                variant="outline" 
                                className={`text-xs flex-shrink-0 ${isOverridden ? 'opacity-60' : ''} ${permissionColors[permission.write] || permissionColors.default}`}
                              >
                                {permissionIcons[permission.write] || permissionIcons.default}
                                <span className="ml-1 hidden sm:inline">Write:</span>
                                <span className="ml-1">{permission.write}</span>
                              </Badge>
                              
                              <button
                                className="h-8 w-8 sm:h-7 sm:w-7 p-0 min-w-[32px] sm:min-w-0 rounded-lg hover:bg-accent/50 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                                onClick={() => startEditing(key)}
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
      
      {/* Bottom section with last updated and refresh */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-shrink-0 mt-4 pt-4 border-t border-border/30"
      >
        {lastUpdated && (
          <Badge variant="secondary" className="text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        )}
        <button
          onClick={fetchAuthority}
          className="h-7 px-2 rounded-lg hover:bg-accent/50 transition-all duration-200"
          title="Refresh authority"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </motion.div>
    </div>
  )
}