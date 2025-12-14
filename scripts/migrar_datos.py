"""
Script de Migración: Google Sheets CSV → Supabase

Este script lee tu CSV exportado de Google Sheets y lo sube a Supabase,
transformando los datos al nuevo formato del schema.

Requisitos:
    pip install supabase python-dotenv

Uso:
    python scripts/migrar_datos.py

Autor: Tu nombre
Fecha: 2024-12
"""

import os
import csv
import re
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# ============================================
# CONFIGURACIÓN
# ============================================

# Cargar variables de entorno desde .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Usa service_role, NO anon

# Ruta al CSV (ajusta según tu estructura)
CSV_PATH = "data/restaurantes.csv"

# ============================================
# FUNCIONES DE TRANSFORMACIÓN
# ============================================

def generar_slug(nombre: str) -> str:
    """
    Convierte un nombre a formato URL-friendly (slug).
    
    Ejemplo: "Thai Garden (thai emotion)" → "thai-garden-thai-emotion"
    
    ¿Qué es un slug?
    Es una versión "limpia" del nombre para usar en URLs.
    Sin espacios, sin caracteres especiales, todo en minúsculas.
    """
    # Convertir a minúsculas
    slug = nombre.lower()
    
    # Reemplazar caracteres especiales españoles
    reemplazos = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ñ': 'n', 'ü': 'u'
    }
    for original, reemplazo in reemplazos.items():
        slug = slug.replace(original, reemplazo)
    
    # Reemplazar cualquier caracter no alfanumérico por guión
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    
    # Eliminar guiones al inicio y final
    slug = slug.strip('-')
    
    # Eliminar guiones duplicados
    slug = re.sub(r'-+', '-', slug)
    
    return slug


def parsear_precio_rango(precio_str: str) -> tuple[Optional[int], Optional[int]]:
    """
    Convierte el string de precio a min/max.
    
    Ejemplos:
        "15-20" → (15, 20)
        "25+" → (25, None)
        "10-15" → (10, 15)
        "" → (None, None)
    """
    if not precio_str or precio_str.strip() == "":
        return None, None
    
    precio_str = precio_str.strip()
    
    # Caso "25+"
    if precio_str.endswith('+'):
        try:
            precio_min = int(precio_str.replace('+', ''))
            return precio_min, None
        except ValueError:
            return None, None
    
    # Caso "15-20"
    if '-' in precio_str:
        partes = precio_str.split('-')
        try:
            precio_min = int(partes[0].strip())
            precio_max = int(partes[1].strip())
            return precio_min, precio_max
        except (ValueError, IndexError):
            return None, None
    
    # Caso número solo "15"
    try:
        precio = int(precio_str)
        return precio, precio
    except ValueError:
        return None, None


def parsear_puntuacion(punt_str: str) -> Optional[float]:
    """
    Convierte la puntuación de string a float.
    
    Maneja tanto coma como punto decimal (formato español vs inglés).
    
    Ejemplos:
        "4,5" → 4.5
        "4.5" → 4.5
        "4" → 4.0
        "" → None
    """
    if not punt_str or punt_str.strip() == "":
        return None
    
    # Reemplazar coma por punto (formato español)
    punt_str = punt_str.strip().replace(',', '.')
    
    try:
        puntuacion = float(punt_str)
        # Validar rango
        if 1.0 <= puntuacion <= 5.0:
            return puntuacion
        else:
            print(f"  ⚠️ Puntuación fuera de rango: {puntuacion}")
            return None
    except ValueError:
        return None


def parsear_boolean(valor: str) -> bool:
    """
    Convierte strings tipo "TRUE"/"FALSE" a boolean de Python.
    """
    if not valor:
        return False
    return valor.strip().upper() in ('TRUE', 'SI', 'SÍ', '1', 'YES')


