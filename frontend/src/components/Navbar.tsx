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
import { RootState, AppDispatch } from '../store'
import { logout } from '../store/slices/authSlice'
import { AccountCircle, ExitToApp, RouteOutlined, EmojiEventsOutlined } from '@mui/icons-material'
import { AuthDialog } from './auth'
import { brandColors, brandGradients } from '../theme/brandColors'

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
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
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: '#0a0a0a',
          borderBottom: `1px solid rgba(255,255,255,0.1)`
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                cursor: 'pointer',
                fontWeight: 800,
                background: `linear-gradient(45deg, ${brandColors.accent}, ${brandColors.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em',
                mr: 1
              }}
              onClick={() => navigate('/')}
            >
              Baroudique
            </Typography>
            <Chip 
              label="BETA" 
              size="small"
              sx={{ 
                backgroundColor: brandColors.accent, 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.6rem',
                height: '18px'
              }} 
            />
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button 
                  startIcon={<RouteOutlined />}
                  onClick={handleNavigateToPlanner}
                  sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: `${brandColors.accent}20`,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Route Planner
                </Button>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={user.username}
                    variant="outlined"
                    sx={{ 
                      borderColor: brandColors.accent,
                      color: brandColors.accent,
                      fontWeight: 600,
                      '&:hover': { 
                        bgcolor: `${brandColors.accent}20`,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ 
                      padding: 0.5,
                      '&:hover': { 
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Avatar sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: brandColors.accent,
                      fontWeight: 600,
                      boxShadow: `0 4px 12px ${brandColors.accent}50`
                    }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Box>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: { 
                      minWidth: 200,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      mt: 1,
                      background: '#111111',
                      color: 'white'
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem 
                    onClick={handleNavigateToProfile}
                    sx={{ 
                      py: 1.5,
                      color: 'white',
                      '&:hover': { 
                        bgcolor: `${brandColors.accent}20`
                      }
                    }}
                  >
                    <AccountCircle sx={{ mr: 2, color: brandColors.accent }} />
                    Profile
                  </MenuItem>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5,
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255, 87, 34, 0.2)'
                      }
                    }}
                  >
                    <ExitToApp sx={{ mr: 2, color: '#ff5722' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleLogin}
                  sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: `${brandColors.accent}20`,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  onClick={handleRegister}
                  sx={{ 
                    background: brandGradients.primary,
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      background: brandGradients.primary,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Get Beta Access
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