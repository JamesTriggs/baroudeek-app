import { Box, Button, FormControlLabel, Switch, Typography, Slider, Alert, CircularProgress } from '@mui/material'
import { PlayArrowOutlined, SaveOutlined, ShareOutlined, ClearOutlined } from '@mui/icons-material'
import { useRoute } from '../contexts/RouteContext'

const PlannerControls = () => {
  const { generateRoute, waypoints, isLoading, error, clearRoute } = useRoute()

  const handleGenerateRoute = async () => {
    console.log('Generate route button clicked')
    await generateRoute()
  }

  const handleSaveRoute = () => {
    alert('Save functionality coming soon!')
  }

  const handleShareRoute = () => {
    alert('Collaboration features coming soon!')
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Route Preferences
      </Typography>
      
      <FormControlLabel
        control={<Switch defaultChecked />}
        label="Avoid busy roads"
        sx={{ mb: 1, display: 'block' }}
      />
      
      <FormControlLabel
        control={<Switch defaultChecked />}
        label="Prefer smooth surfaces"
        sx={{ mb: 1, display: 'block' }}
      />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Max gradient: 8%
        </Typography>
        <Slider
          defaultValue={8}
          min={0}
          max={20}
          step={1}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrowOutlined />}
          fullWidth
          onClick={handleGenerateRoute}
          disabled={isLoading || waypoints.length < 2}
        >
          {isLoading ? 'Generating...' : 'Generate Route'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SaveOutlined />}
          fullWidth
          onClick={handleSaveRoute}
        >
          Save Route
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ShareOutlined />}
          fullWidth
          onClick={handleShareRoute}
        >
          Share & Collaborate
        </Button>
        
        <Button
          variant="text"
          startIcon={<ClearOutlined />}
          fullWidth
          onClick={clearRoute}
          disabled={waypoints.length === 0}
        >
          Clear All
        </Button>
      </Box>
    </Box>
  )
}

export default PlannerControls