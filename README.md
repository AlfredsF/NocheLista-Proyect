# 🏨 NocheLista

Sistema web de reservas hoteleras desarrollado con **React**, **Django REST Framework** y **Supabase**, orientado a facilitar la búsqueda, reserva y administración de alojamientos.

> Proyecto académico desarrollado para la asignatura **Gestión de Proyectos de Software (TDSD333)** de la **Escuela Politécnica Nacional**.

---

# 📖 Descripción

NocheLista es una plataforma que permite a los clientes buscar hoteles, consultar habitaciones disponibles y realizar reservas de manera sencilla.

Los establecimientos hoteleros cuentan con un panel para administrar su información, habitaciones, precios y reservas.

La aplicación se ejecuta completamente en **entorno local**, mientras que la información se almacena en **Supabase (PostgreSQL)**.

---

# 🚀 Estado del proyecto

🟡 En desarrollo

- ✔ Frontend en React
- ✔ Backend con Django REST Framework
- ✔ Base de datos PostgreSQL mediante Supabase
- ✔ API REST funcional
- ✔ Sistema de autenticación
- ✔ Gestión de hoteles
- ✔ Gestión de habitaciones
- ✔ Gestión de reservas

**Demo pública:** No disponible (ejecución local)

Repositorio:

https://github.com/AlfredsF/NocheLista-Proyect

---

# 🛠 Tecnologías

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- Python
- Django
- Django REST Framework

## Base de datos

- Supabase
- PostgreSQL

## Herramientas

- Git
- GitHub
- Visual Studio Code

---

# 📂 Estructura del proyecto

```text
NocheLista-Proyect/

├── frontend-react/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── NocheLista/
│   └── backend/
│       ├── api/
│       ├── nochelista/
│       ├── manage.py
│       └── requirements.txt
│
├── README.md
└── .gitignore
```

---

# ⚙ Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/AlfredsF/NocheLista-Proyect.git
```

---

## 2. Backend

Entrar al proyecto

```bash
cd NocheLista-Proyect/NocheLista/backend
```

Crear entorno virtual

```bash
python -m venv venv
```

Activarlo

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Instalar dependencias

```bash
pip install -r requirements.txt
```

Crear el archivo `.env`

```env
SUPABASE_URL=https://tu-proyecto.supabase.co

SUPABASE_KEY=tu_clave

DJANGO_SECRET_KEY=tu_clave

DEBUG=True

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Ejecutar el servidor

```bash
python manage.py runserver
```

Backend disponible en

```
http://localhost:8000
```

---

## 3. Frontend

Entrar al frontend

```bash
cd frontend-react
```

Instalar dependencias

```bash
npm install
```

Crear el archivo `.env`

```env
VITE_API_URL=http://localhost:8000
```

Ejecutar

```bash
npm run dev
```

Frontend disponible en

```
http://localhost:5173
```

---

# 🗄 Base de datos

El proyecto utiliza **Supabase** como proveedor de PostgreSQL.

Se requiere:

- Crear un proyecto en Supabase.
- Crear las tablas correspondientes.
- Configurar las políticas RLS.
- Agregar datos de prueba.

---

# ✨ Funcionalidades

## Cliente

- Registro
- Inicio de sesión
- Buscar hoteles
- Ver habitaciones
- Realizar reservas
- Consultar reservas

## Establecimiento

- Administrar hotel
- Administrar habitaciones
- Actualizar precios
- Gestionar reservas

## Administrador

- Gestionar usuarios
- Aprobar hoteles
- Supervisar reservas

---

# 🧪 Pruebas

Backend

```bash
python manage.py test
```

Frontend (si está configurado)

```bash
npm run test
```

---

# 👥 Roles

| Rol | Descripción |
|------|-------------|
| Administrador | Gestiona el sistema y los usuarios |
| Establecimiento | Administra hoteles y habitaciones |
| Cliente | Busca hoteles y realiza reservas |

---

# 🤝 Contribuciones

Proyecto de carácter académico.

Actualmente no se aceptan contribuciones externas.

---

# 👨‍💻 Autores

**Alfredo Fuel**

GitHub:

https://github.com/AlfredsF

**Melva Suarez**

GitHub:

https://github.com/MelvaSuarez29

---

# 📄 Licencia

Proyecto desarrollado únicamente con fines académicos.

---

**Escuela Politécnica Nacional**

**Gestión de Proyectos de Software (TDSD333)**

**Período Académico 2026-B**
