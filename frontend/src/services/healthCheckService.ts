interface HealthStatus {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  error?: string
  details?: any
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  services: HealthStatus[]
  timestamp: string
  warnings: string[]
}

class HealthCheckService {
  private results: HealthStatus[] = []
  
  /**
   * Run comprehensive health checks for all external services
   */
  async runHealthChecks(): Promise<SystemHealth> {
    console.log('🔍 Running system health checks...')
    this.results = []
    
    // Run all health checks in parallel
    const checks = [
      this.checkElevationAPI(),
      this.checkOpenRouteService(),
      this.checkOSRMAPI(),
      this.checkOSMOverpassAPI()
    ]
    
    await Promise.allSettled(checks)
    
    // Determine overall health
    const healthyCount = this.results.filter(r => r.status === 'healthy').length
    const degradedCount = this.results.filter(r => r.status === 'degraded').length
    const unhealthyCount = this.results.filter(r => r.status === 'unhealthy').length
    
    let overall: 'healthy' | 'degraded' | 'unhealthy'
    if (unhealthyCount > 0) {
      overall = 'unhealthy'
    } else if (degradedCount > 0) {
      overall = 'degraded'
    } else {
      overall = 'healthy'
    }
    
    const warnings = this.generateWarnings()
    
    const systemHealth: SystemHealth = {
      overall,
      services: this.results,
      timestamp: new Date().toISOString(),
      warnings
    }
    
    this.logHealthSummary(systemHealth)
    return systemHealth
  }
  
