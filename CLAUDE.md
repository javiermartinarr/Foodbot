# CLAUDE.md — Foodbot

Guía de referencia para Claude Code al trabajar en este repositorio.

---

## Qué es Foodbot

Aplicación web personal de recomendación de restaurantes, enfocada actualmente en **Madrid**. Javier (el creador) curate la base de datos con sus restaurantes visitados, y los usuarios los pueden explorar de cuatro formas distintas: navegación con filtros, mapa interactivo, colecciones curadas, y chat con IA.

Stack: **React + Vite** (frontend) · **Supabase/PostgreSQL** (base de datos) · **Gemini API** (chat IA) · **Vercel** (deploy + edge functions) · **Tailwind CSS v4** (estilos).

---

## Estructura del proyecto

```
Foodbot/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Router, nav, fetch principal de Supabase
│   │   ├── main.jsx
│   │   ├── index.css                # Tailwind + CSS custom properties (dark mode)
│   │   ├── App.css
│   │   ├── lib/
│   │   │   └── supabase.js          # Cliente Supabase (anon key)
│   │   └── components/
│   │       ├── Explorar.jsx         # Vista grid + filtros
│   │       ├── Mapa.jsx             # Mapa Leaflet con pins
│   │       ├── Chat.jsx             # Chat IA con Gemini
│   │       ├── Destacados.jsx       # Colecciones curadas + Top Picks
│   │       ├── Filters.jsx          # Componente de filtros reutilizable
│   │       ├── RestaurantCard.jsx   # Tarjeta individual de restaurante
│   │       ├── RestaurantModal.jsx  # Modal detalle (usado por todas las vistas)
│   │       ├── RestaurantTable.jsx  # Vista tabla (alternativa a cards)
│   │       └── DarkModeToggle.jsx   # Toggle de tema oscuro/claro
│   ├── api/
│   │   └── chat.js                  # Vercel Edge Function → Gemini API
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   └── migrar_datos.py              # Importación masiva CSV → Supabase
├── foodbot-scripts/
│   └── rellenar-restaurantes.py     # Scripts auxiliares de datos
├── docs/
│   ├── DATABASE_SCHEMA.md
│   └── GUIA_SUPABASE.md
└── env.example
```

---

## Comandos de desarrollo

```bash
# Desde /frontend
npm install          # instalar dependencias
npm run dev          # servidor dev en http://localhost:5173
npm run build        # build de producción
npm run preview      # preview del build
npm run lint         # ESLint
```

---

## Variables de entorno

**`frontend/.env.local`** (cliente Vite — solo anon key, se expone en browser):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel env** (para la Edge Function `/api/chat`):
```
GEMINI_API_KEY=your-gemini-api-key
```

**`/.env`** (solo para scripts Python de migración — service role key, nunca en frontend):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

---

## Arquitectura de datos

### Flujo principal

```
Supabase (SELECT * WHERE activo=true)
  ↓ App.jsx (fetchRestaurantes al montar)
  ↓ restaurantes[] + loading pasados como props a todas las vistas
  ↓ Cada vista filtra/ordena en el cliente (no hay llamadas adicionales a Supabase)

Chat: Chat.jsx envía restaurantes[] + historial + mensaje → /api/chat → Gemini
```

### Tabla `restaurantes` (campos clave)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | Auto-generado |
| nombre | text | |
| slug | text | URL-friendly, auto-generado |
| tipo_comida | text | Española, Italiana, Japonesa… |
| subtipo_comida | text | Más específico |
| tags | text[] | pet-friendly, terraza, brunch… |
| puntuacion | numeric | **Auto-calculado** por trigger PG desde scores individuales |
| ambiente / servicio / rapidez / limpieza / calidad_precio / cantidad | numeric | Scores individuales (1-5) |
| precio_categoria | text | $, $$, $$$, $$$$ |
| precio_min / precio_max | integer | €/persona |
| plato_recomendado | text | |
| descripcion_personal | text | Nota personal de Javier |
| mejor_para | text[] | cita, amigos, familia, brunch, trabajo, solo, celebracion, afterwork |
| destacado | boolean | Aparece en favoritos de Destacados |
| activo | boolean | false = soft delete |
| barrio | text | |
| ciudad | text | |
| latitud / longitud | numeric | Para el mapa |
| google_maps_url | text | |
| url_carta / url_reservas / url_web | text | |
| verificado | boolean | |

**Importante**: nunca enviar `puntuacion` al crear/actualizar — el trigger de la DB lo calcula.

---

## Vistas y funcionalidades

### 1. Explorar (`/`)
Vista principal. Grid de `RestaurantCard` con barra de filtros.

**Filtros (aplicados secuencialmente):**
1. Ciudad — al cambiar, resetea el barrio seleccionado
2. Tipo de comida
3. Barrio — dropdown dinámico filtrado por ciudad activa
4. Precio ($–$$$$)
5. Puntuación mínima (slider o select)
6. Búsqueda por nombre (substring case-insensitive)

**Ordenación:** por puntuación desc (default), nombre A-Z, precio asc/desc.

