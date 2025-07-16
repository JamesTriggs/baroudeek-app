export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  preferences: UserPreferences
  stats: UserStats
}

export interface UserPreferences {
  avoidBusyRoads: boolean
  preferSmoothSurface: boolean
  maxGradient: number
  routeType: 'fastest' | 'safest' | 'scenic'
}

export interface UserStats {
  totalRoutes: number
  totalDistance: number
  contributionPoints: number
  ratingsGiven: number
}

export interface Route {
  id: string
  name: string
  waypoints: Waypoint[]
  geometry: GeoJSON.LineString
  distance: number
  estimatedTime: number
  difficulty: 'easy' | 'moderate' | 'hard'
  roadQualityScore: number
  elevation: ElevationProfile
  createdAt: string
  updatedAt: string
  userId: string
  isPublic: boolean
  tags: string[]
}

export interface Waypoint {
  id: string
  lat: number
  lng: number
  address?: string
  type: 'start' | 'waypoint' | 'end'
  order: number
}

export interface ElevationProfile {
  maxElevation: number
  minElevation: number
  totalAscent: number
  totalDescent: number
  points: Array<{ distance: number; elevation: number }>
}

export interface RoadSegment {
  id: string
  startPoint: [number, number]
  endPoint: [number, number]
  roadType: 'primary' | 'secondary' | 'tertiary' | 'residential' | 'cycleway'
  surface: 'asphalt' | 'concrete' | 'gravel' | 'dirt' | 'unknown'
  qualityScore: number
  safetyScore: number
  trafficLevel: 'low' | 'medium' | 'high'
  hasLane: boolean
  maxSpeed: number
  gradient: number
  ratings: RoadRating[]
  usageCount: number
}

export interface RoadRating {
  id: string
  userId: string
  roadId: string
  rating: number
  comment?: string
  createdAt: string
  categories: {
    surface: number
    safety: number
    traffic: number
    scenery: number
  }
}

export interface CollaborationSession {
  id: string
  routeId: string
  inviteCode: string
  createdAt: string
  expiresAt: string
  collaborators: Collaborator[]
  isActive: boolean
}

export interface Collaborator {
  id: string
  username: string
  joinedAt: string
  cursor?: { lat: number; lng: number }
  isActive: boolean
  color: string
}

export interface WebSocketMessage {
  type: 'cursor_update' | 'waypoint_added' | 'waypoint_removed' | 'route_updated' | 'user_joined' | 'user_left'
  data: any
  userId: string
  timestamp: string
}

export interface HeatmapData {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  zoom: number
  data: Array<{
    lat: number
    lng: number
    intensity: number
  }>
}

export interface PopularRoute {
  id: string
  name: string
  distance: number
  difficulty: string
  rating: number
  usageCount: number
  thumbnail?: string
  tags: string[]
}