  /**
   * Test Open Elevation API
   */
  private async checkElevationAPI(): Promise<void> {
    const startTime = Date.now()
    const service = 'Open Elevation API'
    
    try {
      // Test with a known location (London)
      const testUrl = 'https://api.open-elevation.com/api/v1/lookup'
      console.log(`Testing ${service}...`)
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: [{ latitude: 51.4308, longitude: -0.9101 }]
        })
      })
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.results || data.results.length === 0 || data.results[0].elevation === null) {
        throw new Error('No elevation data returned')
      }
      
      const elevation = data.results[0].elevation
      
      // Sanity check - London should be between 0-200m elevation
      if (elevation < -100 || elevation > 500) {
        this.results.push({
          service,
          status: 'degraded',
          responseTime,
          error: `Suspicious elevation reading: ${elevation}m`,
          details: { elevation, location: 'London' }
        })
      } else {
        this.results.push({
          service,
          status: 'healthy',
          responseTime,
          details: { elevation, location: 'London' }
        })
      }
      
      console.log(`✅ ${service}: ${elevation}m elevation in ${responseTime}ms`)
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`❌ ${service} failed:`, error)
      
      this.results.push({
        service,
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  /**
   * Test OpenRouteService API (if API key is available)
   */
  private async checkOpenRouteService(): Promise<void> {
    const startTime = Date.now()
    const service = 'OpenRouteService Routing API'
    const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY
    
    if (!apiKey) {
      this.results.push({
        service,
        status: 'degraded',
        responseTime: 0,
        error: 'No API key configured',
        details: { note: 'Will fall back to OSRM' }
      })
      console.log(`⚠️ ${service}: No API key - using OSRM fallback`)
      return
    }
    
    try {
      console.log(`Testing ${service}...`)
      
      // Test with simple 2-point route in London
      const testBody = {
        coordinates: [[-0.9101, 51.4308], [-0.9001, 51.4408]],
        elevation: false, // Simple test without elevation
        instructions: false
      }
      
      const response = await fetch('https://api.openrouteservice.org/v2/directions/cycling-regular/geojson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify(testBody)
      })
      
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No route returned')
      }
      
      const route = data.features[0]
      const distance = route.properties.summary.distance
      
      this.results.push({
        service,
        status: 'healthy',
        responseTime,
        details: { 
          routeDistance: `${(distance / 1000).toFixed(2)}km`,
          features: 'Advanced routing with preferences'
        }
      })
      
      console.log(`✅ ${service}: ${(distance / 1000).toFixed(2)}km route in ${responseTime}ms`)
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`❌ ${service} failed:`, error)
      
      this.results.push({
        service,
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        details: { note: 'Will fall back to OSRM' }
      })
    }
  }
  
  /**
   * Test OSRM routing API
   */
  private async checkOSRMAPI(): Promise<void> {
    const startTime = Date.now()
    const service = 'OSRM Routing API'
    
    try {
      console.log(`Testing ${service}...`)
      
      // Test route in London
      const testUrl = 'https://router.project-osrm.org/route/v1/cycling/-0.9101,51.4308;-0.9001,51.4408?overview=full&geometries=geojson'
      
      const response = await fetch(testUrl)
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes returned')
      }
      
      const route = data.routes[0]
      const distance = route.distance
      
      this.results.push({
        service,
        status: 'healthy',
        responseTime,
        details: { 
          routeDistance: `${(distance / 1000).toFixed(2)}km`,
          features: 'Free routing fallback'
        }
      })
      
      console.log(`✅ ${service}: ${(distance / 1000).toFixed(2)}km route in ${responseTime}ms`)
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`❌ ${service} failed:`, error)
      
      this.results.push({
        service,
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  /**
   * Test OSM Overpass API for road quality data
   */
  private async checkOSMOverpassAPI(): Promise<void> {
    const startTime = Date.now()
    const service = 'OSM Overpass API'
    
    try {
      console.log(`Testing ${service}...`)
      
      // Simple test query for roads near London
      const query = `
        [out:json][timeout:10];
        (
          way["highway"]["highway"!="footway"]["highway"!="path"]["highway"!="steps"]
          (51.430,-0.911,51.431,-0.910);
        );
        out geom;
      `
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query
      })
      
      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.elements || data.elements.length === 0) {
        this.results.push({
          service,
          status: 'degraded',
          responseTime,
          error: 'No road data returned for test area',
          details: { note: 'May affect road quality scoring' }
        })
      } else {
        this.results.push({
          service,
          status: 'healthy',
          responseTime,
          details: { 
            roadsFound: data.elements.length,
            features: 'Road quality data for scoring'
          }
        })
      }
      
      console.log(`✅ ${service}: ${data.elements?.length || 0} roads found in ${responseTime}ms`)
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`❌ ${service} failed:`, error)
      
      this.results.push({
        service,
        status: 'degraded',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        details: { note: 'Will use estimated road quality scoring' }
      })
    }
  }
  
  /**
   * Generate warnings based on health check results
   */
  private generateWarnings(): string[] {
    const warnings: string[] = []
    
    const elevationService = this.results.find(r => r.service.includes('Elevation'))
    const routingServices = this.results.filter(r => r.service.includes('Routing'))
    const osmService = this.results.find(r => r.service.includes('Overpass'))
    
    // Elevation warnings
    if (elevationService?.status === 'unhealthy') {
      warnings.push('⚠️ Elevation data unavailable - routes will not show accurate gradients')
    }
    
    // Routing warnings
    const healthyRouting = routingServices.filter(r => r.status === 'healthy')
    if (healthyRouting.length === 0) {
      warnings.push('🚨 No routing services available - app will not function')
    } else if (healthyRouting.length === 1 && healthyRouting[0].service.includes('OSRM')) {
      warnings.push('⚠️ Advanced routing features unavailable - only basic routing works')
    }
    
    // OSM warnings
    if (osmService?.status !== 'healthy') {
      warnings.push('⚠️ Road quality data limited - using estimated scoring')
    }
    
    return warnings
  }
  
  /**
   * Log comprehensive health summary
   */
  private logHealthSummary(health: SystemHealth): void {
    console.log(`\n🏥 System Health Report (${health.timestamp})`)
    console.log(`Overall Status: ${this.getStatusEmoji(health.overall)} ${health.overall.toUpperCase()}`)
    console.log('\nService Details:')
    
    health.services.forEach(service => {
      const emoji = this.getStatusEmoji(service.status)
      const time = service.responseTime > 0 ? ` (${service.responseTime}ms)` : ''
      console.log(`  ${emoji} ${service.service}${time}`)
      
      if (service.error) {
        console.log(`     Error: ${service.error}`)
      }
      if (service.details) {
        console.log(`     Details:`, service.details)
      }
    })
    
    if (health.warnings.length > 0) {
      console.log('\nWarnings:')
      health.warnings.forEach(warning => console.log(`  ${warning}`))
    }
    
    console.log('\n' + '='.repeat(50))
  }
  
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'healthy': return '✅'
      case 'degraded': return '⚠️'
      case 'unhealthy': return '❌'
      default: return '❓'
    }
  }
}

export const healthCheckService = new HealthCheckService()
export type { SystemHealth, HealthStatus }