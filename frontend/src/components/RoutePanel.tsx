import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton as MuiIconButton
} from '@mui/material'
import { 
  DeleteOutlined, 
  DragIndicatorOutlined, 
  SaveOutlined, 
  Speed,
  AccessTime,
  Terrain,
  Traffic,
  Star,
  TrendingUp,
  InfoOutlined,
  Height
} from '@mui/icons-material'
import { useRoute } from '../contexts/RouteContext'
import { useMapHighlight } from '../contexts/MapHighlightContext'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { routeAPI } from '../services/api'
import ElevationProfile from './ElevationProfile'
import { brandColors, brandGradients } from '../theme/brandColors'

const RoutePanel = () => {
  const { waypoints, route, removeWaypoint } = useRoute()
  const { setHighlightedSegment } = useMapHighlight()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)


  // Helper function to get score explanations
  const getScoreExplanation = (scoreType: string) => {
    const explanations = {
      surface: "Surface quality based on road type and condition:\n• Tarmac/asphalt: 90-100 points\n• Good concrete: 80-90 points\n• Poor surfaces: 40-70 points\n• Unpaved/gravel: 20-40 points",
      traffic: "Traffic safety assessment:\n• Cycle lanes/paths: 90-100 points\n• Quiet residential: 80-90 points\n• Moderate traffic: 60-80 points\n• Busy roads: 20-60 points\n• Major highways: 0-20 points",
      gradient: "Gradient suitability for cycling:\n• 0-3% grade: 90-100 points\n• 3-6% grade: 70-90 points\n• 6-10% grade: 40-70 points\n• 10-15% grade: 20-40 points\n• >15% grade: 0-20 points"
    }
    return explanations[scoreType as keyof typeof explanations] || "Score calculation details"
  }

  // Helper function to format gradient with max 2 decimal places
  const formatGradient = (gradient: number) => {
    return gradient % 1 === 0 ? gradient.toString() : gradient.toFixed(2)
  }

  // Calculate route's actual max gradient
  const getRouteMaxGradient = () => {
    if (!route?.elevation?.profile || route.elevation.profile.length < 2) {
      return null
    }
    
    let maxGradient = 0
    let maxGradientIndex = 0
    
    // First check if grades are already calculated in the profile
    const hasPreCalculatedGrades = route.elevation.profile.some(point => point.grade !== undefined)
    
    if (hasPreCalculatedGrades) {
      // Use pre-calculated grades
      route.elevation.profile.forEach((point, index) => {
        if (point.grade !== undefined && Math.abs(point.grade) > Math.abs(maxGradient)) {
          maxGradient = Math.abs(point.grade)
          maxGradientIndex = index
        }
      })
    } else {
      // Calculate gradients from elevation points
      for (let i = 1; i < route.elevation.profile.length; i++) {
        const currentPoint = route.elevation.profile[i]
        const previousPoint = route.elevation.profile[i - 1]
        
        const elevationDiff = currentPoint.elevation - previousPoint.elevation
        const distanceDiff = currentPoint.distance - previousPoint.distance
        
        if (distanceDiff > 0) {
          const gradient = Math.abs((elevationDiff / distanceDiff) * 100)
          
          if (gradient > maxGradient) {
            maxGradient = gradient
            maxGradientIndex = i
          }
        }
      }
    }
    
    return {
      gradient: maxGradient,
      segmentIndex: maxGradientIndex
    }
  }

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`
    }
    return `${distance.toFixed(0)} m`
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleOpenSaveDialog = () => {
    if (!user) {
      setSaveError('Please log in to save routes')
      return
    }
    if (!route || waypoints.length < 2) {
      setSaveError('Please generate a route first')
      return
    }
    setSaveError(null)
    setSaveDialogOpen(true)
  }

  const handleSaveRoute = async () => {
    if (!route || !user) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const routeData = {
        name: saveFormData.name.trim() || `Route ${new Date().toLocaleDateString()}`,
        description: saveFormData.description.trim(),
        waypoints: waypoints.map(wp => ({
          id: wp.id,
          lat: wp.lat,
          lng: wp.lng,
          address: wp.address
        })),
        distance: route.distance,
        estimated_time: route.duration,
        difficulty: 'moderate' as const,
        is_public: saveFormData.isPublic,
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: route.coordinates
        })
      }

      await routeAPI.createRoute(routeData)
      
      // Reset form and close dialog
      setSaveFormData({ name: '', description: '', isPublic: true })
      setSaveDialogOpen(false)
      
      // Show success message (you could add a snackbar here)
      console.log('Route saved successfully!')
      
    } catch (error) {
      console.error('Error saving route:', error)
      setSaveError('Failed to save route. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false)
    setSaveError(null)
    setSaveFormData({ name: '', description: '', isPublic: true })
  }

  return (
    <Box>
      {route ? (
        <>
          {/* Route Quality Score - Prominent Display */}
          <Card sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
            color: 'white',
            border: `2px solid ${brandColors.accent}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Route Quality Score
                </Typography>
                <Star sx={{ color: 'white' }} />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="h2" sx={{ 
                  fontWeight: 900,
                  fontSize: '3rem',
                  lineHeight: 1
                }}>
                  {route.quality?.overallScore || 85}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    {route.quality?.overallScore >= 90 ? 'Excellent' : 
                     route.quality?.overallScore >= 80 ? 'Great' :
                     route.quality?.overallScore >= 70 ? 'Good' : 'Fair'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Perfect cycling conditions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Route Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Speed sx={{ color: brandColors.accent, mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Distance
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                    {formatDistance(route.distance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={4}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ color: brandColors.accent, mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Time
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                    {formatDuration(route.duration)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card sx={{ 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Height sx={{ color: brandColors.accent, mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Max Grade
                    </Typography>
                  </Box>
                  {getRouteMaxGradient() ? (
                    <Tooltip 
                      title="Hover to highlight this section on the route"
                      arrow
                      placement="top"
                    >
                      <Box component="span">
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: 'white',
                            cursor: 'pointer',
                            '&:hover': {
                              color: brandColors.accent,
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={() => {
                            const maxGrad = getRouteMaxGradient()
                            if (maxGrad) setHighlightedSegment(maxGrad.segmentIndex)
                          }}
                          onMouseLeave={() => setHighlightedSegment(null)}
                        >
                          {`${formatGradient(getRouteMaxGradient()!.gradient)}%`}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'rgba(255,255,255,0.5)'
                      }}
                    >
                      N/A
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quality Breakdown */}
          {route.quality && (
            <Card sx={{ 
              mb: 3,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                  Quality Breakdown
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Terrain sx={{ color: brandColors.accent, mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>Surface</Typography>
                      <Tooltip 
                        title={getScoreExplanation('surface')}
                        arrow
                        placement="top"
                        sx={{ ml: 1 }}
                      >
                        <MuiIconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}>
                          <InfoOutlined sx={{ fontSize: '0.8rem' }} />
                        </MuiIconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ color: brandColors.accent, fontWeight: 600 }}>
                      {route.quality.surfaceScore}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={route.quality.surfaceScore} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: brandColors.accent
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Traffic sx={{ color: brandColors.accent, mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>Traffic</Typography>
                      <Tooltip 
                        title={getScoreExplanation('traffic')}
                        arrow
                        placement="top"
                        sx={{ ml: 1 }}
                      >
                        <MuiIconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}>
                          <InfoOutlined sx={{ fontSize: '0.8rem' }} />
                        </MuiIconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ color: brandColors.accent, fontWeight: 600 }}>
                      {route.quality.trafficScore}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={route.quality.trafficScore} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: brandColors.accent
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ color: brandColors.accent, mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>Gradient</Typography>
                      <Tooltip 
                        title={getScoreExplanation('gradient')}
                        arrow
                        placement="top"
                        sx={{ ml: 1 }}
                      >
                        <MuiIconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}>
                          <InfoOutlined sx={{ fontSize: '0.8rem' }} />
                        </MuiIconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ color: brandColors.accent, fontWeight: 600 }}>
                      {route.quality.gradientScore}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={route.quality.gradientScore} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: brandColors.accent
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Elevation Profile */}
          <Card sx={{ 
            mb: 3,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                Elevation Profile
              </Typography>
              <ElevationProfile elevation={route.elevation} distance={route.distance} />
            </CardContent>
          </Card>

          {/* Route Warnings */}
          {route.warnings && route.warnings.length > 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                color: 'white'
              }}
            >
              <Typography variant="body2">
                {route.warnings[0]}
              </Typography>
            </Alert>
          )}

          {/* Save Button */}
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            onClick={handleOpenSaveDialog}
            fullWidth
            sx={{
              background: brandGradients.primary,
              fontWeight: 600,
              py: 1.5,
              mb: 2,
              '&:hover': {
                background: brandGradients.primary,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Save This Route
          </Button>

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            Plan Your Route
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Click on the map to add waypoints and generate an intelligent route
          </Typography>
        </Box>
      )}

      {/* Waypoints Section */}
      <Box sx={{ 
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        pt: 3,
        mt: 3
      }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
          Waypoints ({waypoints.length})
        </Typography>
        
        {waypoints.length > 0 ? (
          <List dense sx={{ 
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {waypoints.map((waypoint, index) => (
              <Box key={waypoint.id}>
                <ListItem sx={{ 
                  '&:hover': { 
                    background: 'rgba(255,255,255,0.1)' 
                  }
                }}>
                  <IconButton edge="start" size="small" sx={{ color: brandColors.accent }}>
                    <DragIndicatorOutlined />
                  </IconButton>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {waypoint.address || `${index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Waypoint ${index}`}`}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                      </Typography>
                    }
                  />
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={() => removeWaypoint(waypoint.id)}
                    sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      '&:hover': { color: '#ff5722' }
                    }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </ListItem>
                {index < waypoints.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                )}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 3,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              No waypoints added yet
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              Click on the map to start planning
            </Typography>
          </Box>
        )}
      </Box>

      {/* Save Route Dialog */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Save Route</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}
            
            <TextField
              label="Route Name"
              value={saveFormData.name}
              onChange={(e) => setSaveFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal"
              placeholder={`Route ${new Date().toLocaleDateString()}`}
            />
            
            <TextField
              label="Description (optional)"
              value={saveFormData.description}
              onChange={(e) => setSaveFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Describe your route..."
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={saveFormData.isPublic}
                  onChange={(e) => setSaveFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
              }
              label="Make this route public"
              sx={{ mt: 1 }}
            />
            
            {route && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Route Summary</Typography>
                <Typography variant="body2">Distance: {formatDistance(route.distance)}</Typography>
                <Typography variant="body2">Est. Time: {formatDuration(route.duration)}</Typography>
                <Typography variant="body2">Waypoints: {waypoints.length}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveRoute} 
            variant="contained" 
            disabled={isSaving}
            startIcon={isSaving ? undefined : <SaveOutlined />}
          >
            {isSaving ? 'Saving...' : 'Save Route'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RoutePanel