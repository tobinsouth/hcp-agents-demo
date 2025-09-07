"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChatComponent } from "@/components/chat-component"
import { PreferenceDatabaseUI } from "@/components/preference-database-ui"
import { AgentNegotiation } from "@/components/agent-negotiation"
import { GrantAuthorityUI } from "@/components/grant-authority-ui"
import { OnboardingModal } from "@/components/onboarding-modal"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { ArrowDown, ArrowRight, Sparkles, Archive, Network, Shield } from "lucide-react"
import { useDemoInitialization } from "@/hooks/use-demo-initialization"

// Typewriter component
function TypewriterText({ text, delay = 0, speed = 80 }: { text: string; delay?: number; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("")
  const [startTyping, setStartTyping] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStartTyping(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!startTyping) return

    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, startTyping])

  return <span>{displayedText}</span>
}

export default function HomePage() {
  // Initialize demo data automatically
  const { initialized: demoInitialized } = useDemoInitialization()
  
  // Flow state management
  const [currentStep, setCurrentStep] = useState<'initial' | 'preferences' | 'authority' | 'applications'>('initial')
  const [showPreferences, setShowPreferences] = useState(false)
  const [showGrantAuthority, setShowGrantAuthority] = useState(false)
  const [showApplications, setShowApplications] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showNegotiation, setShowNegotiation] = useState(false)
  
  // Modal state
  const [currentModal, setCurrentModal] = useState<'preferences' | 'authority' | 'application' | null>(null)
  
  // Button click tracking
  const [authorityButtonClicked, setAuthorityButtonClicked] = useState(false)
  const [applicationButtonClicked, setApplicationButtonClicked] = useState(false)

  const handleModalClose = (modal: 'preferences' | 'authority' | 'application') => {
    setCurrentModal(null)
    
    setTimeout(() => {
      if (modal === 'preferences') {
        setCurrentStep('preferences')
        // Don't auto-expand preferences - let user click to open
      } else if (modal === 'authority') {
        setCurrentStep('authority')
        // Don't auto-expand authority - let user click to open
      } else if (modal === 'application') {
        setCurrentStep('applications')
        // Don't auto-expand applications - let user click to open
      }
    }, 300)
  }
  
  const handleAddAuthority = () => {
    setAuthorityButtonClicked(true)
    setCurrentModal('authority')
  }
  
  const handleSeeInUse = () => {
    setApplicationButtonClicked(true)
    setCurrentModal('application')
  }

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
      case 'authority':
        setShowGrantAuthority(!showGrantAuthority)
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
        ease: "easeOut" as const
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


  return (
    <>
      {/* Onboarding Modals - Progressive Flow */}
      <OnboardingModal
        isOpen={currentModal === 'preferences'}
        onClose={() => handleModalClose('preferences')}
        title="The Importance of Human Context"
        content="To perform most interactions online, you need to know an individual's preferences and history. This 'human context' is what makes AI truly useful."
        actionLabel="See what Human Context is"
        modalType="preferences"
      />
      <OnboardingModal
        isOpen={currentModal === 'authority'}
        onClose={() => handleModalClose('authority')}
        title="Controlling Your Agent Authority"
        content="Your context is sensitive. Grant of Authority lets you control how it's shared and used by AI."
        actionLabel="Grant Agentic Authorization"
        modalType="authority"
      />
      <OnboardingModal
        isOpen={currentModal === 'application'}
        onClose={() => handleModalClose('application')}
        title="See It In Action"
        content="Watch how context and authority work together across AI applications."
        actionLabel="Explore Applications"
        modalType="application"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-16 sm:mb-16 md:mb-20 lg:mb-24"
        >
          {/* Typewriter tagline - appears when no modal is open */}
          {!currentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="inline-block mb-8 sm:mb-10"
            >
              <span className="text-xs sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/60 uppercase">
                <TypewriterText 
                  text="HUMAN CONTEXT IN AI WORKFLOWS" 
                  delay={500}
                  speed={40}
                />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ 
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.8
                  }}
                  className="ml-1 inline-block w-0.5 h-3 bg-muted-foreground/60"
                />
              </span>
            </motion.div>
          )}
          
          {/* Main title emerges with elegant stagger */}
          <motion.div className="mb-10 sm:mb-12">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight"
              style={{ fontFamily: 'var(--font-crimson)' }}
            >
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                animate={{ opacity: currentModal ? 0.3 : 1, y: 0, filter: "blur(0px)" }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                Human Context &
              </motion.span>
              <motion.span 
                className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-4 text-muted-foreground font-normal"
                initial={{ opacity: 0, y: 20, filter: "blur(3px)" }}
                animate={{ opacity: currentModal ? 0.2 : 1, y: 0, filter: "blur(0px)" }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                Delegated Authority
              </motion.span>
            </motion.h1>
          </motion.div>
          
          {/* Subtitle fades in gracefully */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(3px)" }}
            animate={{ opacity: currentModal ? 0.2 : 1, y: 0, filter: "blur(0px)" }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground/80 max-w-sm sm:max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Demonstrating the critical role of delegated authority in AI systems
          </motion.p>

          {/* Start Demo Button */}
          {currentStep === 'initial' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 1.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="flex justify-center"
              style={{ pointerEvents: 'auto' }}
            >
              <Button
                onClick={() => setCurrentModal('preferences')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-all duration-300 hover:scale-105 min-h-[44px] sm:min-h-[48px]"
              >
                See why context and delegation is important
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content */}
        <LayoutGroup>
          <motion.div layout className="space-y-6 sm:space-y-8 md:space-y-10 pb-8 sm:pb-12 md:pb-16">

              {/* Step 1: Human Context (Preference Database) */}
              {currentStep !== 'initial' && (
              <motion.div
                layout
                initial="hidden"
                animate="visible"
                variants={{
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
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.3
                    }
                  }
                }}
                className="w-full"
              >
                <Card className="overflow-hidden bg-card/80 backdrop-blur-md border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-500">
                  <motion.div 
                    className="p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-between cursor-pointer group"
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
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                          Human Context
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                          Your preferences, values, and interaction history
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
                
                {/* Add Grant Authority Button */}
                <AnimatePresence>
                  {showPreferences && currentStep === 'preferences' && !authorityButtonClicked && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="flex justify-center mt-6"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Button
                        onClick={handleAddAuthority}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base min-h-[44px] sm:min-h-[48px]"
                      >
                        Add Grant of Authority
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              )}

              {/* Step 2: Grant of Authority - Only show after preferences */}
              {(currentStep === 'authority' || currentStep === 'applications') && (
              <motion.div
                layout
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
              >
                <Card className="overflow-hidden bg-card/80 backdrop-blur-md border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-500">
                  <motion.div 
                    className="p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleComponent('authority')}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                      </motion.div>
                      <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                          Grant of Authority
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                          Control how your context is shared and used
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: showGrantAuthority ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" as const }}
                      className="group-hover:bg-accent/10 rounded-full p-2 sm:p-3 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </motion.div>
                  </motion.div>
                  
                  <AnimatePresence>
                    {showGrantAuthority && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={contentVariants}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                          <div className="h-[350px] sm:h-[400px] md:h-[450px] rounded-lg bg-muted/5 p-1">
                            <GrantAuthorityUI />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
                
                {/* See in Use Button */}
                <AnimatePresence>
                  {showGrantAuthority && currentStep === 'authority' && !applicationButtonClicked && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="flex justify-center mt-6"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Button
                        onClick={handleSeeInUse}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base min-h-[44px] sm:min-h-[48px]"
                      >
                        See this in use
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              )}

              {/* Step 3: Applications (Chat & Agent Negotiation) */}
              {currentStep === 'applications' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light mb-2" style={{ fontFamily: 'var(--font-crimson)' }}>
                      Applications in Action
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      See how human context and authority work together
                    </p>
                  </motion.div>
                  
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
                        className="p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-between cursor-pointer group"
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
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                              Chat Interface
                            </h2>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                              Natural conversation with context awareness
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
                  
                  {/* Agent Negotiation */}
                  <motion.div
                    layout
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full"
                  >
                    <Card className="overflow-hidden bg-card/80 backdrop-blur-md border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-500">
                      <motion.div 
                        className="p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-between cursor-pointer group"
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
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1" style={{ fontFamily: 'var(--font-crimson)' }}>
                              Agent Negotiation
                            </h2>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                              AI agents working together on your behalf
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
                </>
              )}
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
              Human context is the foundation of AI utility. Without understanding{" "}
              <span className="text-foreground font-medium">preferences and interaction history</span>,{" "}
              AI cannot deliver personalized, meaningful experiences. This context must be{" "}
              <span className="text-foreground font-medium">transparent, interoperable, and secure</span>.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-base sm:text-lg md:text-xl leading-[1.7] sm:leading-[1.8] text-center text-muted-foreground mt-4 sm:mt-6"
              style={{ fontFamily: 'var(--font-crimson)' }}
            >
              Grant of Authority is the key unlock for deploying agents at scale. By giving users{" "}
              <span className="text-foreground font-medium">fine-grained control</span>{" "}
              over how their context is shared and used, we enable a future where AI can{" "}
              <span className="text-foreground font-medium">safely and reliably</span>{" "}
              act on our behalf.
            </motion.p>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent mt-12"
            />
          </div>
        </motion.div>
        
        {/* Attribution Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 8.0 }}
          className="text-center pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20"
        >
          <p className="text-xs text-muted-foreground/40 font-mono tracking-wide">
            Made with 💙 by Tobin in collaboration with{" "}
            <span className="text-muted-foreground/60">Stanford DEL</span> and{" "}
            <span className="text-muted-foreground/60">Consumer Reports</span>
          </p>
        </motion.div>
        </div>
      </div>
    </>
  )
}
