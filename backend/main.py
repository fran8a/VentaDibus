from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config.database import engine, Base
from app.config.settings import settings
from app.routes.auth_routes import router as auth_router
from app.routes.drawing_routes import router as drawing_router
import os

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VentaDibus API",
    description="API para venta de dibujos de mascotas con autenticación Google",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(auth_router)
app.include_router(drawing_router)

# Crear directorio de uploads si no existe
os.makedirs("uploads/drawings", exist_ok=True)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    return {"message": "VentaDibus API - Sistema de autenticación con Google OAuth"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
