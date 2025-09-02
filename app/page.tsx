"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ChatComponent } from "@/components/chat-component"
import { PreferenceDatabaseUI } from "@/components/preference-database-ui"
import { AgentNegotiation } from "@/components/agent-negotiation"
import { OnboardingModal } from "@/components/onboarding-modal"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { ArrowDown, Sparkles, Archive, Network } from "lucide-react"

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
      y: 60,
      filter: "blur(15px)"
    },
    visible: { 
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const contentVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.5, ease: "easeInOut" as const },
        opacity: { duration: 0.3 }
      }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.5, ease: "easeInOut" as const },
        opacity: { duration: 0.4, delay: 0.1 }
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
        actionLabel="Start Chatting"
        modalType="chat"
      />
      <OnboardingModal
        isOpen={currentModal === 'preferences'}
        onClose={() => handleModalClose('preferences')}
        title={modalContent.preferences.title}
        content={modalContent.preferences.content}
        actionLabel="View Database"
        modalType="preferences"
      />
      <OnboardingModal
        isOpen={currentModal === 'negotiation'}
        onClose={() => handleModalClose('negotiation')}
        title={modalContent.negotiation.title}
        content={modalContent.negotiation.content}
        actionLabel="See Agents"
        modalType="negotiation"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="max-w-4xl mx-auto px-3 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" as const }}
          className="text-center mb-16 sm:mb-16 md:mb-20 lg:mb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6 sm:mb-6"
          >
            <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground uppercase">
              Protecting dignity in the AI age
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 sm:mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-crimson)' }}
          >
            <span className="block">Human Context</span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-3 text-muted-foreground font-normal">
              to Agent Behavior
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base sm:text-lg text-muted-foreground max-w-sm sm:max-w-2xl mx-auto leading-relaxed"
          >
            A demonstration of how personal context shapes AI interactions
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <LayoutGroup>
          <motion.div layout className="space-y-6 sm:space-y-8 md:space-y-10 pb-8 sm:pb-12 md:pb-16">
              {/* Chat Interface */}
              <motion.div
                layout
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
              >
                <Card className="overflow-hidden bg-card/80 backdrop-blur-md border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-500">
                  <motion.div 
                    className="p-4 sm:p-8 md:p-10 flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleComponent('chat')}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                          Like talking to your friend
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                        Chatbots are the most natural interaction pattern for the modern age.
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: showChat ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" as const }}
                      className="group-hover:bg-accent/10 rounded-full p-2 sm:p-3 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
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
                        <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                          <div className="h-[350px] sm:h-[400px] md:h-[450px] rounded-lg bg-muted/5 p-1">
                            <ChatComponent />
                          </div>
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
                <Card className="overflow-hidden bg-card/80 backdrop-blur-md border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-500">
                  <motion.div 
                    className="p-4 sm:p-8 md:p-10 flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleComponent('preferences')}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Archive className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                          That remembers everything about you
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Your preferences become your digital fingerprint
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: showPreferences ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" as const }}
                      className="group-hover:bg-accent/10 rounded-full p-2 sm:p-3 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
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
                        <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                          <div className="h-[350px] sm:h-[400px] md:h-[450px] rounded-lg bg-muted/5 p-1">
                            <PreferenceDatabaseUI />
                          </div>
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
                <Card className="overflow-hidden bg-card/80 backdrop-blur-md border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-500">
                  <motion.div 
                    className="p-4 sm:p-8 md:p-10 flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleComponent('negotiation')}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Network className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                          Who will soon act on your behalf
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          AI agents negotiating with your values in mind
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: showNegotiation ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" as const }}
                      className="group-hover:bg-accent/10 rounded-full p-2 sm:p-3 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
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
                        <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                          <div className="min-h-[350px] sm:min-h-[400px] md:min-h-[450px] rounded-lg bg-muted/5 p-1">
                            <AgentNegotiation />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
          </motion.div>
        </LayoutGroup>
        
        {/* Manifesto */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 mb-8 sm:mb-10 md:mb-12"
        >
          <div className="max-w-2xl sm:max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12"
            />
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-base sm:text-lg md:text-xl leading-[1.7] sm:leading-[1.8] text-center text-muted-foreground"
              style={{ fontFamily: 'var(--font-crimson)' }}
            >
              If we want an open AI ecosystem where{" "}
              <span className="text-foreground font-medium">chat interfaces don't lock users</span>{" "}
              into proprietary preference silos, we need an{" "}
              <span className="text-foreground font-medium">interoperable protocol</span>{" "}
              for transferring human context between AI systems.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-base sm:text-lg md:text-xl leading-[1.7] sm:leading-[1.8] text-center text-muted-foreground mt-4 sm:mt-6"
              style={{ fontFamily: 'var(--font-crimson)' }}
            >
              This isn't just about preventing vendor lock-in—it's about ensuring{" "}
              <span className="text-foreground font-medium">user preferences can flow freely</span>{" "}
              in a competitive marketplace while enabling AI agents to truly act on our behalf.
            </motion.p>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent mt-12"
            />
          </div>
        </motion.div>
        </div>
      </div>
    </>
  )
}
