interface ElevationPoint {
  distance: number
  elevation: number
  grade?: number
}

interface OpenElevationResponse {
  results: Array<{
    elevation: number | null
    latitude: number
    longitude: number
  }>
}

class ElevationService {
  // Use local elevation service (with fallback to external APIs)
  private baseUrl = 'http://localhost:8000/api/elevation/lookup'
  private fallbackUrl = 'https://api.open-elevation.com/api/v1/lookup'
  
  
  /**
   * Fetches real elevation data for route coordinates using Open-Topo-Data API
   * Uses ASTER 30m dataset which provides good global coverage
   */
  async getRouteElevationProfile(
    coordinates: [number, number][], 
    totalDistance: number
  ): Promise<{
    ascent: number
    descent: number
    maxElevation: number
    minElevation: number
    profile: ElevationPoint[]
  }> {
    try {
      // Limit coordinates to reasonable number for API (max 100 points)
      const maxPoints = 100
      const stepSize = Math.max(1, Math.floor(coordinates.length / maxPoints))
      const sampledCoords = coordinates.filter((_, index) => index % stepSize === 0)
      
      // Always include the last coordinate
      if (sampledCoords[sampledCoords.length - 1] !== coordinates[coordinates.length - 1]) {
        sampledCoords.push(coordinates[coordinates.length - 1])
      }
      
      console.log(`Fetching elevation data for ${sampledCoords.length} points...`)
      
      // Format coordinates for Open Elevation API (requires POST with JSON)
      const locations = sampledCoords.map(coord => ({
        latitude: coord[0],
        longitude: coord[1]
      }))
      
      const apiUrl = this.baseUrl
      
      console.log(`Fetching elevation from ${this.baseUrl} (with fallback)`)
      console.log('Sample coordinates:', sampledCoords.slice(0, 3))
      
      // Try local service first, fallback to external API
      let response
      let isLocalService = true
      
      try {
        response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ locations })
        })
        
        if (!response.ok) {
          throw new Error(`Local service failed: ${response.status}`)
        }
      } catch (localError) {
        console.warn('Local elevation service failed, trying fallback:', localError)
        isLocalService = false
        
        response = await fetch(this.fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ locations })
        })
        
        if (!response.ok) {
          throw new Error(`Both elevation services failed. Local: ${localError.message}, Fallback: ${response.status}`)
        }
      }
      
      console.log(`Using ${isLocalService ? 'local' : 'fallback'} elevation service`)
      
      if (!response.ok) {
        throw new Error(`Elevation API error: ${response.status}`)
      }
      
      const data: OpenElevationResponse = await response.json()
      
      // Open Elevation API doesn't have a status field, check for results
      if (!data.results || data.results.length === 0) {
        throw new Error('No elevation results returned')
      }
      
      return this.processElevationData(data.results, sampledCoords, totalDistance)
      
    } catch (error) {
      console.error('Failed to fetch real elevation data:', error)
      throw new Error(`Elevation service failed: ${error.message}`)
    }
  }
  
  private processElevationData(
    results: OpenElevationResponse['results'],
    coordinates: [number, number][],
    totalDistance: number
  ) {
    const profile: ElevationPoint[] = []
    let totalAscent = 0
    let totalDescent = 0
    let maxElevation = -Infinity
    let minElevation = Infinity
    
    // Filter out null elevation results and smooth data
    const validElevations = results
      .map((result, index) => ({
        elevation: result.elevation,
        coordinate: coordinates[index],
        index
      }))
      .filter(item => item.elevation !== null && item.elevation !== undefined)
    
    if (validElevations.length < 2) {
      throw new Error('Insufficient valid elevation data')
    }
    
    // Apply light smoothing to reduce noise
    const smoothedElevations = this.smoothElevationData(validElevations.map(v => v.elevation!))
    
    for (let i = 0; i < validElevations.length; i++) {
      const smoothedElevation = smoothedElevations[i]
      const distance = (totalDistance / (validElevations.length - 1)) * i
      
      // Track elevation extremes
      maxElevation = Math.max(maxElevation, smoothedElevation)
      minElevation = Math.min(minElevation, smoothedElevation)
      
      // Calculate grade (gradient percentage)
      let grade = 0
      if (i > 0) {
        const distanceDiff = distance - profile[i - 1].distance
        const elevationDiff = smoothedElevation - profile[i - 1].elevation
        
        // Only calculate grade if distance difference is meaningful (>10m)
        if (distanceDiff > 10) {
          grade = (elevationDiff / distanceDiff) * 100
          // Cap at realistic cycling gradients
          grade = Math.max(-25, Math.min(25, grade))
        }
        
        // Track ascent/descent
        if (elevationDiff > 0.5) { // Ignore tiny elevation changes
          totalAscent += elevationDiff
        } else if (elevationDiff < -0.5) {
          totalDescent += Math.abs(elevationDiff)
        }
      }
      
      profile.push({
        distance: Math.round(distance),
        elevation: Math.round(smoothedElevation * 10) / 10,
        grade: Math.round(grade * 100) / 100
      })
    }
    
    console.log(`Elevation profile: ${profile.length} points, ascent: ${totalAscent.toFixed(1)}m, descent: ${totalDescent.toFixed(1)}m`)
    
    return {
      ascent: Math.round(totalAscent * 10) / 10,
      descent: Math.round(totalDescent * 10) / 10,
      maxElevation: Math.round(maxElevation * 10) / 10,
      minElevation: Math.round(minElevation * 10) / 10,
      profile
    }
  }
  
  /**
   * Apply simple moving average smoothing to reduce GPS/elevation noise
   */
  private smoothElevationData(elevations: number[]): number[] {
    const windowSize = 3
    const smoothed: number[] = []
    
    for (let i = 0; i < elevations.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2))
      const end = Math.min(elevations.length, i + Math.floor(windowSize / 2) + 1)
      
      const window = elevations.slice(start, end)
      const average = window.reduce((sum, val) => sum + val, 0) / window.length
      
      smoothed.push(average)
    }
    
    return smoothed
  }
  
}

export const elevationService = new ElevationService()
export type { ElevationPoint }