import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { DirectionsBikeOutlined } from '@mui/icons-material'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <DirectionsBikeOutlined sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          CycleShare
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/planner')}>
            Route Planner
          </Button>
          <Button color="inherit" onClick={() => navigate('/profile')}>
            Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar