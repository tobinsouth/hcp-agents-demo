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
  Allow: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200/60 shadow-emerald-100/50",
  Ask: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200/60 shadow-amber-100/50", 
  Never: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200/60 shadow-rose-100/50",
  default: "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200/60 shadow-slate-100/50"
}

const permissionBoxColors: Record<string, string> = {
  Allow: "bg-gradient-to-br from-emerald-50/80 to-green-50/80 border-emerald-200/40",
  Ask: "bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border-amber-200/40",
  Never: "bg-gradient-to-br from-rose-50/80 to-red-50/80 border-rose-200/40",
  default: "bg-gradient-to-br from-slate-50/80 to-gray-50/80 border-slate-200/40"
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
      <div className="flex flex-col h-full p-3 sm:p-6 bg-gradient-to-b from-slate-50/30 via-white to-slate-50/20">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 pr-2 sm:pr-4 animate-pulse">
            {/* Skeleton for default policy */}
            <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-100/50 to-slate-200/30 border border-slate-200/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-200/70 w-10 h-10"></div>
                  <div>
                    <div className="h-4 bg-slate-200/70 rounded w-40 mb-1"></div>
                    <div className="h-3 bg-slate-200/50 rounded w-32"></div>
                  </div>
                </div>
                <div className="w-full sm:w-[240px] h-11 bg-slate-200/70 rounded-lg"></div>
              </div>
            </div>
            
            {/* Skeleton for permission cards */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="p-5 rounded-xl bg-gradient-to-br from-slate-100/40 to-slate-200/20 border border-slate-200/30">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-slate-200/70 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-200/50 rounded w-24"></div>
                    </div>
                    <div className="h-9 w-9 bg-slate-200/70 rounded-lg"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-200/40 border border-slate-200/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-200/70 rounded-md"></div>
                            <div className="h-3 bg-slate-200/70 rounded w-8"></div>
                          </div>
                          <div className="h-6 bg-slate-200/70 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-200/40 border border-slate-200/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-200/70 rounded-md"></div>
                            <div className="h-3 bg-slate-200/70 rounded w-10"></div>
                          </div>
                          <div className="h-6 bg-slate-200/70 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 mt-6 pt-5 border-t border-slate-200/40">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <div className="w-2 h-2 rounded-full bg-slate-300/70"></div>
            <div className="h-6 bg-slate-200/70 rounded w-32"></div>
          </div>
          <div className="h-9 bg-slate-200/70 rounded-xl w-20 order-1 sm:order-2"></div>
        </div>
      </div>
    )
  }

  const allKeys = [...new Set([...Object.keys(authority.permissions), ...contextKeys])]

  return (
    <div className="flex flex-col h-full p-2 sm:p-3 md:p-6 bg-gradient-to-b from-slate-50/30 via-white to-slate-50/20 overflow-hidden">

      {/* Permissions List */}
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-2 md:pr-4 w-full min-w-0">
          {/* Default Grant Policy */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30 border border-slate-200/60 shadow-lg shadow-slate-100/20 backdrop-blur-sm w-full min-w-0">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200/70 shadow-sm flex-shrink-0">
                  <Settings className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-semibold text-slate-800 break-words">Default Grant of Authority</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed break-words">Global permission policy for new requests</p>
                </div>
              </div>
              <Select value={currentPolicy} onValueChange={handlePolicyChange}>
                <SelectTrigger className="w-full h-10 sm:h-11 text-sm border-slate-200/60 bg-white/80 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="share-everything">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-red-500" />
                      <span>Always share everything</span>
                      <span className="text-red-500 text-xs">(dangerous)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ask-permission">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-yellow-500" />
                      <span>Always ask permission</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="allow-list">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span>Use allow list</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AnimatePresence>
            {allKeys.length === 0 ? (
              <Card className="border-slate-200/40 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-lg shadow-slate-100/20">
                <CardContent className="py-8 sm:py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/70 shadow-sm mb-6">
                      <Shield className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-2">No Context Keys Yet</h3>
                    <p className="text-sm text-slate-600 max-w-sm">Add data to your context to begin managing granular permissions for AI access</p>
                    <div className="mt-6 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/40">
                      <p className="text-xs text-blue-700 font-medium">💡 Visit the Human Context tab to add preferences and data</p>
                    </div>
                  </div>
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
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    <Card className={`group hover:shadow-xl hover:shadow-slate-200/20 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden border-slate-200/40 bg-gradient-to-br from-white via-slate-50/30 to-white w-full min-w-0 ${isOverridden ? 'opacity-80' : ''}`}>
                      {isOverridden && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-sm shadow-amber-200" title="Overridden by default policy" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50/10 to-slate-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="py-3 sm:py-4 md:py-5 px-3 sm:px-4 md:px-6 relative z-10 min-w-0">
                        <div className="space-y-3 w-full min-w-0">
                          {/* Key name and edit button */}
                          <div className="flex items-start justify-between gap-2 sm:gap-3 min-w-0">
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h3 className="text-sm sm:text-base font-semibold text-slate-800 break-words leading-relaxed truncate pr-1">{key}</h3>
                              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">Context data permission</p>
                            </div>
                            {!isEditing && (
                              <button
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg bg-slate-50/50 hover:bg-slate-100/70 hover:shadow-sm transition-all duration-200 flex items-center justify-center flex-shrink-0 group/edit"
                                onClick={() => startEditing(key)}
                                title="Edit permissions"
                              >
                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 group-hover/edit:text-slate-700 transition-colors" />
                              </button>
                            )}
                          </div>
                          
                          {isEditing && editingValues ? (
                            <div className="space-y-3 w-full min-w-0">
                              {/* Read permission */}
                              <div className="space-y-2 min-w-0">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Read Permission</label>
                                <Select
                                  value={editingValues.read}
                                  onValueChange={(value) => 
                                    setEditingValues({ ...editingValues, read: value as PermissionValue })
                                  }
                                >
                                  <SelectTrigger className="w-full h-10 sm:h-11 border-slate-200/60 bg-white/90 shadow-sm hover:shadow-md transition-shadow min-w-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Allow">
                                      <div className="flex items-center gap-2">
                                        <Unlock className="w-4 h-4 text-green-600" />
                                        <span>Allow</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Ask">
                                      <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-yellow-600" />
                                        <span>Ask</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Never">
                                      <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-red-600" />
                                        <span>Never</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Write permission */}
                              <div className="space-y-2 min-w-0">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Write Permission</label>
                                <Select
                                  value={editingValues.write}
                                  onValueChange={(value) => 
                                    setEditingValues({ ...editingValues, write: value as PermissionValue })
                                  }
                                >
                                  <SelectTrigger className="w-full h-10 sm:h-11 border-slate-200/60 bg-white/90 shadow-sm hover:shadow-md transition-shadow min-w-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Allow">
                                      <div className="flex items-center gap-2">
                                        <Unlock className="w-4 h-4 text-green-600" />
                                        <span>Allow</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Ask">
                                      <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-yellow-600" />
                                        <span>Ask</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Never">
                                      <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-red-600" />
                                        <span>Never</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex gap-3 pt-2">
                                <button
                                  className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                  onClick={saveEditing}
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Save Changes</span>
                                </button>
                                <button
                                  className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                  onClick={cancelEditing}
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Permission badges - stacked on mobile, inline on desktop */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className={`flex items-center justify-between p-3 rounded-xl border shadow-sm ${permissionBoxColors[permission.read] || permissionBoxColors.default} ${isOverridden ? 'opacity-70' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-white/60">
                                      {permissionIcons[permission.read] || permissionIcons.default}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">Read</span>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-medium px-2.5 py-1 shadow-sm ${permissionColors[permission.read] || permissionColors.default}`}
                                  >
                                    <span>{permission.read}</span>
                                  </Badge>
                                </div>
                                
                                <div className={`flex items-center justify-between p-3 rounded-xl border shadow-sm ${permissionBoxColors[permission.write] || permissionBoxColors.default} ${isOverridden ? 'opacity-70' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-white/60">
                                      {permissionIcons[permission.write] || permissionIcons.default}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">Write</span>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs font-medium px-2.5 py-1 shadow-sm ${permissionColors[permission.write] || permissionColors.default}`}
                                  >
                                    <span>{permission.write}</span>
                                  </Badge>
                                </div>
                              </div>
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 mt-6 pt-5 border-t border-gradient-to-r from-transparent via-slate-200/60 to-transparent"
      >
        {lastUpdated && (
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse"></div>
            <Badge variant="secondary" className="text-xs bg-slate-100/60 text-slate-600 border-slate-200/40 px-2.5 py-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
        )}
        <button
          onClick={fetchAuthority}
          className="group h-10 sm:h-9 px-4 sm:px-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border border-slate-200/40 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-xs order-1 sm:order-2 hover:-translate-y-0.5"
          title="Refresh authority"
        >
          <RefreshCw className="w-4 h-4 sm:w-3 sm:h-3 text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
          <span className="sm:hidden font-medium">Refresh</span>
        </button>
      </motion.div>
    </div>
  )
}