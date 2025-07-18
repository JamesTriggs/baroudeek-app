import { useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  IconButton,
  Chip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/slices/authSlice'
import { DirectionsBikeOutlined, AccountCircle, ExitToApp } from '@mui/icons-material'
import { AuthDialog } from './auth'

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.auth)
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogMode, setAuthDialogMode] = useState<'login' | 'register'>('login')

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    handleProfileMenuClose()
    navigate('/')
  }

  const handleLogin = () => {
    setAuthDialogMode('login')
    setAuthDialogOpen(true)
  }

  const handleRegister = () => {
    setAuthDialogMode('register')
    setAuthDialogOpen(true)
  }

  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false)
  }

  const handleNavigateToProfile = () => {
    navigate('/profile')
    handleProfileMenuClose()
  }

  const handleNavigateToPlanner = () => {
    navigate('/planner')
    handleProfileMenuClose()
  }

  const isAuthenticated = !!(user && token)

  return (
    <>
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button color="inherit" onClick={handleNavigateToPlanner}>
                  Route Planner
                </Button>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={user.username}
                    variant="outlined"
                    sx={{ 
                      color: 'white', 
                      borderColor: 'white',
                      '& .MuiChip-label': { color: 'white' }
                    }}
                  />
                  <IconButton
                    color="inherit"
                    onClick={handleProfileMenuOpen}
                    sx={{ padding: 0.5 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Box>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: { minWidth: 200 }
                  }}
                >
                  <MenuItem onClick={handleNavigateToProfile}>
                    <AccountCircle sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={handleLogin}>
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  variant="outlined" 
                  onClick={handleRegister}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <AuthDialog
        open={authDialogOpen}
        onClose={handleAuthDialogClose}
        initialMode={authDialogMode}
      />
    </>
  )
}

export default Navbar