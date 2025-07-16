import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import routeReducer from './slices/routeSlice'
import collaborationReducer from './slices/collaborationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    route: routeReducer,
    collaboration: collaborationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch