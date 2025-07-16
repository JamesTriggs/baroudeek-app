import { Box, Button, FormControlLabel, Switch, Typography, Slider } from '@mui/material'
import { PlayArrowOutlined, SaveOutlined, ShareOutlined } from '@mui/icons-material'

const PlannerControls = () => {
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
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowOutlined />}
          fullWidth
        >
          Generate Route
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SaveOutlined />}
          fullWidth
        >
          Save Route
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<ShareOutlined />}
          fullWidth
        >
          Share & Collaborate
        </Button>
      </Box>
    </Box>
  )
}

export default PlannerControls