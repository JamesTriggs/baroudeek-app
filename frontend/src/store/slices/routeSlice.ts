import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { routeAPI } from '../../services/api'

interface Waypoint {
  id: string
  lat: number
  lng: number
  address?: string
}

interface Route {
  id: string
  user_id: string
  name: string
  description?: string
  waypoints: Waypoint[]
  distance: number
  estimated_time: number
  difficulty: 'easy' | 'moderate' | 'hard'
  road_quality_score: number
  safety_score: number
  is_public: boolean
  tags: string[]
  view_count: number
  usage_count: number
  rating_avg: number
  rating_count: number
  geometry?: string
  created_at: string
  updated_at?: string
}

interface RouteState {
  currentRoute: Route | null
  routes: Route[]
  isLoading: boolean
  error: string | null
  planningMode: boolean
}

const initialState: RouteState = {
  currentRoute: null,
  routes: [],
  isLoading: false,
  error: null,
  planningMode: false,
}

export const createRoute = createAsyncThunk(
  'route/create',
  async (routeData: {
    name: string
    description?: string
    waypoints: Waypoint[]
    distance: number
    estimated_time: number
    difficulty?: string
    is_public?: boolean
    geometry?: string
  }) => {
    const response = await routeAPI.createRoute(routeData)
    return response
  }
)

export const updateRoute = createAsyncThunk(
  'route/update',
  async ({ id, updates }: { 
    id: string
    updates: {
      name?: string
      description?: string
      is_public?: boolean
    }
  }) => {
    const response = await routeAPI.updateRoute(id, updates)
    return response
  }
)

export const deleteRoute = createAsyncThunk(
  'route/delete',
  async (id: string) => {
    await routeAPI.deleteRoute(id)
    return id
  }
)

export const fetchRoutes = createAsyncThunk(
  'route/fetchAll',
  async () => {
    const response = await routeAPI.getRoutes()
    return response
  }
)

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setPlanningMode: (state, action) => {
      state.planningMode = action.payload
    },
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload
    },
    addWaypoint: (state, action) => {
      if (state.currentRoute) {
        state.currentRoute.waypoints.push(action.payload)
      }
    },
    removeWaypoint: (state, action) => {
      if (state.currentRoute) {
        state.currentRoute.waypoints = state.currentRoute.waypoints.filter(
          waypoint => waypoint.id !== action.payload
        )
      }
    },
    updateWaypoint: (state, action) => {
      if (state.currentRoute) {
        const index = state.currentRoute.waypoints.findIndex(
          waypoint => waypoint.id === action.payload.id
        )
        if (index !== -1) {
          state.currentRoute.waypoints[index] = action.payload
        }
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoute.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentRoute = action.payload
        state.routes.push(action.payload)
      })
      .addCase(createRoute.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create route'
      })
      .addCase(fetchRoutes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.isLoading = false
        state.routes = action.payload
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch routes'
      })
      .addCase(updateRoute.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.routes.findIndex(route => route.id === action.payload.id)
        if (index !== -1) {
          state.routes[index] = action.payload
        }
        if (state.currentRoute?.id === action.payload.id) {
          state.currentRoute = action.payload
        }
      })
      .addCase(updateRoute.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to update route'
      })
      .addCase(deleteRoute.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.isLoading = false
        state.routes = state.routes.filter(route => route.id !== action.payload)
        if (state.currentRoute?.id === action.payload) {
          state.currentRoute = null
        }
      })
      .addCase(deleteRoute.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to delete route'
      })
  },
})

export const {
  setPlanningMode,
  setCurrentRoute,
  addWaypoint,
  removeWaypoint,
  updateWaypoint,
  clearError,
} = routeSlice.actions

export default routeSlice.reducer