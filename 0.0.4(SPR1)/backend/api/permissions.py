from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'


class IsGestor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'gestor'


class IsCliente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'cliente'


class IsAdminOrGestor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ('admin', 'gestor')


class IsAuthenticatedOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.is_authenticated


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user_id = obj.get('usuario_id') or obj.get('user_id')
        return request.user.rol == 'admin' or str(user_id) == str(request.user.id)
