import { Box, Container, Typography, Button, Grid, Chip, Stack } from '@mui/material'
import { PlayArrow, Speed, ArrowForward } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { brandColors, brandGradients, brandShadows } from '../theme/brandColors'

const LandingPage = () => {
  const navigate = useNavigate()


  return (
    <Box sx={{ 
      background: '#0a0a0a',
      color: 'white',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        {/* Hero Background Image */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.8)), url('/assets/Breathtaking_ultra-wide_cinematic_landscape.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: { xs: 'scroll', md: 'fixed' }, // Parallax effect on desktop
          filter: 'brightness(0.9) contrast(1.1)', // Enhance the image slightly
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
            
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
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

            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={7}>
                {/* Hero Content */}
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(45deg, #ffffff, #cccccc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  The first cycling app that actually works
                </Typography>

                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontSize: { xs: '1.2rem', md: '1.8rem' },
                    fontWeight: 400,
                    mb: 4,
                    opacity: 0.8,
                    lineHeight: 1.4
                  }}
                >
                  Never hit another pothole again. Find routes so good, you'll think we cheated.
                </Typography>

                {/* Primary CTA */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/app')}
                    sx={{
                      background: brandGradients.primary,
                      color: 'white',
                      fontWeight: 'bold',
                      px: 6,
                      py: 3,
                      fontSize: '1.3rem',
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
                    Get Beta Access Now
                  </Button>
                  
                  <Button
                    variant="text"
                    size="large"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500,
                      px: 3,
                      py: 3,
                      fontSize: '1rem',
                      textTransform: 'none',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: brandColors.accent,
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                    startIcon={<PlayArrow />}
                  >
                    See how it works
                  </Button>
                </Stack>

                {/* Viral Hooks & FOMO */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ 
                  opacity: 0.9,
                  background: 'rgba(16,185,129,0.1)',
                  p: 3,
                  border: `1px solid ${brandColors.accent}`,
                  borderLeft: `4px solid ${brandColors.accent}`
                }}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: brandColors.accent }}>
                      Free Forever
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      For first 1,000 users
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: brandColors.accent }}>
                      847 Spots Left
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Beta access closing soon
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: brandColors.accent }}>
                      Share & Unlock
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Premium features
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                {/* Hero Visual - Route Intelligence Interface */}
                <Box sx={{ 
                  position: 'relative',
                  height: { xs: 250, md: 350 },
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  border: `2px solid ${brandColors.accent}`,
                  borderLeft: `6px solid ${brandColors.accent}`,
                  background: `linear-gradient(135deg, rgba(4,120,87,0.05), rgba(16,185,129,0.05))`
                }}>
                  <Box
                    component="video"
                    src="/assets/Sophisticated_holographic_route_planning_interface.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  
                  {/* Overlay with branding */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    p: 3,
                    color: 'white'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      AI-Powered Route Intelligence
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Real-time surface analysis & quality scoring
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Road Intelligence Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#111111' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>
              Stop wasting time on terrible routes
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.7, maxWidth: 600, mx: 'auto', mb: 4 }}>
              While others give you random lines on a map, we analyze actual road conditions.
            </Typography>
          </Box>

          {/* Revolutionary Score Display with Dashboard */}
          <Grid container spacing={4} alignItems="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: `linear-gradient(135deg, rgba(4,120,87,0.1), rgba(16,185,129,0.1))`,
                  border: `1px solid ${brandColors.accent}`,
                  p: 4,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, ${brandColors.accent}22, transparent, ${brandColors.accent}22)`,
                    zIndex: 0
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h1" sx={{ 
                      fontWeight: 900, 
                      fontSize: '4rem',
                      background: `linear-gradient(45deg, ${brandColors.light}, ${brandColors.accent})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1
                    }}>
                      95
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: brandColors.accent, 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: 2
                    }}>
                      ROUTE SCORE
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'left', position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" sx={{ 
                      color: brandColors.light, 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.7rem',
                      opacity: 0.9
                    }}>
                      Example: Box Hill Circuit
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
                      Flawless Roads
                    </Typography>
                    <Typography variant="h6" sx={{ color: brandColors.accent, fontWeight: 'bold' }}>
                      Zero compromises. Zero bullshit.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{
                position: 'relative',
                height: 200,
                backgroundImage: 'url("/assets/data-visualization-dashboard.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 3,
                border: `2px solid ${brandColors.accent}`,
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: `0 20px 60px ${brandColors.accent}33`
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
                  zIndex: 1
                }
              }}>
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  zIndex: 2,
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 2
                }}>
                  <Typography variant="subtitle2" sx={{ color: brandColors.accent, fontWeight: 'bold' }}>
                    REAL-TIME ANALYSIS
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Live elevation profiles & surface quality data
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* 5-Factor Breakdown */}
          <Grid container spacing={2}>
            {[
              {
                factor: "Surface Quality",
                weight: "40%",
                score: 92,
                icon: "🛣️",
                description: "Perfect tarmac, zero potholes",
                tag: "Road condition analysis",
                backgroundImage: "/assets/Ultra-detailed_macro_photograph_of_perfect_tarmac.png"
              },
              {
                factor: "Traffic Intelligence", 
                weight: "25%",
                score: 87,
                icon: "🚗",
                description: "Safe, quiet roads for cyclists",
                tag: "Live traffic data",
                backgroundImage: "/assets/Sophisticated_aerial_view_of_modern_highway_intersection.png"
              },
              {
                factor: "Gradient Optimization",
                weight: "20%", 
                score: 94,
                icon: "⛰️",
                description: "Smart elevation for your fitness",
                tag: "Elevation profiles",
                backgroundImage: "/assets/Dramatic_mountain_landscape_silhouette_with_elevation.png"
              },
              {
                factor: "Infrastructure",
                weight: "10%",
                score: 78,
                icon: "🛤️", 
                description: "Bike lanes & wide shoulders",
                tag: "Cyclist infrastructure",
                backgroundImage: "/assets/Clean_architectural_photograph_of_modern_cycle_lane.png"
              },
              {
                factor: "Scenic Beauty",
                weight: "5%",
                score: 89,
                icon: "🌲",
                description: "Routes that inspire",
                tag: "Natural landscapes",
                backgroundImage: "/assets/Ethereal_forest_canopy_photograph_shot_from_below.png"
              }
            ].map((factor, index) => (
              <Grid item xs={12/5} sm={12/5} md={12/5} key={index}>
                <Box sx={{
                  position: 'relative',
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${factor.backgroundImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: '1px solid rgba(255,255,255,0.2)',
                  p: 2,
                  height: '180px',
                  color: 'white',
                  textAlign: 'center',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `2px solid ${brandColors.accent}`,
                    transform: 'translateY(-8px)',
                    '&::before': {
                      opacity: 0.3
                    }
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
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {factor.icon}
                    </Typography>
                    
                    {/* Score */}
                    <Typography variant="h5" sx={{ 
                      fontWeight: 900,
                      color: factor.score > 90 ? brandColors.light : factor.score > 80 ? brandColors.accent : '#fbbf24',
                      mb: 1
                    }}>
                      {factor.score}
                    </Typography>

                    {/* Factor Name */}
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'white', fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {factor.factor}
                    </Typography>

                    {/* Weight Badge */}
                    <Chip 
                      label={factor.weight}
                      size="small"
                      sx={{ 
                        backgroundColor: `rgba(4,120,87,0.3)`, 
                        color: brandColors.light,
                        fontWeight: 'bold',
                        mb: 1,
                        fontSize: '0.7rem',
                        height: '20px'
                      }} 
                    />

                    {/* Description */}
                    <Typography variant="caption" sx={{ 
                      opacity: 0.8, 
                      color: 'white',
                      display: 'block',
                      lineHeight: 1.2,
                      fontSize: '0.75rem'
                    }}>
                      {factor.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Revolutionary Claims */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: brandColors.accent,
              textTransform: 'uppercase',
              letterSpacing: 2,
              mb: 2
            }}>
              Real data. Real intelligence. Real revolution.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, color: 'white', maxWidth: 500, mx: 'auto' }}>
              While other apps give you random lines on a map, we analyze actual road conditions, 
              traffic patterns, and surface quality to create routes that feel like magic.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Competitive Comparison Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>
              Why we're destroying the competition
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.7, maxWidth: 600, mx: 'auto' }}>
              Other apps are just social networks with basic maps. We actually solve routing.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{
                textAlign: 'center',
                p: 4,
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #ff5722',
                position: 'relative'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff5722', mb: 2 }}>
                  Strava
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
                  Social features, basic routing
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ff5722', mr: 1 }}>❌</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Road quality data</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ff5722', mr: 1 }}>❌</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Surface analysis</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ff5722', mr: 1 }}>❌</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Traffic intelligence</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#10b981', mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Social features</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{
                textAlign: 'center',
                p: 4,
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #8bc34a',
                position: 'relative'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8bc34a', mb: 2 }}>
                  Komoot
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
                  Tourist routes, no quality data
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ff5722', mr: 1 }}>❌</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Road quality data</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ff5722', mr: 1 }}>❌</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Surface analysis</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#10b981', mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Tourist POIs</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: '#10b981', mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Offline maps</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{
                textAlign: 'center',
                p: 4,
                background: `linear-gradient(135deg, rgba(4,120,87,0.1), rgba(16,185,129,0.1))`,
                border: `2px solid ${brandColors.accent}`,
                borderTop: `4px solid ${brandColors.accent}`,
                position: 'relative',
                '&::after': {
                  content: '"BEST"',
                  position: 'absolute',
                  top: -12,
                  right: 16,
                  background: brandColors.accent,
                  color: 'black',
                  padding: '4px 12px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: brandColors.accent, mb: 2 }}>
                  Baroudique
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, fontWeight: 'bold' }}>
                  AI-powered road intelligence
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: brandColors.accent, mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'bold' }}>Real-time road quality</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: brandColors.accent, mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'bold' }}>Surface analysis</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: brandColors.accent, mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'bold' }}>Traffic intelligence</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ color: brandColors.accent, mr: 1 }}>✅</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'bold' }}>Perfect routes every time</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" sx={{ 
              color: brandColors.accent, 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              Finally, an app built for road cyclists
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Social Proof & Viral Section */}
      <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
              Cyclists are going crazy for this
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.7, mb: 4 }}>
              Join 2,847 cyclists who already discovered perfect routes
            </Typography>
            
            {/* Usage Stats with Certification */}
            <Grid container spacing={3} alignItems="center" sx={{ mb: 5 }}>
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: brandColors.accent, mb: 1 }}>
                  2,847
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active cyclists
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: brandColors.accent, mb: 1 }}>
                  12,394
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Potholes avoided this week
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: brandColors.accent, mb: 1 }}>
                  847
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Beta spots remaining
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: brandColors.accent, mb: 1 }}>
                  4.9★
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Average rating
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    backgroundImage: 'url("/assets/certification-badge.png")',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'drop-shadow(0 8px 24px rgba(16,185,129,0.3))',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Real Testimonials with Community Background */}
          <Box sx={{ 
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("/assets/cyclist-community.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.1,
              zIndex: 0
            }
          }}>
            <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  p: 3,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `4px solid ${brandColors.accent}`,
                position: 'relative'
              }}>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "Found a 47km route with ZERO traffic lights. This app is actually magic."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: brandGradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography sx={{ fontWeight: 'bold', color: 'white' }}>S</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Sarah Chen
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      London • Road Cyclist
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 4,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `4px solid ${brandColors.accent}`,
                position: 'relative'
              }}>
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "Finally deleted Strava. This actually plans routes instead of just tracking them."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: brandGradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography sx={{ fontWeight: 'bold', color: 'white' }}>M</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Marcus Weber
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Berlin • Competitive Cyclist
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 4,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `4px solid ${brandColors.accent}`,
                position: 'relative'
              }}>
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "Perfect routes every single time. My average speed increased 15% just from better roads."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: brandGradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography sx={{ fontWeight: 'bold', color: 'white' }}>E</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Elena Rodriguez
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Barcelona • Triathlete
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
          </Box>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ 
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>
            Ready to ride better?
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9, color: 'white' }}>
            Start planning smarter routes in seconds. No signup, no BS.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/app')}
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
            Claim Your Beta Spot
          </Button>

          <Typography variant="body2" sx={{ mt: 3, opacity: 0.9, color: 'white', fontWeight: 500 }}>
            Free forever for first 1,000 users • 847 spots remaining
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage