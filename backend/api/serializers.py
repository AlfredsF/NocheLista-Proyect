import re
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    nombre_completo = serializers.CharField(max_length=255)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    rol = serializers.ChoiceField(choices=['cliente', 'gestor'])

    def validate_telefono(self, value):
        if value and not re.match(r'^\+?\d{7,15}$', value):
            raise serializers.ValidationError('Teléfono no válido')
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class HotelSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    gestor_id = serializers.CharField(required=False, allow_null=True)
    nombre = serializers.CharField(max_length=255)
    descripcion = serializers.CharField()
    direccion = serializers.CharField(max_length=500)
    ciudad = serializers.CharField(max_length=100, default='Quito')
    estrellas = serializers.IntegerField(min_value=1, max_value=5)
    imagen_principal = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    activo = serializers.BooleanField(read_only=True)
    aprobado = serializers.BooleanField(read_only=True)


class HabitacionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    hotel_id = serializers.CharField()
    tipo = serializers.ChoiceField(choices=['standard', 'deluxe', 'suite'])
    nombre = serializers.CharField(max_length=255)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    precio_por_noche = serializers.DecimalField(max_digits=10, decimal_places=2)
    capacidad = serializers.IntegerField(default=2, min_value=1)
    disponible = serializers.BooleanField(default=True)


class ReservaSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    usuario_id = serializers.CharField(read_only=True)
    habitacion_id = serializers.CharField()
    hotel_id = serializers.CharField()
    fecha_entrada = serializers.DateField()
    fecha_salida = serializers.DateField()
    precio_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    estado = serializers.CharField(read_only=True)

    def validate(self, data):
        if data['fecha_salida'] <= data['fecha_entrada']:
            raise serializers.ValidationError('La fecha de salida debe ser posterior a la de entrada')
        return data


class SolicitudSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    usuario_id = serializers.CharField(read_only=True)
    nombre_hotel = serializers.CharField(max_length=255)
    descripcion = serializers.CharField()
    direccion = serializers.CharField(max_length=500)
    ciudad = serializers.CharField(max_length=100, default='Quito')
    estado = serializers.CharField(read_only=True)


class PromocionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    hotel_id = serializers.CharField()
    titulo = serializers.CharField(max_length=255)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    descuento_porcentaje = serializers.IntegerField(min_value=1, max_value=100)
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField()
    activo = serializers.BooleanField(default=True)

    def validate(self, data):
        if data['fecha_fin'] <= data['fecha_inicio']:
            raise serializers.ValidationError('La fecha fin debe ser posterior a la fecha inicio')
        return data


class PerfilSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    nombre_completo = serializers.CharField(max_length=255)
    telefono = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rol = serializers.CharField(read_only=True)
    creado_en = serializers.DateTimeField(read_only=True)
