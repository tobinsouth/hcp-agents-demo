"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, Sparkles, Archive, Network, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaperLinkButton } from "@/components/ui/paper-link-button"
import { useEffect, useCallback } from "react"
import { useVerboseMode } from "@/lib/utils"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  actionLabel?: string
  modalType: 'chat' | 'preferences' | 'negotiation' | 'authority'
}

// Single card content for each modal type
const modalContent: Record<'chat' | 'preferences' | 'negotiation' | 'authority', {
  title: string
  subtitle: string
  content: string
  visual: 'chat' | 'data' | 'authority' | 'agents'
  keyPoints: string[]
  paperLink?: {
    href: string
    title: string
    subtitle: string
  }
}> = {
  chat: {
    title: "Chatbots are becoming our friends",
    subtitle: "Natural conversation is the new interface",
    content: "Every day when you talk with Claude or ChatGPT, they are implicitly storing and remembering information about you and your preferences. This is how they achieve market lock-in.",
    visual: 'chat',
    keyPoints: [
      "Natural language interaction",
      "Context accumulation over time",
      "Personalized responses"
    ],
    paperLink: {
      href: "https://hcp.loyalagents.org/hcp-paper.pdf",
      title: "Read the Human Context Protocol Paper",
      subtitle: "Learn about portable human context for AI systems"
    }
  },
  preferences: {
    title: "Your accumulated context forms a rich preference database",
    subtitle: "Your preferences are the foundation of AI utility",
    content: "This data represents your unique digital fingerprint - your interests, values, and decision patterns. This is what creates vendor lock-in, but it could also enable personalized AI experiences across platforms.",
    visual: 'data',
    keyPoints: [
      "Transparent: You can see and control your data",
      "Interoperable: Works across different AI services",
      "Secure: Protected by design and encrypted"
    ],
    paperLink: {
      href: "https://hcp.loyalagents.org/hcp-paper.pdf",
      title: "Read the Human Context Protocol Paper",
      subtitle: "Explore the technical architecture and privacy guarantees"
    }
  },
  negotiation: {
    title: "AI Agents will soon take action on your behalf",
    subtitle: "Context + Authority = Powerful AI",
    content: "With portable human context, AI agents can negotiate on your behalf with deep understanding of your preferences. This enables a future where multiple AI systems can collaborate while respecting your individual needs and values.",
    visual: 'agents',
    keyPoints: [
      "Seamless AI experiences across all platforms",
      "Agents that truly represent your interests",
      "Transparent, controllable, and trustworthy"
    ],
    paperLink: {
      href: "https://hcp.loyalagents.org/hcp-paper.pdf",
      title: "Read the Human Context Protocol Paper",
      subtitle: "Discover how agents can safely act on your behalf"
    }
  },
  authority: {
    title: "You control who can access your context",
    subtitle: "Your context is sensitive and powerful",
    content: "Grant of Authority lets you decide which AI agents and services can access your preferences, what data they can see, and how much autonomy they have when acting on your behalf. This ensures your digital sovereignty in an AI-powered world.",
    visual: 'authority',
    keyPoints: [
      "Define precise access rules for each AI service",
      "Set autonomy levels based on trust and task",
      "Maintain complete audit trail of all access"
    ],
    paperLink: {
      href: "https://hcp.loyalagents.org/authentic-AI-whitepaper.pdf",
      title: "Read the Authentic AI Whitepaper",
      subtitle: "Learn about safe and reliable AI delegation"
    }
  }
}

export function OnboardingModal({ 
  isOpen, 
  onClose, 
  actionLabel = "Continue",
  modalType
}: OnboardingModalProps) {
  const content = modalContent[modalType]
  
  // Check for verbose display query parameter
  const showVerboseDisplay = useVerboseMode()
  
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, handleClose])
  
  const getVisualIcon = (visual: string) => {
    switch (visual) {
      case 'chat': return Sparkles
      case 'data': return Archive
      case 'agents': return Network
      case 'authority': return Shield
      default: return Archive
    }
  }
  
  const VisualIcon = getVisualIcon(content?.visual)
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 300,
              duration: 0.6
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:w-full"
          >
            <motion.div 
              className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
              layout
            >
              {/* Header */}
              <div className="relative p-4 pb-3 sm:p-8 sm:pb-6 md:p-10 md:pb-8">
                <motion.button
                  onClick={handleClose}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full p-1.5 sm:p-2 md:p-2.5 hover:bg-accent/20 transition-colors group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.button>
                
                
                {/* Visual icon */}
                <motion.div 
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <VisualIcon className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="px-4 pb-3 sm:px-8 sm:pb-4 md:px-10">
                <div className="text-center mb-6 sm:mb-8">
                  <motion.h2 
                    className="text-2xl sm:text-3xl md:text-4xl mb-2 font-light"
                    style={{ fontFamily: 'var(--font-crimson)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {content?.title}
                  </motion.h2>
                  {content?.subtitle && (
                    <motion.p 
                      className="text-sm sm:text-base text-primary/80 font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {content.subtitle}
                    </motion.p>
                  )}
                </div>
                
                <motion.p 
                  className="text-sm sm:text-base text-muted-foreground leading-[1.6] sm:leading-[1.7] text-center mb-6 sm:mb-8 max-w-sm sm:max-w-lg mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {content?.content}
                </motion.p>
                
                {/* Key insights - only show when VERBOSE_DISPLAY=true */}
                {showVerboseDisplay && (
                  <motion.div 
                    className="bg-muted/20 rounded-xl p-3 sm:p-6 mb-4 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="font-medium mb-4 text-center" style={{ fontFamily: 'var(--font-crimson)' }}>Key Insights</h4>
                    <div className="space-y-3">
                      {content?.keyPoints.map((point, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Paper link button */}
                {content?.paperLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                    className="mb-4 sm:mb-6"
                  >
                    <PaperLinkButton
                      href={content.paperLink.href}
                      title={content.paperLink.title}
                      subtitle={content.paperLink.subtitle}
                    />
                  </motion.div>
                )}
              </div>
              
              {/* Actions */}
              <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      onClick={handleClose}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base"
                    >
                      {actionLabel}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}