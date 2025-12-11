from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse
from app.services.token_service import TokenService
from app.services.google_oauth_service import GoogleOAuthService
from typing import Optional, Dict


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def authenticate_with_google(self, code: str) -> Optional[Dict]:
        """Autenticar usuario con Google OAuth"""
        # Obtener información del usuario de Google
        google_user = await GoogleOAuthService.get_user_info(code)
        
        if not google_user:
            return None
        
        google_id = google_user.get('id')
        email = google_user.get('email')
        name = google_user.get('name')
        picture = google_user.get('picture')
        
        # Buscar o crear usuario
        user = self.user_repo.get_by_google_id(google_id)
        
        if not user:
            # Crear nuevo usuario
            user_data = UserCreate(
                email=email,
                name=name,
                picture=picture,
                google_id=google_id
            )
            user = self.user_repo.create(user_data)
        else:
            # Actualizar información si cambió
            update_data = {
                'name': name,
                'picture': picture,
                'email': email
            }
            user = self.user_repo.update(user, update_data)
        
        # Generar token JWT
        access_token = TokenService.create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
    
    def get_current_user(self, token: str) -> Optional[UserResponse]:
        """Obtener usuario actual desde token"""
        print(f"🔍 AuthService.get_current_user llamado con token: {token[:50] if token else 'None'}...")
        token_data = TokenService.verify_token(token)
        
        if not token_data or not token_data.user_id:
            print(f"❌ Token inválido o sin user_id")
            return None
        
        print(f"👤 Buscando usuario con ID: {token_data.user_id}")
        user = self.user_repo.get_by_id(int(token_data.user_id))
        
        if not user:
            print(f"❌ Usuario no encontrado en la base de datos")
            return None
        
        print(f"✅ Usuario encontrado: {user.email} (ID: {user.id})")
        return UserResponse.from_orm(user)
