import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { login, clearError } from '../../store/slices/authSlice'
import { PersonOutline, LockOutlined } from '@mui/icons-material'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) return

    try {
      await dispatch(login(formData) as any).unwrap()
      onSuccess?.()
    } catch (error) {
      // Error is handled by Redux state
    }
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 400,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to your CycleShare account
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={handleClearError}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        error={!!formErrors.email}
        helperText={formErrors.email}
        required
        fullWidth
        InputProps={{
          startAdornment: <PersonOutline sx={{ mr: 1, color: 'action.active' }} />,
        }}
      />

      <TextField
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        error={!!formErrors.password}
        helperText={formErrors.password}
        required
        fullWidth
        InputProps={{
          startAdornment: <LockOutlined sx={{ mr: 1, color: 'action.active' }} />,
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 1 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToRegister}
            sx={{ fontWeight: 'bold' }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default LoginForm