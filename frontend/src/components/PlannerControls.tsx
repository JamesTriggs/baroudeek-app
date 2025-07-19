import { useState } from 'react'
import { 
  Box, 
  Button, 
  FormControlLabel, 
  Switch, 
  Typography, 
  Slider, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import { 
  PlayArrowOutlined, 
  SaveOutlined, 
  ShareOutlined, 
  ClearOutlined,
  DirectionsBike,
  Settings,
  Speed,
  TrafficOutlined
} from '@mui/icons-material'
import { useRoute } from '../contexts/RouteContext'
import { brandColors, brandGradients } from '../theme/brandColors'

const PlannerControls = () => {
  const { generateRoute, waypoints, isLoading, error, clearRoute } = useRoute()
  const [routeProfile, setRouteProfile] = useState('cycling-regular')
  const [avoidBusyRoads, setAvoidBusyRoads] = useState(true)
  const [preferSmoothSurface, setPreferSmoothSurface] = useState(true)
  const [maxGradient, setMaxGradient] = useState(8)

  // Helper function to format gradient with max 2 decimal places
  const formatGradient = (gradient: number) => {
    return gradient % 1 === 0 ? gradient.toString() : gradient.toFixed(2)
  }

  const handleGenerateRoute = async () => {
    console.log('Generate route button clicked')
    const options = {
      profile: routeProfile,
      avoidBusyRoads,
      preferSmoothSurface,
      maxGradient
    }
    await generateRoute(options)
  }

  const handleSaveRoute = () => {
    alert('Save functionality coming soon!')
  }

  const handleShareRoute = () => {
    alert('Collaboration features coming soon!')
  }

  return (
    <Box>
      {/* Route Type Selection */}
      <Card sx={{ 
        mb: 3,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DirectionsBike sx={{ color: brandColors.accent, mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Route Type
            </Typography>
          </Box>
          
          <FormControl fullWidth>
            <Select
              value={routeProfile}
              onChange={(e) => setRouteProfile(e.target.value)}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: brandColors.accent
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: brandColors.accent
                },
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              }}
            >
              <MenuItem value="cycling-regular">🚴 Regular Cycling</MenuItem>
              <MenuItem value="cycling-road">🚴‍♂️ Road Cycling</MenuItem>
              <MenuItem value="cycling-mountain">🚵 Mountain Biking</MenuItem>
              <MenuItem value="cycling-electric">⚡ E-Bike</MenuItem>
              <MenuItem value="foot-walking">🚶 Walking</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Route Preferences */}
      <Card sx={{ 
        mb: 3,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Settings sx={{ color: brandColors.accent, mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Preferences
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={avoidBusyRoads} 
                  onChange={(e) => setAvoidBusyRoads(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: brandColors.accent,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: brandColors.accent,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrafficOutlined sx={{ mr: 1, fontSize: '1rem', color: brandColors.accent }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Avoid busy roads
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={preferSmoothSurface} 
                  onChange={(e) => setPreferSmoothSurface(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: brandColors.accent,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: brandColors.accent,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Speed sx={{ mr: 1, fontSize: '1rem', color: brandColors.accent }} />
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Prefer smooth surfaces
                  </Typography>
                </Box>
              }
              sx={{ display: 'flex', alignItems: 'center' }}
            />
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mr: 1 }}>
                Max gradient:
              </Typography>
              <Chip 
                label={`${formatGradient(maxGradient)}%`} 
                size="small" 
                sx={{ 
                  backgroundColor: brandColors.accent,
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>
            <Slider
              value={maxGradient}
              onChange={(_, value) => setMaxGradient(value as number)}
              min={0}
              max={20}
              step={0.5}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${formatGradient(value)}%`}
              sx={{
                color: brandColors.accent,
                '& .MuiSlider-thumb': {
                  backgroundColor: brandColors.accent,
                  border: `2px solid ${brandColors.accent}`,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0 0 0 8px ${brandColors.accent}30`,
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: brandColors.accent,
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            background: 'rgba(211, 47, 47, 0.1)',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            color: 'white'
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PlayArrowOutlined />}
          fullWidth
          onClick={handleGenerateRoute}
          disabled={isLoading || waypoints.length < 2}
          sx={{
            background: brandGradients.primary,
            fontWeight: 700,
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
            '&:hover': {
              background: brandGradients.primary,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${brandColors.accent}40`
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)'
            }
          }}
        >
          {isLoading ? 'Analyzing Route...' : waypoints.length < 2 ? 'Add 2+ Waypoints' : 'Generate Intelligent Route'}
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ShareOutlined />}
            fullWidth
            onClick={handleShareRoute}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                borderColor: brandColors.accent,
                color: brandColors.accent,
                background: `${brandColors.accent}10`
              }
            }}
          >
            Share
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ClearOutlined />}
            onClick={clearRoute}
            disabled={waypoints.length === 0}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              minWidth: 'auto',
              px: 2,
              '&:hover': {
                borderColor: '#ff5722',
                color: '#ff5722',
                background: 'rgba(255, 87, 34, 0.1)'
              },
              '&:disabled': {
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PlannerControls