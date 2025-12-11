from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config.settings import settings
from app.schemas.user import TokenData


class TokenService:
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Crear token JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[TokenData]:
        """Verificar y decodificar token JWT"""
        try:
            print(f"🔐 Verificando token: {token[:50]}...")
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            user_id: str = payload.get("sub")
            email: str = payload.get("email")
            print(f"👤 User ID extraído del token: {user_id}")
            print(f"📧 Email extraído del token: {email}")
            if user_id is None:
                print(f"❌ No se encontró user_id en el payload")
                return None
            return TokenData(user_id=user_id, email=email)
        except JWTError as e:
            print(f"❌ Error JWT: {str(e)}")
            return None
