import React from 'react'
import { Box, Container, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const handleRegisterSuccess = () => {
    navigate('/planner')
  }

  const handleSwitchToLogin = () => {
    navigate('/login')
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
            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleRegisterSuccess}
            />
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default RegisterPage