import { useState } from 'react'
import { Box, Paper, Typography, IconButton, Fab, Slide, useTheme, useMediaQuery } from '@mui/material'
import { ChevronLeft, ChevronRight, Tune } from '@mui/icons-material'
import MapComponent from '../components/MapComponent'
import PlannerControls from '../components/PlannerControls'
import RoutePanel from '../components/RoutePanel'
import HealthStatus from '../components/HealthStatus'
import { RouteProvider } from '../contexts/RouteContext'
import { MapHighlightProvider, useMapHighlight } from '../contexts/MapHighlightContext'
import { brandColors, brandGradients } from '../theme/brandColors'

const PlannerPageContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { highlightedSegment } = useMapHighlight()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
      <Box sx={{ 
        height: 'calc(100vh - 64px)', 
        display: 'flex',
        background: '#0a0a0a',
        position: 'relative'
      }}>
        {/* Collapsible Sidebar */}
        <Slide direction="right" in={sidebarOpen} mountOnEnter unmountOnExit>
          <Paper sx={{ 
            width: { xs: '100vw', md: 400 },
            height: '100%',
            background: '#111111',
            borderRadius: 0,
            borderRight: `1px solid rgba(255,255,255,0.1)`,
            display: 'flex', 
            flexDirection: 'column',
            position: { xs: 'absolute', md: 'relative' },
            zIndex: { xs: 1000, md: 1 },
            overflow: 'hidden'
          }}>
            {/* Header */}
            <Box sx={{ 
              p: 3,
              background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Route Intelligence
              </Typography>
              {isMobile && (
                <IconButton 
                  onClick={toggleSidebar} 
                  sx={{ color: 'white' }}
                >
                  <ChevronLeft />
                </IconButton>
              )}
            </Box>

            {/* Content */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.05)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: brandColors.accent,
                borderRadius: '3px',
              }
            }}>
              <Box sx={{ p: 3 }}>
                <HealthStatus compact />
                <PlannerControls />
              </Box>
              
              <Box sx={{ 
                borderTop: `1px solid rgba(255,255,255,0.1)`,
                p: 3
              }}>
                <RoutePanel />
              </Box>
            </Box>
          </Paper>
        </Slide>

        {/* Map Container */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          width: sidebarOpen && !isMobile ? 'calc(100% - 400px)' : '100%'
        }}>
          <MapComponent highlightedSegment={highlightedSegment} />
          
          {/* Sidebar Toggle Button */}
          {!sidebarOpen && (
            <Fab
              onClick={toggleSidebar}
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: brandGradients.primary,
                color: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                '&:hover': {
                  background: brandGradients.primary,
                  transform: 'scale(1.1)',
                }
              }}
            >
              <Tune />
            </Fab>
          )}

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <IconButton
              onClick={toggleSidebar}
              sx={{
                position: 'absolute',
                top: 20,
                left: sidebarOpen ? 380 : 20,
                background: brandGradients.primary,
                color: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: brandGradients.primary,
                  transform: 'scale(1.1)',
                }
              }}
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          )}
        </Box>
      </Box>
  )
}

const PlannerPage = () => {
  return (
    <RouteProvider>
      <MapHighlightProvider>
        <PlannerPageContent />
      </MapHighlightProvider>
    </RouteProvider>
  )
}

export default PlannerPage