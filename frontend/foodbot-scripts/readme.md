# 🍽️ Foodbot - Rellenador automático de datos

Este script busca restaurantes en Google Places API y actualiza automáticamente tu base de datos de Supabase con:

- 📍 Dirección completa
- 🗺️ Coordenadas (latitud/longitud)
- 📞 Teléfono
- 🌐 Web oficial
- 🔗 URL de Google Maps
- 📮 Código postal

## 📋 Requisitos

- Python 3.10+
- API Key de Google Places (New)
- Credenciales de Supabase

## 🚀 Instalación

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. (Opcional) Editar las credenciales en el script si no las has puesto
```

## 💻 Uso

### Modo 1: Procesar todos los restaurantes sin coordenadas

```bash
python rellenar_restaurantes.py
```

El script:
1. Conecta a Supabase
2. Busca restaurantes donde `latitud` es NULL
3. Por cada uno, busca en Google Places
4. Actualiza los datos automáticamente

### Modo 2: Probar con un restaurante específico (sin guardar)

```bash
python rellenar_restaurantes.py "Thai Garden" "Madrid"
```

Esto solo muestra los datos que encontraría, sin modificar la BD.

## 📊 Ejemplo de salida

```
============================================================
🍽️  FOODBOT - Rellenador automático de datos
============================================================

📡 Conectando a Supabase...
  ✅ Conectado

📋 Buscando restaurantes sin coordenadas...
  📍 Encontrados 5 restaurantes sin coordenadas

⚡ Se van a procesar 5 restaurantes

[1/5]
🔍 Buscando: Thai Garden (Madrid)...
  📍 Dirección: Calle Añastro, 6, 28033 Madrid, Spain
  🗺️  Coords: 40.4567890, -3.6234567
  📞 Teléfono: 915 123 456
  🌐 Web: https://thaigarden.es
  ✅ Actualizado correctamente

[2/5]
🔍 Buscando: Lateral (Madrid)...
  ...
```

## ⚠️ Notas importantes

1. **Coste**: Google Places API tiene un tier gratuito de $200/mes (~11,000 búsquedas). Este script hace 1 búsqueda por restaurante.

2. **Verificar resultados**: Revisa que Google haya encontrado el restaurante correcto. A veces puede confundir locales con nombres similares.

3. **No sobrescribe todo**: El script solo actualiza los campos de ubicación/contacto. NO toca tus datos personales como `puntuacion`, `descripcion_personal`, `plato_recomendado`, etc.

4. **Barrios**: Google NO devuelve el barrio. Ese campo lo sigues rellenando tú manualmente.

## 🔧 Campos que rellena vs campos manuales

| Campo | ¿Auto? | Fuente |
|-------|--------|--------|
| `direccion` | ✅ | Google Places |
| `latitud` | ✅ | Google Places |
| `longitud` | ✅ | Google Places |
| `telefono` | ✅ | Google Places |
| `url_web` | ✅ | Google Places |
| `google_maps_url` | ✅ | Google Places |
| `codigo_postal` | ✅ | Google Places |
| `barrio` | ❌ | Manual |
| `puntuacion` | ❌ | Manual |
| `descripcion_personal` | ❌ | Manual |
| `plato_recomendado` | ❌ | Manual |
| `mejor_para` | ❌ | Manual |
| `tipo_comida` | ❌ | Manual |
| `precio_*` | ❌ | Manual |