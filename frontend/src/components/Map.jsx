import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, LayerGroup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './Map.css'

const KIGALI_CENTER = [-1.9441, 30.0619]
const KIGALI_ZOOM   = 13

/* Custom pin icon — matches the brand mark used in the navbar */
const pinIcon = L.divIcon({
  className: 'pin-marker',
  html: `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#1B4F82"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
})

/* Small dot icon for competitor markers */
const competitorIcon = (isPositive) => L.divIcon({
  className: 'competitor-marker-wrap',
  html: `<div class="competitor-marker" style="background:${isPositive ? 'var(--green)' : 'var(--red)'}"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

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
    if (center && map) map.flyTo([center[0], center[1]], Math.max(map.getZoom(), 15))
  }, [center, map])
  return null
}

/**
 * Map component.
 *
 * Props:
 *   pinPosition     — { lat, lng } of the dropped pin, or null
 *   onPinPlaced     — called with { lat, lng } when user clicks the map
 *   radiusMeters    — analysis radius for the buffer circle
 *   layers          — { showBuffer, showCompetitors }
 *   center          — [lat, lng] to fly to (from search)
 *   nearbyMarkers   — array of { id, latitude, longitude, reference_label }
 *                     from /api/v1/nearby/competitors — real backend data.
 *                     App.jsx fetches these and passes them down.
 */
export default function Map({ pinPosition, onPinPlaced, radiusMeters = 500, layers = {}, center, nearbyMarkers = [] }) {
  return (
    <MapContainer
      className="map-leaflet-container"
      center={KIGALI_CENTER}
      zoom={KIGALI_ZOOM}
      zoomControl={true}
    >
      {center && <MapRecenter center={center} />}

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {pinPosition && (
        <>
          <Marker position={[pinPosition.lat, pinPosition.lng]} icon={pinIcon} />

          {layers.showBuffer && (
            <Circle
              center={[pinPosition.lat, pinPosition.lng]}
              radius={Number(radiusMeters)}
              pathOptions={{ color: '#1B4F82', weight: 1.5, fillOpacity: 0.06, dashArray: '4 6' }}
            />
          )}

          {layers.showCompetitors && nearbyMarkers.length > 0 && (
            <LayerGroup>
              {nearbyMarkers.map((m) => (
                <Marker
                  key={`nearby-${m.id}`}
                  position={[m.latitude, m.longitude]}
                  icon={competitorIcon(m.reference_label)}
                />
              ))}
            </LayerGroup>
          )}
        </>
      )}

      <PinDropHandler onPinDrop={onPinPlaced} />
    </MapContainer>
  )
}
