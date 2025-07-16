import { useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet'
import { Box } from '@mui/material'
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

const MapComponent = () => {
  const mapRef = useRef<L.Map | null>(null)
  const { waypoints, route, addWaypoint } = useRoute()
  
  // Default center - London, UK (good for cycling)
  const defaultCenter: [number, number] = [51.505, -0.09]

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked at:', lat, lng)
    addWaypoint(lat, lng)
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        
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
          <Polyline 
            positions={route.coordinates} 
            color="blue" 
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </Box>
  )
}

export default MapComponent