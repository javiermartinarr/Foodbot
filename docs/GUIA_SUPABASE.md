# 🗄️ Guía de Supabase - De Cero a Base de Datos

## ¿Qué es Supabase?

Supabase es una alternativa open-source a Firebase. En términos simples, es un servicio que te da:

1. **Base de datos PostgreSQL** → Donde viven tus datos
2. **API REST automática** → Para acceder a los datos desde tu web
3. **Autenticación** → Login de usuarios (no lo usaremos ahora)
4. **Storage** → Para archivos (fotos, etc.)
5. **Interfaz visual** → Para ver y editar datos como en Excel

### ¿Por qué Supabase y no otra cosa?

| Alternativa | Por qué NO para este proyecto |
|-------------|------------------------------|
| Firebase | NoSQL (menos potente para filtros complejos), vendor lock-in con Google |
| MongoDB Atlas | NoSQL, más complejo para datos relacionales |
| PlanetScale | MySQL en vez de PostgreSQL, tier gratis más limitado |
| Railway/Render | Requieren más configuración manual |
| JSON en el repo | No escala, no tiene interfaz de edición |

**Supabase gana porque:**
- PostgreSQL es el estándar de la industria (muy valioso para CV)
- Tier gratuito muy generoso (500MB, suficiente para miles de restaurantes)
- API REST automática = no necesitas escribir backend
- Interfaz visual para editar datos = no dependes de código para añadir restaurantes

---

## Paso 1: Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project" o "Sign Up"
3. **Registrate con GitHub** (recomendado) o con email
4. Autoriza el acceso si usas GitHub

---

## Paso 2: Crear un nuevo proyecto

1. Una vez dentro, click en **"New Project"**
2. Rellena los campos:

| Campo | Qué poner |
|-------|-----------|
| **Organization** | Tu nombre o "Personal" (se crea automático) |
| **Project name** | `foodie-madrid` (o como quieras llamarlo) |
| **Database Password** | Genera una segura y **GUÁRDALA** (la necesitarás) |
| **Region** | `West EU (Ireland)` - el más cercano a España |
| **Pricing Plan** | Free (0$/month) |

3. Click en **"Create new project"**
4. Espera 1-2 minutos mientras se aprovisiona

---

## Paso 3: Familiarizarte con la interfaz

Una vez creado el proyecto, verás el dashboard. Las secciones importantes:

```
┌─────────────────────────────────────────────────────────────┐
│  MENÚ LATERAL                                                │
├─────────────────────────────────────────────────────────────┤
│  🏠 Home          → Resumen del proyecto                    │
│  📊 Table Editor  → Ver/editar datos (como Excel) ⭐        │
│  🔲 SQL Editor    → Ejecutar SQL directamente ⭐            │
│  🔐 Authentication→ Gestión de usuarios (no lo usamos)      │
│  📦 Storage       → Archivos (no lo usamos ahora)           │
│  ⚡ Edge Functions→ Código serverless (no lo usamos)        │
│  📋 API Docs      → Documentación auto-generada ⭐          │
│  ⚙️ Settings      → Configuración, API keys ⭐              │
└─────────────────────────────────────────────────────────────┘
```

---

## Paso 4: Crear la tabla de restaurantes

### Opción A: Usando SQL Editor (recomendada para aprender)

1. Ve a **SQL Editor** en el menú lateral
2. Click en **"New query"**
3. Pega el siguiente SQL:

