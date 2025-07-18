import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { verifyToken } from '../store/slices/authSlice'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth)

  const isAuthenticated = !!(user && token)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const storedToken = localStorage.getItem('token')
    if (storedToken && !user) {
      dispatch(verifyToken() as any)
    }
  }, [user, dispatch])

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext