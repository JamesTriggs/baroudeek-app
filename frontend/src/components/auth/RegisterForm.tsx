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
import { register, clearError } from '../../store/slices/authSlice'
import { PersonOutline, LockOutlined, AccountCircleOutlined } from '@mui/icons-material'

interface RegisterFormProps {
  onSwitchToLogin?: () => void
  onSuccess?: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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

    console.log('Registration form submitted with data:', {
      email: formData.email,
      username: formData.username,
      password: formData.password
    })

    try {
      const result = await dispatch(register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      }) as any).unwrap()
      console.log('Registration successful:', result)
      onSuccess?.()
    } catch (error) {
      console.error('Registration failed:', error)
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
          Join CycleShare
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create your account to start planning routes
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
        label="Username"
        type="text"
        value={formData.username}
        onChange={handleChange('username')}
        error={!!formErrors.username}
        helperText={formErrors.username}
        required
        fullWidth
        InputProps={{
          startAdornment: <AccountCircleOutlined sx={{ mr: 1, color: 'action.active' }} />,
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

      <TextField
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
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
        {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToLogin}
            sx={{ fontWeight: 'bold' }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default RegisterForm