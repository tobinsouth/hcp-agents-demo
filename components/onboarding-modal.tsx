"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  actionLabel?: string
}

export function OnboardingModal({ 
  isOpen, 
  onClose, 
  title, 
  content,
  actionLabel = "Got it!"
}: OnboardingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-accent/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {content}
                </p>
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={onClose}
                    className="min-w-[100px]"
                  >
                    {actionLabel}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}