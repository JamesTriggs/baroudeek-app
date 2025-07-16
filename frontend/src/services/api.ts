import axios from 'axios'

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
    const token = localStorage.getItem('token')
    if (token) {
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
      localStorage.removeItem('token')
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
    const response = await api.post('/auth/register', userData)
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
  getRoutes: async () => {
    const response = await api.get('/routes')
    return response.data
  },
  
  getRoute: async (id: string) => {
    const response = await api.get(`/routes/${id}`)
    return response.data
  },
  
  createRoute: async (routeData: any) => {
    const response = await api.post('/routes', routeData)
    return response.data
  },
  
  updateRoute: async (id: string, updates: any) => {
    const response = await api.put(`/routes/${id}`, updates)
    return response.data
  },
  
  deleteRoute: async (id: string) => {
    await api.delete(`/routes/${id}`)
  },
  
  generateRoute: async (waypoints: any[], preferences: any) => {
    const response = await api.post('/routes/generate', { waypoints, preferences })
    return response.data
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