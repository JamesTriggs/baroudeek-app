import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import HomePage from './pages/HomePage'
import PlannerPage from './pages/PlannerPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App