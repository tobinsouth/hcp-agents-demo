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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeDemo = async () => {
      try {
        // Check if demo data is already loaded
        const statusResponse = await fetch('/api/demo?action=status')
        const status = await statusResponse.json()

        if (!status.demo_mode && mounted) {
          // Load demo data if not already loaded
          const loadResponse = await fetch('/api/demo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              scenario: undefined, // Load default demo data
              reset: false // Don't reset if data exists
            })
          })

          const result = await loadResponse.json()
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to load demo data')
          }

          console.log('[Demo] Initialized with demo data:', result.message)
        }

        if (mounted) {
          setInitialized(true)
          setError(null)
        }
      } catch (err) {
        console.error('[Demo] Failed to initialize:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize demo')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeDemo()

    return () => {
      mounted = false
    }
  }, [])

  return { initialized, loading, error }
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