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

Render Free duerme los servicios web despues de 15 minutos sin trafico. Para reducir el cold start, este repo incluye un GitHub Action que llama al endpoint `/health` cada 20 minutos.

El workflow esta en:

```text
.github/workflows/keep-render-awake.yml
```

Actualmente llama a:

```text
https://ventadibus.onrender.com/api/health
```

Subi los cambios a GitHub. El workflow se ejecuta solo cada 20 minutos y tambien se puede correr manualmente desde la pestana `Actions`.

Cada 20 minutos puede reducir el cold start, pero Render Free puede dormirse despues de 15 minutos sin trafico.


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
