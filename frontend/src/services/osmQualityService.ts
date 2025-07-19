interface OSMRoadData {
  wayId: string
  surface?: string
  smoothness?: string
  highway: string
  coordinates: [number, number][]
  name?: string
}

interface OSMQualityScore {
  surfaceScore: number // 0-100 based on OSM surface tag
  smoothnessScore: number // 0-100 based on OSM smoothness tag
  highwayScore: number // 0-100 based on road type
  combinedScore: number // weighted combination
  confidence: number // how much OSM data is available
  details: {
    surface?: string
    smoothness?: string
    highway: string
    dataAvailable: string[]
  }
}

class OSMQualityService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter'
  
  /**
   * Fetch road quality data for a route using Overpass API
   */
  async getRouteQualityData(coordinates: [number, number][]): Promise<OSMRoadData[]> {
    if (coordinates.length < 2) return []
    
    try {
      // Create bounding box around the route
      const bbox = this.createBoundingBox(coordinates)
      
      // Build Overpass query for roads with surface/smoothness data
      const query = this.buildOverpassQuery(bbox)
      
      const response = await fetch(this.overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      })
      
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.parseOverpassResponse(data)
      
    } catch (error) {
      console.error('OSM Quality Service error:', error)
      return []
    }
  }
  
  /**
   * Calculate quality scores based on OSM road data
   */
  calculateOSMQualityScore(osmData: OSMRoadData): OSMQualityScore {
    const surfaceScore = this.scoreSurface(osmData.surface)
    const smoothnessScore = this.scoreSmoothness(osmData.smoothness)
    const highwayScore = this.scoreHighwayType(osmData.highway)
    
    // Calculate availability of data
    const dataAvailable = []
    if (osmData.surface) dataAvailable.push('surface')
    if (osmData.smoothness) dataAvailable.push('smoothness')
    dataAvailable.push('highway')
    
    const confidence = Math.min(100, dataAvailable.length * 33)
    
    // Weighted combination (surface is most important for cyclists)
    const combinedScore = Math.round(
      (surfaceScore * 0.50) +
      (smoothnessScore * 0.35) +
      (highwayScore * 0.15)
    )
    
    return {
      surfaceScore,
      smoothnessScore,
      highwayScore,
      combinedScore,
      confidence,
      details: {
        surface: osmData.surface,
        smoothness: osmData.smoothness,
        highway: osmData.highway,
        dataAvailable
      }
    }
  }
  
  /**
   * Score surface type for road bike suitability
   */
  private scoreSurface(surface?: string): number {
    if (!surface) return 70 // Unknown surface - assume reasonable
    
    const surfaceScores: Record<string, number> = {
      // Excellent surfaces
      'asphalt': 95,
      'concrete': 90,
      'paved': 85,
      'concrete:plates': 88,
      'concrete:lanes': 85,
      
      // Good surfaces  
      'paving_stones': 75,
      'sett': 70,
      'metal': 65,
      
      // Fair surfaces
      'compacted': 60,
      'fine_gravel': 55,
      'pebblestone': 50,
      
      // Poor surfaces for road bikes
      'gravel': 30,
      'dirt': 20,
      'grass': 15,
      'sand': 10,
      'mud': 5,
      'unpaved': 25,
      'ground': 20,
      'earth': 15,
      'cobblestone': 40
    }
    
    return surfaceScores[surface.toLowerCase()] || 60
  }
  
  /**
   * Score smoothness for cycling comfort
   */
  private scoreSmoothness(smoothness?: string): number {
    if (!smoothness) return 70 // Unknown - assume reasonable
    
    const smoothnessScores: Record<string, number> = {
      'excellent': 100,
      'good': 85,
      'intermediate': 70,
      'bad': 40,
      'very_bad': 20,
      'horrible': 10,
      'very_horrible': 5,
      'impassable': 0
    }
    
    return smoothnessScores[smoothness.toLowerCase()] || 70
  }
  
  /**
   * Score highway type for road bike suitability
   */
  private scoreHighwayType(highway: string): number {
    const highwayScores: Record<string, number> = {
      // Excellent for cycling
      'cycleway': 100,
      'path': 85, // If specifically for cycling
      
      // Very good roads
      'secondary': 90,
      'secondary_link': 88,
      'tertiary': 95, // Often quieter than secondary
      'tertiary_link': 92,
      'unclassified': 85, // Often quiet rural roads
      'residential': 80,
      
      // Good roads
      'primary': 75, // Can be busy but usually good surface
      'primary_link': 70,
      'trunk': 60, // Usually good surface but very busy
      'trunk_link': 55,
      
      // Challenging for road bikes
      'motorway': 0, // Not allowed
      'motorway_link': 0,
      'service': 70,
      'track': 25, // Usually unpaved
      'footway': 30, // Not ideal for cycling
      'bridleway': 20,
      'steps': 0,
      
      // Links and ramps
      'living_street': 85,
      'pedestrian': 40
    }
    
    return highwayScores[highway.toLowerCase()] || 60
  }
  
  /**
   * Create bounding box around route coordinates
   */
  private createBoundingBox(coordinates: [number, number][]): [number, number, number, number] {
    const lats = coordinates.map(coord => coord[0])
    const lngs = coordinates.map(coord => coord[1])
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    
    // Add small buffer (about 100m)
    const buffer = 0.001
    
    return [
      minLat - buffer,  // south
      minLng - buffer,  // west  
      maxLat + buffer,  // north
      maxLng + buffer   // east
    ]
  }
  
  /**
   * Build Overpass query for road data with surface/smoothness info
   */
  private buildOverpassQuery(bbox: [number, number, number, number]): string {
    const [south, west, north, east] = bbox
    
    return `
      [out:json][timeout:25];
      (
        way["highway"]
           ["highway"!~"^(footway|cycleway|path|bridleway|steps)$"]
           (${south},${west},${north},${east});
      );
      out geom;
    `
  }
  
  /**
   * Parse Overpass API response into road data
   */
  private parseOverpassResponse(data: any): OSMRoadData[] {
    if (!data.elements || !Array.isArray(data.elements)) {
      return []
    }
    
    return data.elements
      .filter((element: any) => element.type === 'way' && element.geometry)
      .map((way: any): OSMRoadData => ({
        wayId: way.id.toString(),
        surface: way.tags?.surface,
        smoothness: way.tags?.smoothness,
        highway: way.tags?.highway || 'unknown',
        name: way.tags?.name,
        coordinates: way.geometry.map((point: any) => [point.lat, point.lon])
      }))
  }
  
  /**
   * Find the closest road segment to a point
   */
  findClosestRoad(point: [number, number], roads: OSMRoadData[]): OSMRoadData | null {
    if (roads.length === 0) return null
    
    let closestRoad = roads[0]
    let minDistance = this.distanceToRoad(point, roads[0])
    
    for (let i = 1; i < roads.length; i++) {
      const distance = this.distanceToRoad(point, roads[i])
      if (distance < minDistance) {
        minDistance = distance
        closestRoad = roads[i]
      }
    }
    
    return minDistance < 0.001 ? closestRoad : null // Within ~100m
  }
  
  /**
   * Calculate minimum distance from point to road
   */
  private distanceToRoad(point: [number, number], road: OSMRoadData): number {
    if (road.coordinates.length === 0) return Infinity
    
    let minDistance = Infinity
    
    for (const coord of road.coordinates) {
      const distance = this.calculateDistance(point[0], point[1], coord[0], coord[1])
      if (distance < minDistance) {
        minDistance = distance
      }
    }
    
    return minDistance
  }
  
  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c / 1000 // Return in kilometers
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

export const osmQualityService = new OSMQualityService()
export type { OSMRoadData, OSMQualityScore }