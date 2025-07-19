import { useEffect, useState } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Chip, 
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material'
import { 
  PersonOutlined, 
  RouteOutlined, 
  StarOutlined, 
  EditOutlined, 
  DeleteOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { fetchRoutes, updateRoute, deleteRoute } from '../store/slices/routeSlice'

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { routes, isLoading, error } = useSelector((state: RootState) => state.route)
  
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    is_public: true
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchRoutes())
    }
  }, [dispatch, user])

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`
    }
    return `${distance.toFixed(0)} m`
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleEditRoute = (route: any) => {
    setSelectedRoute(route)
    setEditFormData({
      name: route.name,
      description: route.description || '',
      is_public: route.is_public
    })
    setEditDialogOpen(true)
  }

  const handleDeleteRoute = (route: any) => {
    setSelectedRoute(route)
    setDeleteDialogOpen(true)
  }

  const handleUpdateRoute = async () => {
    if (!selectedRoute) return

    setIsUpdating(true)
    setEditError(null)

    try {
      await dispatch(updateRoute({
        id: selectedRoute.id,
        updates: editFormData
      })).unwrap()
      
      setEditDialogOpen(false)
      setSelectedRoute(null)
    } catch (error) {
      setEditError('Failed to update route. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedRoute) return

    setIsDeleting(true)

    try {
      await dispatch(deleteRoute(selectedRoute.id)).unwrap()
      setDeleteDialogOpen(false)
      setSelectedRoute(null)
    } catch (error) {
      console.error('Failed to delete route:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setSelectedRoute(null)
    setEditError(null)
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                <PersonOutlined sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                Guest User
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sign in to save routes and collaborate with other cyclists
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip label="New Cyclist" size="small" />
                <Chip label="Community Member" size="small" />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Routes
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <RouteOutlined sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Sign in to view and manage your saved routes
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Community Contributions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <StarOutlined sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Start rating roads and contributing to help fellow cyclists
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
              <PersonOutlined sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.username || 'Cyclist'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label="Cyclist" size="small" />
              <Chip label="Community Member" size="small" />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Routes ({routes.length})
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : routes.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <RouteOutlined sx={{ mr: 1 }} />
                <Typography variant="body2">
                  No routes saved yet. Start planning to save your first route!
                </Typography>
              </Box>
            ) : (
              <List>
                {routes.map((route, index) => (
                  <ListItem key={route.id} divider={index < routes.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{route.name}</Typography>
                          {route.is_public ? (
                            <VisibilityOutlined fontSize="small" color="primary" />
                          ) : (
                            <VisibilityOffOutlined fontSize="small" color="disabled" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {route.description && `${route.description} • `}
                            {formatDistance(route.distance)} • {formatDuration(route.estimated_time)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(route.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditRoute(route)}
                        sx={{ mr: 1 }}
                      >
                        <EditOutlined />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteRoute(route)}
                        color="error"
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {routes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Routes Created
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {routes.reduce((total, route) => total + route.distance, 0) >= 1000 
                      ? `${(routes.reduce((total, route) => total + route.distance, 0) / 1000).toFixed(1)}k`
                      : routes.reduce((total, route) => total + route.distance, 0).toFixed(0)
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Distance (m)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Route Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Route</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {editError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editError}
              </Alert>
            )}
            
            <TextField
              label="Route Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Description"
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={editFormData.is_public}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                />
              }
              label="Make this route public"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRoute} 
            variant="contained" 
            disabled={isUpdating || !editFormData.name.trim()}
          >
            {isUpdating ? 'Updating...' : 'Update Route'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Route Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Route</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedRoute?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ProfilePage