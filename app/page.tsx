"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChatComponent } from "@/components/chat-component"
import { PreferenceDatabaseUI } from "@/components/preference-database-ui"
import { AgentNegotiation } from "@/components/agent-negotiation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { ChevronDown, MessageSquare, Database, Users } from "lucide-react"

export default function HomePage() {
  const [showChat, setShowChat] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!hasAnimated) {
      const timer1 = setTimeout(() => setShowChat(true), 500)
      const timer2 = setTimeout(() => setShowPreferences(true), 1000)
      const timer3 = setTimeout(() => {
        setShowNegotiation(true)
        setHasAnimated(true)
      }, 1500)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [hasAnimated])

  const toggleComponent = (component: string) => {
    switch(component) {
      case 'chat':
        setShowChat(!showChat)
        break
      case 'preferences':
        setShowPreferences(!showPreferences)
        break
      case 'negotiation':
        setShowNegotiation(!showNegotiation)
        break
    }
  }

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  }

  const contentVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.3 }
      }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-2 mb-8"
        >
          <div className="text-center space-y-2 mb-6">
          <h1 className="text-4xl font-bold text-foreground">Human Context to Agent Behavior</h1>
          <p className="text-muted-foreground text-lg">This is a proof of concept for how human context can be used to influence agent behavior.</p>
          <p className="text-muted-foreground text-lg">Human context is the informational exhaust that is generated as we interact with our favorite chatbots. It's being used by AI companies to create vendor lock-in.</p>
          <p className="text-muted-foreground text-lg">Making this human context interoperable is essential to an open market of AI tools.</p>
          <p className="text-muted-foreground text-lg">Extending this: Rich understanding of consumer preferences via their context is important to facilitate robust agent-negotiation.</p>
        </div>
        </motion.div>

        {/* Main Content */}
        <LayoutGroup>
          <motion.div layout className="space-y-6 pb-8">
              {/* Chat Interface */}
              <motion.div
                layout
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
              >
                <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
                  <motion.div 
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => toggleComponent('chat')}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-semibold">AI Chat Tools</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: showChat ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {showChat && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={contentVariants}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 h-[400px]">
                          <ChatComponent />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>

              {/* Preference Database */}
              <motion.div
                layout
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { 
                    opacity: 0,
                    scale: 0.95,
                    y: 20
                  },
                  visible: { 
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                      delay: 0.2
                    }
                  }
                }}
                className="w-full"
              >
                <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
                  <motion.div 
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => toggleComponent('preferences')}
                  >
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-semibold">Preference Database</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: showPreferences ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {showPreferences && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={contentVariants}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 h-[400px]">
                          <PreferenceDatabaseUI />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>

              {/* Agent Negotiation */}
              <motion.div
                layout
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { 
                    opacity: 0,
                    scale: 0.95,
                    y: 20
                  },
                  visible: { 
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                      delay: 0.4
                    }
                  }
                }}
                className="w-full"
              >
                <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
                  <motion.div 
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => toggleComponent('negotiation')}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-semibold">Agent-to-Agent Negotiation</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: showNegotiation ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {showNegotiation && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={contentVariants}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 min-h-[350px]">
                          <AgentNegotiation />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
          </motion.div>
        </LayoutGroup>
      </div>
    </div>
  )
}
