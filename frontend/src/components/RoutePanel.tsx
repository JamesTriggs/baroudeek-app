import { Box, Typography, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material'
import { DeleteOutlined, DragIndicatorOutlined } from '@mui/icons-material'
import { useRoute } from '../contexts/RouteContext'

const RoutePanel = () => {
  const { waypoints, route, removeWaypoint } = useRoute()

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

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Route Details
      </Typography>
      
      {route && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
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
    </Box>
  )
}

export default RoutePanel