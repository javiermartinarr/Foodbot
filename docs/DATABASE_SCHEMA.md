# 📊 Schema de Base de Datos - Recomendaciones Gastronómicas

## Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre de la tabla** | `restaurantes` |
| **Base de datos** | PostgreSQL (Supabase) |
| **Versión del schema** | 1.0.0 |
| **Fecha de creación** | 2024-12 |

---

## Descripción

Esta tabla almacena información sobre restaurantes, cafeterías y establecimientos gastronómicos visitados y recomendados. Está diseñada para:

1. Alimentar un mapa interactivo con localizaciones
2. Permitir filtrado por múltiples criterios (zona, precio, tipo...)
3. Proporcionar contexto rico a un chatbot LLM para recomendaciones personalizadas

---

## Campos de la Tabla

### 🔑 Identificación

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | `UUID` | NO | `gen_random_uuid()` | Identificador único universal. UUID en lugar de autoincremental para evitar exponer el número de registros y facilitar migraciones. |

---

### 📝 Información Básica

| Campo | Tipo | Nullable | Default | Constraints | Descripción |
|-------|------|----------|---------|-------------|-------------|
| `nombre` | `VARCHAR(150)` | NO | - | `UNIQUE` | Nombre del establecimiento. Máx 150 caracteres. Debe ser único para evitar duplicados. |
| `slug` | `VARCHAR(160)` | NO | - | `UNIQUE` | Versión URL-friendly del nombre (ej: "beata-pasta"). Se genera automáticamente. Útil para URLs amigables en el futuro. |

---

### 🍕 Categorización Gastronómica

| Campo | Tipo | Nullable | Default | Valores Permitidos | Descripción |
|-------|------|----------|---------|-------------------|-------------|
| `tipo_comida` | `VARCHAR(50)` | NO | - | Ver tabla de tipos | Categoría principal de cocina. |
| `subtipo_comida` | `VARCHAR(50)` | SÍ | `NULL` | Libre | Especialidad dentro del tipo (ej: "Pasta", "Sushi Buffet", "Smash Burgers"). |
| `tags` | `TEXT[]` | SÍ | `'{}'` | Array de strings | Etiquetas adicionales para búsqueda flexible (ej: `{'brunch', 'terraza', 'pet-friendly'}`). |

#### Valores recomendados para `tipo_comida`:

| Valor | Ejemplos de subtipos |
|-------|---------------------|
| `Española` | Tapas, Asador, Cocido, Andaluza, Gallega |
| `Italiana` | Pasta, Pizza, Risotto |
| `Asiática` | Sushi, Tailandesa, China, Vietnamita, Coreana |
| `Americana` | Hamburguesas, BBQ, Tex-Mex |
| `Mexicana` | Tacos, Burritos, Mex |
| `Mediterránea` | Griega, Libanesa, Turca |
| `Francesa` | Bistró, Brasserie |
| `Cafetería` | Specialty Coffee, Brunch, Repostería |
| `Otros` | Fusión, Autor, Internacional |

---

### ⭐ Valoración

| Campo | Tipo | Nullable | Default | Min | Max | Descripción |
|-------|------|----------|---------|-----|-----|-------------|
| `puntuacion` | `DECIMAL(2,1)` | NO | - | 1.0 | 5.0 | Puntuación global del 1 al 5. Permite medios puntos (ej: 4.5). |

#### Escala de puntuación:

| Valor | Significado |
|-------|-------------|
| 5.0 | Excepcional - De mis favoritos absolutos |
| 4.5 | Excelente - Muy recomendable |
| 4.0 | Muy bueno - Merece la pena |
| 3.5 | Bueno - Cumple bien |
| 3.0 | Correcto - Nada especial |
| 2.5 | Regular - Solo si no hay alternativa |
| 2.0 | Flojo - No repetiría |
| 1.0-1.5 | Malo - Evitar |

---

### 💰 Precio

| Campo | Tipo | Nullable | Default | Valores/Rango | Descripción |
|-------|------|----------|---------|---------------|-------------|
| `precio_categoria` | `VARCHAR(4)` | NO | - | `$`, `$$`, `$$$`, `$$$$` | Categoría de precio visual e intuitiva. |
| `precio_min` | `INTEGER` | SÍ | `NULL` | 5 - 200 | Precio mínimo aproximado por persona en euros. |
| `precio_max` | `INTEGER` | SÍ | `NULL` | 5 - 200 | Precio máximo aproximado por persona en euros. |