def limpiar_url(url_str: str) -> Optional[str]:
    """
    Limpia y valida URLs.
    
    Si el campo contiene solo texto (no una URL), devuelve None.
    En el futuro podrías buscar la URL real del restaurante.
    """
    if not url_str or url_str.strip() == "":
        return None
    
    url_str = url_str.strip()
    
    # Si ya es una URL válida
    if url_str.startswith('http://') or url_str.startswith('https://'):
        return url_str
    
    # Si parece un dominio
    if '.' in url_str and ' ' not in url_str:
        return f"https://{url_str}"
    
    # Si es solo texto (ej: "Beata Pasta"), no es una URL
    # Podrías hacer web scraping aquí para encontrar la URL real
    return None


def extraer_barrio(direccion: str) -> str:
    """
    Intenta extraer el barrio de la dirección.
    
    Tu CSV tiene direcciones tipo "Metro Bilbao" o "Chueca - Tribunal".
    Esta función intenta normalizar eso.
    
    TODO: Mejorar esta lógica según tus datos reales.
    """
    if not direccion:
        return "Sin especificar"
    
    direccion = direccion.strip()
    
    # Mapeo de metros/zonas a barrios
    mapeo_barrios = {
        'bilbao': 'Chamberí',
        'diego de leon': 'Salamanca',
        'diego de león': 'Salamanca',
        'velazquez': 'Salamanca',
        'velázquez': 'Salamanca',
        'nuñez de balboa': 'Salamanca',
        'núñez de balboa': 'Salamanca',
        'chueca': 'Chueca',
        'tribunal': 'Malasaña',
        'gran via': 'Centro',
        'gran vía': 'Centro',
        'sol': 'Centro',
        'opera': 'Centro',
        'ópera': 'Centro',
        'noviciado': 'Malasaña',
        'callao': 'Centro',
        'plaza de españa': 'Centro',
        'arguelles': 'Argüelles',
        'argüelles': 'Argüelles',
        'moncloa': 'Moncloa',
        'colombia': 'Chamartín',
        'cuzco': 'Chamartín',
        'santiago bernabeu': 'Chamartín',
        'bernabeu': 'Chamartín',
        'arturo soria': 'Ciudad Lineal',
        'ibiza': 'Retiro',
        'goya': 'Salamanca',
        'serrano': 'Salamanca',
        'hermosilla': 'Salamanca',
        'alberto alcocer': 'Chamartín',
        'concha espina': 'Chamartín',
        'la latina': 'La Latina',
        'lavapies': 'Lavapiés',
        'lavapiés': 'Lavapiés',
        'huertas': 'Huertas',
        'anton martin': 'Lavapiés',
        'antón martín': 'Lavapiés',
        'atocha': 'Centro',
        'legazpi': 'Arganzuela',
        'delicias': 'Arganzuela',
        'fuencarral': 'Chamberí',
        'alonso cano': 'Chamberí',
        'rios rosas': 'Chamberí',
        'ríos rosas': 'Chamberí',
        'cuatro caminos': 'Tetuán',
        'estrecho': 'Tetuán',
        'tetuan': 'Tetuán',
        'tetuán': 'Tetuán',
        'prosperidad': 'Prosperidad',
        'alfonso xiii': 'Prosperidad',
        'campo de las naciones': 'Hortaleza',
        'alcobendas': 'Alcobendas',
        'moraleja': 'Alcobendas',
    }
    
    direccion_lower = direccion.lower()
    
    for clave, barrio in mapeo_barrios.items():
        if clave in direccion_lower:
            return barrio
    
    # Si no encuentra, devolver la dirección original como barrio
    # (mejor que nada, lo puedes corregir manualmente después)
    return direccion


def normalizar_tipo_comida(tipo: str) -> str:
    """
    Normaliza el tipo de comida (tildes, capitalización).
    """
    if not tipo:
        return "Otros"
    
    tipo = tipo.strip()
    
    normalizaciones = {
        'asiatica': 'Asiática',
        'italiana': 'Italiana',
        'americana': 'Americana',
        'mexicana': 'Mexicana',
        'española': 'Española',
        'espanola': 'Española',
        'libanesa': 'Libanesa',
        'mediterranea': 'Mediterránea',
        'francesa': 'Francesa',
        'cafeteria': 'Cafetería',
    }
    
    tipo_lower = tipo.lower()
    return normalizaciones.get(tipo_lower, tipo.capitalize())


