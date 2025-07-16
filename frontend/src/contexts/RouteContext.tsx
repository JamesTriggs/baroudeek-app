import React, { createContext, useContext, useState, ReactNode } from 'react'
import { routingService, RouteResponse } from '../services/routingService'

interface Waypoint {
  id: string
  lat: number
  lng: number
  address?: string
}

interface RouteInfo {
  coordinates: [number, number][]
  distance: number
  duration: number
  elevation: {
    ascent: number
    descent: number
  }
}

interface RouteContextType {
  waypoints: Waypoint[]
  route: RouteInfo | null
  isLoading: boolean
  error: string | null
  addWaypoint: (lat: number, lng: number) => void
  removeWaypoint: (id: string) => void
  generateRoute: () => Promise<void>
  clearRoute: () => void
}

const RouteContext = createContext<RouteContextType | undefined>(undefined)

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addWaypoint = (lat: number, lng: number) => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      lat,
      lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
    setWaypoints(prev => [...prev, newWaypoint])
  }

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id))
    setRoute(null) // Clear route when waypoints change
  }

  const generateRoute = async () => {
    console.log('Generating route with waypoints:', waypoints)
    if (waypoints.length < 2) {
      alert('Please add at least 2 waypoints to generate a route')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const routeResponse = await routingService.getRoute(waypoints)
      setRoute(routeResponse)
      console.log('Route generated:', routeResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate route'
      setError(errorMessage)
      console.error('Route generation error:', err)
    } finally {
      setIsLoading(false)
    }
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