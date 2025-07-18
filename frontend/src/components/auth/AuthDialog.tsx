import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Slide,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { Close } from '@mui/icons-material'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

const AuthDialog: React.FC<AuthDialogProps> = ({ 
  open, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // Update mode when initialMode changes or dialog opens
  useEffect(() => {
    if (open) {
      setMode(initialMode)
    }
  }, [open, initialMode])

  const handleSwitchMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
  }

  const handleSuccess = () => {
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset to login mode when closing
    setTimeout(() => setMode('login'), 300)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <Close />
        </IconButton>
        
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            {mode === 'login' ? (
              <LoginForm
                onSwitchToRegister={handleSwitchMode}
                onSuccess={handleSuccess}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={handleSwitchMode}
                onSuccess={handleSuccess}
              />
            )}
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  )
}

export default AuthDialog