# ============================================
# FUNCIÓN PRINCIPAL DE TRANSFORMACIÓN
# ============================================

def transformar_fila(fila: dict) -> Optional[dict]:
    """
    Transforma una fila del CSV al formato de Supabase.
    
    Recibe un diccionario con las columnas del CSV y devuelve
    un diccionario listo para insertar en Supabase.
    """
    nombre = fila.get('NOMBRE', '').strip()
    
    # Saltar filas vacías
    if not nombre:
        return None
    
    # Parsear valores
    precio_min, precio_max = parsear_precio_rango(fila.get('PRECIO x PERSONA', ''))
    puntuacion_original = parsear_puntuacion(fila.get('PUNTUACION', ''))
    
    # Construir el registro para Supabase
    registro = {
        # Identificación
        'nombre': nombre,
        'slug': generar_slug(nombre),
        
        # Categorización
        'tipo_comida': normalizar_tipo_comida(fila.get('TIPO DE COMIDA', '')),
        'subtipo_comida': fila.get('SUBTIPO DE COMIDA', '').strip() or None,
        'tags': [],  # Lo rellenarás manualmente después
        
        # Puntuaciones - Por ahora ponemos la original en calidad_precio
        # y dejamos las demás vacías para que las rellenes
        'punt_ambiente': None,
        'punt_servicio': None,
        'punt_rapidez': None,
        'punt_limpieza': None,
        'punt_calidad_precio': puntuacion_original,  # Usamos la puntuación original aquí temporalmente
        'punt_cantidad': None,
        # 'puntuacion' se calculará automáticamente por el trigger
        
        # Precio
        'precio_categoria': fila.get('PRECIO', '$$').strip() or '$$',
        'precio_min': precio_min,
        'precio_max': precio_max,
        
        # Recomendación
        'plato_recomendado': fila.get('PLATO RECOMENDADO', '').strip() or None,
        'descripcion_personal': None,  # Lo rellenarás manualmente
        'mejor_para': [],  # Lo rellenarás manualmente
        
        # Ambiente
        'ambiente': fila.get('AMBIENTE', 'Informal').strip() or 'Informal',
        'acepta_reservas': parsear_boolean(fila.get('RESERVAS', '')),
        'requiere_reserva': False,  # Lo ajustarás manualmente
        
        # Ubicación
        'direccion': fila.get('DIRECCION', '').strip() or 'Sin especificar',
        'barrio': extraer_barrio(fila.get('DIRECCION', '')),
        'ciudad': fila.get('CIUDAD', 'Madrid').strip() or 'Madrid',
        'pais': 'España',
        'codigo_postal': None,  # Lo añadirás después
        'latitud': None,  # Lo añadirás después (geocoding)
        'longitud': None,  # Lo añadirás después (geocoding)
        'google_maps_url': None,  # Lo añadirás después
        
        # Enlaces
        'url_web': None,
        'url_carta': limpiar_url(fila.get('LINK (CARTA)', '')),
        'url_reservas': None,
        'telefono': None,
        'instagram': None,
        
        # Metadatos
        'fecha_primera_visita': None,
        'fecha_ultima_visita': None,
        
        # Control
        'activo': True,
        'destacado': False,
        'verificado': False,
    }
    
    return registro


# ============================================
# CONEXIÓN Y SUBIDA A SUPABASE
# ============================================

