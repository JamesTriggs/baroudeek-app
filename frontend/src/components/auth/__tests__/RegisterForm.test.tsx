import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../../store/slices/authSlice'
import RegisterForm from '../RegisterForm'
import { vi } from 'vitest'

// Mock the API
vi.mock('../../../services/api', () => ({
  authAPI: {
    register: vi.fn()
  }
}))

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  })
}

const renderWithProvider = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    renderWithProvider(<RegisterForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('displays the correct title and description', () => {
    renderWithProvider(<RegisterForm />)
    
    expect(screen.getByText('Join Baroudique')).toBeInTheDocument()
    expect(screen.getByText('Create your account to start your cycling adventures')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithProvider(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Username is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    renderWithProvider(<RegisterForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('validates username format', async () => {
    renderWithProvider(<RegisterForm />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    
    // Test too short
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument()
    })

    // Test invalid characters
    fireEvent.change(usernameInput, { target: { value: 'user@name' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Username can only contain letters, numbers, and underscores')).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    renderWithProvider(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: '123' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    renderWithProvider(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } })
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('clears field errors when user starts typing', async () => {
    renderWithProvider(<RegisterForm />)
    
    // Trigger email validation error
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    // Start typing in email field
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@' } })
    
    // Error should be cleared
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('shows loading state during submission', () => {
    const loadingStore = createTestStore({ isLoading: true })
    renderWithProvider(<RegisterForm />, loadingStore)
    
    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays error from Redux state', () => {
    const errorStore = createTestStore({ error: 'Registration failed' })
    renderWithProvider(<RegisterForm />, errorStore)
    
    expect(screen.getByText('Registration failed')).toBeInTheDocument()
  })

  it('calls onSwitchToLogin when sign in link is clicked', () => {
    const onSwitchToLogin = vi.fn()
    renderWithProvider(<RegisterForm onSwitchToLogin={onSwitchToLogin} />)
    
    const signInLink = screen.getByText('Sign in')
    fireEvent.click(signInLink)
    
    expect(onSwitchToLogin).toHaveBeenCalled()
  })

  it('submits form with correct data including optional fields', async () => {
    const { authAPI } = await import('../../../services/api')
    const mockRegister = vi.mocked(authAPI.register)
    mockRegister.mockResolvedValue({
      access_token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        bio: 'Love cycling!'
      }
    })

    const onSuccess = vi.fn()
    renderWithProvider(<RegisterForm onSuccess={onSuccess} />)
    
    // Fill all fields
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: 'Love cycling!' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})