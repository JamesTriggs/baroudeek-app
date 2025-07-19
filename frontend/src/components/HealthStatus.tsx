import React, { useState } from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Collapse, 
  IconButton, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
import { 
  ExpandMore, 
  ExpandLess, 
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material'
import { useHealthCheck } from '../hooks/useHealthCheck'
import { brandColors } from '../theme/brandColors'

interface HealthStatusProps {
  showDetails?: boolean
  compact?: boolean
}

const HealthStatus = ({ showDetails = false, compact = false }: HealthStatusProps) => {
  const { health, isLoading, error, runHealthCheck, isHealthy, isDegraded, isUnhealthy } = useHealthCheck()
  const [expanded, setExpanded] = useState(showDetails)

  if (isLoading && !health) {
    return (
      <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: 'white' }}>
              Running system health checks...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error && !health) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={runHealthCheck}>
            Retry
          </Button>
        }
      >
        Health check failed: {error}
      </Alert>
    )
  }

  if (!health) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle sx={{ color: '#4caf50' }} />
      case 'degraded': return <Warning sx={{ color: '#ff9800' }} />
      case 'unhealthy': return <ErrorIcon sx={{ color: '#f44336' }} />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4caf50'
      case 'degraded': return '#ff9800'
      case 'unhealthy': return '#f44336'
      default: return '#666'
    }
  }

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getStatusIcon(health.overall)}
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          System {health.overall}
        </Typography>
        {isLoading && <CircularProgress size={12} />}
      </Box>
    )
  }

  return (
    <Card sx={{ 
      mb: 2, 
      background: 'rgba(255,255,255,0.05)', 
      border: `1px solid ${getStatusColor(health.overall)}40` 
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getStatusIcon(health.overall)}
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              System Health
            </Typography>
            <Chip 
              label={health.overall.toUpperCase()} 
              size="small"
              sx={{ 
                backgroundColor: getStatusColor(health.overall),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={runHealthCheck} 
              disabled={isLoading}
              sx={{ color: 'white' }}
              size="small"
            >
              {isLoading ? <CircularProgress size={16} /> : <Refresh />}
            </IconButton>
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'white' }}
              size="small"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {health.warnings.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {health.warnings.map((warning, index) => (
              <Typography 
                key={index} 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: '#ff9800',
                  mb: 0.5
                }}
              >
                {warning}
              </Typography>
            ))}
          </Box>
        )}

        <Collapse in={expanded}>
          <List dense sx={{ mt: 1 }}>
            {health.services.map((service, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  {getStatusIcon(service.status)}
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {service.service}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {service.responseTime > 0 && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {service.responseTime}ms
                        </Typography>
                      )}
                      {service.error && (
                        <Typography variant="caption" sx={{ color: '#f44336', display: 'block' }}>
                          {service.error}
                        </Typography>
                      )}
                      {service.details && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                          {typeof service.details === 'object' 
                            ? Object.entries(service.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                            : service.details
                          }
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, display: 'block' }}>
            Last checked: {new Date(health.timestamp).toLocaleTimeString()}
          </Typography>
        </Collapse>
      </CardContent>
    </Card>
  )
}

export default HealthStatus