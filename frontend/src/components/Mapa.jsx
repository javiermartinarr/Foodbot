import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import RestaurantModal from './RestaurantModal'

// Fix para los iconos de Leaflet en React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Icon } from 'leaflet'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function createCustomIcon(restaurante) {
  const score = restaurante.puntuacion

  let pinColor
  if (!score) {
    pinColor = '#E5E7EB'
  } else if (score >= 4.5) {
    pinColor = '#BBF7D0'
  } else if (score >= 4.0) {
    pinColor = '#DCFCE7'
  } else if (score >= 3.5) {
    pinColor = '#FDE68A'
  } else if (score >= 3.0) {
    pinColor = '#FED7AA'
  } else {
    pinColor = '#E5E7EB'
  }

  return new DivIcon({
    className: 'custom-marker',
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z"
              fill="${pinColor}"
              stroke="#1F2937"
              stroke-width="1.5"/>
        <circle cx="14" cy="12" r="4.5" fill="#1F2937"/>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

function Mapa({ restaurantes }) {
  const [selectedRestaurante, setSelectedRestaurante] = useState(null)

  const restaurantesConCoordenadas = restaurantes.filter(
    r => r.latitud && r.longitud
  )

  const centroMadrid = [40.4168, -3.7038]

  if (restaurantesConCoordenadas.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-3xl shadow-sm p-12 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--card-title)' }}>Mapa interactivo</h2>
          <p style={{ color: 'var(--card-subtitle)' }}>
            No hay restaurantes con coordenadas todavía.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--card-meta)' }}>
            Añade latitud y longitud en Supabase para verlos aquí.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--card-subtitle)' }}>
          <span style={{ color: '#D97706' }}>📍</span>
          {restaurantesConCoordenadas.length} restaurantes en el mapa
        </p>
        <p className="text-xs" style={{ color: 'var(--card-meta)' }}>
          Click en un marcador para ver detalles
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--card-border)' }}>
        <MapContainer
          center={centroMadrid}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '70vh', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {restaurantesConCoordenadas.map(restaurante => (
            <Marker
              key={restaurante.id}
              position={[restaurante.latitud, restaurante.longitud]}
              icon={createCustomIcon(restaurante)}
            >
              <Popup>
                <div style={{
                  minWidth: '220px',
                  padding: '8px',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--card-title)',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontFamily: 'Merriweather, serif',
                    fontWeight: 600,
                    color: 'var(--card-title)',
                    fontSize: '16px',
                    marginBottom: '4px',
                    lineHeight: '1.3'
                  }}>
                    {restaurante.nombre}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--card-subtitle)', marginBottom: '10px' }}>
                    {restaurante.tipo_comida}
                    {restaurante.subtipo_comida && ` · ${restaurante.subtipo_comida}`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{
                      background: 'var(--filter-bg)',
                      border: '1px solid var(--card-border)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--card-title)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ color: '#D97706', fontSize: '11px' }}>⭐</span>
                      {restaurante.puntuacion?.toFixed(1) || '-'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--card-title)', fontWeight: 500 }}>
                      {restaurante.precio_categoria}
                      {restaurante.precio_min && restaurante.precio_max && (
                        <span style={{ color: 'var(--card-meta)', fontWeight: 400 }}>
                          {' '}({restaurante.precio_min}-{restaurante.precio_max}€)
                        </span>
                      )}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--card-subtitle)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    📍 {restaurante.barrio}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedRestaurante(restaurante) }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#D97706',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Ver más
                    </button>
                    {restaurante.google_maps_url && (
                      <a
                        href={restaurante.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--filter-bg)',
                          border: '1px solid var(--card-border)',
                          borderRadius: '10px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--card-title)',
                          textDecoration: 'none'
                        }}
                      >
                        Maps →
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <RestaurantModal
        restaurante={selectedRestaurante}
        onClose={() => setSelectedRestaurante(null)}
      />
    </div>
  )
}

export default Mapa
