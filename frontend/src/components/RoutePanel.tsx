import { useState } from 'react'
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
  Alert
} from '@mui/material'
import { DeleteOutlined, DragIndicatorOutlined, SaveOutlined } from '@mui/icons-material'
import { useRoute } from '../contexts/RouteContext'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { routeAPI } from '../services/api'

const RoutePanel = () => {
  const { waypoints, route, removeWaypoint } = useRoute()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Route Details
      </Typography>
      
      {route && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Distance: {formatDistance(route.distance)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Est. Time: {formatDuration(route.duration)}
            </Typography>
            {route.elevation.ascent > 0 && (
              <Typography variant="body2" color="text.secondary">
                Ascent: {route.elevation.ascent}m
              </Typography>
            )}
            {route.elevation.descent > 0 && (
              <Typography variant="body2" color="text.secondary">
                Descent: {route.elevation.descent}m
              </Typography>
            )}
          </Box>
          
          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            onClick={handleOpenSaveDialog}
            fullWidth
            sx={{ mb: 1 }}
          >
            Save Route
          </Button>
          
          {saveError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {saveError}
            </Alert>
          )}
        </Box>
      )}
      
      <Typography variant="subtitle2" gutterBottom>
        Waypoints
      </Typography>
      
      <List dense>
        {waypoints.map((waypoint, index) => (
          <Box key={waypoint.id}>
            <ListItem
              secondaryAction={
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => removeWaypoint(waypoint.id)}
                >
                  <DeleteOutlined />
                </IconButton>
              }
            >
              <IconButton edge="start" size="small">
                <DragIndicatorOutlined />
              </IconButton>
              <ListItemText
                primary={waypoint.address || `${index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Waypoint ${index}`}`}
                secondary={`${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}`}
              />
            </ListItem>
            {index < waypoints.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        Click on map to add waypoints
      </Typography>

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