```sql
-- ============================================
-- TABLA PRINCIPAL: restaurantes
-- ============================================

CREATE TABLE restaurantes (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(160) NOT NULL UNIQUE,
    
    -- Categorización
    tipo_comida VARCHAR(50) NOT NULL,
    subtipo_comida VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    -- Puntuaciones individuales (1.0 - 5.0)
    punt_ambiente DECIMAL(2,1) CHECK (punt_ambiente IS NULL OR (punt_ambiente >= 1.0 AND punt_ambiente <= 5.0)),
    punt_servicio DECIMAL(2,1) CHECK (punt_servicio IS NULL OR (punt_servicio >= 1.0 AND punt_servicio <= 5.0)),
    punt_rapidez DECIMAL(2,1) CHECK (punt_rapidez IS NULL OR (punt_rapidez >= 1.0 AND punt_rapidez <= 5.0)),
    punt_limpieza DECIMAL(2,1) CHECK (punt_limpieza IS NULL OR (punt_limpieza >= 1.0 AND punt_limpieza <= 5.0)),
    punt_calidad_precio DECIMAL(2,1) CHECK (punt_calidad_precio IS NULL OR (punt_calidad_precio >= 1.0 AND punt_calidad_precio <= 5.0)),
    punt_cantidad DECIMAL(2,1) CHECK (punt_cantidad IS NULL OR (punt_cantidad >= 1.0 AND punt_cantidad <= 5.0)),
    
    -- Puntuación calculada (se actualiza automáticamente)
    puntuacion DECIMAL(2,1) CHECK (puntuacion IS NULL OR (puntuacion >= 1.0 AND puntuacion <= 5.0)),
    
    -- Precio
    precio_categoria VARCHAR(4) NOT NULL CHECK (precio_categoria IN ('$', '$$', '$$$', '$$$$')),
    precio_min INTEGER CHECK (precio_min IS NULL OR (precio_min >= 5 AND precio_min <= 200)),
    precio_max INTEGER CHECK (precio_max IS NULL OR (precio_max >= 5 AND precio_max <= 200)),
    
    -- Recomendación personal
    plato_recomendado VARCHAR(200),
    descripcion_personal TEXT,
    mejor_para TEXT[] DEFAULT '{}',
    
    -- Ambiente
    ambiente VARCHAR(30) DEFAULT 'Informal',
    acepta_reservas BOOLEAN DEFAULT FALSE,
    requiere_reserva BOOLEAN DEFAULT FALSE,
    
    -- Ubicación
    direccion VARCHAR(255) NOT NULL,
    barrio VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) DEFAULT 'Madrid',
    pais VARCHAR(50) DEFAULT 'España',
    codigo_postal VARCHAR(10),
    latitud DECIMAL(10,7) CHECK (latitud IS NULL OR (latitud >= -90 AND latitud <= 90)),
    longitud DECIMAL(10,7) CHECK (longitud IS NULL OR (longitud >= -180 AND longitud <= 180)),
    google_maps_url VARCHAR(500),
    
    -- Enlaces
    url_web VARCHAR(500),
    url_carta VARCHAR(500),
    url_reservas VARCHAR(500),
    telefono VARCHAR(20),
    instagram VARCHAR(100),
    
    -- Metadatos temporales
    fecha_primera_visita DATE,
    fecha_ultima_visita DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Control
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    verificado BOOLEAN DEFAULT FALSE,
    
    -- Constraint adicional
    CONSTRAINT chk_precio_rango CHECK (precio_min IS NULL OR precio_max IS NULL OR precio_min <= precio_max)
);

-- ============================================
-- FUNCIÓN: Calcular puntuación automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION calcular_puntuacion()
RETURNS TRIGGER AS $$
DECLARE
    suma DECIMAL;
    contador INTEGER;
BEGIN
    suma := 0;
    contador := 0;
    
    IF NEW.punt_ambiente IS NOT NULL THEN
        suma := suma + NEW.punt_ambiente;
        contador := contador + 1;
    END IF;
    
    IF NEW.punt_servicio IS NOT NULL THEN
        suma := suma + NEW.punt_servicio;
        contador := contador + 1;
    END IF;
    
    IF NEW.punt_rapidez IS NOT NULL THEN
        suma := suma + NEW.punt_rapidez;
        contador := contador + 1;
    END IF;
    
    IF NEW.punt_limpieza IS NOT NULL THEN
        suma := suma + NEW.punt_limpieza;
        contador := contador + 1;
    END IF;
    
    IF NEW.punt_calidad_precio IS NOT NULL THEN
        suma := suma + NEW.punt_calidad_precio;
        contador := contador + 1;
    END IF;
    
    IF NEW.punt_cantidad IS NOT NULL THEN
        suma := suma + NEW.punt_cantidad;
        contador := contador + 1;
    END IF;
    
    IF contador > 0 THEN
        NEW.puntuacion := ROUND(suma / contador, 1);
    ELSE
        NEW.puntuacion := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Ejecutar cálculo en INSERT/UPDATE
-- ============================================

CREATE TRIGGER trigger_calcular_puntuacion
    BEFORE INSERT OR UPDATE ON restaurantes
    FOR EACH ROW
    EXECUTE FUNCTION calcular_puntuacion();

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
    BEFORE UPDATE ON restaurantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ÍNDICES para búsquedas rápidas
-- ============================================

CREATE INDEX idx_restaurantes_ciudad ON restaurantes(ciudad);
CREATE INDEX idx_restaurantes_barrio ON restaurantes(barrio);
CREATE INDEX idx_restaurantes_tipo ON restaurantes(tipo_comida);
CREATE INDEX idx_restaurantes_precio ON restaurantes(precio_categoria);
CREATE INDEX idx_restaurantes_puntuacion ON restaurantes(puntuacion DESC);
CREATE INDEX idx_restaurantes_activo ON restaurantes(activo);
CREATE INDEX idx_restaurantes_ciudad_tipo_precio ON restaurantes(ciudad, tipo_comida, precio_categoria);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (cualquiera puede ver los restaurantes)
CREATE POLICY "Lectura pública de restaurantes" 
    ON restaurantes 
    FOR SELECT 
    USING (activo = true);

-- Para INSERT/UPDATE/DELETE necesitarás autenticación (lo configuramos después)
-- Por ahora, permitimos todo desde el service_role (tu script de migración)
CREATE POLICY "Acceso total para service role" 
    ON restaurantes 
    FOR ALL 
    USING (true)
    WITH CHECK (true);
```

