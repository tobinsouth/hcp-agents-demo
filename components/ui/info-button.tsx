"use client"
import { motion } from "framer-motion"
import { Info } from "lucide-react"

interface InfoButtonProps {
  onClick: () => void
  className?: string
}

export function InfoButton({ onClick, className = "" }: InfoButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`absolute bottom-3 right-3 p-2 rounded-full bg-muted/30 backdrop-blur-sm border border-border/20 hover:bg-muted/50 hover:border-border/40 transition-all duration-300 group ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.5, scale: 1 }}
      whileHover={{ opacity: 1, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      aria-label="Show information modal"
    >
      <Info className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
    </motion.button>
  )
}