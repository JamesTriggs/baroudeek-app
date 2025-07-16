import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RouteOutlined, GroupOutlined, TrendingUpOutlined } from '@mui/icons-material'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <RouteOutlined color="primary" sx={{ fontSize: 40 }} />,
      title: 'Smart Route Planning',
      description: 'AI-powered routes optimized for road cycling with quality road scoring',
    },
    {
      icon: <GroupOutlined color="primary" sx={{ fontSize: 40 }} />,
      title: 'Real-time Collaboration',
      description: 'Plan routes together with other cyclists in real-time',
    },
    {
      icon: <TrendingUpOutlined color="primary" sx={{ fontSize: 40 }} />,
      title: 'Community-Driven',
      description: 'Crowdsourced road ratings and usage heatmaps from fellow cyclists',
    },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            CycleShare
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            The collaborative route planning app built for road cyclists
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/planner')}
            sx={{ mr: 2 }}
          >
            Start Planning
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/profile')}
          >
            Sign In
          </Button>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, p: 4, backgroundColor: 'primary.main', borderRadius: 2, color: 'white' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Join the Community
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Help fellow cyclists by rating roads, sharing your favorite routes, and contributing to our growing database of cycling-friendly paths.
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Get Started
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default HomePage