4. Click en **"Run"** (o Ctrl+Enter)
5. Deberías ver "Success. No rows returned" - eso es correcto

### Verificar que se creó bien:

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver la tabla `restaurantes`
3. Click en ella para ver las columnas (estará vacía)

---

## Paso 5: Obtener las credenciales de API

Para conectar tu script de Python con Supabase:

1. Ve a **Settings** (icono engranaje) → **API**
2. Encontrarás:

| Dato | Dónde está | Para qué |
|------|------------|----------|
| **Project URL** | Arriba del todo | URL base de tu API |
| **anon public** | En "Project API keys" | Para lectura pública desde el frontend |
| **service_role** | En "Project API keys" | Para escritura desde scripts (¡NUNCA expongas este!) |

3. **Copia estos valores** y guárdalos en un lugar seguro

Tu URL será algo como:
```
https://xyzabc123.supabase.co
```

---

## Paso 6: Estructura de archivos para el proyecto

Crea esta estructura en tu ordenador:

```
foodie-madrid/
├── .env                    # Variables de entorno (credenciales)
├── .gitignore              # Para no subir credenciales a GitHub
├── scripts/
│   └── migrar_datos.py     # Script de migración
├── data/
│   └── restaurantes.csv    # Tu CSV exportado de Google Sheets
└── docs/
    ├── DATABASE_SCHEMA.md  # El documento que ya tienes
    └── GUIA_SUPABASE.md    # Esta guía
```

### Archivo .env (NUNCA subir a GitHub):

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_service_role_key_aqui
```

### Archivo .gitignore:

```gitignore
# Credenciales
.env
*.env

# Python
__pycache__/
*.pyc
.venv/
venv/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## Conceptos importantes que has aprendido

### 🔑 Row Level Security (RLS)

PostgreSQL permite definir "políticas" que controlan quién puede ver/editar qué filas. En nuestro caso:
- **Lectura pública**: Cualquiera puede ver restaurantes activos
- **Escritura restringida**: Solo tú (con la service_role key) puedes añadir/editar

### 🔄 Triggers

Son "ganchos" que ejecutan código automáticamente cuando ocurre algo en la base de datos:
- `trigger_calcular_puntuacion`: Recalcula la media cuando cambias una puntuación
- `trigger_updated_at`: Actualiza la fecha de modificación automáticamente

### 📇 Índices

Son como el índice de un libro: permiten encontrar datos más rápido. Sin índices, PostgreSQL tendría que revisar TODAS las filas para cada búsqueda.

---

## Próximos pasos

1. ✅ Crear cuenta en Supabase
2. ✅ Crear proyecto
3. ✅ Ejecutar el SQL para crear la tabla
4. ✅ Copiar las credenciales
5. ⏳ Ejecutar el script de migración (siguiente documento)

---

## Troubleshooting común

### "permission denied for table restaurantes"
→ Asegúrate de usar la key `service_role`, no la `anon`

### "duplicate key value violates unique constraint"
→ Estás intentando insertar un restaurante que ya existe (mismo nombre o slug)

### "new row violates check constraint"
→ Algún valor está fuera de rango (ej: puntuación de 6.0)

### La tabla no aparece en Table Editor
→ Refresca la página (F5) o revisa si el SQL dio error

