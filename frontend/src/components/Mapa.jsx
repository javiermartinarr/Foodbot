import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useState } from 'react'

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

function Mapa({ restaurantes }) {
  const [selectedId, setSelectedId] = useState(null)
  
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
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden">
        <MapContainer
          center={centroMadrid}
          zoom={13}
          style={{ height: '600px', width: '100%' }}
          className="rounded-3xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {restaurantesConCoordenadas.map(restaurante => (
            <Marker
              key={restaurante.id}
              position={[restaurante.latitud, restaurante.longitud]}
              eventHandlers={{
                click: () => setSelectedId(restaurante.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    {restaurante.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {restaurante.tipo_comida} {restaurante.subtipo_comida && `· ${restaurante.subtipo_comida}`}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg font-medium">
                      ⭐ {restaurante.puntuacion?.toFixed(1) || '-'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {restaurante.precio_categoria}
                    </span>
                  </div>

                  {restaurante.plato_recomendado && (
                    <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mb-2">
                      🍴 {restaurante.plato_recomendado}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    📍 {restaurante.barrio}
                  </p>

                  {restaurante.google_maps_url && (
                  <a href={restaurante.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
                    Abrir en Google Maps →
                  </a>
                )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Lista bajo el mapa */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Restaurantes en el mapa:
        </h3>
        <div className="flex flex-wrap gap-2">
          {restaurantesConCoordenadas.map(r => (
            <span
              key={r.id}
              className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
            >
              {r.nombre}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Mapa