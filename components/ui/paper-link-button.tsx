"use client"
import { motion } from "framer-motion"
import { FileText, ExternalLink } from "lucide-react"

interface PaperLinkButtonProps {
  href: string
  title: string
  subtitle?: string
}

export function PaperLinkButton({ href, title, subtitle }: PaperLinkButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Icon container with gradient background */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg blur-md group-hover:blur-lg transition-all" />
        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
        </div>
      </div>
      
      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
            {title}
          </span>
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 0.5, x: 0 }}
            whileHover={{ opacity: 1, x: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
          </motion.div>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.a>
  )
}