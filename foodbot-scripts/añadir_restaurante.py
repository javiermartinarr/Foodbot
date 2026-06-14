#!/usr/bin/env python3
"""
🍽️ FOODBOT - Script interactivo para añadir restaurantes
Tú rellenas lo personal → Google Places completa el resto → Se guarda en Supabase
"""

import requests
import time
import re

# ============================================
# CONFIGURACIÓN
# ============================================

SUPABASE_URL = "https://fgczzsdwgvkwxwbakesi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnY3p6c2R3Z3Zrd3h3YmFrZXNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQyNjIwNSwiZXhwIjoyMDk3MDAyMjA1fQ.iTxPUdj0DHZu5bMdxaqSFkw3mvk3jWjzyiaZYk5qKpo"
GOOGLE_PLACES_API_KEY = "AIzaSyCyCsXTUKf6_GSijUVI3C-WxeB4cfr-OBM"

# Headers para Supabase
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Campos de Google Places
GOOGLE_FIELDS = ",".join([
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.addressComponents"
])

# Rutas de carta
CARTA_PATHS = ["/carta", "/menu", "/carta/", "/menu/", "/la-carta", "/nuestra-carta", "/menus", "/carta.pdf", "/menu.pdf"]

# ============================================
# UTILIDADES
# ============================================

def limpiar_pantalla():
    print("\n" * 2)

def generar_slug(nombre):
    """Genera slug URL-friendly desde el nombre."""
    slug = nombre.lower()
    slug = re.sub(r'[áàäâ]', 'a', slug)
    slug = re.sub(r'[éèëê]', 'e', slug)
    slug = re.sub(r'[íìïî]', 'i', slug)
    slug = re.sub(r'[óòöô]', 'o', slug)
    slug = re.sub(r'[úùüû]', 'u', slug)
    slug = re.sub(r'[ñ]', 'n', slug)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug

def input_con_default(prompt, default=None):
    """Input con valor por defecto."""
    if default:
        valor = input(f"{prompt} [{default}]: ").strip()
        return valor if valor else default
    else:
        return input(f"{prompt}: ").strip()

def input_requerido(prompt):
    """Input que no puede estar vacío."""
    while True:
        valor = input(f"{prompt}: ").strip()
        if valor:
            return valor
        print("  ⚠️  Este campo es obligatorio")

def input_puntuacion(prompt):
    """Input de puntuación 1-5."""
    while True:
        valor = input(f"{prompt} (1-5, decimales ok): ").strip()
        if not valor:
            return None
        try:
            num = float(valor)
            if 1 <= num <= 5:
                return round(num, 1)
            print("  ⚠️  Debe ser entre 1 y 5")
        except ValueError:
            print("  ⚠️  Introduce un número válido")

def input_precio_categoria():
    """Input de categoría de precio."""
    while True:
        valor = input("Precio ($, $$, $$$, $$$$): ").strip()
        if valor in ['$', '$$', '$$$', '$$$$']:
            return valor
        print("  ⚠️  Debe ser $, $$, $$$ o $$$$")

def input_array(prompt):
    """Input para arrays (separado por comas)."""
    valor = input(f"{prompt} (separados por coma): ").strip()
    if not valor:
        return []
    return [item.strip() for item in valor.split(',') if item.strip()]

def input_si_no(prompt, default='s'):
    """Input sí/no."""
    sufijo = "(S/n)" if default == 's' else "(s/N)"
    valor = input(f"{prompt} {sufijo}: ").strip().lower()
    if not valor:
        return default == 's'
    return valor in ['s', 'si', 'sí', 'y', 'yes']

# ============================================
# GOOGLE PLACES
# ============================================

def buscar_en_google_places(nombre, ciudad, barrio=None):
    """Busca un restaurante en Google Places."""
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": GOOGLE_FIELDS
    }
    
    if barrio:
        query = f"{nombre} restaurante {barrio} {ciudad}"
    else:
        query = f"{nombre} restaurante {ciudad}"
    
    body = {"textQuery": query, "languageCode": "es"}
    
    try:
        response = requests.post(url, headers=headers, json=body)
        data = response.json()
        
        if "places" in data and len(data["places"]) > 0:
            return data["places"][0]
        return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def buscar_url_carta(url_web):
    """Intenta encontrar la URL de la carta."""
    if not url_web:
        return None
    
    base_url = url_web.rstrip("/")
    
    for path in CARTA_PATHS:
        url_carta = base_url + path
        try:
            response = requests.head(url_carta, timeout=3, allow_redirects=True)
            if response.status_code == 200:
                return url_carta
        except:
            continue
    return None

def extraer_codigo_postal(address_components):
    """Extrae CP de los componentes de dirección."""
    if not address_components:
        return None
    for component in address_components:
        if "postalCode" in component.get("types", []):
            return component.get("longText")
    return None

