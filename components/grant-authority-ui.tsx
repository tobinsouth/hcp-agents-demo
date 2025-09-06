"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Shield, 
  Lock, 
  Unlock, 
  Settings, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Bot,
  Server,
  Smartphone,
  Globe,
  ChevronDown,
  ChevronRight,
  Bell,
  FileCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  subscribeToGrantAuthority,
  type GrantAuthority,
  type ClientAccess,
  type AutonomyLevel,
  type ContextSection
} from "@/lib/grant-authority"

// Icon mapping for client types
const clientTypeIcons = {
  ai_assistant: Bot,
  agent: Server,
  service: Globe,
  application: Smartphone
}

// Autonomy level descriptions
const autonomyDescriptions = {
  high_security: "Maximum security with approval required for all actions",
  balanced: "Balanced approach with smart defaults and selective approvals",
  max_autonomy: "Maximum autonomy with minimal restrictions",
  custom: "Custom configuration with fine-grained control"
}

// Context section display names
const sectionDisplayNames: Record<string, string> = {
  communication_style: "Communication Style",
  decision_making: "Decision Making",
  values: "Personal Values",
  negotiation_priorities: "Negotiation Priorities",
  constraints: "Constraints & Limits",
  domains: "Domain Preferences",
  conversation_patterns: "Conversation Patterns"
}

