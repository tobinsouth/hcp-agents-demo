/**
 * Human Context Protocol (HCP) Core Library - Simplified
 * 
 * Simple management of hierarchical JSON context data.
 */

import type { HCPContext } from '../types'

/**
 * Core HCP Manager - Singleton for managing context
 */
export class HCPManager {
  private static instance: HCPManager
  private context: HCPContext
  private initialized: boolean = false

  private constructor() {
    this.context = {}
  }

  /**
   * Get singleton instance
   */
  static getInstance(): HCPManager {
    if (!HCPManager.instance) {
      HCPManager.instance = new HCPManager()
      HCPManager.instance.initializeDemo()
    }
    return HCPManager.instance
  }

  /**
   * Initialize with demo data
   */
  private initializeDemo(): void {
    if (!this.initialized) {
      // Lazy load demo data
      import('../../../demo/data/hcp-demo-data').then(({ DEMO_CONTEXT }) => {
        if (Object.keys(this.context).length === 0) {
          this.context = DEMO_CONTEXT
          console.log('[HCP] Initialized with demo context')
        }
      }).catch(err => {
        console.error('[HCP] Failed to load demo data:', err)
      })
      this.initialized = true
    }
  }

  /**
   * Get the full context
   */
  getContext(): HCPContext {
    return { ...this.context }
  }

  /**
   * Update the context (merges with existing)
   */
  updateContext(updates: Partial<HCPContext>): void {
    this.context = this.deepMerge(this.context, updates)
  }

  /**
   * Set the entire context (replaces existing)
   */
  setContext(context: HCPContext): void {
    this.context = { ...context }
  }

  /**
   * Clear the context
   */
  clearContext(): void {
    this.context = {}
  }

  /**
   * Get value at a specific path
   */
  getValueAtPath(path: string): any {
    const keys = path.split('.')
    let current: any = this.context
    
    for (const key of keys) {
      if (current?.[key] === undefined) {
        return undefined
      }
      current = current[key]
    }
    
    return current
  }

  /**
   * Set value at a specific path
   */
  setValueAtPath(path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    let current: any = this.context
    
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[lastKey] = value
  }

  /**
   * Get all keys in the context (flattened with dot notation)
   */
  getAllKeys(obj = this.context, prefix = ''): string[] {
    const keys: string[] = []
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.push(fullKey)
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...this.getAllKeys(obj[key], fullKey))
      }
    }
    
    return keys
  }

  /**
   * Deep merge helper
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }
}

// Export singleton instance
export const hcp = HCPManager.getInstance()

// Export convenience function
export function getHCP(): HCPManager {
  return HCPManager.getInstance()
}

export default hcp