import { Box, Paper, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ElevationPoint {
  distance: number
  elevation: number
  grade?: number
}

interface ElevationProfileProps {
  elevation: {
    ascent: number
    descent: number
    maxElevation: number
    minElevation: number
    profile: ElevationPoint[]
  }
  distance: number
}

const ElevationProfile = ({ elevation }: ElevationProfileProps) => {
  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`
    }
    return `${distance.toFixed(0)}m`
  }

  const formatElevation = (elevation: number) => {
    return `${elevation.toFixed(0)}m`
  }

  // If no elevation profile data, show summary only
  if (!elevation.profile || elevation.profile.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Elevation Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Ascent</Typography>
            <Typography variant="body1" color="success.main">↗ {elevation.ascent}m</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Descent</Typography>
            <Typography variant="body1" color="error.main">↘ {elevation.descent}m</Typography>
          </Box>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Elevation Profile
      </Typography>
      
      {/* Summary Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Ascent</Typography>
          <Typography variant="body2" color="success.main">↗ {elevation.ascent}m</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Descent</Typography>
          <Typography variant="body2" color="error.main">↘ {elevation.descent}m</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Max</Typography>
          <Typography variant="body2">{elevation.maxElevation}m</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Min</Typography>
          <Typography variant="body2">{elevation.minElevation}m</Typography>
        </Box>
      </Box>

      {/* Elevation Chart */}
      <Box sx={{ height: 150, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={elevation.profile}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="distance" 
              tickFormatter={formatDistance}
              type="number"
              scale="linear"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              tickFormatter={formatElevation}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip 
              labelFormatter={(value) => `Distance: ${formatDistance(value as number)}`}
              formatter={(value, name, props) => {
                if (name === 'elevation') {
                  const point = props.payload
                  const gradientText = point?.grade !== undefined 
                    ? ` (${point.grade > 0 ? '+' : ''}${point.grade.toFixed(1)}% grade)` 
                    : ''
                  return [`${formatElevation(value as number)}${gradientText}`, 'Elevation']
                }
                return [`${value}%`, 'Grade']
              }}
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="elevation" 
              stroke="#2196f3" 
              strokeWidth={2}
              dot={false}
              name="elevation"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}

export default ElevationProfile