def conectar_supabase() -> Client:
    """
    Crea y devuelve un cliente de Supabase.
    
    ¿Qué es un "cliente"?
    Es un objeto que mantiene la conexión con Supabase y te permite
    hacer operaciones (insertar, leer, actualizar, borrar).
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "❌ Faltan las credenciales de Supabase.\n"
            "   Asegúrate de tener un archivo .env con:\n"
            "   SUPABASE_URL=https://tu-proyecto.supabase.co\n"
            "   SUPABASE_KEY=tu_service_role_key"
        )
    
    print(f"🔌 Conectando a Supabase: {SUPABASE_URL}")
    cliente = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Conexión establecida")
    
    return cliente


def subir_restaurante(cliente: Client, restaurante: dict) -> bool:
    """
    Sube un restaurante a Supabase.
    
    Devuelve True si tuvo éxito, False si falló.
    """
    try:
        resultado = cliente.table('restaurantes').insert(restaurante).execute()
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def subir_batch(cliente: Client, restaurantes: list[dict]) -> tuple[int, int]:
    """
    Sube múltiples restaurantes de una vez (más eficiente).
    
    ¿Qué es un "batch"?
    En vez de hacer 28 peticiones individuales (una por restaurante),
    hacemos una sola petición con todos los datos. Es mucho más rápido.
    
    Devuelve (exitosos, fallidos)
    """
    try:
        resultado = cliente.table('restaurantes').insert(restaurantes).execute()
        return len(restaurantes), 0
    except Exception as e:
        print(f"❌ Error en batch: {e}")
        # Si falla el batch, intentar uno por uno para identificar el problemático
        print("🔄 Intentando insertar uno por uno...")
        exitosos = 0
        fallidos = 0
        for rest in restaurantes:
            if subir_restaurante(cliente, rest):
                exitosos += 1
            else:
                fallidos += 1
                print(f"  Falló: {rest['nombre']}")
        return exitosos, fallidos


# ============================================
# FUNCIÓN PRINCIPAL
# ============================================

def main():
    """
    Función principal que orquesta todo el proceso de migración.
    """
    print("=" * 60)
    print("🍽️  MIGRACIÓN DE RESTAURANTES A SUPABASE")
    print("=" * 60)
    print()
    
    # 1. Verificar que existe el CSV
    if not os.path.exists(CSV_PATH):
        print(f"❌ No se encuentra el archivo: {CSV_PATH}")
        print(f"   Asegúrate de exportar tu Google Sheets como CSV")
        print(f"   y guardarlo en: {CSV_PATH}")
        return
    
    # 2. Leer el CSV
    print(f"📂 Leyendo CSV: {CSV_PATH}")
    restaurantes = []
    
    with open(CSV_PATH, 'r', encoding='utf-8') as archivo:
        lector = csv.DictReader(archivo)
        
        for i, fila in enumerate(lector, start=1):
            registro = transformar_fila(fila)
            
            if registro:
                restaurantes.append(registro)
                print(f"  ✓ {registro['nombre']} → {registro['barrio']}")
    
    print()
    print(f"📊 Total de restaurantes a migrar: {len(restaurantes)}")
    print()
    
    if not restaurantes:
        print("⚠️ No hay restaurantes para migrar")
        return
    
    # 3. Confirmar antes de subir
    respuesta = input("¿Continuar con la migración? (s/n): ")
    if respuesta.lower() != 's':
        print("❌ Migración cancelada")
        return
    
    print()
    
    # 4. Conectar a Supabase
    cliente = conectar_supabase()
    print()
    
    # 5. Subir los datos
    print("📤 Subiendo restaurantes a Supabase...")
    exitosos, fallidos = subir_batch(cliente, restaurantes)
    
    # 6. Resumen
    print()
    print("=" * 60)
    print("📋 RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    print(f"  ✅ Exitosos: {exitosos}")
    print(f"  ❌ Fallidos: {fallidos}")
    print()
    
    if fallidos == 0:
        print("🎉 ¡Migración completada con éxito!")
        print()
        print("Próximos pasos:")
        print("  1. Ve a Supabase → Table Editor → restaurantes")
        print("  2. Verifica que los datos se ven bien")
        print("  3. Rellena los campos que faltan:")
        print("     - descripcion_personal (tu opinión)")
        print("     - mejor_para (ocasiones)")
        print("     - puntuaciones individuales")
        print("     - coordenadas (latitud/longitud)")
    else:
        print("⚠️ Algunos restaurantes no se pudieron migrar.")
        print("   Revisa los errores arriba y corrígelos manualmente.")


# ============================================
# PUNTO DE ENTRADA
# ============================================

if __name__ == "__main__":
    main()
