import { Box, Typography, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material'
import { DeleteOutlined, DragIndicatorOutlined } from '@mui/icons-material'

const RoutePanel = () => {
  const mockWaypoints = [
    { id: '1', address: 'Start: London Bridge', lat: 51.5045, lng: -0.0865 },
    { id: '2', address: 'Tower Bridge', lat: 51.5055, lng: -0.0754 },
    { id: '3', address: 'End: Greenwich', lat: 51.4816, lng: -0.0076 },
  ]

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Route Details
      </Typography>
      
      <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Distance: 12.5 km
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Est. Time: 35 min
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Difficulty: Moderate
        </Typography>
      </Box>
      
      <Typography variant="subtitle2" gutterBottom>
        Waypoints
      </Typography>
      
      <List dense>
        {mockWaypoints.map((waypoint, index) => (
          <Box key={waypoint.id}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" size="small">
                  <DeleteOutlined />
                </IconButton>
              }
            >
              <IconButton edge="start" size="small">
                <DragIndicatorOutlined />
              </IconButton>
              <ListItemText
                primary={waypoint.address}
                secondary={`${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}`}
              />
            </ListItem>
            {index < mockWaypoints.length - 1 && <Divider />}
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