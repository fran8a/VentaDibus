# VentaDibus - Sistema de Venta de Dibujos de Mascotas

Plataforma web para la venta de dibujos personalizados de mascotas con autenticación mediante Google OAuth.

## Estructura del Proyecto

```
ventaDibus/
├── frontend/          # Aplicación React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizables (Sidebar)
│   │   ├── pages/         # Páginas principales
│   │   ├── context/       # Context API (AuthContext)
│   │   └── assets/        # Imágenes y recursos estáticos
│   ├── public/            # Archivos públicos
│   └── package.json
│
└── backend/           # API REST con FastAPI + Python
    ├── app/
    │   ├── config/        # Configuración y base de datos
    │   ├── models/        # Modelos SQLAlchemy
    │   ├── routes/        # Endpoints de la API
    │   ├── services/      # Lógica de negocio
    │   ├── repositories/  # Acceso a datos
    │   └── schemas/       # Esquemas Pydantic
    ├── main.py
    └── requirements.txt
```

## 🚀 Instalación y Ejecución

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Backend

```bash
cd backend
pip install -r requirements.txt

# Configurar variables de entorno en .env
# GOOGLE_CLIENT_ID=tu_client_id
# GOOGLE_CLIENT_SECRET=tu_client_secret
# SECRET_KEY=tu_secret_key

python main.py
```
backend  `http://localhost:8000`


## 🔐 Autenticación

El sistema utiliza Google OAuth 2.0 con la librería `@react-oauth/google` para el login seguro de usuarios.

## 🛠️ Tecnologías

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router DOM
- @react-oauth/google

**Backend:**
- Python 3.13
- FastAPI
- SQLAlchemy
- Pydantic
- Google Auth
- JWT (python-jose)

---

Desarrollado con ❤️ por Fran
