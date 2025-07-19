import { useState, useEffect } from 'react'
import { healthCheckService, type SystemHealth } from '../services/healthCheckService'

export const useHealthCheck = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runHealthCheck = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const healthStatus = await healthCheckService.runHealthChecks()
      setHealth(healthStatus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed'
      setError(errorMessage)
      console.error('Health check failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Run health check on mount
    runHealthCheck()
  }, [])

  return {
    health,
    isLoading,
    error,
    runHealthCheck,
    isHealthy: health?.overall === 'healthy',
    isDegraded: health?.overall === 'degraded',
    isUnhealthy: health?.overall === 'unhealthy'
  }
}