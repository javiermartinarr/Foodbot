import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const STORAGE_KEY = 'foodbot-chat-history'

const MENSAJE_INICIAL = {
  tipo: 'bot',
  texto: '¡Hola! Soy Javi, tu amigo y guía gastronómico por Madrid. Pregúntame lo que quieras: dónde comer, qué pedir, sitios para una cita... ¡Fiaos de mis recomendaciones!'
}

function Chat({ restaurantes }) {
  // Cargar mensajes desde localStorage al iniciar
  const [mensajes, setMensajes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Verificar que es un array válido con mensajes
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Error cargando historial:', e)
    }
    return [MENSAJE_INICIAL]
  })
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Guardar mensajes en localStorage cada vez que cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes))
    } catch (e) {
      console.error('Error guardando historial:', e)
    }
  }, [mensajes])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Función para limpiar el chat
  const limpiarChat = () => {
    setMensajes([MENSAJE_INICIAL])
    localStorage.removeItem(STORAGE_KEY)
  }

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const mensajeUsuario = input.trim()
    setInput('')
    
    // Añadir mensaje del usuario
    const nuevosMensajes = [...mensajes, { tipo: 'user', texto: mensajeUsuario }]
    setMensajes(nuevosMensajes)
    setLoading(true)

    try {
      // Preparar historial para el LLM (excluir mensaje inicial de bienvenida)
      const historialParaLLM = nuevosMensajes
        .slice(1) // Quitar mensaje de bienvenida
        .map(m => ({
          role: m.tipo === 'user' ? 'user' : 'assistant',
          content: m.texto
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: mensajeUsuario,
          historial: historialParaLLM, // ← Enviamos el historial
          restaurantes: restaurantes 
        })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setMensajes(prev => [...prev, { tipo: 'bot', texto: data.respuesta }])
    } catch (error) {
      console.error('Error:', error)
      setMensajes(prev => [...prev, { 
        tipo: 'bot', 
        texto: `Error: ${error.message}. Revisa la consola para más detalles.`
      }])
    } finally {
      setLoading(false)
    }
  }

  const sugerencias = [
    "¿Dónde como bien por Chamartin?",
    "Recomiéndame un italiano",
    "Sitio para una cita especial", 
    "¿Dónde puedo ir sin reservar?"
  ]

  // Estilos semánticos basados en tus variables CSS
  const containerStyle = {
    backgroundColor: 'var(--card-bg)',
    borderColor: 'var(--card-border)',
  }

  const headerStyle = {
    borderBottomColor: 'var(--card-divider)',
    backgroundColor: 'var(--filter-bg)'
  }

  const botBubbleStyle = {
    backgroundColor: 'var(--badge-bg)',
    color: 'var(--card-title)'
  }

  const userBubbleStyle = {
    backgroundColor: 'var(--color-amber-brand)',
    color: '#FFFFFF'
  }

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--input-text)'
  }

  // Verificar si hay conversación más allá del mensaje inicial
  const hayConversacion = mensajes.length > 1

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Contenedor principal del chat */}
      <div 
        className="rounded-3xl shadow-sm border overflow-hidden flex flex-col transition-colors duration-300" 
        style={{ ...containerStyle, height: '70vh' }}
      >
        
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-start" style={headerStyle}>
          <div>
            <h2 className="font-semibold" style={{ fontFamily: 'Merriweather, serif', color: 'var(--card-title)' }}>
              💬 Pregúntame
            </h2>
            <p className="text-sm" style={{ color: 'var(--card-subtitle)' }}>
              Tu asistente gastronómico personal · {restaurantes.length} restaurantes en mi base de datos
            </p>
          </div>
          {/* Botón Nueva Conversación */}
          {hayConversacion && (
            <button
              onClick={limpiarChat}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80 active:scale-95 border flex items-center gap-1"
              style={{ 
                backgroundColor: 'var(--input-bg)', 
                color: 'var(--card-subtitle)',
                borderColor: 'var(--card-border)'
              }}
              title="Iniciar nueva conversación"
            >
              🔄 Nueva conversación
            </button>
          )}
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensajes.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.tipo === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm ${
                  msg.tipo === 'user'
                    ? 'rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={msg.tipo === 'user' ? userBubbleStyle : botBubbleStyle}
              >
                <div className={`${msg.tipo === 'bot' ? '[&_strong]:font-bold [&_ul]:my-2 [&_ul]:ml-4 [&_li]:mb-1 [&_li]:list-disc [&_li]:list-inside' : ''}`}>
                  <ReactMarkdown>{msg.texto}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div 
                className="px-4 py-3 rounded-2xl rounded-bl-md"
                style={botBubbleStyle}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias - solo si no hay conversación */}
        {!hayConversacion && (
          <div className="px-6 pb-4">
            <p className="text-xs mb-2" style={{ color: 'var(--card-meta)' }}>Prueba a preguntar:</p>
            <div className="flex flex-wrap gap-2">
              {sugerencias.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(sug)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80 active:scale-95 border"
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--card-subtitle)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={enviarMensaje} className="border-t p-4" style={{ borderColor: 'var(--card-divider)' }}>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all placeholder-gray-400 disabled:opacity-50"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 text-white rounded-2xl font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{ backgroundColor: 'var(--color-amber-brand)' }}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat