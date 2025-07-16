interface Waypoint {
  lat: number
  lng: number
}

interface RouteResponse {
  coordinates: [number, number][]
  distance: number
  duration: number
  elevation: {
    ascent: number
    descent: number
  }
}

class RoutingService {
  private baseUrl = 'https://api.openrouteservice.org/v2/directions'
  private apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY

  async getRoute(waypoints: Waypoint[], profile: string = 'cycling-regular'): Promise<RouteResponse> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints required for routing')
    }

    // Convert waypoints to coordinates (OpenRouteService expects [lng, lat])
    const coordinates = waypoints.map(wp => [wp.lng, wp.lat])
    
    const body = {
      coordinates,
      profile,
      elevation: true,
      geometry_format: 'geojson',
      instructions: false,
      options: {
        avoid_features: ['highways', 'tollways'],
        profile_params: {
          weightings: {
            steepness_difficulty: 2,
            green: 0.4,
            quiet: 0.8
          }
        }
      }
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add API key if available
      if (this.apiKey) {
        headers['Authorization'] = this.apiKey
      }

      const response = await fetch(`${this.baseUrl}/${profile}/geojson`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Routing API error:', response.status, errorText)
        throw new Error(`Routing API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No route found')
      }
      
      const route = data.features[0]
      
      return {
        coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
        distance: route.properties.summary.distance,
        duration: route.properties.summary.duration,
        elevation: {
          ascent: route.properties.ascent || 0,
          descent: route.properties.descent || 0
        }
      }
    } catch (error) {
      console.error('Routing error:', error)
      console.log('Falling back to straight-line routing')
      // Fallback to straight line routing
      return this.getFallbackRoute(waypoints)
    }
  }

  private getFallbackRoute(waypoints: Waypoint[]): RouteResponse {
    const coordinates: [number, number][] = waypoints.map(wp => [wp.lat, wp.lng])
    
    // Calculate approximate distance
    let totalDistance = 0
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += this.calculateDistance(
        waypoints[i].lat, waypoints[i].lng,
        waypoints[i + 1].lat, waypoints[i + 1].lng
      )
    }

    return {
      coordinates,
      distance: totalDistance,
      duration: totalDistance / 5, // Assume 5 m/s cycling speed
      elevation: {
        ascent: 0,
        descent: 0
      }
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

export const routingService = new RoutingService()
export type { RouteResponse }