**RestaurantCard** muestra: nombre, tipo, barrio, precio, puntuación con color, tag de `plato_recomendado`, array de `tags`.

Al hacer clic → abre `RestaurantModal`.

### 2. Mapa (`/mapa`)
Mapa Leaflet centrado en Madrid. Pins con colores por puntuación:
- Verde oscuro: ≥ 4.5
- Verde claro: 4.0–4.5
- Ámbar: 3.5–4.0
- Naranja: 3.0–3.5

Solo se plotean restaurantes con `latitud` y `longitud` definidos. Popup al clicar el pin: nombre, tipo, barrio, puntuación, link a Google Maps y botón "Ver más" que abre `RestaurantModal`.

### 3. Chat (`/chat`)
Interfaz conversacional con IA. El chat usa el contexto completo de restaurantes ya cargado en memoria del cliente.

**Comportamiento:**
- Sin historial: muestra pills de sugerencias de preguntas
- Historial persistido en `localStorage` (key: `foodbot-chat-history`)
- Envía a `/api/chat`: `{ mensaje, historial, restaurantes }`
- El historial se limita a los últimos 10 mensajes para no exceder tokens
- Respuestas en Markdown renderizadas con `react-markdown`
- "Nueva conversación" limpia estado + localStorage

**Edge Function `/api/chat`:**
- Modelo: `gemini-2.5-flash`
- Persona: "Javier el foodie" — solo recomienda restaurantes de la lista, nunca inventa
- Si hay historial previo: usa `systemInstruction` + array `messages`
- Si no hay historial: embebe sistema + datos en el primer prompt de usuario

### 4. Top Picks / Destacados (`/top-picks`)
Colecciones curadas:
- **Sorpréndeme**: botón que abre un restaurante aleatorio con puntuación ≥ 3.5
- **Por categoría**: scrolls horizontales agrupados por valor de `mejor_para` (cita, amigos, familia, etc.)
- **Top 5**: ranking de los 5 mejor puntuados
- **Favoritos**: restaurantes con `destacado: true`

---

## Estilo visual y dark mode

### Sistema de colores

Tailwind v4 con CSS custom properties definidas en `index.css`. Las variables cambian al añadir clase `dark` en `<html>`:

```css
/* Variables clave (modo claro → oscuro) */
--bg-gradient        /* fondo principal: crema → oscuro */
--card-bg            /* fondo tarjeta */
--card-title         /* color título */
--card-subtitle      /* color subtítulo */
--border-color       /* bordes */
--filter-bg          /* fondo barra de filtros */
```

### DarkModeToggle
- Gestiona `<html class="dark">`
- Persiste preferencia en `localStorage` (key: `darkMode`)
- Activo en el header en todas las vistas

### Colores de puntuación (consistentes en todas las vistas)
```
≥ 4.5  → bg-green-200  (verde)
4.0–4.5 → bg-green-100  (verde claro)
3.5–4.0 → bg-amber-200  (ámbar)
3.0–3.5 → bg-orange-200 (naranja)
< 3.0  → bg-gray-200   (gris)
```

---

## RestaurantModal (componente compartido)

Modal detalle usado por Explorar, Mapa y Destacados. Muestra todos los campos del restaurante:
- Cabecera: nombre, tipo, barrio, ciudad, puntuación general
- Scores individuales: ambiente, servicio, rapidez, limpieza, calidad_precio, cantidad
- Info práctica: precio, plato recomendado, descripción personal, tags, mejor_para
- Links: web, carta, reservas, Google Maps, Instagram, teléfono
- Fechas de visita si están disponibles

---

## Patrones y convenciones

### Estado global
No hay store global (Redux/Zustand). `App.jsx` fetchea los restaurantes y los pasa como props a cada ruta. Cada componente gestiona su propio estado local (filtros, modal abierto, etc.).

### Soft delete
`activo=false` excluye el restaurante de todas las queries. La query base en `App.jsx` siempre filtra `activo=true`.

### LocalStorage
Dos entradas:
- `foodbot-chat-history` — array JSON de mensajes del chat
- `darkMode` — boolean del tema

Ambas con try/catch para tolerar errores de cuota.

### Slugs
`slug` = nombre normalizado (minúsculas, sin tildes, guiones). Se genera al crear el restaurante con la función `generar_slug()` del script de migración.

---

## Migración de datos

`scripts/migrar_datos.py` importa desde CSV a Supabase:
1. Lee CSV con columnas: NOMBRE, TIPO DE COMIDA, SUBTIPO, PUNTUACION, PRECIO, etc.
2. Transforma: genera slug, parsea puntuaciones ES (`4,5` → `4.5`), extrae rango de precios, mapea barrios
3. Inserta via service role key

Campos que requieren relleno manual después de migrar: `descripcion_personal`, `mejor_para`, scores individuales, `latitud`/`longitud`.

---

## Deploy

- Frontend + Edge Functions desplegados en **Vercel**
- La Edge Function `api/chat.js` corre en el runtime `edge` de Vercel
- Supabase maneja el hosting de la base de datos y la API REST auto-generada
- RLS en Supabase: `SELECT` público donde `activo=true`; writes solo con service role key
