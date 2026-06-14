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
 * Generates illustrative nearby-business markers around the pin.
 * In production this is replaced by the /api/v1/nearby/competitors
 * response, clustered with leaflet.markercluster.
 */
function generateNearbyMarkers(lat, lng, radius) {
  const markers = []
  const offsets = [0.2, -0.15, 0.4, -0.35, 0.6, -0.5]
  for (let i = 0; i < offsets.length; i++) {
    const angle = (i * 60) * (Math.PI / 180)
    const r = (radius * (0.35 + (i % 3) * 0.18)) / 111320
    const dLat = r * Math.cos(angle)
    const dLng = r * Math.sin(angle) / Math.cos(lat * Math.PI / 180)
    markers.push({ lat: lat + dLat, lng: lng + dLng })
  }
  return markers
}

export default function Map({ pinPosition, onPinPlaced, radiusMeters = 500, layers = {}, center }) {
  const nearby = useMemo(
    () => pinPosition ? generateNearbyMarkers(pinPosition.lat, pinPosition.lng, Number(radiusMeters)) : [],
    [pinPosition, radiusMeters]
  )

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

          {layers.showCompetitors && (
            <LayerGroup>
              {nearby.map((m, i) => (
                <Marker
                  key={`nearby-${i}`}
                  position={[m.lat, m.lng]}
                  icon={L.divIcon({ className: 'competitor-marker-wrap', html: '<div class="competitor-marker"></div>', iconSize: [10, 10] })}
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