export function GrantAuthorityUI() {
  const [grantAuthority, setGrantAuthority] = useState<GrantAuthority | null>(null)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [showCustomSettings, setShowCustomSettings] = useState(false)
  const [customSettingsText, setCustomSettingsText] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<AutonomyLevel>("balanced")
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState<Partial<ClientAccess>>({
    clientName: "",
    clientType: "ai_assistant",
    description: "",
    allowedSections: {}
  })

  useEffect(() => {
    // Fetch initial data
    fetch("/api/grant-authority")
      .then((res) => res.json())
      .then((data) => {
        setGrantAuthority(data)
        setSelectedLevel(data.autonomySettings.level)
        if (data.autonomySettings.customSettings) {
          setCustomSettingsText(data.autonomySettings.customSettings)
        }
      })

    // Subscribe to real-time updates
    const unsubscribe = subscribeToGrantAuthority((updated) => {
      setGrantAuthority(updated)
      setSelectedLevel(updated.autonomySettings.level)
      if (updated.autonomySettings.customSettings) {
        setCustomSettingsText(updated.autonomySettings.customSettings)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleAutonomyChange = async (level: AutonomyLevel) => {
    setSelectedLevel(level)
    if (level === "custom") {
      setShowCustomSettings(true)
      return
    }

    const settings = {
      level,
      requiresApproval: {
        financial: level === "high_security",
        legal: level === "high_security",
        medical: level === "high_security",
        personal_data: level === "high_security",
        threshold_amount: level === "high_security" ? 100 : level === "balanced" ? 500 : 10000
      },
      notificationPreferences: {
        before_action: level === "high_security",
        after_action: level !== "max_autonomy",
        summary_frequency: level === "high_security" ? "immediate" : level === "balanced" ? "daily" : "weekly"
      }
    }

    await fetch("/api/grant-authority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-autonomy", settings })
    })
  }

  const handleCustomSettingsSave = async () => {
    const settings = {
      level: "custom" as AutonomyLevel,
      customSettings: customSettingsText,
      requiresApproval: {
        financial: true,
        legal: true,
        medical: true,
        personal_data: false,
        threshold_amount: 250
      },
      notificationPreferences: {
        before_action: false,
        after_action: true,
        summary_frequency: "daily" as const
      }
    }

    await fetch("/api/grant-authority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-autonomy", settings })
    })
    
    setShowCustomSettings(false)
  }

  const handleRemoveClient = async (clientId: string) => {
    await fetch("/api/grant-authority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove-client", clientId })
    })
  }

  const handleAddClient = async () => {
    const client: ClientAccess = {
      clientId: `client-${Date.now()}`,
      clientName: newClient.clientName || "New Client",
      clientType: newClient.clientType || "ai_assistant",
      description: newClient.description,
      allowedSections: newClient.allowedSections || {},
      createdAt: new Date().toISOString(),
      accessCount: 0
    }

    await fetch("/api/grant-authority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-client", client })
    })

    setShowAddClient(false)
    setNewClient({
      clientName: "",
      clientType: "ai_assistant",
      description: "",
      allowedSections: {}
    })
  }

  const toggleSectionAccess = (section: string) => {
    setNewClient(prev => ({
      ...prev,
      allowedSections: {
        ...prev.allowedSections,
        [section]: !prev.allowedSections?.[section as keyof ContextSection]
      }
    }))
  }

  if (!grantAuthority) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading authority settings...</div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Autonomy Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Autonomy Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedLevel} onValueChange={(v) => handleAutonomyChange(v as AutonomyLevel)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_security">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    High Security
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Balanced (Default)
                  </div>
                </SelectItem>
                <SelectItem value="max_autonomy">
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    Max Autonomy
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Custom
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <p className="text-sm text-muted-foreground">
              {autonomyDescriptions[selectedLevel]}
            </p>

            {/* Notification Preferences */}
            {grantAuthority.autonomySettings.notificationPreferences && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Notifications:</span>
                  <Badge variant={grantAuthority.autonomySettings.notificationPreferences.before_action ? "default" : "secondary"}>
                    {grantAuthority.autonomySettings.notificationPreferences.before_action ? "Before Action" : "After Action"}
                  </Badge>
                  <Badge variant="outline">
                    {grantAuthority.autonomySettings.notificationPreferences.summary_frequency}
                  </Badge>
                </div>
              </div>
            )}

            {/* Custom Settings Input */}
            <AnimatePresence>
              {showCustomSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <Textarea
                    placeholder="Enter custom autonomy rules and constraints..."
                    value={customSettingsText}
                    onChange={(e) => setCustomSettingsText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCustomSettingsSave}>
                      Save Custom Settings
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setShowCustomSettings(false)
                        setSelectedLevel("balanced")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Authorized Clients */}
        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-primary" />
                Authorized Clients
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAddClient(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {grantAuthority.authorizedClients.map((client) => {
              const Icon = clientTypeIcons[client.clientType]
              const isExpanded = expandedClient === client.clientId
              
              return (
                <motion.div
                  key={client.clientId}
                  layout
                  className="border rounded-lg p-4 space-y-3 bg-background/50"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-start gap-3 flex-1 cursor-pointer"
                      onClick={() => setExpandedClient(isExpanded ? null : client.clientId)}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{client.clientName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {client.clientType}
                          </Badge>
                        </div>
                        {client.description && (
                          <p className="text-sm text-muted-foreground">
                            {client.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Access Count: {client.accessCount || 0}</span>
                          {client.lastAccessed && (
                            <>
                              <span>•</span>
                              <span>Last: {new Date(client.lastAccessed).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveClient(client.clientId)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t space-y-3">
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Allowed Context Sections:</span>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(client.allowedSections).map(([section, allowed]) => {
                                if (section === "domains" && allowed && typeof allowed === "object") {
                                  return Object.entries(allowed).map(([domain, domainAllowed]) => (
                                    domainAllowed && (
                                      <Badge key={`domain-${domain}`} variant="outline" className="gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        {domain}
                                      </Badge>
                                    )
                                  ))
                                }
                                return allowed && (
                                  <Badge key={section} variant="outline" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {sectionDisplayNames[section] || section}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>

                          {client.restrictions && client.restrictions.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Restrictions:</span>
                              <div className="space-y-1">
                                {client.restrictions.map((restriction, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-3 w-3 mt-0.5 text-yellow-500" />
                                    <span>{restriction}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {client.expiresAt && (
                            <div className="text-sm text-muted-foreground">
                              Expires: {new Date(client.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {grantAuthority.authorizedClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No authorized clients yet</p>
                <p className="text-sm">Add clients to grant them access to your context</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Restrictions */}
        {grantAuthority.globalRestrictions && grantAuthority.globalRestrictions.length > 0 && (
          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
                Global Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grantAuthority.globalRestrictions.map((restriction, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{restriction}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Client Modal */}
        <AnimatePresence>
          {showAddClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddClient(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border rounded-lg p-6 max-w-md w-full space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold">Add New Client</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Client Name</label>
                    <Input
                      placeholder="e.g., Shopping Assistant"
                      value={newClient.clientName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, clientName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Client Type</label>
                    <Select 
                      value={newClient.clientType}
                      onValueChange={(v) => setNewClient(prev => ({ ...prev, clientType: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_assistant">AI Assistant</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="application">Application</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="What will this client do?"
                      value={newClient.description}
                      onChange={(e) => setNewClient(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Allowed Sections</label>
                    <div className="space-y-2">
                      {Object.keys(sectionDisplayNames).map(section => {
                        const value = newClient.allowedSections?.[section as keyof ContextSection]
                        const isChecked = section === 'domains' ? !!value && typeof value === 'object' : !!value
                        return (
                          <label key={section} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSectionAccess(section)}
                              className="rounded"
                            />
                            <span className="text-sm">{sectionDisplayNames[section]}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddClient} className="flex-1">
                    Add Client
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddClient(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  )
}