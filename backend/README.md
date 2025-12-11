# Backend Setup Instructions

## 1. Configurar Credenciales de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth 2.0"
5. Configura:
   - Tipo de aplicación: Aplicación web
   - URIs de redirección autorizados: `http://localhost:8000/api/auth/callback`
   - Orígenes de JavaScript autorizados: `http://localhost:5174`

## 2. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

## 3. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa las credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
- `GOOGLE_CLIENT_ID`: Tu Client ID de Google
- `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google
- `SECRET_KEY`: Genera uno con: `openssl rand -hex 32`

## 4. Iniciar el Backend

```bash
python main.py
```

O con uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 5. Endpoints Disponibles

- `GET /api/auth/login` - Obtener URL de login de Google
- `GET /api/auth/callback?code=...` - Callback de Google OAuth
- `GET /api/auth/me` - Obtener usuario actual (requiere token)
- `POST /api/auth/logout` - Cerrar sesión

## Estructura del Proyecto

```
backend/
├── app/
│   ├── config/
│   │   ├── settings.py      # Configuración
│   │   └── database.py      # Conexión a BD
│   ├── models/
│   │   └── user.py          # Modelo de Usuario
│   ├── schemas/
│   │   └── user.py          # Schemas Pydantic
│   ├── repositories/
│   │   └── user_repository.py  # Capa de datos
│   ├── services/
│   │   ├── auth_service.py     # Lógica de autenticación
│   │   ├── token_service.py    # Manejo de JWT
│   │   └── google_oauth_service.py  # OAuth Google
│   └── routes/
│       └── auth_routes.py   # Endpoints API
├── main.py                  # Aplicación FastAPI
├── requirements.txt         # Dependencias
└── .env.example            # Ejemplo de variables
```

## Frontend

El frontend ya está integrado con:
- Context API para manejo de autenticación
- Componente de login en el sidebar
- Página de callback para recibir el token
- Almacenamiento del token en localStorage
