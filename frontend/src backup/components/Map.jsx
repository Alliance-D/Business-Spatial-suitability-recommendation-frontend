import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, LayerGroup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './Map.css'

const KIGALI_CENTER = [-1.9441, 30.0619]

function PinDropHandler({ onPinDrop }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onPinDrop({ lat, lng })
    },
  })
  return null
}

function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center && map) map.flyTo([center[0], center[1]], map.getZoom())
  }, [center, map])
  return null
}

// Map is now presentation-only: it notifies parent about pin placement via `onPinPlaced`.
export default function Map({ businessCategory, pinPosition, onPinPlaced, radiusMeters = 500, layers = {}, center }) {
  // Create a few deterministic nearby markers around the drop location for UI layers
  function generateNearbyMarkers(lat, lng, radius) {
    const markers = []
    const offsets = [0.2, -0.15, 0.4, -0.35, 0.6]
    for (let i = 0; i < offsets.length; i++) {
      const angle = (i * 72) * (Math.PI / 180)
      const r = (radius * (0.4 + (i % 3) * 0.15)) / 111320 // approx degrees
      const dLat = r * Math.cos(angle)
      const dLng = r * Math.sin(angle) / Math.cos(lat * Math.PI / 180)
      markers.push({ lat: lat + dLat, lng: lng + dLng })
    }
    return markers
  }

  return (
    <div className="map-container">
      <MapContainer 
        center={KIGALI_CENTER} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        {center && <MapRecenter center={center} />}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {pinPosition && (
          <>
            <Marker position={[pinPosition.lat, pinPosition.lng]} />
            {layers.showBuffer && (
              <Circle center={[pinPosition.lat, pinPosition.lng]} radius={Number(radiusMeters)} pathOptions={{ color: '#3b82f6', weight: 1, fillOpacity: 0.05 }} />
            )}
            {layers.showCompetitors && (
              <LayerGroup>
                {generateNearbyMarkers(pinPosition.lat, pinPosition.lng, Number(radiusMeters)).map((m, i) => (
                  <Marker key={`comp-${i}`} position={[m.lat, m.lng]} />
                ))}
              </LayerGroup>
            )}
          </>
        )}
        <PinDropHandler onPinDrop={onPinPlaced} />
      </MapContainer>
    </div>
  )
}
