from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.usuario import UserCreate
from typing import Optional


class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Obtener usuario por email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_google_id(self, google_id: str) -> Optional[User]:
        """Obtener usuario por Google ID"""
        return self.db.query(User).filter(User.google_id == google_id).first()
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Obtener usuario por ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create(self, user_data: UserCreate) -> User:
        """Crear nuevo usuario"""
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            picture=user_data.picture,
            google_id=user_data.google_id
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def update(self, user: User, user_data: dict) -> User:
        """Actualizar usuario existente"""
        for key, value in user_data.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user
