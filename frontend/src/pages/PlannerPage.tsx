import { Box, Paper, Typography } from '@mui/material'
import MapComponent from '../components/MapComponent'
import PlannerControls from '../components/PlannerControls'
import RoutePanel from '../components/RoutePanel'

const PlannerPage = () => {
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      <Paper sx={{ width: 300, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Route Planner
        </Typography>
        <PlannerControls />
        <RoutePanel />
      </Paper>
      
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponent />
      </Box>
    </Box>
  )
}

export default PlannerPage