#### Escala de `precio_categoria`:

| Valor | Rango aprox. | Descripción |
|-------|--------------|-------------|
| `$` | 5-15€ | Económico / Fast casual |
| `$$` | 15-25€ | Precio medio |
| `$$$` | 25-40€ | Precio alto |
| `$$$$` | 40€+ | Premium / Fine dining |

---

### 🍽️ Recomendación Personal

| Campo | Tipo | Nullable | Default | Max Length | Descripción |
|-------|------|----------|---------|------------|-------------|
| `plato_recomendado` | `VARCHAR(200)` | SÍ | `NULL` | 200 | Plato(s) que hay que pedir sí o sí. Puede incluir varios separados por `/`. |
| `descripcion_personal` | `TEXT` | SÍ | `NULL` | ~1000 | **Campo clave para el LLM.** Tu opinión personal, tips, historia, por qué te gusta. Escrito en tu voz. |
| `mejor_para` | `TEXT[]` | SÍ | `'{}'` | - | Array con ocasiones ideales. |

#### Valores recomendados para `mejor_para`:

```
'cita'          - Romántico, ambiente íntimo
'amigos'        - Grupos, ambiente animado  
'familia'       - Apto para niños, cómodo
'trabajo'       - Comidas de negocio, discreto
'solo'          - Barra, servicio rápido
'celebracion'   - Cumpleaños, ocasiones especiales
'afterwork'     - Copas y picoteo
'brunch'        - Fines de semana, mañanas
'takeaway'      - Para llevar
'delivery'      - A domicilio
```

---

### 🏠 Ambiente y Experiencia

| Campo | Tipo | Nullable | Default | Valores Permitidos | Descripción |
|-------|------|----------|---------|-------------------|-------------|
| `ambiente` | `VARCHAR(30)` | NO | `'Informal'` | `Informal`, `Formal`, `Casual`, `Animado`, `Íntimo`, `Terraza` | Ambiente general del local. |
| `acepta_reservas` | `BOOLEAN` | NO | `FALSE` | `TRUE`, `FALSE` | Si se puede/debe reservar. |
| `requiere_reserva` | `BOOLEAN` | NO | `FALSE` | `TRUE`, `FALSE` | Si es muy recomendable/obligatorio reservar con antelación. |

---

### 📍 Ubicación

| Campo | Tipo | Nullable | Default | Rango/Formato | Descripción |
|-------|------|----------|---------|---------------|-------------|
| `direccion` | `VARCHAR(255)` | NO | - | - | Dirección completa (calle y número). |
| `barrio` | `VARCHAR(50)` | NO | - | - | Barrio o zona reconocible (ej: "Malasaña", "Salamanca", "Chamberí"). |
| `ciudad` | `VARCHAR(50)` | NO | `'Madrid'` | - | Ciudad. |
| `pais` | `VARCHAR(50)` | NO | `'España'` | - | País (para expansión futura). |
| `codigo_postal` | `VARCHAR(10)` | SÍ | `NULL` | - | CP para geolocalización más precisa. |
| `latitud` | `DECIMAL(10,7)` | SÍ | `NULL` | -90 a 90 | Coordenada latitud para el mapa. 7 decimales = precisión ~1cm. |
| `longitud` | `DECIMAL(10,7)` | SÍ | `NULL` | -180 a 180 | Coordenada longitud para el mapa. |
| `google_maps_url` | `VARCHAR(500)` | SÍ | `NULL` | URL válida | Link directo a Google Maps para el usuario. |

#### Barrios de Madrid (valores sugeridos):

```
Centro: Sol, Gran Vía, Ópera, La Latina, Lavapiés, Huertas
Chamberí: Chamberí, Trafalgar, Alonso Cano
Salamanca: Salamanca, Recoletos, Goya, Lista
Retiro: Retiro, Ibiza, Niño Jesús
Malasaña-Chueca: Malasaña, Chueca, Tribunal
Chamartín: Chamartín, Colombia, Prosperidad
Tetuán: Tetuán, Cuatro Caminos, Estrecho
Arganzuela: Arganzuela, Legazpi, Delicias
Otros: Moncloa, Argüelles, Ciudad Lineal, Hortaleza...
```

