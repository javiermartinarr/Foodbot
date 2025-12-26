export const config = {
    runtime: 'edge',
  }
  
  const SYSTEM_PROMPT = `Eres Javier, un foodie madrileño con opiniones claras sobre restaurantes. Esta es tu base de datos personal de recomendaciones.
  
  TU ESTILO:
  - Hablas de forma cercana y directa, como a un amigo, 
  - Manten un tono siempre formal con un toquedivertido
  - Usas algunas expresiones españolas: "brutal", "una pasada", "merece mucho la pena" sin abusar de ellas
  - Eres honesto: si algo no te convenció del todo, lo dices
  - Das recomendaciones concretas: qué plato pedir, si hay que reservar, precio aproximado
  - Si no conoces un sitio o no tienes info, lo dices claramente
  - Nunca inventes restaurantes que no estén en tu base de datos
  
  FORMATO DE RESPUESTA:
  - Respuestas concisas pero útiles (2-4 párrafos máximo)
  - Preferiblemente estructuradas en formato de lista con "-" para marcar cada punto
  - Si recomiendas varios sitios, no más de 5 a la vez
  - Incluye siempre: nombre, qué pedir, y precio aproximado
  - Si requiere reserva, menciónalo
  
  CUANDO NO TENGAS OPCIONES:
  - Sé honesto: "No tengo nada que encaje exactamente con eso"
  - Ofrece alternativas cercanas si las hay`
  
  export default async function handler(req) {
    // Log para verificar que la función se ejecuta
    console.log('API llamada, método:', req.method)
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  
    // Verificar que existe la API key
    const apiKey = process.env.GEMINI_API_KEY
    console.log('API Key existe:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key no configurada' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  
    try {
      const body = await req.json()
      const { mensaje, restaurantes } = body
      
      console.log('Mensaje recibido:', mensaje)
      console.log('Restaurantes recibidos:', restaurantes?.length || 0)
  
      if (!mensaje) {
        return new Response(JSON.stringify({ error: 'Mensaje vacío' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
  
      // Preparar contexto con los restaurantes
      const restaurantesLimitados = restaurantes || []
      const restaurantesContext = restaurantesLimitados
        .map(r => `- ${r.nombre} (${r.tipo_comida}${r.subtipo_comida ? ` - ${r.subtipo_comida}` : ''}): ${r.barrio}, ${r.precio_categoria} (${r.precio_min || '?'}-${r.precio_max || '?'}€), Ambiente: ${r.ambiente || 'No especificado'}, ${r.puntuacion?.toFixed(1) || '?'}/5${r.plato_recomendado ? `, Pedir: ${r.plato_recomendado}` : ''}${r.requiere_reserva ? ', ⚠️ Requiere reserva' : r.acepta_reservas ? ', Acepta reservas' : ', Sin reservas'}${r.mejor_para?.length ? `, Ideal para: ${r.mejor_para.join(', ')}` : ''}`)
        .join('\n')
  
      const prompt = `${SYSTEM_PROMPT}
  
  MIS RESTAURANTES:
  ${restaurantesContext}
  
  USUARIO: ${mensaje}`
  
      console.log('Llamando a Gemini...')
  
      // Llamar a Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 2048,
            }
          })
        }
      )
  
      console.log('Gemini response status:', response.status)
  
      const data = await response.json()
      
      console.log('Gemini response:', JSON.stringify(data).slice(0, 200))
      
      if (data.error) {
        console.error('Gemini error:', data.error)
        return new Response(JSON.stringify({ error: data.error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
  
      const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta'
  
      return new Response(JSON.stringify({ respuesta }), {
        headers: { 'Content-Type': 'application/json' }
      })
  
    } catch (error) {
      console.error('Error completo:', error.message, error.stack)
      return new Response(
        JSON.stringify({ error: `Error: ${error.message}` }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }