import requests
from datetime import datetime
from uuid import uuid4
from .supabase_client import get_supabase

# ========== AUTENTICACIÓN ==========
def register_user(data):
    """
    Registra un usuario en Supabase Auth.
    El trigger handle_new_user se encarga de crear el perfil automáticamente.
    Si el perfil ya existe (por algún motivo), no se intenta insertar de nuevo.
    """
    supabase = get_supabase(use_service_role=True)
    try:
        auth_data = {
            "email": data["email"],
            "password": data["password"],
            "data": {
                "nombre_completo": data.get("nombre_completo", ""),
                "telefono": data.get("telefono", ""),
                "rol": data.get("rol", "cliente")
            }
        }
        response = supabase.auth().sign_up(auth_data)
        user_id = response.get("user", {}).get("id")
        token = response.get("access_token") or response.get("token")

        # ✅ No insertamos manualmente en perfiles, confiamos en el trigger.
        # Si el trigger falló (caso raro), se puede verificar y crear aquí, pero evitamos duplicado.

        return {
            "message": "Usuario registrado exitosamente",
            "user": response.get("user"),
            "token": token
        }
    except requests.exceptions.HTTPError as e:
        error_detail = ""
        try:
            error_json = e.response.json()
            if "msg" in error_json:
                error_detail = error_json["msg"]
            elif "error_description" in error_json:
                error_detail = error_json["error_description"]
            else:
                error_detail = str(error_json)
        except:
            error_detail = e.response.text

        # Si el error es "user already registered", lanzamos ValueError
        if e.response.status_code == 422 and ("already registered" in error_detail.lower() or "user already" in error_detail.lower()):
            raise ValueError("El correo electrónico ya está registrado")
        else:
            raise ValueError(f"Error en registro: {error_detail}")
    except Exception as e:
        # Capturar otros errores (incluyendo duplicado de perfil si ocurriera)
        if "duplicate key" in str(e) and "perfiles_pkey" in str(e):
            # El perfil ya fue creado por el trigger, consideramos éxito
            return {"message": "Usuario registrado exitosamente", "user": None, "token": None}
        raise ValueError(f"Error inesperado: {str(e)}")

def login_user(email, password):
    """
    Inicia sesión y devuelve token, user y rol.
    """
    supabase = get_supabase(use_service_role=True)
    try:
        credentials = {"email": email, "password": password}
        response = supabase.auth().sign_in(credentials)
        token = response.get("access_token")
        user_id = response.get("user", {}).get("id")
        # Obtener rol del perfil (usando service_role para evitar problemas de RLS)
        supabase_admin = get_supabase(use_service_role=True)
        perfil = supabase_admin.table("perfiles").select("rol, nombre_completo").eq("id", user_id).execute()
        if perfil.data:
            rol = perfil.data[0]["rol"]
            nombre_completo = perfil.data[0].get("nombre_completo", "")
        else:
            # Si no existe perfil, crearlo (por seguridad)
            nombre_completo = response.get("user", {}).get("email", "").split('@')[0]
            rol = "cliente"
            supabase_admin.table("perfiles").insert({
                "id": user_id,
                "nombre_completo": nombre_completo,
                "rol": rol
            }).execute()
        return {
            "token": token,
            "refresh": response.get("refresh_token"),
            "user": {
                "id": user_id,
                "email": response.get("user", {}).get("email"),
                "nombre_completo": nombre_completo,
                "rol": rol
            },
            "rol": rol
        }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in (400, 401):
            raise ValueError("Credenciales incorrectas")
        else:
            raise ValueError("Error en el inicio de sesión")
    except Exception as e:
        raise ValueError(f"Error inesperado: {str(e)}")

# ========== BÚSQUEDA Y CATÁLOGO ==========
def buscar_hoteles(filtros, jwt_token=None):
    supabase = get_supabase(use_service_role=False, jwt_token=jwt_token)
    query = supabase.table("hoteles").select("*").eq("aprobado", True).eq("activo", True)

    if filtros.get("ciudad"):
        query = query.eq("ciudad", filtros["ciudad"])
    if filtros.get("estrellas"):
        query = query.eq("estrellas", int(filtros["estrellas"]))
    
    result = query.execute()
    hoteles = result.data if result.data else []
    
    # Filtro por nombre en memoria (case-insensitive)
    if filtros.get("nombre"):
        nombre_buscar = filtros["nombre"].lower()
        hoteles = [h for h in hoteles if nombre_buscar in h.get("nombre", "").lower()]
    
    return hoteles

