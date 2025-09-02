"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChatComponent } from "@/components/chat-component"
import { PreferenceDatabaseUI } from "@/components/preference-database-ui"
import { AgentNegotiation } from "@/components/agent-negotiation"
import { OnboardingModal } from "@/components/onboarding-modal"
import { motion, AnimatePresence, LayoutGroup, Easing } from "framer-motion"
import { ChevronDown, MessageSquare, Database, Users } from "lucide-react"

export default function HomePage() {
  const [showChat, setShowChat] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [currentModal, setCurrentModal] = useState<'chat' | 'preferences' | 'negotiation' | null>(null)
  const [hasOpenedChat, setHasOpenedChat] = useState(false)
  const [hasOpenedPreferences, setHasOpenedPreferences] = useState(false)
  const [hasOpenedNegotiation, setHasOpenedNegotiation] = useState(false)

  const handleModalClose = (modal: 'chat' | 'preferences' | 'negotiation') => {
    setCurrentModal(null)
    
    setTimeout(() => {
      if (modal === 'chat') {
        setShowChat(true)
        setHasOpenedChat(true)
      } else if (modal === 'preferences') {
        setShowPreferences(true)
        setHasOpenedPreferences(true)
      } else if (modal === 'negotiation') {
        setShowNegotiation(true)
        setHasOpenedNegotiation(true)
      }
    }, 300)
  }

  const toggleComponent = (component: string) => {
    switch(component) {
      case 'chat':
        if (!showChat && !hasOpenedChat) {
          setCurrentModal('chat')
        } else {
          setShowChat(!showChat)
        }
        break
      case 'preferences':
        if (!showPreferences && !hasOpenedPreferences) {
          setCurrentModal('preferences')
        } else {
          setShowPreferences(!showPreferences)
        }
        break
      case 'negotiation':
        if (!showNegotiation && !hasOpenedNegotiation) {
          setCurrentModal('negotiation')
        } else {
          setShowNegotiation(!showNegotiation)
        }
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
        height: { duration: 0.4, ease: "easeOut" as Easing },
        opacity: { duration: 0.3 }
      }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.4, ease: "easeOut" as Easing },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    }
  }

  const modalContent = {
    chat: {
      title: "Chatbots are becoming our friends.",
      content: "Every day when you talk with Claude or ChatGPT, they are implicitly storing and remembering information about you and your preferences. This is how they achieve market lock-in."
    },
    preferences: {
      title: "Your accumulated context forms a rich preference database.",
      content: "This data represents your unique digital fingerprint - your interests, values, and decision patterns. This is what creates vendor lock-in, but it could also enable personalized AI experiences across platforms."
    },
    negotiation: {
      title: "AI Agents will soon take action on your behalf.",
      content: "With portable human context, AI agents can negotiate on your behalf with deep understanding of your preferences. This enables a future where multiple AI systems can collaborate while respecting your individual needs and values."
    }
  }

  return (
    <>
      {/* Onboarding Modals */}
      <OnboardingModal
        isOpen={currentModal === 'chat'}
        onClose={() => handleModalClose('chat')}
        title={modalContent.chat.title}
        content={modalContent.chat.content}
        actionLabel="Open Chat Interface"
      />
      <OnboardingModal
        isOpen={currentModal === 'preferences'}
        onClose={() => handleModalClose('preferences')}
        title={modalContent.preferences.title}
        content={modalContent.preferences.content}
        actionLabel="View Preferences"
      />
      <OnboardingModal
        isOpen={currentModal === 'negotiation'}
        onClose={() => handleModalClose('negotiation')}
        title={modalContent.negotiation.title}
        content={modalContent.negotiation.content}
        actionLabel="See Negotiation"
      />
      
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
                      <h2 className="text-2xl font-semibold">Like talking to your friend...</h2>
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
                      <h2 className="text-2xl font-semibold">that remembers everything about you...</h2>
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
                      <h2 className="text-2xl font-semibold">... who will soon take action on your behalf.</h2>
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
    </>
  )
}
