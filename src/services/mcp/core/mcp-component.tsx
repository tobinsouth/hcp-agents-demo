"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card } from "@/frontend/components/core/ui/card"
import { Cpu, ArrowRight, Workflow, Sparkles } from "lucide-react"

export function MCPComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full p-3 sm:p-4 md:p-6"
    >
      <Card className="flex-1 bg-card/50 backdrop-blur-sm border-0 shadow-lg">
        <div className="p-6 sm:p-8 md:p-10 flex flex-col h-full">
          {/* Header with Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Workflow className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Model Context Protocol
            </h2>
          </motion.div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Main Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">
                The Model Context Protocol is a groundbreaking standard that enables AI workflows to 
                natively connect to external applications in agentic workflows. It transforms how AI 
                systems interact with tools, data sources, and services—making them truly capable 
                of acting on your behalf.
              </p>

              {/* Feature Pills */}
              <motion.div 
                className="flex flex-wrap gap-2 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {[
                  { icon: Cpu, label: "Native Integration" },
                  { icon: ArrowRight, label: "Seamless Workflows" },
                  { icon: Sparkles, label: "Agentic AI" }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full"
                  >
                    <feature.icon className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div 
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <a 
              href="https://cursor.com/en/install-mcp?name=human-context-protocol&config=eyJ1cmwiOiJodHRwczovL2hjcC5sb3lhbGFnZW50cy5vcmcvYXBpL21jcC9tY3AifQ%3D%3D"
              className="inline-block transition-transform hover:scale-105 active:scale-95"
            >
              <img 
                src="https://cursor.com/deeplink/mcp-install-dark.svg" 
                alt="Add human-context-protocol MCP server to Cursor" 
                height="32"
                className="h-8 sm:h-9"
              />
            </a>
          </motion.div>

          {/* Subtle hint text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-xs text-center text-muted-foreground/60 mt-4"
          >
            Connect your Human Context Protocol to Cursor IDE
          </motion.p>
        </div>
      </Card>
    </motion.div>
  )
}