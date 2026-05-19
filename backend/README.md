## Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

## Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa las credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
- `GOOGLE_CLIENT_ID`: Tu Client ID de Google
- `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google
- `SECRET_KEY`: Genera uno con: `openssl rand -hex 32`

## Iniciar el Backend

```bash
python main.py
```

O con uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Mantener activo el Backend en Render Free

Render Free duerme los servicios web despues de 15 minutos sin trafico. Para reducir el cold start, este repo incluye un GitHub Action que llama al endpoint `/health` cada 10 minutos.

Configuralo asi:

1. En GitHub, entra al repo y abre `Settings` > `Secrets and variables` > `Actions`.
2. Crea un secret llamado `RENDER_HEALTH_URL`.
3. Como valor usa la URL publica de Render con `/health`, por ejemplo:

```text
https://tu-backend.onrender.com/health
```

4. Sube los cambios a GitHub. El workflow `.github/workflows/keep-render-awake.yml` se ejecuta solo cada 10 minutos y tambien se puede correr manualmente desde la pestana `Actions`.

Cada 30 minutos no alcanza para mantenerlo despierto, porque Render Free se duerme antes.


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
