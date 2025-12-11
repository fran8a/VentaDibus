from sqlalchemy.orm import Session
from app.models.drawing import Drawing
from app.schemas.drawing import DrawingCreate
from typing import List, Optional


class DrawingRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> List[Drawing]:
        """Obtener todos los dibujos"""
        return self.db.query(Drawing).order_by(Drawing.created_at.desc()).all()
    
    def get_by_id(self, drawing_id: int) -> Optional[Drawing]:
        """Obtener dibujo por ID"""
        return self.db.query(Drawing).filter(Drawing.id == drawing_id).first()
    
    def create(self, drawing_data: DrawingCreate, user_id: int) -> Drawing:
        """Crear nuevo dibujo"""
        db_drawing = Drawing(
            image_url=drawing_data.image_url,
            instagram_link=drawing_data.instagram_link,
            created_by=user_id
        )
        self.db.add(db_drawing)
        self.db.commit()
        self.db.refresh(db_drawing)
        return db_drawing
    
    def delete(self, drawing_id: int) -> bool:
        """Eliminar dibujo"""
        drawing = self.get_by_id(drawing_id)
        if drawing:
            self.db.delete(drawing)
            self.db.commit()
            return True
        return False
