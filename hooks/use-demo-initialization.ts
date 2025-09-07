/**
 * Hook for automatically initializing demo data
 * 
 * This hook ensures demo data is loaded on first access to provide
 * a better demo experience without requiring manual initialization.
 */

import { useEffect, useState } from 'react'

export function useDemoInitialization() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // The backend auto-initializes with demo data on first access
    // This hook just confirms the initialization
    const checkInitialization = async () => {
      try {
        const response = await fetch('/api/demo?action=status')
        if (response.ok) {
          const status = await response.json()
          console.log('[Demo] Status:', status)
          setInitialized(true)
        }
      } catch (error) {
        console.log('[Demo] Status check failed, but backend will auto-initialize')
        setInitialized(true)
      } finally {
        setLoading(false)
      }
    }

    checkInitialization()
  }, [])

  return { initialized, loading }
}

/**
 * Hook to check demo status
 */
export function useDemoStatus() {
  const [status, setStatus] = useState<{
    demo_mode: boolean
    context_version: string
    clients_count: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/demo?action=status')
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error('Failed to check demo status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    
    // Poll for status changes every 5 seconds
    const interval = setInterval(checkStatus, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return { status, loading }
}