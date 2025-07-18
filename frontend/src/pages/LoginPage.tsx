import React from 'react'
import { Box, Container, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/planner')
  }

  const handleSwitchToRegister = () => {
    navigate('/register')
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          py: 4,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 500,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onSuccess={handleLoginSuccess}
            />
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default LoginPage