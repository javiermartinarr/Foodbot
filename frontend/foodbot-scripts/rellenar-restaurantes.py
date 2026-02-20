#!/usr/bin/env python3
"""
Script para rellenar automáticamente datos de restaurantes desde Google Places API (New)
Busca restaurantes sin coordenadas en Supabase y los actualiza con datos de Google.
"""

import os
import requests
import time
from supabase import create_client, Client

# ============================================
# CONFIGURACIÓN - Pon tus credenciales aquí
# ============================================

SUPABASE_URL = "https://ulloigptbpjgblqffiyc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbG9pZ3B0YnBqZ2JscWZmaXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzMyNzcsImV4cCI6MjA4MTMwOTI3N30.xnVdEoI59T0SplQ9xayepQ4ZHLhOyX7Yr5YVoD0"
GOOGLE_PLACES_API_KEY = "AIzaSyCyCsXTUKf6_GSijUVI3C-WxeB4cfr-OBM"

# ============================================
# FUNCIONES
# ============================================

def buscar_en_google_places(nombre_restaurante: str, ciudad: str = "Madrid") -> dict | None:
    """
    Busca un restaurante en Google Places API (New) y devuelve sus datos.
    """
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.addressComponents"
    }
    
    body = {
        "textQuery": f"{nombre_restaurante} restaurante {ciudad}",
        "languageCode": "es"
    }
    
    try:
        response = requests.post(url, headers=headers, json=body)
        data = response.json()
        
        if "places" in data and len(data["places"]) > 0:
            return data["places"][0]  # Devuelve el primer resultado
        else:
            print(f"  ⚠️  No se encontró: {nombre_restaurante}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error buscando {nombre_restaurante}: {e}")
        return None


def extraer_codigo_postal(address_components: list) -> str | None:
    """
    Extrae el código postal de los componentes de dirección de Google.
    """
    if not address_components:
        return None
        
    for component in address_components:
        if "postalCode" in component.get("types", []):
            return component.get("longText")
    return None


def extraer_datos_de_google(place_data: dict) -> dict:
    """
    Extrae los campos relevantes del resultado de Google Places.
    """
    datos = {}
    
    # Dirección
    if "formattedAddress" in place_data:
        datos["direccion"] = place_data["formattedAddress"]
    
    # Coordenadas
    if "location" in place_data:
        datos["latitud"] = place_data["location"].get("latitude")
        datos["longitud"] = place_data["location"].get("longitude")
    
    # Teléfono
    if "nationalPhoneNumber" in place_data:
        datos["telefono"] = place_data["nationalPhoneNumber"]
    
    # Web
    if "websiteUri" in place_data:
        datos["url_web"] = place_data["websiteUri"]
    
    # Google Maps URL
    if "googleMapsUri" in place_data:
        datos["google_maps_url"] = place_data["googleMapsUri"]
    
    # Código postal
    if "addressComponents" in place_data:
        cp = extraer_codigo_postal(place_data["addressComponents"])
        if cp:
            datos["codigo_postal"] = cp
    
    return datos


def obtener_restaurantes_sin_coordenadas(supabase: Client) -> list:
    """
    Obtiene restaurantes que no tienen latitud/longitud rellenadas.
    """
    response = supabase.table("restaurantes") \
        .select("id, nombre, ciudad") \
        .is_("latitud", "null") \
        .eq("activo", True) \
        .execute()
    
    return response.data


def obtener_todos_los_restaurantes(supabase: Client) -> list:
    """
    Obtiene todos los restaurantes activos.
    """
    response = supabase.table("restaurantes") \
        .select("id, nombre, ciudad, latitud") \
        .eq("activo", True) \
        .execute()
    
    return response.data


def actualizar_restaurante(supabase: Client, restaurante_id: str, datos: dict) -> bool:
    """
    Actualiza un restaurante en Supabase con los datos obtenidos.
    """
    try:
        supabase.table("restaurantes") \
            .update(datos) \
            .eq("id", restaurante_id) \
            .execute()
        return True
    except Exception as e:
        print(f"  ❌ Error actualizando: {e}")
        return False


