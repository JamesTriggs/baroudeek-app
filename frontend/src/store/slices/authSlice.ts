import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'
import { tokenUtils } from '../../utils/tokenUtils'

interface User {
  id: string
  email: string
  username: string
  full_name?: string
  bio?: string
  preferences: {
    avoid_busy_roads: boolean
    prefer_smooth_surface: boolean
    max_gradient: number
    route_type: string
  }
  stats: {
    total_routes: number
    total_distance: number
    contribution_points: number
    ratings_given: number
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: tokenUtils.getToken(),
  isLoading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(credentials)
    tokenUtils.setToken(response.access_token)
    return response
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; username: string; password: string; full_name?: string; bio?: string }) => {
    const response = await authAPI.register(userData)
    tokenUtils.setToken(response.access_token)
    return response
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  tokenUtils.removeToken()
})

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenUtils.getToken()
      if (!token) {
        throw new Error('No token found')
      }
      
      const response = await authAPI.me()
      return { user: response, token }
    } catch (error) {
      tokenUtils.removeToken()
      return rejectWithValue('Token verification failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Login failed'
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Registration failed'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
      })
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer