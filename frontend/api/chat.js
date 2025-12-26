export const config = {
    runtime: 'edge',
  }
  
  const SYSTEM_PROMPT = `Eres Javier, un foodie madrileño con opiniones claras sobre restaurantes. Esta es tu base de datos personal de recomendaciones.
  
  TU ESTILO:
  - Hablas de forma cercana y directa, como a un amigo
  - Usas expresiones coloquiales españolas: "brutal", "una pasada", "de lo mejorcito", "merece mucho la pena"
  - Eres honesto: si algo no te convenció del todo, lo dices
  - Das recomendaciones concretas: qué plato pedir, si hay que reservar, precio aproximado
  - Si no conoces un sitio o no tienes info, lo dices claramente
  - Nunca inventes restaurantes que no estén en tu base de datos
  
  FORMATO DE RESPUESTA:
  - Respuestas concisas pero útiles (2-4 párrafos máximo)
  - Si recomiendas varios sitios, no más de 3
  - Incluye siempre: nombre, qué pedir, y precio aproximado
  - Si requiere reserva, menciónalo
  
  CUANDO NO TENGAS OPCIONES:
  - Sé honesto: "No tengo nada que encaje exactamente con eso"
  - Ofrece alternativas cercanas si las hay`
  
  export default async function handler(req) {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }
  
    try {
      const { mensaje, restaurantes } = await req.json()
  
      // Preparar contexto con los restaurantes
      const restaurantesContext = restaurantes
        .map(r => `
  - **${r.nombre}** (${r.tipo_comida}${r.subtipo_comida ? ` - ${r.subtipo_comida}` : ''})
    Barrio: ${r.barrio} | Precio: ${r.precio_categoria} ${r.precio_min && r.precio_max ? `(${r.precio_min}-${r.precio_max}€)` : ''}
    Puntuación: ${r.puntuacion?.toFixed(1) || 'Sin puntuar'}/5
    ${r.plato_recomendado ? `Pedir: ${r.plato_recomendado}` : ''}
    ${r.descripcion_personal ? `Mi opinión: ${r.descripcion_personal}` : ''}
    ${r.ambiente ? `Ambiente: ${r.ambiente}` : ''}
    ${r.requiere_reserva ? '⚠️ Requiere reserva' : r.acepta_reservas ? 'Acepta reservas' : 'Sin reservas'}
    ${r.mejor_para?.length ? `Ideal para: ${r.mejor_para.join(', ')}` : ''}
  `).join('\n')
  
      const prompt = `${SYSTEM_PROMPT}
  
  ESTOS SON MIS RESTAURANTES (tu base de datos):
  ${restaurantesContext}
  
  PREGUNTA DEL USUARIO:
  ${mensaje}`
  
      // Llamar a Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        }
      )
  
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message)
      }
  
      const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta'
  
      return new Response(JSON.stringify({ respuesta }), {
        headers: { 'Content-Type': 'application/json' }
      })
  
    } catch (error) {
      console.error('Error:', error)
      return new Response(
        JSON.stringify({ error: 'Error procesando la solicitud' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }