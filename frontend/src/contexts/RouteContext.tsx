import React, { createContext, useContext, useState, ReactNode } from 'react'
import { routingService } from '../services/routingService'

interface Waypoint {
  id: string
  lat: number
  lng: number
  address?: string
}

interface ElevationPoint {
  distance: number
  elevation: number
  grade?: number
}

interface RouteInfo {
  coordinates: [number, number][]
  distance: number
  duration: number
  elevation: {
    ascent: number
    descent: number
    maxElevation: number
    minElevation: number
    profile: ElevationPoint[]
  }
  quality: {
    surfaceScore: number
    trafficScore: number
    overallScore: number
  }
  warnings: string[]
}

interface RouteOptions {
  profile?: string
  avoidBusyRoads?: boolean
  preferSmoothSurface?: boolean
  maxGradient?: number
}

interface RouteContextType {
  waypoints: Waypoint[]
  route: RouteInfo | null
  isLoading: boolean
  error: string | null
  addWaypoint: (lat: number, lng: number) => Promise<void>
  removeWaypoint: (id: string) => void
  generateRoute: (options?: RouteOptions) => Promise<void>
  clearRoute: () => void
}

const RouteContext = createContext<RouteContextType | undefined>(undefined)

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addWaypoint = async (lat: number, lng: number) => {
    // Try to get a readable address using reverse geocoding
    let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      if (response.ok) {
        const data = await response.json()
        if (data.display_name) {
          // Extract a readable short address
          const parts = data.display_name.split(', ')
          address = parts.slice(0, 3).join(', ') || address
        }
      }
    } catch (error) {
      console.log('Geocoding failed, using coordinates:', error)
    }
    
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      lat,
      lng,
      address
    }
    setWaypoints(prev => {
      const updated = [...prev, newWaypoint]
      // Auto-generate route when we have 2+ waypoints
      if (updated.length >= 2) {
        setTimeout(() => generateRouteForWaypoints(updated), 100)
      }
      return updated
    })
  }

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => {
      const updated = prev.filter(wp => wp.id !== id)
      // Auto-generate route for remaining waypoints if we still have 2+
      if (updated.length >= 2) {
        setTimeout(() => generateRouteForWaypoints(updated), 100)
      } else {
        setRoute(null) // Clear route when we have fewer than 2 waypoints
      }
      return updated
    })
  }

  const generateRouteForWaypoints = async (waypointsToUse: Waypoint[], options?: RouteOptions) => {
    if (waypointsToUse.length < 2) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const profile = options?.profile || 'cycling-regular'
      const preferences = {
        avoidBusyRoads: options?.avoidBusyRoads,
        preferSmoothSurface: options?.preferSmoothSurface,
        maxGradient: options?.maxGradient,
        routeType: 'balanced' as const
      }
      const routeResponse = await routingService.getRoute(waypointsToUse, profile, preferences)
      setRoute(routeResponse)
      console.log('Route generated with profile:', profile, routeResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate route'
      setError(errorMessage)
      console.error('Route generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRoute = async (options?: RouteOptions) => {
    console.log('Manually generating route with waypoints:', waypoints, 'options:', options)
    if (waypoints.length < 2) {
      setError('Please add at least 2 waypoints to generate a route')
      return
    }
    
    await generateRouteForWaypoints(waypoints, options)
  }

  const clearRoute = () => {
    setWaypoints([])
    setRoute(null)
    setError(null)
  }

  return (
    <RouteContext.Provider value={{ 
      waypoints, 
      route, 
      isLoading, 
      error, 
      addWaypoint, 
      removeWaypoint,
      generateRoute, 
      clearRoute 
    }}>
      {children}
    </RouteContext.Provider>
  )
}

export const useRoute = () => {
  const context = useContext(RouteContext)
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider')
  }
  return context
}