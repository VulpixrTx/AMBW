import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const brandIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng)
    }
  })
  return null
}

export default function EventMap({
  lat, lng, locationName,
  editable = false, onLocationChange,
  height = '280px'
}) {
  const center = [lat || -7.2575, lng || 112.7521] // default Surabaya

  return (
    <MapContainer
      center={center}
      zoom={lat ? 15 : 12}
      style={{ height, width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {editable && <ClickHandler onMapClick={(latlng) => onLocationChange?.(latlng)} />}
      {lat && lng && (
        <Marker position={[lat, lng]} icon={brandIcon}>
          {locationName && (
            <Popup>
              <div className="font-body text-sm">
                <strong>{locationName}</strong>
                <br />
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline text-xs"
                >
                  Buka di Google Maps
                </a>
              </div>
            </Popup>
          )}
        </Marker>
      )}
    </MapContainer>
  )
}
