import { useRef, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet'
import { Box, ToggleButton, ToggleButtonGroup, Paper, IconButton, Tooltip, CircularProgress } from '@mui/material'
import { MapOutlined, SatelliteOutlined, TerrainOutlined, MyLocationOutlined } from '@mui/icons-material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRoute } from '../contexts/RouteContext'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

interface MapComponentProps {
  highlightedSegment?: number | null
}

const MapComponent = ({ highlightedSegment }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const { waypoints, route, addWaypoint } = useRoute()
  const [mapStyle, setMapStyle] = useState<'osm' | 'cartodb' | 'positron' | 'cycle' | 'satellite' | 'terrain'>('positron')
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)
  
  // Default center - London, UK (fallback if geolocation fails)
  const defaultCenter: [number, number] = [51.505, -0.09]
  const mapCenter = currentLocation || defaultCenter
  
  useEffect(() => {
    // Try to get user's current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation([latitude, longitude])
          setLocationLoading(false)
          console.log('Current location found:', latitude, longitude)
        },
        (error) => {
          console.log('Geolocation error:', error.message)
          setLocationLoading(false)
          // Use default location if geolocation fails
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      console.log('Geolocation not supported')
      setLocationLoading(false)
    }
  }, [])

  const handleMapClick = async (lat: number, lng: number) => {
    console.log('Map clicked at:', lat, lng)
    await addWaypoint(lat, lng)
  }

  const handleRecenterLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setView(currentLocation, 14)
    } else if ('geolocation' in navigator) {
      setLocationLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation: [number, number] = [latitude, longitude]
          setCurrentLocation(newLocation)
          setLocationLoading(false)
          if (mapRef.current) {
            mapRef.current.setView(newLocation, 14)
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message)
          setLocationLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Map Style Selector */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1000,
          p: 1
        }}
      >
        <ToggleButtonGroup
          value={mapStyle}
          exclusive
          onChange={(_, newStyle) => newStyle && setMapStyle(newStyle)}
          size="small"
        >
          <ToggleButton value="positron" aria-label="Clean colored map">
            <MapOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="cycle" aria-label="Cycling map">
            🚴‍♂️
          </ToggleButton>
          <ToggleButton value="cartodb" aria-label="Minimal map">
            <MapOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="osm" aria-label="Standard map">
            <TerrainOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="satellite" aria-label="Satellite">
            <SatelliteOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="terrain" aria-label="Terrain">
            <TerrainOutlined fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>
      
      {/* Location Control */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          bottom: 80, 
          right: 10, 
          zIndex: 1000
        }}
      >
        <Tooltip title="Center on my location">
          <IconButton 
            onClick={handleRecenterLocation}
            disabled={locationLoading}
            color={currentLocation ? 'primary' : 'default'}
          >
            {locationLoading ? (
              <CircularProgress size={20} />
            ) : (
              <MyLocationOutlined />
            )}
          </IconButton>
        </Tooltip>
      </Paper>
      <MapContainer
        center={mapCenter}
        zoom={currentLocation ? 14 : 13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when location changes
      >
        {/* Map Tiles */}
        {mapStyle === 'osm' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        {mapStyle === 'cartodb' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        )}
        {mapStyle === 'positron' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        )}
        {mapStyle === 'cycle' && (
          <TileLayer
            url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Tiles style by <a href="https://www.cyclosm.org/">CyclOSM</a>'
          />
        )}
        {mapStyle === 'satellite' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
          />
        )}
        {mapStyle === 'terrain' && (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          />
        )}
        
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Render current location marker */}
        {currentLocation && (
          <Marker 
            position={currentLocation}
            icon={L.divIcon({
              className: 'current-location-marker',
              html: '<div style="background: #2196f3; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #2196f3;"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div>
                <strong>📍 Your Location</strong>
                <br />
                {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render waypoints */}
        {waypoints.map((waypoint, index) => (
          <Marker key={waypoint.id} position={[waypoint.lat, waypoint.lng]}>
            <Popup>
              <div>
                <strong>{index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Waypoint ${index}`}</strong>
                <br />
                {waypoint.address}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render route */}
        {route && route.coordinates.length > 0 && (
          <>
            {/* Main route line */}
            <Polyline 
              positions={route.coordinates} 
              color="#2196f3" 
              weight={4}
              opacity={0.7}
            />
            
            {/* Highlighted segment for max gradient */}
            {highlightedSegment !== null && route.elevation?.profile && route.elevation.profile.length > highlightedSegment && (
              <Polyline 
                positions={[
                  route.coordinates[Math.max(0, highlightedSegment - 1)],
                  route.coordinates[Math.min(route.coordinates.length - 1, highlightedSegment + 1)]
                ]} 
                color="#ff5722" 
                weight={6}
                opacity={0.9}
              />
            )}
          </>
        )}
      </MapContainer>
    </Box>
  )
}

export default MapComponent
export type { MapComponentProps }