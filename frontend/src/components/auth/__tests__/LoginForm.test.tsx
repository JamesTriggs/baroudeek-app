import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../../store/slices/authSlice'
import LoginForm from '../LoginForm'
import { vi } from 'vitest'

// Mock the API
vi.mock('../../../services/api', () => ({
  authAPI: {
    login: vi.fn()
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    renderWithProvider(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays the correct title and description', () => {
    renderWithProvider(<LoginForm />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue your cycling adventures')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithProvider(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    renderWithProvider(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('clears field errors when user starts typing', async () => {
    renderWithProvider(<LoginForm />)
    
    // Trigger email validation error
    const submitButton = screen.getByRole('button', { name: /sign in/i })
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
    renderWithProvider(<LoginForm />, loadingStore)
    
    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays error from Redux state', () => {
    const errorStore = createTestStore({ error: 'Login failed' })
    renderWithProvider(<LoginForm />, errorStore)
    
    expect(screen.getByText('Login failed')).toBeInTheDocument()
  })

  it('calls onSwitchToRegister when create account link is clicked', () => {
    const onSwitchToRegister = vi.fn()
    renderWithProvider(<LoginForm onSwitchToRegister={onSwitchToRegister} />)
    
    const createAccountLink = screen.getByText('Create an account')
    fireEvent.click(createAccountLink)
    
    expect(onSwitchToRegister).toHaveBeenCalled()
  })

  it('submits form with correct credentials', async () => {
    const { authAPI } = await import('../../../services/api')
    const mockLogin = vi.mocked(authAPI.login)
    mockLogin.mockResolvedValue({
      access_token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser'
      }
    })

    const onSuccess = vi.fn()
    renderWithProvider(<LoginForm onSuccess={onSuccess} />)
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})