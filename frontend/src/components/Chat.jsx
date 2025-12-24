function Chat({ restaurantes }) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/50 p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pregúntame</h2>
          <p className="text-gray-500 mb-4">
            Próximamente: un chatbot que conoce mis {restaurantes.length} recomendaciones
          </p>
          <span className="inline-block bg-amber-100 text-amber-700 text-sm px-4 py-2 rounded-full font-medium">
            🚧 En desarrollo
          </span>
        </div>
      </div>
    )
  }
  
  export default Chat