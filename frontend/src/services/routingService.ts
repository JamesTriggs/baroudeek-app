import { osmQualityService, type OSMRoadData } from './osmQualityService'
import { elevationService } from './elevationService'

interface Waypoint {
  lat: number
  lng: number
}

interface ElevationPoint {
  distance: number
  elevation: number
  grade?: number
}

interface RouteQuality {
  surfaceScore: number      // 0-100, tarmac quality & smoothness (40% weight)
  trafficScore: number      // 0-100, traffic volume & safety (25% weight)
  gradientScore: number     // 0-100, gradient suitability (20% weight)
  infrastructureScore: number // 0-100, cycle lanes & road width (10% weight)
  scenicScore: number       // 0-100, natural beauty & views (5% weight)
  overallScore: number      // 0-100, weighted overall cycling suitability
  osmScore?: number         // 0-100, OpenStreetMap road quality data
  details: {
    surfaceType: 'excellent' | 'good' | 'fair' | 'poor'
    trafficLevel: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
    maxGradient: number
    avgGradient: number
    hasShoulders: boolean
    hasCycleLanes: boolean
    scenicHighlights: string[]
    osmData?: {
      confidence: number
      roadTypes: string[]
      surfaces: string[]
      smoothness: string[]
      dataAvailable: string[]
    }
  }
}

interface RouteResponse {
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
  quality: RouteQuality
  warnings: string[]
}

class RoutingService {
  private baseUrl = 'https://api.openrouteservice.org/v2/directions'
  private apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY
  private osrmUrl = 'https://router.project-osrm.org/route/v1/cycling'

