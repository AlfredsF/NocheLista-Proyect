import os
import warnings
import requests
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class SupabaseClient:
    def __init__(self, use_service_role: bool = True, jwt_token: Optional[str] = None):
        self.url = os.environ.get('SUPABASE_URL')
        if not self.url:
            raise ValueError("SUPABASE_URL no configurada")

        if use_service_role:
            self.key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_KEY')
            if not self.key:
                raise ValueError("SUPABASE_KEY (service_role) no configurada")
        else:
            self.key = os.environ.get('SUPABASE_ANON_KEY')
            if not self.key:
                warnings.warn("SUPABASE_ANON_KEY no configurada. Usando SUPABASE_KEY como fallback.")
                self.key = os.environ.get('SUPABASE_KEY')
                if not self.key:
                    raise ValueError("No se encontró ninguna clave API")
            self.jwt_token = jwt_token

        self.base_url = f"{self.url}/rest/v1"
        self.headers = {
            'apikey': self.key,
            'Content-Type': 'application/json'
        }
        if not use_service_role and jwt_token:
            self.headers['Authorization'] = f'Bearer {jwt_token}'
        elif use_service_role and jwt_token:
            self.headers['Authorization'] = f'Bearer {jwt_token}'

    def table(self, table_name: str):
        return TableProxy(self, table_name)

    def auth(self):
        return AuthProxy(self)


class TableProxy:
    def __init__(self, client: SupabaseClient, table_name: str):
        self.client = client
        self.table_name = table_name
        self.select_cols = '*'
        self.filters = []
        self.order_col = None
        self.order_desc = False
        self.insert_data = None
        self.update_data = None
        self.delete_condition = None

    def select(self, columns: str = '*'):
        self.select_cols = columns
        return self

    def eq(self, column: str, value):
        # Convertir booleanos a strings lower case que Supabase entiende
        if isinstance(value, bool):
            value = str(value).lower()
        self.filters.append(f"{column}=eq.{value}")
        return self

    def in_(self, column: str, values: list):
        formatted = ','.join(str(v) for v in values)
        self.filters.append(f"{column}=in.({formatted})")
        return self

    def order(self, column: str, desc: bool = False):
        self.order_col = column
        self.order_desc = desc
        return self

    def insert(self, data: dict):
        self.insert_data = data
        return self

    def update(self, data: dict):
        self.update_data = data
        return self

    def delete(self):
        self.delete_condition = True
        return self

    def execute(self):
        url = f"{self.client.base_url}/{self.table_name}"
        params = {}

        if self.select_cols != '*':
            params['select'] = self.select_cols

        # CORRECCIÓN: cada filtro se añade como un parámetro individual
        for f in self.filters:
            # f tiene formato "columna=operador.valor"
            key, value = f.split('=', 1)
            params[key] = value

        if self.order_col:
            params['order'] = f"{self.order_col}.{'desc' if self.order_desc else 'asc'}"

        timeout = (5, 10)

        if self.insert_data is not None:
            response = requests.post(url, headers=self.client.headers, json=self.insert_data, params=params, timeout=timeout)
            response.raise_for_status()
            return self._wrap_response(response.json())
        elif self.update_data is not None:
            response = requests.patch(url, headers=self.client.headers, json=self.update_data, params=params, timeout=timeout)
            response.raise_for_status()
            return self._wrap_response(response.json())
        elif self.delete_condition:
            response = requests.delete(url, headers=self.client.headers, params=params, timeout=timeout)
            response.raise_for_status()
            return self._wrap_response(None)
        else:
            response = requests.get(url, headers=self.client.headers, params=params, timeout=timeout)
            response.raise_for_status()
            return self._wrap_response(response.json())

    def _wrap_response(self, data):
        class ResponseWrapper:
            def __init__(self, data):
                self.data = data
        return ResponseWrapper(data)


class AuthProxy:
    def __init__(self, client: SupabaseClient):
        self.client = client

    def sign_up(self, credentials: dict):
        url = f"{self.client.url}/auth/v1/signup"
        headers = {'apikey': self.client.key, 'Content-Type': 'application/json'}
        payload = {"email": credentials["email"], "password": credentials["password"], "data": credentials.get("data", {})}
        response = requests.post(url, headers=headers, json=payload, timeout=(5, 10))
        response.raise_for_status()
        return response.json()

    def sign_in(self, credentials: dict):
        url = f"{self.client.url}/auth/v1/token?grant_type=password"
        headers = {'apikey': self.client.key, 'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=credentials, timeout=(5, 10))
        response.raise_for_status()
        return response.json()

    def get_user(self, jwt: str):
        url = f"{self.client.url}/auth/v1/user"
        headers = {'apikey': self.client.key, 'Authorization': f'Bearer {jwt}'}
        response = requests.get(url, headers=headers, timeout=(5, 10))
        response.raise_for_status()
        return response.json()

    def update_password(self, user_id: str, new_password: str):
        url = f"{self.client.url}/auth/v1/admin/users/{user_id}"
        headers = {'apikey': self.client.key, 'Content-Type': 'application/json'}
        payload = {"password": new_password}
        response = requests.put(url, headers=headers, json=payload, timeout=(5, 10))
        response.raise_for_status()
        return response.json()


_client_service_role = None

def get_supabase(use_service_role: bool = True, jwt_token: Optional[str] = None):
    if use_service_role:
        global _client_service_role
        if _client_service_role is None:
            _client_service_role = SupabaseClient(use_service_role=True)
        return _client_service_role
    else:
        return SupabaseClient(use_service_role=False, jwt_token=jwt_token)