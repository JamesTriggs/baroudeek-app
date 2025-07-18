import axios from 'axios'
import { tokenUtils } from '../utils/tokenUtils'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken()
    if (token) {
      // Check if token is expired
      if (tokenUtils.isTokenExpired(token)) {
        tokenUtils.removeToken()
        window.location.href = '/login'
        return Promise.reject(new Error('Token expired'))
      }
      
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenUtils.removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  register: async (userData: { email: string; username: string; password: string }) => {
    console.log('API: Making registration request to /auth/register with:', userData)
    const response = await api.post('/auth/register', userData)
    console.log('API: Registration response:', response.data)
    return response.data
  },
  
  logout: async () => {
    await api.post('/auth/logout')
  },
  
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const routeAPI = {
  // Get all user routes
  getRoutes: async () => {
    console.log('API: Getting user routes')
    const response = await api.get('/routes')
    console.log('API: Routes response:', response.data)
    return response.data
  },
  
  // Get specific route by ID
  getRoute: async (id: string) => {
    console.log('API: Getting route:', id)
    const response = await api.get(`/routes/${id}`)
    console.log('API: Route response:', response.data)
    return response.data
  },
  
  // Create new route
  createRoute: async (routeData: {
    name: string
    description?: string
    waypoints: Array<{id: string, lat: number, lng: number, address?: string}>
    distance: number
    estimated_time: number
    difficulty?: string
    is_public?: boolean
    geometry?: string
  }) => {
    console.log('API: Creating route with data:', routeData)
    const response = await api.post('/routes', routeData)
    console.log('API: Route created:', response.data)
    return response.data
  },
  
  // Update existing route
  updateRoute: async (id: string, updates: {
    name?: string
    description?: string
    is_public?: boolean
  }) => {
    console.log('API: Updating route:', id, updates)
    const response = await api.put(`/routes/${id}`, updates)
    console.log('API: Route updated:', response.data)
    return response.data
  },
  
  // Delete route
  deleteRoute: async (id: string) => {
    console.log('API: Deleting route:', id)
    await api.delete(`/routes/${id}`)
    console.log('API: Route deleted successfully')
  },
}

export const collaborationAPI = {
  createSession: async (routeId: string) => {
    const response = await api.post('/collaboration/sessions', { routeId })
    return response.data
  },
  
  joinSession: async (inviteCode: string) => {
    const response = await api.post('/collaboration/join', { inviteCode })
    return response.data
  },
  
  leaveSession: async (sessionId: string) => {
    await api.post(`/collaboration/sessions/${sessionId}/leave`)
  },
}

export const communityAPI = {
  rateRoad: async (roadId: string, rating: number, comment?: string) => {
    const response = await api.post('/community/rate', { roadId, rating, comment })
    return response.data
  },
  
  getHeatmapData: async (bounds: any) => {
    const response = await api.get('/community/heatmap', { params: bounds })
    return response.data
  },
  
  getPopularRoutes: async (limit = 10) => {
    const response = await api.get('/community/popular', { params: { limit } })
    return response.data
  },
}

export default api