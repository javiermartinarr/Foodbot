#!/usr/bin/env python3
"""
Script para rellenar automáticamente datos de restaurantes desde Google Places API (New)
Versión 2.1 - Busca con barrio + detecta URL de carta/menú
"""

import requests
import time

# ============================================
# CONFIGURACIÓN
# ============================================

SUPABASE_URL = "https://ulloigptbpjgblqffiyc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbG9pZ3B0YnBqZ2JscWZmaXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTczMzI3NywiZXhwIjoyMDgxMzA5Mjc3fQ.c-FnR6gkHi8zN42Lgp1dKgUv4ZiyobmTIQjA-15Jg1A"
GOOGLE_PLACES_API_KEY = "AIzaSyCyCsXTUKf6_GSijUVI3C-WxeB4cfr-OBM"

# Headers para Supabase
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Posibles rutas de carta/menú
CARTA_PATHS = [
    "/carta",
    "/menu",
    "/carta/",
    "/menu/",
    "/la-carta",
    "/nuestra-carta",
    "/our-menu",
    "/menus",
    "/carta.pdf",
    "/menu.pdf"
]

# ============================================
# CAMPOS QUE PEDIMOS A GOOGLE PLACES
# ============================================

GOOGLE_FIELDS = ",".join([
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.addressComponents",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.currentOpeningHours",
    "places.servesBreakfast",
    "places.servesLunch", 
    "places.servesDinner",
    "places.servesBeer",
    "places.servesWine",
    "places.servesVegetarianFood",
    "places.outdoorSeating",
    "places.reservable",
    "places.delivery",
    "places.takeout"
])

# ============================================
# FUNCIONES SUPABASE (via REST API)
# ============================================