---

### 🔗 Enlaces y Referencias

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `url_web` | `VARCHAR(500)` | SÍ | `NULL` | Web oficial del restaurante. |
| `url_carta` | `VARCHAR(500)` | SÍ | `NULL` | Link directo a la carta/menú. |
| `url_reservas` | `VARCHAR(500)` | SÍ | `NULL` | Link a plataforma de reservas (ElTenedor, Resy, etc.). |
| `telefono` | `VARCHAR(20)` | SÍ | `NULL` | Teléfono de contacto. Formato: "+34 XXX XXX XXX". |
| `instagram` | `VARCHAR(100)` | SÍ | `NULL` | Handle de Instagram sin @. |

---

### 📅 Metadatos Temporales

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `fecha_primera_visita` | `DATE` | SÍ | `NULL` | Cuándo lo visitaste por primera vez. |
| `fecha_ultima_visita` | `DATE` | SÍ | `NULL` | Última vez que fuiste. Útil para el LLM ("hace tiempo que no voy"). |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de creación del registro. Automático. |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Timestamp de última modificación. Se actualiza automáticamente con trigger. |

---

### 🎛️ Control y Estado

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `activo` | `BOOLEAN` | NO | `TRUE` | Soft delete. Si está a FALSE, no aparece en búsquedas pero se mantiene el histórico. |
| `destacado` | `BOOLEAN` | NO | `FALSE` | Para marcar favoritos especiales que aparezcan en sección "Top Picks". |
| `verificado` | `BOOLEAN` | NO | `FALSE` | Si has verificado recientemente que sigue abierto y la info es correcta. |

---

## Índices Recomendados

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_restaurantes_ciudad ON restaurantes(ciudad);
CREATE INDEX idx_restaurantes_barrio ON restaurantes(barrio);
CREATE INDEX idx_restaurantes_tipo ON restaurantes(tipo_comida);
CREATE INDEX idx_restaurantes_precio ON restaurantes(precio_categoria);
CREATE INDEX idx_restaurantes_puntuacion ON restaurantes(puntuacion DESC);

-- Filtro compuesto común
CREATE INDEX idx_restaurantes_ciudad_tipo_precio ON restaurantes(ciudad, tipo_comida, precio_categoria);

-- Para el mapa (geoespacial)
CREATE INDEX idx_restaurantes_coords ON restaurantes(latitud, longitud) WHERE latitud IS NOT NULL;

-- Para búsqueda de texto en descripción
CREATE INDEX idx_restaurantes_descripcion_gin ON restaurantes USING GIN(to_tsvector('spanish', descripcion_personal));
```

---

## Constraints y Validaciones

```sql
-- Puntuación entre 1 y 5
ALTER TABLE restaurantes ADD CONSTRAINT chk_puntuacion 
  CHECK (puntuacion >= 1.0 AND puntuacion <= 5.0);

-- Precio mínimo menor o igual que máximo
ALTER TABLE restaurantes ADD CONSTRAINT chk_precio_rango 
  CHECK (precio_min IS NULL OR precio_max IS NULL OR precio_min <= precio_max);

-- Precio en rango razonable
ALTER TABLE restaurantes ADD CONSTRAINT chk_precio_valores 
  CHECK (precio_min IS NULL OR (precio_min >= 5 AND precio_min <= 200));
ALTER TABLE restaurantes ADD CONSTRAINT chk_precio_max_valores 
  CHECK (precio_max IS NULL OR (precio_max >= 5 AND precio_max <= 200));

-- Latitud válida
ALTER TABLE restaurantes ADD CONSTRAINT chk_latitud 
  CHECK (latitud IS NULL OR (latitud >= -90 AND latitud <= 90));

-- Longitud válida
ALTER TABLE restaurantes ADD CONSTRAINT chk_longitud 
  CHECK (longitud IS NULL OR (longitud >= -180 AND longitud <= 180));

-- Precio categoría válido
ALTER TABLE restaurantes ADD CONSTRAINT chk_precio_categoria 
  CHECK (precio_categoria IN ('$', '$$', '$$$', '$$$$'));
