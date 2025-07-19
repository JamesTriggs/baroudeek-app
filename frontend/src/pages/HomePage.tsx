import React from 'react'
import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack, Chip, Fab } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { RouteOutlined, GroupOutlined, TrendingUpOutlined, NavigationOutlined, ArrowForward, Speed } from '@mui/icons-material'
import { brandColors, brandGradients, brandShadows } from '../theme/brandColors'
import HealthStatus from '../components/HealthStatus'

const HomePage = () => {
  const navigate = useNavigate()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = !!(user && token)

  const features = [
    {
      icon: <RouteOutlined sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Route Discovery',
      description: 'AI-powered route analysis to find the best cycling adventures on any terrain with difficulty scoring',
      color: 'primary.main',
    },
    {
      icon: <GroupOutlined sx={{ fontSize: 48, color: 'info.main' }} />,
      title: 'Adventure Sharing',
      description: 'Share routes, compare experiences with fellow cyclists, and plan group adventures',
      color: 'info.main',
    },
    {
      icon: <TrendingUpOutlined sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Performance Analytics',
      description: 'Detailed route analysis, elevation profiles, and optimal conditions for cycling',
      color: 'secondary.main',
    },
  ]

  const stats = [
    { value: '5K+', label: 'Routes' },
    { value: '2K+', label: 'Adventurers' },
    { value: '50K+', label: 'Adventures' },
    { value: '87%', label: 'Success Rate' },
  ]

  return (
    <Box sx={{ 
      background: '#0a0a0a',
      color: 'white',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', minHeight: '80vh' }}>
        {/* Hero Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(rgba(10,10,10,0.8), rgba(10,10,10,0.9)), url('/assets/brand-pattern.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7) contrast(1.1)',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
            
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 6 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${brandColors.accent}, ${brandColors.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mr: 2
                }}
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
                  fontSize: '0.7rem'
                }} 
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              {/* Hero Content */}
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 3,
                  background: 'linear-gradient(45deg, #ffffff, #cccccc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Start planning better routes
              </Typography>

              <Typography 
                variant="h5" 
                sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  fontWeight: 400,
                  mb: 4,
                  opacity: 0.8,
                  lineHeight: 1.4,
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Access the route intelligence that's revolutionizing cycling
              </Typography>

              {/* Primary CTA */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(isAuthenticated ? '/planner' : '/register')}
                  sx={{
                    background: brandGradients.primary,
                    color: 'white',
                    fontWeight: 'bold',
                    px: 6,
                    py: 2.5,
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: brandShadows.primary,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: brandShadows.primaryHover
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  endIcon={<ArrowForward />}
                >
                  {isAuthenticated ? 'Start Planning Routes' : 'Get Beta Access'}
                </Button>
                
                {!isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: brandColors.accent,
                      color: brandColors.accent,
                      px: 4,
                      py: 2.5,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: brandColors.light,
                        color: brandColors.light,
                        backgroundColor: `${brandColors.accent}10`
                      }
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </Stack>

              {/* Status Indicators */}
              {!isAuthenticated && (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" sx={{ 
                  opacity: 0.9,
                  background: 'rgba(16,185,129,0.1)',
                  p: 3,
                  border: `1px solid ${brandColors.accent}`,
                  borderLeft: `4px solid ${brandColors.accent}`,
                  maxWidth: 600,
                  mx: 'auto'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: brandColors.accent }}>
                      Free Beta Access
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      No credit card required
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: brandColors.accent }}>
                      847 Spots Left
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Limited time offer
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>
              Join the revolution
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.7, color: 'white' }}>
              Cyclists are already discovering better routes
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${brandColors.accent}`,
                    transform: 'translateY(-4px)',
                    background: 'rgba(16,185,129,0.1)'
                  }
                }}>
                  <Typography variant="h3" sx={{ 
                    color: brandColors.accent, 
                    fontWeight: 900,
                    mb: 1
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    opacity: 0.8,
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>
              Built for serious cyclists
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.7, maxWidth: '600px', mx: 'auto', color: 'white' }}>
              Advanced features that actually matter for route planning
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{
                  position: 'relative',
                  background: `linear-gradient(135deg, rgba(4,120,87,0.1), rgba(16,185,129,0.1))`,
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  p: 4,
                  height: '280px',
                  color: 'white',
                  textAlign: 'center',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `2px solid ${brandColors.accent}`,
                    transform: 'translateY(-8px)',
                    background: `linear-gradient(135deg, rgba(4,120,87,0.15), rgba(16,185,129,0.15))`
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${brandColors.primary}33, ${brandColors.accent}22)`,
                    opacity: 0.2,
                    transition: 'opacity 0.3s ease',
                    zIndex: 1
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    {/* Icon */}
                    <Box sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `rgba(4,120,87,0.3)`,
                      border: `2px solid ${brandColors.accent}`
                    }}>
                      {React.cloneElement(feature.icon, {
                        sx: { fontSize: 32, color: brandColors.accent }
                      })}
                    </Box>
                    
                    {/* Title */}
                    <Typography variant="h5" sx={{ 
                      fontWeight: 'bold', 
                      mb: 2, 
                      color: 'white' 
                    }}>
                      {feature.title}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body1" sx={{ 
                      opacity: 0.8, 
                      color: 'white',
                      lineHeight: 1.5
                    }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>
            Ready to start planning?
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9, color: 'white' }}>
            Join cyclists who are already discovering better routes with intelligent planning.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/planner' : '/register')}
            sx={{
              backgroundColor: 'white',
              color: brandColors.primary,
              fontWeight: 'bold',
              px: 6,
              py: 2.5,
              fontSize: '1.2rem',
              textTransform: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${brandColors.accent}33, transparent)`,
                transition: 'left 0.6s',
              },
              '&:hover::before': {
                left: '100%'
              },
              transition: 'all 0.3s ease'
            }}
            endIcon={<Speed />}
          >
            {isAuthenticated ? 'Start Planning Routes' : 'Get Beta Access'}
          </Button>

          <Typography variant="body2" sx={{ mt: 3, opacity: 0.9, color: 'white', fontWeight: 500 }}>
            {isAuthenticated ? 'Access all route intelligence features' : 'Free forever for first 1,000 users'}
          </Typography>
        </Container>
      </Box>

      {/* Floating Action Button */}
      {isAuthenticated && (
        <Fab 
          onClick={() => navigate('/planner')}
          sx={{ 
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            background: brandGradients.primary,
            color: 'white',
            boxShadow: brandShadows.primary,
            '&:hover': {
              background: brandGradients.primary,
              transform: 'scale(1.1)',
              boxShadow: brandShadows.primaryHover
            }
          }}
        >
          <NavigationOutlined />
        </Fab>
      )}
      
      {/* System Health Status for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <HealthStatus showDetails />
        </Container>
      )}
    </Box>
  )
}

export default HomePage