def buscar_hoteles_por_ciudad(ciudad, jwt_token=None):
    return buscar_hoteles({"ciudad": ciudad}, jwt_token)

# ========== RESERVAS ==========
def verificar_disponibilidad(habitacion_id, fecha_inicio, fecha_salida, jwt_token):
    supabase = get_supabase(use_service_role=False, jwt_token=jwt_token)
    reservas = supabase.table("reservas").select("*").eq("habitacion_id", habitacion_id).in_("estado", ["pendiente", "confirmada", "pagada"]).execute()
    for r in reservas.data:
        if not (fecha_salida <= datetime.fromisoformat(r["fecha_entrada"]).date() or
                fecha_inicio >= datetime.fromisoformat(r["fecha_salida"]).date()):
            return False
    return True

def calcular_precio_total(habitacion_id, fecha_inicio, fecha_salida, jwt_token):
    supabase = get_supabase(use_service_role=False, jwt_token=jwt_token)
    hab = supabase.table("habitaciones").select("precio_por_noche").eq("id", habitacion_id).execute()
    if not hab.data:
        raise ValueError("Habitación no encontrada")
    precio_diario = hab.data[0]["precio_por_noche"]
    start = datetime.fromisoformat(fecha_inicio)
    end = datetime.fromisoformat(fecha_salida)
    noches = (end - start).days
    if noches <= 0:
        raise ValueError("La fecha de salida debe ser posterior a la fecha de entrada")
    return precio_diario * noches, noches

def crear_reserva(data, user_id, jwt_token):
    supabase = get_supabase(use_service_role=False, jwt_token=jwt_token)
    reserva_data = {
        "id": str(uuid4()),
        "usuario_id": user_id,
        "habitacion_id": data["habitacion_id"],
        "hotel_id": data["hotel_id"],
        "fecha_entrada": str(data["fecha_entrada"]),
        "fecha_salida": str(data["fecha_salida"]),
        "precio_total": data["precio_total"],
        "estado": "pendiente"
    }
    result = supabase.table("reservas").insert(reserva_data).execute()
    return result.data[0] if result.data else reserva_data

def get_reservas_usuario(user_id, jwt_token):
    supabase = get_supabase(use_service_role=False, jwt_token=jwt_token)
    result = supabase.table("reservas").select("*").eq("usuario_id", user_id).execute()
    return result.data

# ========== MÉTRICAS ==========
def get_metricas_hotel(hotel_id):
    supabase = get_supabase(use_service_role=True)
    reservas = supabase.table("reservas").select("*").eq("hotel_id", hotel_id).execute()
    confirmadas = sum(1 for r in reservas.data if r.get("estado") == "confirmada")
    pendientes = sum(1 for r in reservas.data if r.get("estado") == "pendiente")
    ingresos = sum(r.get("precio_total", 0) for r in reservas.data)
    habitaciones = supabase.table("habitaciones").select("id").eq("hotel_id", hotel_id).execute()
    total_habitaciones = len(habitaciones.data)
    ocupacion = round((confirmadas / total_habitaciones) * 100, 1) if total_habitaciones > 0 else 0
    return {
        "confirmadas": confirmadas,
        "pendientes": pendientes,
        "ingresos_totales": ingresos,
        "ocupacion": ocupacion,
        "hotel_id": hotel_id
    }

def get_metricas_admin():
    supabase = get_supabase(use_service_role=True)
    hoteles = supabase.table("hoteles").select("*").execute()
    usuarios = supabase.table("perfiles").select("*").execute()
    reservas = supabase.table("reservas").select("*").execute()
    return {
        "total_hoteles": len(hoteles.data),
        "total_usuarios": len(usuarios.data),
        "total_reservas": len(reservas.data)
    }