```

---

## Ejemplo de Registro Completo

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nombre": "Thai Garden",
  "slug": "thai-garden",
  "tipo_comida": "Asiática",
  "subtipo_comida": "Tailandesa",
  "tags": ["picante", "auténtico", "terraza"],
  "puntuacion": 5.0,
  "precio_categoria": "$$$$",
  "precio_min": 25,
  "precio_max": 40,
  "plato_recomendado": "Nua Kratiam / Khao Soi",
  "descripcion_personal": "El mejor tailandés de Madrid sin discusión. Llevo yendo años y nunca me ha decepcionado. El Khao Soi es brutal, curry del norte de Tailandia que no encuentras en ningún otro sitio. Pide nivel de picante 'Thai style' si te atreves. La terraza en verano es un planazo.",
  "mejor_para": ["cita", "celebracion", "amigos"],
  "ambiente": "Formal",
  "acepta_reservas": true,
  "requiere_reserva": true,
  "direccion": "Calle Añastro, 6",
  "barrio": "Arturo Soria",
  "ciudad": "Madrid",
  "pais": "España",
  "codigo_postal": "28033",
  "latitud": 40.4567890,
  "longitud": -3.6234567,
  "google_maps_url": "https://maps.google.com/?q=Thai+Garden+Madrid",
  "url_web": "https://thaiemotion.es",
  "url_carta": "https://thaiemotion.es/carta",
  "url_reservas": "https://www.eltenedor.es/restaurante/thai-garden",
  "telefono": "+34 915 123 456",
  "instagram": "thaigardenmd",
  "fecha_primera_visita": "2019-06-15",
  "fecha_ultima_visita": "2024-10-20",
  "created_at": "2024-12-01T10:30:00Z",
  "updated_at": "2024-12-01T10:30:00Z",
  "activo": true,
  "destacado": true,
  "verificado": true
}
```

---

## Mapeo desde CSV Original

| Campo CSV Original | → | Campo Nuevo | Transformación Necesaria |
|-------------------|---|-------------|-------------------------|
| NOMBRE | → | `nombre` | Directo |
| - | → | `slug` | Generar desde nombre |
| TIPO DE COMIDA | → | `tipo_comida` | Normalizar tildes |
| SUBTIPO DE COMIDA | → | `subtipo_comida` | Directo |
| PUNTUACION | → | `puntuacion` | Cambiar coma por punto |
| PRECIO | → | `precio_categoria` | Directo |
| PRECIO x PERSONA | → | `precio_min`, `precio_max` | Parsear "15-20" → 15, 20 |
| PLATO RECOMENDADO | → | `plato_recomendado` | Directo |
| AMBIENTE | → | `ambiente` | Directo |
| LINK (CARTA) | → | `url_carta` | Limpiar, convertir a URL |
| RESERVAS | → | `acepta_reservas` | TRUE/FALSE → boolean |
| DIRECCION | → | `direccion`, `barrio` | Separar y enriquecer |
| CIUDAD | → | `ciudad` | Directo |
| - | → | `latitud`, `longitud` | Geocoding API |
| - | → | `descripcion_personal` | **Añadir manualmente** |
| - | → | `mejor_para` | **Añadir manualmente** |

---

## Notas de Implementación

### Para Supabase:

1. Los arrays (`tags`, `mejor_para`) se manejan nativamente en PostgreSQL como `TEXT[]`.
2. Supabase auto-genera la API REST, podrás hacer queries tipo:
   ```
   GET /restaurantes?ciudad=eq.Madrid&tipo_comida=eq.Italiana&puntuacion=gte.4
   ```
3. El trigger para `updated_at` se configura en Supabase con una función.

### Para el LLM:

Los campos más importantes para el chatbot son:
- `descripcion_personal` (tu voz y opinión)
- `mejor_para` (contexto de ocasión)
- `plato_recomendado` (qué pedir)
- `puntuacion` (tu valoración)

### Para el Mapa:

Campos esenciales:
- `latitud`, `longitud` (posición)
- `nombre` (tooltip)
- `tipo_comida` (color/icono del marcador)
- `puntuacion` (tamaño del marcador opcional)

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2024-12 | Schema inicial |

