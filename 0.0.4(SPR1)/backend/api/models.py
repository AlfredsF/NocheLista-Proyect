from django.db import models

class Perfil(models.Model):
    id = models.UUIDField(primary_key=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    nombre_completo = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    password_hash = models.CharField(max_length=255)
    rol = models.CharField(max_length=20)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'perfiles'

class Hotel(models.Model):
    id = models.UUIDField(primary_key=True)
    gestor_id = models.UUIDField(null=True, blank=True)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    direccion = models.CharField(max_length=500)
    ciudad = models.CharField(max_length=100)
    estrellas = models.IntegerField()
    imagen_principal = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=False)
    aprobado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'hoteles'

class Habitacion(models.Model):
    id = models.UUIDField(primary_key=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, db_column='hotel_id')
    tipo = models.CharField(max_length=20)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    precio_por_noche = models.DecimalField(max_digits=10, decimal_places=2)
    capacidad = models.IntegerField(default=2)
    disponible = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'habitaciones'

class Reserva(models.Model):
    id = models.UUIDField(primary_key=True)
    usuario = models.ForeignKey(Perfil, on_delete=models.CASCADE, db_column='usuario_id')
    habitacion = models.ForeignKey(Habitacion, on_delete=models.CASCADE, db_column='habitacion_id')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, db_column='hotel_id')
    fecha_entrada = models.DateField()
    fecha_salida = models.DateField()
    precio_total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'reservas'

class SolicitudAfiliacion(models.Model):
    id = models.UUIDField(primary_key=True)
    usuario = models.ForeignKey(Perfil, on_delete=models.CASCADE, db_column='usuario_id')
    nombre_hotel = models.CharField(max_length=255)
    descripcion = models.TextField()
    direccion = models.CharField(max_length=500)
    ciudad = models.CharField(max_length=100)
    estado = models.CharField(max_length=20)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'solicitudes_afiliacion'

class Promocion(models.Model):
    id = models.UUIDField(primary_key=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, db_column='hotel_id')
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    descuento_porcentaje = models.IntegerField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'promociones'
