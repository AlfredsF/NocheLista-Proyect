import requests
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .supabase_client import get_supabase

class SupabaseUser:
    def __init__(self, payload):
        self.id = payload.get('user_id')
        self.email = payload.get('email')
        self.rol = payload.get('rol')
        self.nombre_completo = payload.get('nombre_completo')
        self.payload = payload

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return self.email


class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate_header(self, request):
        return 'Bearer'

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header:
            raise AuthenticationFailed('Se requiere autenticación. Envíe un token JWT.')

        if not auth_header.startswith('Bearer '):
            raise AuthenticationFailed('Formato de token inválido. Debe ser "Bearer <token>"')

        token = auth_header.split(' ')[1]
        if not token:
            raise AuthenticationFailed('Token vacío.')

        try:
            supabase = get_supabase(use_service_role=False, jwt_token=token)
            user_data = supabase.auth().get_user(token)
            user_id = user_data.get('id')
            if not user_id:
                raise AuthenticationFailed('Token inválido: falta el identificador de usuario.')

            # Usamos service_role para la consulta a perfiles y así evitar RLS
            supabase_admin = get_supabase(use_service_role=True)
            result = supabase_admin.table('perfiles').select('rol, nombre_completo').eq('id', user_id).execute()
            if not result.data:
                raise AuthenticationFailed('Usuario no encontrado en la tabla perfiles.')

            profile = result.data[0]
            user_payload = {
                'user_id': user_id,
                'email': user_data.get('email'),
                'rol': profile.get('rol', 'cliente'),
                'nombre_completo': profile.get('nombre_completo', '')
            }
            user = SupabaseUser(user_payload)
            return (user, token)

        except requests.exceptions.HTTPError as e:
            if e.response is not None and e.response.status_code == 401:
                raise AuthenticationFailed('Token inválido o expirado.')
            raise AuthenticationFailed('Error de comunicación con el servidor de autenticación.')
        except Exception as e:
            raise AuthenticationFailed(f'Error de autenticación: {str(e)}')