def extraer_datos_google(place_data):
    """Extrae datos del resultado de Google Places."""
    datos = {}
    
    if "formattedAddress" in place_data:
        datos["direccion"] = place_data["formattedAddress"]
    
    if "location" in place_data:
        datos["latitud"] = place_data["location"].get("latitude")
        datos["longitud"] = place_data["location"].get("longitude")
    
    if "nationalPhoneNumber" in place_data:
        datos["telefono"] = place_data["nationalPhoneNumber"]
    
    if "websiteUri" in place_data:
        datos["url_web"] = place_data["websiteUri"]
    
    if "googleMapsUri" in place_data:
        datos["google_maps_url"] = place_data["googleMapsUri"]
    
    if "addressComponents" in place_data:
        cp = extraer_codigo_postal(place_data["addressComponents"])
        if cp:
            datos["codigo_postal"] = cp
    
    return datos

# ============================================
# SUPABASE
# ============================================

def guardar_restaurante(datos):
    """Guarda un restaurante en Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/restaurantes"
    
    response = requests.post(url, headers=SUPABASE_HEADERS, json=datos)
    
    if response.status_code in [200, 201]:
        return True, response.json()
    else:
        return False, response.text

def verificar_nombre_existe(nombre):
    """Verifica si ya existe un restaurante con ese nombre."""
    url = f"{SUPABASE_URL}/rest/v1/restaurantes"
    params = {"nombre": f"eq.{nombre}", "select": "id,nombre"}
    
    response = requests.get(url, headers=SUPABASE_HEADERS, params=params)
    
    if response.status_code == 200:
        data = response.json()
        return len(data) > 0
    return False

# ============================================
# FLUJO PRINCIPAL
# ============================================

def recoger_datos_personales():
    """Recoge los datos que el usuario debe introducir."""
    print("\n" + "=" * 50)
    print("🍽️  NUEVO RESTAURANTE")
    print("=" * 50)
    
    datos = {}
    
    # === DATOS OBLIGATORIOS ===
    print("\n📝 DATOS BÁSICOS (obligatorios)")
    print("-" * 30)
    
    datos["nombre"] = input_requerido("Nombre")
    
    # Verificar si ya existe
    if verificar_nombre_existe(datos["nombre"]):
        print(f"\n  ⚠️  Ya existe un restaurante llamado '{datos['nombre']}'")
        if not input_si_no("¿Continuar de todos modos?", 'n'):
            return None
    
    datos["slug"] = generar_slug(datos["nombre"])
    datos["barrio"] = input_requerido("Barrio")
    datos["ciudad"] = input_con_default("Ciudad", "Madrid")
    datos["tipo_comida"] = input_requerido("Tipo de comida (Española, Italiana, Asiática...)")
    datos["precio_categoria"] = input_precio_categoria()
    
    # Dirección provisional (se sobrescribirá con Google)
    datos["direccion"] = datos["barrio"] + ", " + datos["ciudad"]
    
    # === DATOS OPCIONALES ===
    print("\n⭐ VALORACIÓN (opcional, Enter para saltar)")
    print("-" * 30)
    
    datos["subtipo_comida"] = input_con_default("Subtipo (Tapas, Sushi, Pasta...)", None)
    datos["puntuacion"] = input_puntuacion("Puntuación general")
    
    # Puntuaciones detalladas
    if input_si_no("¿Añadir puntuaciones detalladas?", 'n'):
        datos["punt_ambiente"] = input_puntuacion("  Ambiente")
        datos["punt_servicio"] = input_puntuacion("  Servicio")
        datos["punt_rapidez"] = input_puntuacion("  Rapidez")
        datos["punt_limpieza"] = input_puntuacion("  Limpieza")
        datos["punt_calidad_precio"] = input_puntuacion("  Calidad/Precio")
        datos["punt_cantidad"] = input_puntuacion("  Cantidad")
    
    print("\n📋 RECOMENDACIÓN (opcional)")
    print("-" * 30)
    
    datos["plato_recomendado"] = input_con_default("Plato recomendado", None)
    datos["descripcion_personal"] = input_con_default("Tu opinión/descripción", None)
    
    mejor_para = input_array("Mejor para (cita, amigos, familia, brunch, trabajo, solo)")
    if mejor_para:
        datos["mejor_para"] = mejor_para
    
    tags = input_array("Tags extras (terraza, vistas, romántico...)")
    if tags:
        datos["tags"] = tags
    
    print("\n🏠 AMBIENTE (opcional)")
    print("-" * 30)
    
    datos["ambiente"] = input_con_default("Ambiente (Informal, Formal, Casual, Animado, Íntimo)", "Informal")
    datos["acepta_reservas"] = input_si_no("¿Acepta reservas?", 'n')
    if datos["acepta_reservas"]:
        datos["requiere_reserva"] = input_si_no("¿Requiere reserva?", 'n')
    
    # Estado: visitado o wishlist
    print("\n📍 ESTADO")
    print("-" * 30)
    if input_si_no("¿Ya lo has visitado?", 's'):
        datos["estado"] = "visitado"
    else:
        datos["estado"] = "wishlist"
        print("  📝 Guardado como wishlist (pendiente de visitar)")
    
    # Limpiar None values
    datos = {k: v for k, v in datos.items() if v is not None}
    
    return datos

def completar_con_google(datos):
    """Completa los datos con Google Places."""
    print("\n" + "=" * 50)
    print("🔍 BUSCANDO EN GOOGLE PLACES...")
    print("=" * 50)
    
    nombre = datos.get("nombre")
    ciudad = datos.get("ciudad", "Madrid")
    barrio = datos.get("barrio")
    
    print(f"\n  Buscando: {nombre} ({barrio}, {ciudad})")
    
    place_data = buscar_en_google_places(nombre, ciudad, barrio)
    
    if not place_data:
        print("  ⚠️  No se encontró en Google Places")
        print("  Los datos de ubicación quedarán incompletos")
        return datos
    
    # Extraer datos de Google
    datos_google = extraer_datos_google(place_data)
    
    # Mostrar lo encontrado
    print("\n  📍 Datos encontrados:")
    if "direccion" in datos_google:
        print(f"     Dirección: {datos_google['direccion']}")
    if "latitud" in datos_google:
        print(f"     Coords: {datos_google['latitud']}, {datos_google['longitud']}")
    if "telefono" in datos_google:
        print(f"     Teléfono: {datos_google['telefono']}")
    if "url_web" in datos_google:
        print(f"     Web: {datos_google['url_web']}")
    
    # Buscar carta
    if datos_google.get("url_web"):
        print("\n  🔎 Buscando carta...")
        url_carta = buscar_url_carta(datos_google["url_web"])
        if url_carta:
            datos_google["url_carta"] = url_carta
            print(f"     📋 ¡Carta encontrada!: {url_carta}")
        else:
            print(f"     📋 Carta no encontrada en rutas comunes")
    
    # Confirmar datos de Google
    if input_si_no("\n¿Usar estos datos de Google?", 's'):
        datos.update(datos_google)
    else:
        print("  ⏭️  Saltando datos de Google")
    
    return datos

def mostrar_resumen(datos):
    """Muestra resumen antes de guardar."""
    print("\n" + "=" * 50)
    print("📋 RESUMEN")
    print("=" * 50)
    
    campos_mostrar = [
        ("nombre", "Nombre"),
        ("barrio", "Barrio"),
        ("ciudad", "Ciudad"),
        ("tipo_comida", "Tipo"),
        ("subtipo_comida", "Subtipo"),
        ("precio_categoria", "Precio"),
        ("puntuacion", "Puntuación"),
        ("direccion", "Dirección"),
        ("telefono", "Teléfono"),
        ("url_web", "Web"),
        ("url_carta", "Carta"),
        ("plato_recomendado", "Plato"),
        ("descripcion_personal", "Descripción"),
        ("mejor_para", "Mejor para"),
        ("estado", "Estado"),
    ]
    
    for campo, label in campos_mostrar:
        if campo in datos and datos[campo]:
            valor = datos[campo]
            if isinstance(valor, list):
                valor = ", ".join(valor)
            print(f"  {label}: {valor}")

def añadir_restaurante():
    """Flujo completo para añadir un restaurante."""
    # 1. Recoger datos personales
    datos = recoger_datos_personales()
    
    if not datos:
        print("\n❌ Cancelado")
        return False
    
    # 2. Completar con Google Places
    datos = completar_con_google(datos)
    
    # 3. Mostrar resumen
    mostrar_resumen(datos)
    
    # 4. Confirmar y guardar
    if input_si_no("\n¿Guardar en Supabase?", 's'):
        print("\n💾 Guardando...")
        ok, resultado = guardar_restaurante(datos)
        
        if ok:
            print("✅ ¡Restaurante guardado correctamente!")
            return True
        else:
            print(f"❌ Error al guardar: {resultado}")
            return False
    else:
        print("\n❌ No guardado")
        return False

def main():
    """Programa principal."""
    print("\n" + "=" * 50)
    print("🍽️  FOODBOT - Añadir restaurantes")
    print("=" * 50)
    print("Rellena los datos personales y el script")
    print("completará el resto con Google Places.")
    print("=" * 50)
    
    while True:
        añadir_restaurante()
        
        print("\n" + "-" * 50)
        if not input_si_no("¿Añadir otro restaurante?", 's'):
            break
    
    print("\n👋 ¡Hasta luego!")

# ============================================
# EJECUCIÓN
# ============================================

if __name__ == "__main__":
    main()