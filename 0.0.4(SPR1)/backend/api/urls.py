from django.urls import path
from . import views

urlpatterns = [

    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/me/', views.MeView.as_view(), name='me'),

    # Hoteles
    path('hoteles/', views.HotelListCreateView.as_view(), name='hotel-list'),
    path('hoteles/<str:pk>/', views.HotelDetailView.as_view(), name='hotel-detail'),

    # Habitaciones
    path('habitaciones/', views.HabitacionListCreateView.as_view(), name='habitacion-list'),
    path('habitaciones/<str:pk>/', views.HabitacionDetailView.as_view(), name='habitacion-detail'),

    # Buscar
    path('buscar/', views.BuscarHotelesView.as_view(), name='buscar-hoteles'),

    # Reservas
    path('reservas/', views.ReservaListCreateView.as_view(), name='reserva-list'),
    path('reservas/<str:pk>/', views.ReservaDetailView.as_view(), name='reserva-detail'),

    # Solicitudes de afiliación
    path('solicitudes/', views.SolicitudListView.as_view(), name='solicitud-list'),
    path('solicitudes/crear/', views.SolicitudCreateView.as_view(), name='solicitud-crear'),
    path('solicitudes/<str:pk>/', views.SolicitudDetailView.as_view(), name='solicitud-detail'),

    # Usuarios (admin)
    path('usuarios/', views.UsuarioListView.as_view(), name='usuario-list'),
    path('usuarios/<str:pk>/', views.UsuarioDetailView.as_view(), name='usuario-detail'),

    # Métricas
    path('admin/metricas/', views.AdminMetricasView.as_view(), name='admin-metricas'),
    path('gestor/dashboard/', views.GestorDashboardView.as_view(), name='gestor-dashboard'),

    # Gestor: hoteles
    path('gestor/mi-hotel/', views.GestorHotelView.as_view(), name='gestor-hotel'),

    # Promociones
    path('promociones/', views.PromocionListCreateView.as_view(), name='promocion-list'),
    path('promociones/<str:pk>/', views.PromocionDetailView.as_view(), name='promocion-detail'),
]