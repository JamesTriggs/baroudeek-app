import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack, Chip, Fab } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { RouteOutlined, GroupOutlined, TrendingUpOutlined, NavigationOutlined, SpeedOutlined, SecurityOutlined } from '@mui/icons-material'

const HomePage = () => {
  const navigate = useNavigate()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = !!(user && token)

  const features = [
    {
      icon: <RouteOutlined sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Smart Route Planning',
      description: 'AI-powered routes optimized for road cycling with quality road scoring and safety analysis',
      color: 'primary.main',
    },
    {
      icon: <GroupOutlined sx={{ fontSize: 48, color: 'info.main' }} />,
      title: 'Real-time Collaboration',
      description: 'Plan routes together with other cyclists in real-time with live route sharing',
      color: 'info.main',
    },
    {
      icon: <TrendingUpOutlined sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Community-Driven',
      description: 'Crowdsourced road ratings and usage heatmaps from fellow cyclists worldwide',
      color: 'secondary.main',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Routes Created' },
    { value: '5K+', label: 'Active Cyclists' },
    { value: '25K+', label: 'Miles Mapped' },
    { value: '98%', label: 'Safety Score' },
  ]

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 107, 107, 0.05) 0%, rgba(77, 182, 172, 0.05) 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(0, 188, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 87, 34, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              <Chip 
                label="🚴 New" 
                color="primary" 
                variant="outlined"
                sx={{ 
                  fontWeight: 600,
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              />
              <Chip 
                label="AI-Powered" 
                color="info" 
                variant="outlined"
                sx={{ 
                  fontWeight: 600,
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              />
            </Stack>
            
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                background: 'linear-gradient(135deg, #006B6B 0%, #4DB6AC 50%, #00BCD4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              RouteFlow
            </Typography>
            
            <Typography variant="h4" color="text.secondary" sx={{ mb: 1, fontWeight: 400 }}>
              The Future of Cycling Routes
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
              Collaborative route planning powered by AI, built for road cyclists who demand the best paths
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(isAuthenticated ? '/planner' : '/register')}
                sx={{ 
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  minWidth: 180
                }}
              >
                {isAuthenticated ? 'Start Planning' : 'Get Started Free'}
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    minWidth: 180
                  }}
                >
                  Sign In
                </Button>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ 
                textAlign: 'center', 
                py: 3,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}>
                <CardContent>
                  <Typography variant="h3" component="div" color="primary.main" fontWeight={700}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h2" textAlign="center" gutterBottom>
            Why Choose RouteFlow?
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}>
            Advanced features designed by cyclists, for cyclists
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  p: 1,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      mb: 3,
                      p: 2,
                      borderRadius: 3,
                      display: 'inline-block',
                      bgcolor: `${feature.color}15`,
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: 8,
        background: 'linear-gradient(135deg, #006B6B 0%, #4DB6AC 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h2" component="h2" gutterBottom fontWeight={700}>
              Ready to Transform Your Rides?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
              Join thousands of cyclists who trust RouteFlow for their best rides. 
              Create safer, smarter routes with our AI-powered platform.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate(isAuthenticated ? '/planner' : '/register')}
                sx={{ 
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              >
                {isAuthenticated ? 'Start Planning Now' : 'Join RouteFlow'}
              </Button>
            </Stack>
          </Box>
        </Container>
        
        {/* Decorative elements */}
        <Box sx={{ 
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <Box sx={{ 
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
      </Box>

      {/* Floating Action Button */}
      {isAuthenticated && (
        <Fab 
          color="primary" 
          onClick={() => navigate('/planner')}
          sx={{ 
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000
          }}
        >
          <NavigationOutlined />
        </Fab>
      )}
    </Box>
  )
}

export default HomePage