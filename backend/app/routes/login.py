from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.settings import settings
from app.services.auth_service import AuthService
from app.schemas.usuario import UserResponse, Token
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


class GoogleTokenRequest(BaseModel):
    token: str


@router.post("/google", response_model=Token)
async def google_login(
    token_request: GoogleTokenRequest,
    db: Session = Depends(get_db)
):
    """Autenticar con Google usando el token JWT de Google"""
    try:
        # Verificar el token con Google (con tolerancia de 60 segundos para desfase de reloj)
        idinfo = id_token.verify_oauth2_token(
            token_request.token,
            requests.Request(),
            settings.google_client_id,
            clock_skew_in_seconds=60
        )
        
        print(f"✅ Token verificado exitosamente para: {idinfo.get('email')}")
        
        # Extraer información del usuario
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', email)
        picture = idinfo.get('picture', '')
        
        print(f"👤 Usuario: {name} ({email})")
        
        # Crear o actualizar usuario en la base de datos
        auth_service = AuthService(db)
        from app.repositories.user_repository import UserRepository
        from app.models.user import User
        
        user_repo = UserRepository(db)
        user = user_repo.get_by_google_id(google_id)
        
        if not user:
            user = user_repo.get_by_email(email)
            if user:
                # Usuario existe con ese email, actualizar google_id
                print(f"🔄 Actualizando usuario existente")
                user.google_id = google_id
                user.name = name
                user.picture = picture
                db.commit()
            else:
                # Crear nuevo usuario
                print(f"➕ Creando nuevo usuario")
                user = User(
                    google_id=google_id,
                    email=email,
                    name=name,
                    picture=picture
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        
        # Generar token JWT propio
        from app.services.token_service import TokenService
        token_service = TokenService()
        access_token = token_service.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except ValueError as e:
        print(f"❌ Error de validación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )


@router.get("/login")
async def login():
    """Iniciar proceso de login con Google"""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={settings.google_redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline"
    )
    return {"url": google_auth_url}


@router.get("/callback")
async def callback(code: str, db: Session = Depends(get_db)):
    """Callback de Google OAuth"""
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No authorization code provided"
        )
    
    auth_service = AuthService(db)
    result = await auth_service.authenticate_with_google(code)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not authenticate with Google"
        )
    
    # Redirigir al frontend con el token
    frontend_url = f"{settings.frontend_url}/auth/success?token={result['access_token']}"
    return RedirectResponse(url=frontend_url)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Obtener información del usuario actual"""
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    print(f"✅ Usuario autenticado: {user.email}")
    return user


@router.post("/logout")
async def logout():
    """Cerrar sesión (el frontend debe eliminar el token)"""
    return {"message": "Logged out successfully"}
