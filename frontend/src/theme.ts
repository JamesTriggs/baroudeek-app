import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#006B6B', // Deep teal - professional, trustworthy
      light: '#4DB6AC',
      dark: '#004D40',
    },
    secondary: {
      main: '#FF5722', // Vibrant orange - energy, action
      light: '#FF8A65',
      dark: '#D84315',
    },
    info: {
      main: '#00BCD4', // Electric blue - innovation, tech
      light: '#4DD0E1',
      dark: '#00838F',
    },
    background: {
      default: '#FAFAFA', // Warm white - modern, clean
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', // Darker text for better contrast
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.95rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0, 107, 107, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 107, 107, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #006B6B 0%, #4DB6AC 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #004D40 0%, #00695C 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 24px rgba(0, 0, 0, 0.08)',
          color: '#1A1A1A',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#006B6B',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#006B6B',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 24px rgba(0, 107, 107, 0.3)',
          background: 'linear-gradient(135deg, #006B6B 0%, #4DB6AC 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #004D40 0%, #00695C 100%)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
})