def procesar_restaurante(supabase: Client, restaurante: dict) -> bool:
    """
    Procesa un restaurante: busca en Google y actualiza Supabase.
    """
    nombre = restaurante["nombre"]
    ciudad = restaurante.get("ciudad", "Madrid")
    
    print(f"\n🔍 Buscando: {nombre} ({ciudad})...")
    
    # Buscar en Google Places
    place_data = buscar_en_google_places(nombre, ciudad)
    
    if not place_data:
        return False
    
    # Extraer datos
    datos = extraer_datos_de_google(place_data)
    
    if not datos:
        print(f"  ⚠️  No se extrajeron datos para {nombre}")
        return False
    
    # Mostrar qué se va a actualizar
    print(f"  📍 Dirección: {datos.get('direccion', 'N/A')}")
    print(f"  🗺️  Coords: {datos.get('latitud', 'N/A')}, {datos.get('longitud', 'N/A')}")
    print(f"  📞 Teléfono: {datos.get('telefono', 'N/A')}")
    print(f"  🌐 Web: {datos.get('url_web', 'N/A')}")
    
    # Actualizar en Supabase
    if actualizar_restaurante(supabase, restaurante["id"], datos):
        print(f"  ✅ Actualizado correctamente")
        return True
    
    return False


# ============================================
# MODO PRINCIPAL
# ============================================

def main():
    print("=" * 60)
    print("🍽️  FOODBOT - Rellenador automático de datos")
    print("=" * 60)
    
    # Conectar a Supabase
    print("\n📡 Conectando a Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("  ✅ Conectado")
    
    # Obtener restaurantes sin coordenadas
    print("\n📋 Buscando restaurantes sin coordenadas...")
    restaurantes = obtener_restaurantes_sin_coordenadas(supabase)
    
    if not restaurantes:
        print("  ✅ Todos los restaurantes ya tienen coordenadas!")
        
        # Mostrar opción de forzar actualización
        print("\n¿Quieres actualizar TODOS los restaurantes? (sobrescribirá datos existentes)")
        respuesta = input("Escribe 'SI' para continuar: ")
        
        if respuesta.upper() == "SI":
            restaurantes = obtener_todos_los_restaurantes(supabase)
            print(f"\n📋 Se actualizarán {len(restaurantes)} restaurantes")
        else:
            print("\n👋 ¡Hasta luego!")
            return
    else:
        print(f"  📍 Encontrados {len(restaurantes)} restaurantes sin coordenadas")
    
    # Confirmar antes de proceder
    print(f"\n⚡ Se van a procesar {len(restaurantes)} restaurantes")
    print("   Cada búsqueda usa la API de Google Places (tiene coste después del tier gratis)")
    respuesta = input("\n¿Continuar? (s/n): ")
    
    if respuesta.lower() != "s":
        print("\n👋 Cancelado. ¡Hasta luego!")
        return
    
    # Procesar cada restaurante
    actualizados = 0
    errores = 0
    
    for i, restaurante in enumerate(restaurantes, 1):
        print(f"\n[{i}/{len(restaurantes)}]", end="")
        
        if procesar_restaurante(supabase, restaurante):
            actualizados += 1
        else:
            errores += 1
        
        # Pequeña pausa para no saturar la API
        time.sleep(0.5)
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    print(f"  ✅ Actualizados: {actualizados}")
    print(f"  ❌ Errores: {errores}")
    print(f"  📍 Total procesados: {len(restaurantes)}")
    print("\n🎉 ¡Proceso completado!")


# ============================================
# MODO INDIVIDUAL (para probar con un restaurante)
# ============================================

def probar_un_restaurante(nombre: str, ciudad: str = "Madrid"):
    """
    Prueba la búsqueda con un solo restaurante sin actualizar la BD.
    """
    print(f"\n🧪 Probando búsqueda: {nombre} ({ciudad})")
    print("-" * 40)
    
    place_data = buscar_en_google_places(nombre, ciudad)
    
    if place_data:
        datos = extraer_datos_de_google(place_data)
        print("\n📋 Datos encontrados:")
        for key, value in datos.items():
            print(f"  • {key}: {value}")
    else:
        print("❌ No se encontraron resultados")


# ============================================
# EJECUCIÓN
# ============================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Modo prueba: python script.py "Nombre Restaurante" "Ciudad"
        nombre = sys.argv[1]
        ciudad = sys.argv[2] if len(sys.argv) > 2 else "Madrid"
        probar_un_restaurante(nombre, ciudad)
    else:
        # Modo normal: procesar todos
        main()