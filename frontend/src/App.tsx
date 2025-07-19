import { Routes, Route, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import PlannerPage from './pages/PlannerPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Navbar from './components/Navbar'
import { ProtectedRoute } from './components/auth'
import { useHealthCheck } from './hooks/useHealthCheck'

function App() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  
  // Run health checks on app startup
  const { health } = useHealthCheck()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isLandingPage && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/planner" element={
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
    </Box>
  )
}

export default App