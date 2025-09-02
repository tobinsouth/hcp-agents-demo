"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, Sparkles, Archive, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface StoryStep {
  title: string
  subtitle?: string
  content: string
  visual: 'chat' | 'data' | 'agents'
  insights: string[]
}

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  content?: string
  actionLabel?: string
  modalType: 'chat' | 'preferences' | 'negotiation'
}

const storyContent: Record<'chat' | 'preferences' | 'negotiation', StoryStep[]> = {
  chat: [
    {
      title: "The Conversation Begins",
      subtitle: "Every chat shapes your digital identity",
      content: "When you talk with AI assistants like ChatGPT, Claude, or Gemini, something important happens behind the scenes. Each conversation isn't just a one-time interaction—it's building a detailed profile of who you are.",
      visual: 'chat',
      insights: [
        "Your communication style and preferences",
        "The topics you care about most",
        "How you make decisions and solve problems"
      ]
    },
    {
      title: "The Hidden Lock-In",
      subtitle: "Your context becomes their competitive advantage",
      content: "This accumulated understanding becomes incredibly valuable—both to you and to the AI company. The richer your conversation history, the more personalized and helpful the AI becomes. But it also creates a subtle form of vendor lock-in.",
      visual: 'data',
      insights: [
        "Switching to a new AI means starting over",
        "Your preferences don't transfer between platforms",
        "Companies use this data to keep you engaged"
      ]
    }
  ],
  preferences: [
    {
      title: "Your Digital Fingerprint",
      subtitle: "Every interaction adds to your profile",
      content: "Behind every conversation lies a growing database of your preferences, values, and behavioral patterns. This isn't just data—it's your digital identity taking shape.",
      visual: 'data',
      insights: [
        "Communication patterns and decision-making style",
        "Domain-specific preferences (work, home, hobbies)",
        "Values and priorities that guide your choices"
      ]
    },
    {
      title: "The Portability Problem",
      subtitle: "Your context should belong to you",
      content: "This rich context represents years of interaction and learning. Yet today, it's trapped within individual platforms. What if you could take your preferences with you—enabling better AI experiences across all platforms?",
      visual: 'agents',
      insights: [
        "Context portability enables true AI competition",
        "Better experiences when AIs understand you from day one",
        "You control how your data is used and shared"
      ]
    }
  ],
  negotiation: [
    {
      title: "The Agent Future",
      subtitle: "AI acting on your behalf with full context",
      content: "Soon, AI agents will negotiate deals, make purchases, and handle tasks on your behalf. But for this to work well, they need deep understanding of your preferences, constraints, and values.",
      visual: 'agents',
      insights: [
        "Agents negotiate with your unique preferences in mind",
        "Complex multi-party decisions handled automatically",
        "Your values and constraints guide every decision"
      ]
    },
    {
      title: "The Vision Realized",
      subtitle: "A future of interoperable AI that serves you",
      content: "Imagine a world where your AI agent can work with any service provider's agent—all with deep understanding of who you are and what you value. This is the promise of portable human context.",
      visual: 'data',
      insights: [
        "Seamless AI collaboration across platforms",
        "Negotiations that truly represent your interests",
        "A competitive AI ecosystem that puts you first"
      ]
    }
  ]
}

export function OnboardingModal({ 
  isOpen, 
  onClose, 
  actionLabel = "Explore",
  modalType
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Check for verbose display environment variable
  const showVerboseDisplay = process.env.NEXT_PUBLIC_VERBOSE_DISPLAY === 'true'
  
  const story = storyContent[modalType]
  const step = story[currentStep]
  
  const handleNext = async () => {
    if (currentStep < story.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsTransitioning(false)
      }, 200)
    } else {
      onClose()
    }
  }
  
  const handleClose = () => {
    setCurrentStep(0)
    onClose()
  }

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
  }, [isOpen])
  
  const getVisualIcon = (visual: string) => {
    switch (visual) {
      case 'chat': return Sparkles
      case 'data': return Archive
      case 'agents': return Network
      default: return Sparkles
    }
  }
  
  const VisualIcon = getVisualIcon(step?.visual)
  
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
                
                {/* Progress indicator */}
                <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  {story.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1 rounded-full flex-1 ${
                        index <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: index <= currentStep ? 1 : 0.3,
                        backgroundColor: index <= currentStep ? 'oklch(0.385 0.127 265)' : 'oklch(0.925 0.01 83)'
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  ))}
                </div>
                
                {/* Visual icon */}
                <motion.div 
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <VisualIcon className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
              
              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -20 : 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-3 sm:px-8 sm:pb-4 md:px-10"
                >
                  <div className="text-center mb-6 sm:mb-8">
                    <motion.h2 
                      className="text-2xl sm:text-3xl md:text-4xl mb-2 font-light"
                      style={{ fontFamily: 'var(--font-crimson)' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {step?.title}
                    </motion.h2>
                    {step?.subtitle && (
                      <motion.p 
                        className="text-sm sm:text-base text-primary/80 font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {step.subtitle}
                      </motion.p>
                    )}
                  </div>
                  
                  <motion.p 
                    className="text-sm sm:text-base text-muted-foreground leading-[1.6] sm:leading-[1.7] text-center mb-6 sm:mb-8 max-w-sm sm:max-w-lg mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {step?.content}
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
                        {step?.insights.map((insight, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Actions */}
              <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                <div className="flex justify-between items-center gap-4">
                  <motion.p 
                    className="text-xs sm:text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {currentStep + 1} of {story.length}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      onClick={handleNext}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base"
                    >
                      {currentStep < story.length - 1 ? (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        actionLabel
                      )}
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