"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

  useEffect(() => {
    // Fetch initial data
    fetchAuthority()
    fetchContextKeys()

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

  const handleInitializePermissions = async () => {
    try {
      await fetch("/api/hcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize-permissions"
        })
      })
      fetchAuthority()
    } catch (error) {
      console.error("Error initializing permissions:", error)
    }
  }

  const handleSetAllPermissions = async (read: PermissionValue, write: PermissionValue) => {
    for (const key of contextKeys) {
      await fetch("/api/hcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-permission",
          data: { key, permission: { read, write } }
        })
      })
    }
    fetchAuthority()
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
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-shrink-0 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium">Grant of Authority</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchAuthority}
            className="h-8 sm:h-7 px-2 min-w-[44px] sm:min-w-0"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleInitializePermissions}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[32px]"
            >
              Initialize All Keys
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSetAllPermissions('Allow', 'Never')}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[32px]"
            >
              Read-Only
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSetAllPermissions('Allow', 'Allow')}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[32px]"
            >
              Full Access
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSetAllPermissions('Never', 'Never')}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[32px]"
            >
              Block All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions List */}
      <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-2 pr-4">
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
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{key}</p>
                          </div>
                          
                          {isEditing && editingValues ? (
                            <div className="flex items-center gap-2">
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
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:h-7 sm:w-7 p-0 min-w-[32px] sm:min-w-0"
                                onClick={saveEditing}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:h-7 sm:w-7 p-0 min-w-[32px] sm:min-w-0"
                                onClick={cancelEditing}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${permissionColors[permission.read] || permissionColors.default}`}
                              >
                                {permissionIcons[permission.read] || permissionIcons.default}
                                <span className="ml-1">Read: {permission.read}</span>
                              </Badge>
                              
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${permissionColors[permission.write] || permissionColors.default}`}
                              >
                                {permissionIcons[permission.write] || permissionIcons.default}
                                <span className="ml-1">Write: {permission.write}</span>
                              </Badge>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 sm:h-7 sm:w-7 p-0 min-w-[32px] sm:min-w-0"
                                onClick={() => startEditing(key)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
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
    </div>
  )
}