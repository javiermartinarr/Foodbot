import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'

// Fix para los iconos de Leaflet en React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Función para obtener color según puntuación (misma lógica que Explorar)
function getScoreColor(score) {
  if (!score) return { bg: '#D1D5DB', border: '#9CA3AF', text: '#374151' }
  
  if (score >= 4.5) {
    return { bg: '#BBF7D0', border: '#22C55E', text: '#166534' }
  } else if (score >= 4.0) {
    return { bg: '#DCFCE7', border: '#4ADE80', text: '#166534' }
  } else if (score >= 3.5) {
    return { bg: '#FDE68A', border: '#F59E0B', text: '#92400E' }
  } else if (score >= 3.0) {
    return { bg: '#FED7AA', border: '#FB923C', text: '#9A3412' }
  } else {
    return { bg: '#E5E7EB', border: '#9CA3AF', text: '#374151' }
  }
}

// Crear icono personalizado con la puntuación
// Crear icono de chincheta con color según puntuación
// Crear icono estilo Apple Maps con color según puntuación
// Crear icono estilo Apple Maps con color según puntuación
function createCustomIcon(restaurante) {
  const score = restaurante.puntuacion
  
  // Mismas franjas que en Explorar.jsx
  let pinColor
  if (!score) {
    pinColor = '#E5E7EB'  // gray-200
  } else if (score >= 4.5) {
    pinColor = '#BBF7D0'  // green-200
  } else if (score >= 4.0) {
    pinColor = '#DCFCE7'  // green-100
  } else if (score >= 3.5) {
    pinColor = '#FDE68A'  // amber-200
  } else if (score >= 3.0) {
    pinColor = '#FED7AA'  // orange-200
  } else {
    pinColor = '#E5E7EB'  // gray-200
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


// Función para obtener el estilo del badge de puntuación (igual que Explorar)
function getScoreBadgeStyle(score) {
  if (!score) return 'background: #E5E7EB; border: 0.5px solid #9CA3AF;'
  
  if (score >= 4.5) {
    return 'background: #BBF7D0; border: 0.5px solid #9CA3AF;'
  } else if (score >= 4.0) {
    return 'background: #DCFCE7; border: 0.5px solid #9CA3AF;'
  } else if (score >= 3.5) {
    return 'background: #FDE68A; border: 0.5px solid #9CA3AF;'
  } else if (score >= 3.0) {
    return 'background: #FED7AA; border: 0.5px solid #9CA3AF;'
  } else {
    return 'background: #E5E7EB; border: 0.5px solid #9CA3AF;'
  }
}

function Mapa({ restaurantes }) {
  // Filtrar solo restaurantes con coordenadas
  const restaurantesConCoordenadas = restaurantes.filter(
    r => r.latitud && r.longitud
  )

  // Centro del mapa (Madrid)
  const centroMadrid = [40.4168, -3.7038]

  if (restaurantesConCoordenadas.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 p-12 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Mapa interactivo</h2>
          <p className="text-gray-500">
            No hay restaurantes con coordenadas todavía.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Añade latitud y longitud en Supabase para verlos aquí.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Info */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          📍 {restaurantesConCoordenadas.length} restaurantes en el mapa
        </p>
        <p className="text-xs text-gray-400">
          Click en un marcador para ver detalles
        </p>
      </div>

      {/* Mapa */}
      <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-200/50">
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
                <div style={{ minWidth: '220px', padding: '4px' }}>
                  {/* Nombre con fuente Merriweather */}
                  <h3 style={{ 
                    fontFamily: 'Merriweather, serif', 
                    fontWeight: 600, 
                    color: '#1F2937', 
                    fontSize: '16px',
                    marginBottom: '4px',
                    lineHeight: '1.3'
                  }}>
                    {restaurante.nombre}
                  </h3>
                  
                  {/* Tipo y subtipo de comida */}
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6B7280', 
                    marginBottom: '10px' 
                  }}>
                    {restaurante.tipo_comida}
                    {restaurante.subtipo_comida && ` · ${restaurante.subtipo_comida}`}
                  </p>
                  
                  {/* Rating y precio */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      ...Object.fromEntries(getScoreBadgeStyle(restaurante.puntuacion).split(';').filter(s => s.trim()).map(s => {
                        const [key, value] = s.split(':').map(x => x.trim())
                        return [key.replace(/-([a-z])/g, g => g[1].toUpperCase()), value]
                      })),
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1F2937',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ color: '#D97706', fontSize: '11px' }}>⭐</span>
                      {restaurante.puntuacion?.toFixed(1) || '-'}
                    </span>
                    <span style={{ 
                      fontSize: '13px', 
                      color: '#1F2937',
                      fontWeight: 500
                    }}>
                      {restaurante.precio_categoria}
                      {restaurante.precio_min && restaurante.precio_max && (
                        <span style={{ color: '#6B7280', fontWeight: 400 }}>
                          {' '}({restaurante.precio_min}-{restaurante.precio_max}€)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Barrio */}
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📍 {restaurante.barrio}
                  </p>

                  {/* Botón Google Maps */}
                  {restaurante.google_maps_url && (
                    <a 
                      href={restaurante.google_maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: '#F3F4F6',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#1F2937',
                        textDecoration: 'none'
                      }}
                    >
                      Abrir en Google Maps →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default Mapa