  async getRoute(
    waypoints: Waypoint[], 
    profile: string = 'cycling-regular',
    preferences?: {
      avoidBusyRoads?: boolean
      preferSmoothSurface?: boolean
      maxGradient?: number
      routeType?: 'fastest' | 'safest' | 'balanced'
    }
  ): Promise<RouteResponse> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints required for routing')
    }

    // Try OSRM (free) routing - no fallbacks to avoid confusion
    if (!this.apiKey) {
      console.log('No OpenRouteService API key found, using OSRM routing')
      return await this.getOSRMRoute(waypoints, preferences)
    }

    // Convert waypoints to coordinates (OpenRouteService expects [lng, lat])
    const coordinates = waypoints.map(wp => [wp.lng, wp.lat])
    
    const body = {
      coordinates,
      elevation: true,
      instructions: false,
      options: {
        avoid_features: this.getAvoidFeatures(preferences),
        profile_params: {
          weightings: this.getWeightings(preferences, profile)
        }
      }
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey
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
        elevation: await elevationService.getRouteElevationProfile(route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]), route.properties.summary.distance),
        quality: await this.calculateComprehensiveQuality(route, preferences, route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])),
        warnings: []
      }
    } catch (error) {
      console.error('OpenRouteService routing error:', error)
      console.log('Trying OSRM fallback routing')
      // Try OSRM as fallback
      return await this.getOSRMRoute(waypoints, preferences)
    }
  }

  private async getOSRMRoute(
    waypoints: Waypoint[], 
    preferences?: {
      avoidBusyRoads?: boolean
      preferSmoothSurface?: boolean
      maxGradient?: number
      routeType?: 'fastest' | 'safest' | 'balanced'
    }
  ): Promise<RouteResponse> {
    // Format coordinates for OSRM (lng,lat;lng,lat)
    const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';')
    
    const url = `${this.osrmUrl}/${coordinates}?overview=full&geometries=geojson&steps=false`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found by OSRM')
    }
    
    const route = data.routes[0]
    
    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const coordinates_latLng = route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
    
    // Get real elevation profile using elevation service
    const elevationProfile = await elevationService.getRouteElevationProfile(coordinates_latLng, route.distance)
    
    return {
      coordinates: coordinates_latLng,
      distance: route.distance,
      duration: route.duration,
      elevation: elevationProfile,
      quality: await this.calculateComprehensiveQuality(route, preferences, coordinates_latLng),
      warnings: this.generateRouteWarnings(route, preferences)
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

  private getAvoidFeatures(preferences?: any): string[] {
    // Only use valid avoid features for cycling profiles
    const avoid = ['tollways']
    
    if (preferences?.avoidBusyRoads) {
      avoid.push('ferries')
    }
    
    return avoid
  }

  private getWeightings(preferences?: any, profile?: string): any {
    const baseWeights: any = {
      steepness_difficulty: preferences?.maxGradient ? Math.min(preferences.maxGradient / 10, 3) : 2,
      quiet: preferences?.avoidBusyRoads ? 1.2 : 0.6
    }
    
    // Add green/scenic routing preference
    if (preferences?.routeType === 'scenic') {
      baseWeights.green = 1.0
    }
    
    // Surface preferences
    if (preferences?.preferSmoothSurface) {
      baseWeights.surface_quality_known = 1.0
    }

    // Road bike specific adjustments
    if (profile === 'cycling-road') {
      baseWeights.quiet = preferences?.avoidBusyRoads ? 1.5 : 0.8
      baseWeights.steepness_difficulty = preferences?.maxGradient ? Math.min(preferences.maxGradient / 8, 2.5) : 1.8
    }

    return baseWeights
  }

  private async calculateComprehensiveQuality(route: any, preferences?: any, coordinates?: [number, number][]): Promise<RouteQuality> {
    // Comprehensive road cyclist quality scoring based on 5 key factors + OSM data
    
    // Fetch OSM road quality data if coordinates available
    let osmData: OSMRoadData[] = []
    let osmScore: number | undefined = undefined
    let osmDetails: any = undefined
    
    if (coordinates && coordinates.length > 0) {
      try {
        console.log('Fetching OSM road quality data for route...')
        osmData = await osmQualityService.getRouteQualityData(coordinates)
        
        if (osmData.length > 0) {
          const qualityScores = osmData.map(road => osmQualityService.calculateOSMQualityScore(road))
          
          // Calculate weighted average based on confidence
          let totalWeightedScore = 0
          let totalWeight = 0
          
          qualityScores.forEach(score => {
            const weight = score.confidence / 100
            totalWeightedScore += score.combinedScore * weight
            totalWeight += weight
          })
          
          osmScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : undefined
          
          // Aggregate OSM details
          const roadTypes = [...new Set(osmData.map(road => road.highway))]
          const surfaces = [...new Set(osmData.filter(road => road.surface).map(road => road.surface!))]
          const smoothness = [...new Set(osmData.filter(road => road.smoothness).map(road => road.smoothness!))]
          const allDataAvailable = [...new Set(qualityScores.flatMap(score => score.details.dataAvailable))]
          const avgConfidence = qualityScores.reduce((sum, score) => sum + score.confidence, 0) / qualityScores.length
          
          osmDetails = {
            confidence: Math.round(avgConfidence),
            roadTypes,
            surfaces,
            smoothness,
            dataAvailable: allDataAvailable
          }
          
          console.log(`OSM Quality: ${osmScore}/100 (confidence: ${avgConfidence.toFixed(1)}%)`)
        }
      } catch (error) {
        console.warn('Failed to fetch OSM quality data:', error)
      }
    }
    
    // 1. Surface Quality (40% weight) - Enhanced with OSM data
    let surfaceScore = this.calculateSurfaceScore(route, preferences, osmScore)
    
    // 2. Traffic Score (25% weight) - Enhanced with OSM road types
    let trafficScore = this.calculateTrafficScore(route, preferences, osmData)
    
    // 3. Gradient Score (20% weight) - Manageable climbing for road bikes
    let gradientScore = this.calculateGradientScore(route, preferences)
    
    // 4. Infrastructure Score (10% weight) - Enhanced with OSM highway data
    let infrastructureScore = this.calculateInfrastructureScore(route, preferences, osmData)
    
    // 5. Scenic Score (5% weight) - Natural beauty, views
    let scenicScore = this.calculateScenicScore(route, preferences)
    
    // Calculate weighted overall score
    const overallScore = Math.round(
      (surfaceScore * 0.40) +
      (trafficScore * 0.25) +
      (gradientScore * 0.20) +
      (infrastructureScore * 0.10) +
      (scenicScore * 0.05)
    )
    
    return {
      surfaceScore,
      trafficScore,
      gradientScore,
      infrastructureScore,
      scenicScore,
      overallScore,
      osmScore,
      details: {
        surfaceType: this.getSurfaceType(surfaceScore),
        trafficLevel: this.getTrafficLevel(trafficScore),
        maxGradient: this.estimateMaxGradient(route),
        avgGradient: this.estimateAvgGradient(route),
        hasShoulders: this.estimateHasShoulders(route, infrastructureScore),
        hasCycleLanes: this.estimateHasCycleLanes(route, infrastructureScore),
        scenicHighlights: this.getScenicHighlights(route, scenicScore),
        osmData: osmDetails
      }
    }
  }

  private calculateSurfaceScore(route: any, preferences?: any, osmScore?: number): number {
    let score = 75 // Base score for unknown surface
    
    // Use OSM surface/smoothness data if available (highest priority)
    if (osmScore !== undefined) {
      score = osmScore * 0.7 + score * 0.3 // Weight OSM data heavily but blend with estimates
      console.log(`Surface score enhanced with OSM data: ${score.toFixed(1)}`)
    } else {
      // Fallback to estimated scoring
      
      // Route type analysis
      if (preferences?.preferSmoothSurface) {
        score += 10 // User prioritizes smooth surfaces
      }
      
      // Distance factor - longer routes on main roads tend to have better surfaces
      if (route.distance > 30000) {
        score += 8
      } else if (route.distance < 5000) {
        score -= 5 // Short urban routes may have more potholes
      }
      
      // Preference adjustments
      if (preferences?.avoidBusyRoads) {
        score -= 8 // Quiet roads may have less maintenance
      }
      
      // Random variation for realism (surface quality varies significantly)
      score += Math.random() * 20 - 10
    }
    
    return Math.min(100, Math.max(20, Math.round(score)))
  }

  private calculateTrafficScore(route: any, preferences?: any, osmData?: OSMRoadData[]): number {
    let score = 70 // Base traffic score
    
    // Analyze OSM highway types if available
    if (osmData && osmData.length > 0) {
      const highwayTypes = osmData.map(road => road.highway)
      const avgHighwayScore = highwayTypes.reduce((sum, highway) => {
        return sum + this.getHighwayTrafficScore(highway)
      }, 0) / highwayTypes.length
      
      // Blend OSM highway analysis with other factors
      score = avgHighwayScore * 0.6 + score * 0.4
      console.log(`Traffic score enhanced with OSM highway data: ${score.toFixed(1)}`)
    }
    
    // Route preferences strongly affect traffic
    if (preferences?.avoidBusyRoads) {
      score += 25 // Major boost for avoiding traffic
    }
    
    if (preferences?.routeType === 'safest') {
      score += 20
    } else if (preferences?.routeType === 'fastest') {
      score -= 15 // Fastest routes use busier roads
    }
    
    // Distance factor - longer routes tend to use quieter roads
    if (route.distance > 50000) {
      score += 15
    } else if (route.distance < 10000) {
      score -= 10 // Short urban routes typically busier
    }
    
    // Time-based adjustments (if we had time data)
    score += Math.random() * 15 - 7 // Traffic varies by location
    
    return Math.min(100, Math.max(10, Math.round(score)))
  }
  
  private getHighwayTrafficScore(highway: string): number {
    const trafficScores: Record<string, number> = {
      'cycleway': 100, // No traffic
      'path': 95,
      'residential': 85,
      'living_street': 90,
      'unclassified': 80, // Quiet rural roads
      'tertiary': 75,
      'tertiary_link': 78,
      'secondary': 60,
      'secondary_link': 65,
      'primary': 40, // Busy roads
      'primary_link': 45,
      'trunk': 20, // Very busy
      'trunk_link': 25,
      'motorway': 0, // Not allowed anyway
      'motorway_link': 0,
      'service': 75,
      'track': 90 // Usually no traffic but may be unpaved
    }
    
    return trafficScores[highway.toLowerCase()] || 60
  }

  private calculateGradientScore(route: any, preferences?: any): number {
    let score = 80 // Base gradient score
    
    // Max gradient preferences
    if (preferences?.maxGradient) {
      if (preferences.maxGradient <= 3) {
        score += 15 // Very flat preference
      } else if (preferences.maxGradient <= 6) {
        score += 10 // Moderate gradient tolerance
      } else if (preferences.maxGradient >= 12) {
        score -= 10 // Accepts steep climbs
      }
    }
    
    // Estimate gradient from elevation data
    const elevationGain = route.ascent || (route.distance * 0.01)
    const avgGradient = (elevationGain / route.distance) * 100
    
    if (avgGradient < 2) {
      score += 15 // Very flat route
    } else if (avgGradient < 4) {
      score += 10 // Gentle gradients
    } else if (avgGradient > 8) {
      score -= 20 // Very hilly
    } else if (avgGradient > 6) {
      score -= 10 // Moderately hilly
    }
    
    return Math.min(100, Math.max(30, Math.round(score)))
  }

  private calculateInfrastructureScore(route: any, preferences?: any, osmData?: OSMRoadData[]): number {
    let score = 60 // Base infrastructure score
    
    // Analyze OSM highway types for infrastructure likelihood
    if (osmData && osmData.length > 0) {
      const infraScores = osmData.map(road => this.getInfrastructureScoreForHighway(road.highway))
      const avgInfraScore = infraScores.reduce((sum, score) => sum + score, 0) / infraScores.length
      
      // Blend OSM analysis with estimates
      score = avgInfraScore * 0.7 + score * 0.3
      console.log(`Infrastructure score enhanced with OSM data: ${score.toFixed(1)}`)
    }
    
    // Route type affects infrastructure likelihood
    if (preferences?.avoidBusyRoads) {
      score -= 15 // Quiet roads less likely to have cycle infrastructure
    } else {
      score += 10 // Main roads more likely to have shoulders/lanes
    }
    
    // Distance factor
    if (route.distance > 40000) {
      score += 15 // Long routes often use A-roads with better infrastructure
    }
    
    // Urban vs rural estimation based on route characteristics
    if (route.distance < 15000) {
      score += 20 // Urban routes more likely to have cycle infrastructure
    }
    
    score += Math.random() * 20 - 10 // Infrastructure varies significantly
    
    return Math.min(100, Math.max(20, Math.round(score)))
  }
  
  private getInfrastructureScoreForHighway(highway: string): number {
    const infraScores: Record<string, number> = {
      'cycleway': 100, // Dedicated cycling infrastructure
      'path': 90,
      'primary': 80, // Usually have good shoulders
      'primary_link': 75,
      'secondary': 70,
      'secondary_link': 68,
      'trunk': 85, // Usually excellent infrastructure
      'trunk_link': 80,
      'tertiary': 50, // Variable infrastructure
      'tertiary_link': 48,
      'residential': 40, // Usually no specific infrastructure
      'unclassified': 30,
      'living_street': 45,
      'service': 35,
      'track': 10, // Usually no infrastructure
      'motorway': 90, // Excellent but not accessible
      'motorway_link': 85
    }
    
    return infraScores[highway.toLowerCase()] || 50
  }

  private calculateScenicScore(route: any, preferences?: any): number {
    let score = 65 // Base scenic score
    
    // Quiet routes tend to be more scenic
    if (preferences?.avoidBusyRoads) {
      score += 20
    }
    
    if (preferences?.routeType === 'scenic') {
      score += 25
    } else if (preferences?.routeType === 'fastest') {
      score -= 15
    }
    
    // Longer routes more likely to have scenic sections
    if (route.distance > 30000) {
      score += 15
    }
    
    // Rural routes generally more scenic
    if (route.distance > 20000 && preferences?.avoidBusyRoads) {
      score += 10
    }
    
    score += Math.random() * 15 - 7 // Scenic value varies by location
    
    return Math.min(100, Math.max(20, Math.round(score)))
  }



  private getSurfaceType(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  private getTrafficLevel(score: number): 'very-low' | 'low' | 'moderate' | 'high' | 'very-high' {
    if (score >= 85) return 'very-low'
    if (score >= 70) return 'low'
    if (score >= 50) return 'moderate'
    if (score >= 30) return 'high'
    return 'very-high'
  }

  private estimateMaxGradient(route: any): number {
    const elevationGain = route.ascent || (route.distance * 0.01)
    const avgGradient = (elevationGain / route.distance) * 100
    // Max gradient typically 2-3x average gradient
    return Math.min(20, Math.round(avgGradient * 2.5))
  }

  private estimateAvgGradient(route: any): number {
    const elevationGain = route.ascent || (route.distance * 0.01)
    return Math.round(((elevationGain / route.distance) * 100) * 10) / 10
  }

  private estimateHasShoulders(route: any, infraScore: number): boolean {
    return infraScore > 70 && route.distance > 20000
  }

  private estimateHasCycleLanes(route: any, infraScore: number): boolean {
    return infraScore > 80 || (infraScore > 60 && route.distance < 20000)
  }

  private getScenicHighlights(_route: any, scenicScore: number): string[] {
    if (scenicScore < 40) return ['Urban/Industrial areas']
    if (scenicScore < 60) return ['Mixed urban/rural scenery']
    if (scenicScore < 80) return ['Countryside views', 'Rural landscapes']
    return ['Scenic countryside', 'Beautiful views', 'Natural landscapes', 'Peaceful rural roads']
  }

  private generateRouteWarnings(route: any, preferences?: any): string[] {
    const warnings: string[] = []
    
    if (route.distance > 100000) {
      warnings.push('Long route: Consider rest stops and weather conditions')
    }
    
    if (route.duration > 14400) { // 4 hours
      warnings.push('Extended ride time: Plan for nutrition and hydration')
    }
    
    if (preferences?.maxGradient && preferences.maxGradient < 5) {
      warnings.push('Strict gradient limit: Route may use busier roads to avoid hills')
    }
    
    return warnings
  }
}

export const routingService = new RoutingService()
export type { RouteResponse, RouteQuality }