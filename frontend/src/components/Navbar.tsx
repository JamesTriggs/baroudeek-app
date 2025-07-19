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
  Chip,
  Fab
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/slices/authSlice'
import { PedalBike, AccountCircle, ExitToApp, RouteOutlined, EmojiEventsOutlined } from '@mui/icons-material'
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
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <EmojiEventsOutlined sx={{ mr: 1.5, fontSize: '2rem', color: '#FFD700' }} />
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                cursor: 'pointer',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #006B6B 0%, #4DB6AC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em'
              }}
              onClick={() => navigate('/')}
            >
              Baroudeek
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button 
                  startIcon={<RouteOutlined />}
                  onClick={handleNavigateToPlanner}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 107, 107, 0.08)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Route Explorer
                </Button>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={user.username}
                    variant="outlined"
                    sx={{ 
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': { 
                        bgcolor: 'rgba(0, 107, 107, 0.08)',
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
                      bgcolor: 'primary.main',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0, 107, 107, 0.3)'
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
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                      mt: 1
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem 
                    onClick={handleNavigateToProfile}
                    sx={{ 
                      py: 1.5,
                      '&:hover': { 
                        bgcolor: 'rgba(0, 107, 107, 0.08)'
                      }
                    }}
                  >
                    <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5,
                      '&:hover': { 
                        bgcolor: 'rgba(255, 87, 34, 0.08)'
                      }
                    }}
                  >
                    <ExitToApp sx={{ mr: 2, color: 'secondary.main' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleLogin}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 107, 107, 0.08)',
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
                    fontWeight: 600,
                    px: 3
                  }}
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