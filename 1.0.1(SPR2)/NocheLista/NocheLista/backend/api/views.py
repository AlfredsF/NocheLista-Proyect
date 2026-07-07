import time
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework.permissions import IsAuthenticated, AllowAny
from uuid import uuid4
from .permissions import IsAdmin, IsGestor, IsAdminOrGestor

from .serializers import (
    RegisterSerializer, LoginSerializer, HotelSerializer,
    HabitacionSerializer, ReservaSerializer, SolicitudSerializer,
    PromocionSerializer, PerfilSerializer
)
from .services import (
    register_user, login_user, buscar_hoteles, buscar_hoteles_por_ciudad,
    verificar_disponibilidad, calcular_precio_total, crear_reserva,
    get_reservas_usuario, get_metricas_hotel, get_metricas_admin
)
from .supabase_client import get_supabase
from .authentication import SupabaseJWTAuthentication

def get_user_identity(request):
    if request.user and hasattr(request.user, 'id') and hasattr(request.user, 'rol'):
        return request.user.id, request.user.rol
    return None, None

def get_token_from_request(request):
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth.split(' ')[1]
    return None

# ========== AUTH ==========
class RegisterView(APIView):
    authentication_classes = []      # ← Desactiva autenticación automática
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = register_user(serializer.validated_data)
            return Response(result, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    authentication_classes = []      # ← Desactiva autenticación automática
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        cache_key_attempts = f'login_attempts_{email}'
        cache_key_blocked = f'login_blocked_{email}'

        if cache.get(cache_key_blocked):
            return Response(
                {'error': 'Demasiados intentos fallidos. Intente de nuevo en 5 minutos.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = login_user(
                serializer.validated_data['email'],
                serializer.validated_data['password']
            )
            cache.delete(cache_key_attempts)
            cache.delete(cache_key_blocked)
            return Response(result)
        except ValueError as e:
            attempts = cache.get(cache_key_attempts, 0) + 1
            cache.set(cache_key_attempts, attempts, timeout=300)
            if attempts >= 3:
                cache.set(cache_key_blocked, True, timeout=300)
                return Response(
                    {'error': 'Demasiados intentos fallidos. Intente de nuevo en 5 minutos.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MeView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        supabase = get_supabase(use_service_role=False, jwt_token=get_token_from_request(request))
        result = supabase.table('perfiles').select('*').eq('id', user_id).execute()
        if not result.data:
            return Response({'error': 'Usuario no encontrado'}, status=404)
        return Response(result.data[0])

    def put(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)

        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if current_password and new_password:
            if len(new_password) < 8:
                return Response({'error': 'La nueva contraseña debe tener al menos 8 caracteres'}, status=400)
            # Verificar contraseña actual
            try:
                login_user(request.user.email, current_password)
            except ValueError:
                return Response({'error': 'La contraseña actual no es correcta'}, status=400)
            # Actualizar contraseña (usando service_role)
            supabase_admin = get_supabase(use_service_role=True)
            supabase_admin.auth().update_password(user_id, new_password)
            return Response({'mensaje': 'Contraseña actualizada correctamente'})

        allowed = {}
        for field in ('nombre_completo', 'telefono', 'email'):
            if field in request.data:
                allowed[field] = request.data[field]
        if not allowed:
            return Response({'error': 'No hay campos para actualizar'}, status=400)
        supabase_anon = get_supabase(use_service_role=False, jwt_token=get_token_from_request(request))
        if 'email' in allowed:
            # Actualizar email requiere service_role (por el admin API)
            supabase_admin = get_supabase(use_service_role=True)
            supabase_admin.auth().update_email(user_id, allowed['email'])
        supabase_anon.table('perfiles').update(allowed).eq('id', user_id).execute()
        return Response({'mensaje': 'Perfil actualizado'})

# ========== HOTELES ==========
class HotelListCreateView(APIView):
    # Desactiva la autenticación para esta vista (pública para GET)
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        token = get_token_from_request(request)
        if token:
            supabase = get_supabase(use_service_role=False, jwt_token=token)
        else:
            supabase = get_supabase(use_service_role=True)  # público, usa service_role
        user_id, user_rol = get_user_identity(request)
        if user_rol == 'admin':
            result = supabase.table('hoteles').select('*').order('nombre').execute()
        else:
            result = supabase.table('hoteles').select('*').eq('aprobado', True).eq('activo', True).order('nombre').execute()
        data = result.data if result.data else []
        for h in data:
            h['imagen_url'] = h.get('imagen_principal', '')
        return Response(data)

    def post(self, request):
        # POST requiere autenticación y rol admin/gestor
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        serializer = HotelSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        supabase = get_supabase(use_service_role=True)
        data = serializer.validated_data
        data['id'] = str(uuid4())
        data['gestor_id'] = user_id
        result = supabase.table('hoteles').insert(data).execute()
        return Response(result.data[0] if result.data else data, status=201)


class HotelDetailView(APIView):
    authentication_classes = []      # ← pública
    permission_classes = [AllowAny]

    def get(self, request, pk):
        supabase = get_supabase(use_service_role=False, jwt_token=get_token_from_request(request))
        result = supabase.table('hoteles').select('*').eq('id', pk).execute()
        if not result.data:
            raise Http404
        hotel = result.data[0]
        habitaciones = supabase.table('habitaciones').select('*').eq('hotel_id', pk).execute()
        hotel['habitaciones'] = habitaciones.data if habitaciones.data else []
        return Response(hotel)

    def put(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)
        supabase = get_supabase(use_service_role=True)
        hotel = supabase.table('hoteles').select('gestor_id').eq('id', pk).execute()
        if not hotel.data:
            raise Http404
        if user_rol != 'admin' and str(hotel.data[0].get('gestor_id')) != user_id:
            return Response({'error': 'No tienes permiso'}, status=403)
        supabase.table('hoteles').update(request.data).eq('id', pk).execute()
        return Response({'mensaje': 'Hotel actualizado'})

    def delete(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        if user_rol != 'admin':
            return Response({'error': 'No autorizado'}, status=403)
        supabase = get_supabase(use_service_role=True)
        supabase.table('hoteles').delete().eq('id', pk).execute()
        return Response({'mensaje': 'Hotel eliminado'}, status=204)

# ========== HABITACIONES ==========
class HabitacionListCreateView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]

    def get(self, request):
        supabase = get_supabase(use_service_role=False, jwt_token=get_token_from_request(request))
        hotel_id = request.query_params.get('hotel_id')
        query = supabase.table('habitaciones').select('*')
        if hotel_id:
            query = query.eq('hotel_id', hotel_id)
        result = query.order('nombre').execute()
        return Response(result.data if result.data else [])

    def post(self, request):
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        serializer = HabitacionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        supabase = get_supabase(use_service_role=True)
        data = serializer.validated_data
        data['id'] = str(uuid4())
        result = supabase.table('habitaciones').insert(data).execute()
        return Response(result.data[0] if result.data else data, status=201)

class HabitacionDetailView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]

    def get(self, request, pk):
        supabase = get_supabase(use_service_role=False, jwt_token=get_token_from_request(request))
        result = supabase.table('habitaciones').select('*').eq('id', pk).execute()
        if not result.data:
            raise Http404
        return Response(result.data[0])

    def put(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        supabase = get_supabase(use_service_role=True)
        hab = supabase.table('habitaciones').select('hotel_id').eq('id', pk).execute()
        if not hab.data:
            raise Http404
        hotel = supabase.table('hoteles').select('gestor_id').eq('id', hab.data[0]['hotel_id']).execute()
        if user_rol != 'admin' and (not hotel.data or str(hotel.data[0].get('gestor_id')) != user_id):
            return Response({'error': 'No tienes permiso'}, status=403)
        supabase.table('habitaciones').update(request.data).eq('id', pk).execute()
        return Response({'mensaje': 'Habitación actualizada'})

    def delete(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        supabase = get_supabase(use_service_role=True)
        supabase.table('habitaciones').delete().eq('id', pk).execute()
        return Response({'mensaje': 'Habitación eliminada'}, status=204)

# ========== BUSCAR ==========
class BuscarHotelesView(APIView):
    authentication_classes = []      # ← Desactiva autenticación
    permission_classes = [AllowAny]  # ← Permite acceso anónimo

    def get(self, request):
        ciudad = request.query_params.get('ciudad', '')
        token = get_token_from_request(request)  # Esto seguirá funcionando si hay token, pero no es obligatorio
        try:
            resultados = buscar_hoteles_por_ciudad(ciudad, jwt_token=token)
            return Response(resultados)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

# ========== RESERVAS ==========
class ReservaListCreateView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id, user_rol = get_user_identity(request)
        token = get_token_from_request(request)
        supabase = get_supabase(use_service_role=False, jwt_token=token)
        if user_rol == 'admin':
            result = supabase.table('reservas').select('*').order('creado_en', desc=True).execute()
        elif user_rol == 'gestor':
            hoteles = supabase.table('hoteles').select('id').eq('gestor_id', user_id).execute()
            hotel_ids = [h['id'] for h in (hoteles.data or [])]
            if not hotel_ids:
                return Response([])
            result = supabase.table('reservas').select('*').in_('hotel_id', hotel_ids).order('creado_en', desc=True).execute()
        else:
            result = supabase.table('reservas').select('*').eq('usuario_id', user_id).order('creado_en', desc=True).execute()
        reservas = result.data if result.data else []
        for r in reservas:
            hotel_data = supabase.table('hoteles').select('nombre,imagen_principal').eq('id', r['hotel_id']).execute()
            if hotel_data.data:
                r['hotel_nombre'] = hotel_data.data[0].get('nombre', '')
            hab_data = supabase.table('habitaciones').select('nombre,tipo,precio_diario').eq('id', r['habitacion_id']).execute()
            if hab_data.data:
                r['habitacion_nombre'] = hab_data.data[0].get('nombre', '')
        return Response(reservas)

    def post(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)
        serializer = ReservaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        data = serializer.validated_data
        token = get_token_from_request(request)
        if not verificar_disponibilidad(data['habitacion_id'], data['fecha_entrada'], data['fecha_salida'], token):
            return Response({'error': 'La habitación no está disponible en esas fechas'}, status=409)
        try:
            precio_total, _ = calcular_precio_total(data['habitacion_id'], str(data['fecha_entrada']), str(data['fecha_salida']), token)
        except ValueError as e:
            return Response({'error': str(e)}, status=404)
        reserva = crear_reserva({**data, 'precio_total': precio_total}, user_id, token)
        return Response(reserva, status=201)

class ReservaDetailView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        token = get_token_from_request(request)
        supabase = get_supabase(use_service_role=False, jwt_token=token)
        result = supabase.table('reservas').select('*').eq('id', pk).execute()
        if not result.data:
            raise Http404
        reserva = result.data[0]
        if user_rol != 'admin' and str(reserva['usuario_id']) != user_id:
            if user_rol == 'gestor':
                hotel = supabase.table('hoteles').select('gestor_id').eq('id', reserva['hotel_id']).execute()
                if not hotel.data or str(hotel.data[0].get('gestor_id')) != user_id:
                    return Response({'error': 'No autorizado'}, status=403)
            else:
                return Response({'error': 'No autorizado'}, status=403)
        return Response(reserva)

    def put(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        token = get_token_from_request(request)
        supabase = get_supabase(use_service_role=False, jwt_token=token)
        reserva = supabase.table('reservas').select('*').eq('id', pk).execute()
        if not reserva.data:
            raise Http404
        if user_rol != 'admin' and str(reserva.data[0]['usuario_id']) != user_id:
            return Response({'error': 'No autorizado'}, status=403)
        allowed_states = {'confirmada', 'cancelada', 'pagada'}
        if 'estado' in request.data and request.data['estado'] in allowed_states:
            supabase.table('reservas').update({'estado': request.data['estado']}).eq('id', pk).execute()
            return Response({'mensaje': f"Reserva {request.data['estado']}"})
        return Response({'error': 'Estado no válido'}, status=400)

    def delete(self, request, pk):
        user_id, _ = get_user_identity(request)
        token = get_token_from_request(request)
        supabase = get_supabase(use_service_role=False, jwt_token=token)
        supabase.table('reservas').update({'estado': 'cancelada'}).eq('id', pk).execute()
        return Response({'mensaje': 'Reserva cancelada'})

# ========== SOLICITUDES DE AFILIACIÓN ==========
class SolicitudCreateView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)
        serializer = SolicitudSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        supabase = get_supabase(use_service_role=True)
        data = serializer.validated_data
        data['id'] = str(uuid4())
        data['usuario_id'] = user_id
        data['estado'] = 'pendiente'
        result = supabase.table('solicitudes_afiliacion').insert(data).execute()
        return Response(result.data[0] if result.data else data, status=201)

class SolicitudListView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        supabase = get_supabase(use_service_role=True)
        estado = request.query_params.get('estado')
        query = supabase.table('solicitudes_afiliacion').select('*')
        if estado:
            query = query.eq('estado', estado)
        result = query.order('creado_en', desc=True).execute()
        return Response(result.data if result.data else [])

class SolicitudDetailView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        supabase = get_supabase(use_service_role=True)
        nuevo_estado = request.data.get('estado')
        if nuevo_estado not in ('aprobada', 'rechazada'):
            return Response({'error': 'Estado debe ser aprobada o rechazada'}, status=400)
        solicitud = supabase.table('solicitudes_afiliacion').select('*').eq('id', pk).execute()
        if not solicitud.data or len(solicitud.data) == 0:
            return Response({'error': 'Solicitud no encontrada'}, status=404)
        solic_data = solicitud.data[0]
        supabase.table('solicitudes_afiliacion').update({'estado': nuevo_estado}).eq('id', pk).execute()
        if nuevo_estado == 'aprobada':
            hotel_data = {
                'id': str(uuid4()),
                'gestor_id': solic_data['usuario_id'],
                'nombre': solic_data.get('nombre_hotel', 'Hotel sin nombre'),
                'descripcion': solic_data.get('descripcion', ''),
                'direccion': solic_data.get('direccion', ''),
                'ciudad': solic_data.get('ciudad', 'Quito'),
                'estrellas': 3,
                'activo': True,
                'aprobado': True,
            }
            supabase.table('hoteles').insert(hotel_data).execute()
            supabase.table('perfiles').update({'rol': 'gestor'}).eq('id', solic_data['usuario_id']).execute()
        return Response({'mensaje': f'Solicitud {nuevo_estado}'})

# ========== USUARIOS (Admin) ==========
class UsuarioListView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        supabase = get_supabase(use_service_role=True)
        result = supabase.table('perfiles').select('*').order('creado_en', desc=True).execute()
        return Response(result.data if result.data else [])

class UsuarioDetailView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        supabase = get_supabase(use_service_role=True)
        allowed = {}
        for field in ('rol', 'nombre_completo', 'telefono', 'email'):
            if field in request.data:
                allowed[field] = request.data[field]
        if not allowed:
            return Response({'error': 'No hay campos para actualizar'}, status=400)
        supabase.table('perfiles').update(allowed).eq('id', pk).execute()
        return Response({'mensaje': 'Usuario actualizado'})

    def delete(self, request, pk):
        supabase = get_supabase(use_service_role=True)
        supabase.table('perfiles').delete().eq('id', pk).execute()
        return Response({'mensaje': 'Usuario eliminado'}, status=204)

# ========== MÉTRICAS ==========
class AdminMetricasView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            metricas = get_metricas_admin()
            return Response(metricas)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class GestorDashboardView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsGestor]

    def get(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)
        supabase = get_supabase(use_service_role=True)
        hoteles = supabase.table('hoteles').select('id').eq('gestor_id', user_id).execute()
        if not hoteles.data or len(hoteles.data) == 0:
            return Response({
                'confirmadas': 0,
                'pendientes': 0,
                'ingresos_totales': 0,
                'ocupacion': 0,
                'hotel_id': None
            })
        hotel_id = hoteles.data[0]['id']
        metricas = get_metricas_hotel(hotel_id)
        return Response(metricas)

# ========== GESTOR: HOTEL ==========
class GestorHotelView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsGestor]

    def get(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)
        supabase = get_supabase(use_service_role=True)
        result = supabase.table('hoteles').select('*').eq('gestor_id', user_id).execute()
        if not result.data or len(result.data) == 0:
            return Response({'error': 'No tienes un hotel registrado'}, status=404)
        return Response(result.data[0])

    def put(self, request):
        user_id, _ = get_user_identity(request)
        if not user_id:
            return Response({'error': 'No autenticado'}, status=401)
        supabase = get_supabase(use_service_role=True)
        hotel = supabase.table('hoteles').select('id').eq('gestor_id', user_id).execute()
        if not hotel.data or len(hotel.data) == 0:
            return Response({'error': 'Hotel no encontrado'}, status=404)
        allowed = {}
        for field in ('nombre', 'descripcion', 'direccion', 'ciudad', 'estrellas', 'imagen_principal'):
            if field in request.data:
                allowed[field] = request.data[field]
        if not allowed:
            return Response({'error': 'No hay campos para actualizar'}, status=400)
        supabase.table('hoteles').update(allowed).eq('id', hotel.data[0]['id']).execute()
        return Response({'mensaje': 'Hotel actualizado'})

# ========== PROMOCIONES ==========
class PromocionListCreateView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]

    def get(self, request):
        supabase = get_supabase(use_service_role=False, jwt_token=get_token_from_request(request))
        hotel_id = request.query_params.get('hotel_id')
        query = supabase.table('promociones').select('*')
        if hotel_id:
            query = query.eq('hotel_id', hotel_id)
        user_id, user_rol = get_user_identity(request)
        if user_rol == 'gestor' and user_id:
            hoteles = supabase.table('hoteles').select('id').eq('gestor_id', user_id).execute()
            hotel_ids = [h['id'] for h in (hoteles.data or [])]
            if hotel_ids:
                query = query.in_('hotel_id', hotel_ids)
        result = query.order('fecha_inicio', desc=True).execute()
        return Response(result.data if result.data else [])

    def post(self, request):
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        serializer = PromocionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        supabase = get_supabase(use_service_role=True)
        data = serializer.validated_data
        data['id'] = str(uuid4())
        result = supabase.table('promociones').insert(data).execute()
        return Response(result.data[0] if result.data else data, status=201)

class PromocionDetailView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]

    def get_object(self, pk):
        supabase = get_supabase(use_service_role=False, jwt_token=None)
        result = supabase.table('promociones').select('*').eq('id', pk).execute()
        if not result.data or len(result.data) == 0:
            raise Http404
        return result.data[0]

    def get(self, request, pk):
        promocion = self.get_object(pk)
        return Response(promocion)

    def put(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        supabase = get_supabase(use_service_role=True)
        supabase.table('promociones').update(request.data).eq('id', pk).execute()
        return Response({'mensaje': 'Promoción actualizada'})

    def delete(self, request, pk):
        user_id, user_rol = get_user_identity(request)
        if not user_id or user_rol not in ['admin', 'gestor']:
            return Response({'error': 'No autorizado'}, status=403)
        supabase = get_supabase(use_service_role=True)
        supabase.table('promociones').delete().eq('id', pk).execute()
        return Response({'mensaje': 'Promoción eliminada'}, status=204)