def obtener_restaurantes_sin_coordenadas():
    """Obtiene restaurantes que no tienen latitud/longitud."""
    url = f"{SUPABASE_URL}/rest/v1/restaurantes"
    params = {
        "select": "id,nombre,ciudad,barrio",
        "activo": "eq.true",
        "latitud": "is.null"
    }
    response = requests.get(url, headers=SUPABASE_HEADERS, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error obteniendo restaurantes: {response.text}")
        return []


def obtener_todos_los_restaurantes():
    """Obtiene todos los restaurantes activos."""
    url = f"{SUPABASE_URL}/rest/v1/restaurantes"
    params = {
        "select": "id,nombre,ciudad,barrio,latitud",
        "activo": "eq.true"
    }
    response = requests.get(url, headers=SUPABASE_HEADERS, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error obteniendo restaurantes: {response.text}")
        return []


def actualizar_restaurante(restaurante_id, datos):
    """Actualiza un restaurante en Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/restaurantes"
    params = {"id": f"eq.{restaurante_id}"}
    
    response = requests.patch(url, headers=SUPABASE_HEADERS, params=params, json=datos)
    
    return response.status_code in [200, 204]


# ============================================
# FUNCIONES GOOGLE PLACES
# ============================================

def buscar_en_google_places(nombre_restaurante, ciudad="Madrid", barrio=None):
    """Busca un restaurante en Google Places API (New)."""
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": GOOGLE_FIELDS
    }
    
    # Construir query con barrio si está disponible
    if barrio:
        query = f"{nombre_restaurante} restaurante {barrio} {ciudad}"
    else:
        query = f"{nombre_restaurante} restaurante {ciudad}"
    
    body = {
        "textQuery": query,
        "languageCode": "es"
    }
    
    try:
        response = requests.post(url, headers=headers, json=body)
        data = response.json()
        
        if "places" in data and len(data["places"]) > 0:
            return data["places"][0]
        else:
            # Si no encuentra con barrio, intentar sin barrio
            if barrio:
                print(f"  ⚠️  No encontrado con barrio, probando sin barrio...")
                return buscar_en_google_places(nombre_restaurante, ciudad, None)
            print(f"  ⚠️  No se encontró: {nombre_restaurante}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error buscando {nombre_restaurante}: {e}")
        return None


def extraer_codigo_postal(address_components):
    """Extrae el código postal de los componentes de dirección."""
    if not address_components:
        return None
        
    for component in address_components:
        if "postalCode" in component.get("types", []):
            return component.get("longText")
    return None


# ============================================
# DETECCIÓN DE CARTA/MENÚ
# ============================================

def buscar_url_carta(url_web):
    """Intenta encontrar la URL de la carta probando rutas comunes."""
    if not url_web:
        return None
    
    # Limpiar URL base
    base_url = url_web.rstrip("/")
    
    for path in CARTA_PATHS:
        url_carta = base_url + path
        try:
            # Hacer HEAD request (más rápido que GET)
            response = requests.head(url_carta, timeout=3, allow_redirects=True)
            
            # Si devuelve 200, la página existe
            if response.status_code == 200:
                return url_carta
                
        except requests.exceptions.RequestException:
            # Timeout o error de conexión, probar siguiente
            continue
    
    return None


# ============================================
# EXTRACCIÓN DE DATOS
# ============================================

def extraer_datos_de_google(place_data):
    """Extrae los campos relevantes del resultado de Google Places."""
    datos = {}
    
    # === CAMPOS BÁSICOS (se guardan en Supabase) ===
    
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
    
    # === CAMPOS ADICIONALES (para mostrar info, no se guardan por defecto) ===
    datos_extra = {}
    
    if "rating" in place_data:
        datos_extra["google_rating"] = place_data["rating"]
    
    if "userRatingCount" in place_data:
        datos_extra["google_reviews"] = place_data["userRatingCount"]
    
    if "priceLevel" in place_data:
        price_map = {
            "PRICE_LEVEL_FREE": "Gratis",
            "PRICE_LEVEL_INEXPENSIVE": "$",
            "PRICE_LEVEL_MODERATE": "$$",
            "PRICE_LEVEL_EXPENSIVE": "$$$",
            "PRICE_LEVEL_VERY_EXPENSIVE": "$$$$"
        }
        datos_extra["google_price"] = price_map.get(place_data["priceLevel"], place_data["priceLevel"])
    
    if "currentOpeningHours" in place_data:
        horarios = place_data["currentOpeningHours"]
        if "weekdayDescriptions" in horarios:
            datos_extra["horarios"] = horarios["weekdayDescriptions"]
    
    # Características del local
    caracteristicas = []
    if place_data.get("servesBreakfast"): caracteristicas.append("desayuno")
    if place_data.get("servesLunch"): caracteristicas.append("almuerzo")
    if place_data.get("servesDinner"): caracteristicas.append("cena")
    if place_data.get("servesBeer"): caracteristicas.append("cerveza")
    if place_data.get("servesWine"): caracteristicas.append("vino")
    if place_data.get("servesVegetarianFood"): caracteristicas.append("vegetariano")
    if place_data.get("outdoorSeating"): caracteristicas.append("terraza")
    if place_data.get("reservable"): caracteristicas.append("reservable")
    if place_data.get("delivery"): caracteristicas.append("delivery")
    if place_data.get("takeout"): caracteristicas.append("takeaway")
    
    if caracteristicas:
        datos_extra["caracteristicas"] = caracteristicas
    
    return datos, datos_extra


# ============================================
# PROCESAMIENTO
# ============================================

def procesar_restaurante(restaurante, mostrar_extra=True):
    """Procesa un restaurante: busca en Google y actualiza Supabase."""
    nombre = restaurante["nombre"]
    ciudad = restaurante.get("ciudad", "Madrid")
    barrio = restaurante.get("barrio")
    
    if barrio:
        print(f"\n🔍 Buscando: {nombre} ({barrio}, {ciudad})...")
    else:
        print(f"\n🔍 Buscando: {nombre} ({ciudad})...")
        print(f"  ⚠️  Sin barrio - resultado puede ser impreciso")
    
    place_data = buscar_en_google_places(nombre, ciudad, barrio)
    
    if not place_data:
        return False
    
    datos, datos_extra = extraer_datos_de_google(place_data)
    
    if not datos:
        print(f"  ⚠️  No se extrajeron datos para {nombre}")
        return False
    
    # Buscar URL de carta si tenemos web
    if datos.get("url_web"):
        print(f"  🔎 Buscando carta en {datos['url_web']}...")
        url_carta = buscar_url_carta(datos["url_web"])
        if url_carta:
            datos["url_carta"] = url_carta
            print(f"  📋 ¡Carta encontrada!")
        else:
            print(f"  📋 Carta no encontrada en rutas comunes")
    
    # Mostrar datos que se van a guardar
    print(f"  📍 Dirección: {datos.get('direccion', 'N/A')}")
    print(f"  🗺️  Coords: {datos.get('latitud', 'N/A')}, {datos.get('longitud', 'N/A')}")
    print(f"  📞 Teléfono: {datos.get('telefono', 'N/A')}")
    print(f"  🌐 Web: {datos.get('url_web', 'N/A')}")
    print(f"  📋 Carta: {datos.get('url_carta', 'N/A')}")
    
    # Mostrar datos extra (informativos)
    if mostrar_extra and datos_extra:
        print(f"  ---")
        if "google_rating" in datos_extra:
            print(f"  ⭐ Rating Google: {datos_extra['google_rating']} ({datos_extra.get('google_reviews', 0)} reseñas)")
        if "google_price" in datos_extra:
            print(f"  💰 Precio Google: {datos_extra['google_price']}")
        if "caracteristicas" in datos_extra:
            print(f"  🏷️  Características: {', '.join(datos_extra['caracteristicas'])}")
    
    # Actualizar en Supabase (solo datos básicos)
    if actualizar_restaurante(restaurante["id"], datos):
        print(f"  ✅ Actualizado correctamente")
        return True
    else:
        print(f"  ❌ Error al actualizar")
        return False


# ============================================
# MAIN
# ============================================

def main():
    print("=" * 60)
    print("🍽️  FOODBOT - Rellenador automático de datos v2.1")
    print("=" * 60)
    print("📌 Busca con BARRIO + detecta URL de CARTA")
    
    # Obtener restaurantes sin coordenadas
    print("\n📋 Buscando restaurantes sin coordenadas...")
    restaurantes = obtener_restaurantes_sin_coordenadas()
    
    if not restaurantes:
        print("  ✅ Todos los restaurantes ya tienen coordenadas!")
        
        print("\n¿Quieres actualizar TODOS los restaurantes? (sobrescribirá datos)")
        respuesta = input("Escribe 'SI' para continuar: ")
        
        if respuesta.upper() == "SI":
            restaurantes = obtener_todos_los_restaurantes()
            print(f"\n📋 Se actualizarán {len(restaurantes)} restaurantes")
        else:
            print("\n👋 ¡Hasta luego!")
            return
    else:
        print(f"  📍 Encontrados {len(restaurantes)} restaurantes sin coordenadas")
        
        # Avisar de los que no tienen barrio
        sin_barrio = [r for r in restaurantes if not r.get("barrio")]
        if sin_barrio:
            print(f"\n  ⚠️  {len(sin_barrio)} restaurantes SIN BARRIO:")
            for r in sin_barrio[:5]:
                print(f"     - {r['nombre']}")
            if len(sin_barrio) > 5:
                print(f"     ... y {len(sin_barrio) - 5} más")
            print(f"\n  💡 Tip: Añade el barrio en Supabase para búsquedas más precisas")
    
    # Confirmar
    print(f"\n⚡ Se van a procesar {len(restaurantes)} restaurantes")
    respuesta = input("\n¿Continuar? (s/n): ")
    
    if respuesta.lower() != "s":
        print("\n👋 Cancelado")
        return
    
    # Procesar
    actualizados = 0
    errores = 0
    
    for i, restaurante in enumerate(restaurantes, 1):
        print(f"\n[{i}/{len(restaurantes)}]", end="")
        
        if procesar_restaurante(restaurante):
            actualizados += 1
        else:
            errores += 1
        
        time.sleep(0.5)  # Pausa para no saturar la API
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    print(f"  ✅ Actualizados: {actualizados}")
    print(f"  ❌ Errores: {errores}")
    print("\n🎉 ¡Completado!")


def probar_un_restaurante(nombre, ciudad="Madrid", barrio=None):
    """Prueba la búsqueda sin actualizar BD."""
    if barrio:
        print(f"\n🧪 Probando: {nombre} ({barrio}, {ciudad})")
    else:
        print(f"\n🧪 Probando: {nombre} ({ciudad})")
    print("-" * 50)
    
    place_data = buscar_en_google_places(nombre, ciudad, barrio)
    
    if place_data:
        datos, datos_extra = extraer_datos_de_google(place_data)
        
        # Buscar carta
        if datos.get("url_web"):
            print(f"\n🔎 Buscando carta en {datos['url_web']}...")
            url_carta = buscar_url_carta(datos["url_web"])
            if url_carta:
                datos["url_carta"] = url_carta
                print(f"📋 ¡Carta encontrada!")
            else:
                print(f"📋 Carta no encontrada en rutas comunes")
        
        print("\n📋 Datos que se guardarían en Supabase:")
        for key, value in datos.items():
            print(f"  • {key}: {value}")
        
        if datos_extra:
            print("\n📊 Datos adicionales de Google (informativos):")
            for key, value in datos_extra.items():
                if key == "horarios":
                    print(f"  • {key}:")
                    for dia in value:
                        print(f"      {dia}")
                else:
                    print(f"  • {key}: {value}")
    else:
        print("❌ No se encontraron resultados")


# ============================================
# EJECUCIÓN
# ============================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Modo prueba: py script.py "Nombre" "Ciudad" "Barrio"
        nombre = sys.argv[1]
        ciudad = sys.argv[2] if len(sys.argv) > 2 else "Madrid"
        barrio = sys.argv[3] if len(sys.argv) > 3 else None
        probar_un_restaurante(nombre, ciudad, barrio)
    else:
        # Modo normal: procesar todos
        main()