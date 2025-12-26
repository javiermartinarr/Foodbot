import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

function Chat({ restaurantes }) {
  const [mensajes, setMensajes] = useState([
    {
      tipo: 'bot',
      texto: '¡Hola! Soy Javi, tu amigo y guía gastronómico por Madrid y otras ciudades. Pregúntame lo que quieras: dónde comer, qué pedir, sitios para una cita... ¡Fiaos de mis famosas recomendaciones!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const mensajeUsuario = input.trim()
    setInput('')
    
    // Añadir mensaje del usuario
    setMensajes(prev => [...prev, { tipo: 'user', texto: mensajeUsuario }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: mensajeUsuario,
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
    "¿Dónde puedo ir sin reservar?"]

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        
        {/* Header del chat */}
        <div className="bg-gray-50 border-b border-gray-200/50 px-6 py-4">
          <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
            💬 Pregúntame
          </h2>
          <p className="text-sm text-gray-500">
            Tu asistente gastronómico personal · {restaurantes.length} restaurantes en mi base de datos
          </p>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensajes.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.tipo === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.tipo === 'user'
                    ? 'bg-[#D97706] text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                <div className="text-sm">
                  <ReactMarkdown>{msg.texto}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-md">
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

        {/* Sugerencias (solo si no hay mensajes del usuario) */}
        {mensajes.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-2">Prueba a preguntar:</p>
            <div className="flex flex-wrap gap-2">
              {sugerencias.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(sug)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={enviarMensaje} className="border-t border-gray-200/50 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 focus:bg-white transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-[#D97706] text-white rounded-2xl font-medium hover:bg-[#D97706]/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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