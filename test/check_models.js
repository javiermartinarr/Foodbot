// check_models.js
const https = require('https');

// 🔴 PEGA TU API KEY AQUÍ ABAJO ENTRE LAS COMILLAS
const API_KEY = "AIzaSyDsAAA2A1QzTScgaa30KyVj7sinNsWV0b8"; 

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (response.error) {
        console.error("\n❌ ERROR DE LA API:");
        console.error(JSON.stringify(response.error, null, 2));
        return;
    }

    console.log("\n✅ MODELOS DISPONIBLES PARA TI:");
    console.log("--------------------------------");
    
    // Filtramos solo los que sirven para generar texto (chat)
    const chatModels = response.models.filter(m => 
        m.supportedGenerationMethods.includes("generateContent")
    );

    chatModels.forEach(m => {
        // El 'name' suele venir como 'models/gemini-1.5-flash'
        // Para la URL, necesitamos quitarle el 'models/' si tu código ya lo añade
        console.log(`Nombre completo: ${m.name}`);
        console.log(`Versión: ${m.version}`);
        console.log("--------------------------------");
    });
  });

}).on("error", (err) => {
  console.log("Error de conexión: " + err.message);
});