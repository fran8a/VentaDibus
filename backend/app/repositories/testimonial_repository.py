from sqlalchemy.orm import Session
from app.models.testimonial import Testimonial
from app.schemas.testimonials import TestimonialCreate
from typing import List, Optional


class TestimonialRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_visible(self) -> List[Testimonial]:
        """Obtener todos los testimonios visibles (público)"""
        return (
            self.db.query(Testimonial)
            .filter(Testimonial.visible == True)
            .order_by(Testimonial.created_at.desc())
            .all()
        )

    def get_all(self) -> List[Testimonial]:
        """Obtener todos los testimonios incluyendo ocultos (admin)"""
        return (
            self.db.query(Testimonial)
            .order_by(Testimonial.created_at.desc())
            .all()
        )

    def get_by_id(self, testimonial_id: int) -> Optional[Testimonial]:
        """Obtener testimonio por ID"""
        return (
            self.db.query(Testimonial)
            .filter(Testimonial.id == testimonial_id)
            .first()
        )

    def get_by_user_id(self, user_id: int) -> Optional[Testimonial]:
        """Obtener testimonio de un usuario específico"""
        return (
            self.db.query(Testimonial)
            .filter(Testimonial.user_id == user_id)
            .first()
        )

    def create(self, testimonial_data: TestimonialCreate, user_id: int) -> Testimonial:
        """Crear nuevo testimonio"""
        db_testimonial = Testimonial(
            user_id=user_id,
            pet_name=testimonial_data.pet_name,
            pet_type=testimonial_data.pet_type,
            stars=testimonial_data.stars,
            opinion=testimonial_data.opinion,
        )
        self.db.add(db_testimonial)
        self.db.commit()
        self.db.refresh(db_testimonial)
        return db_testimonial

    def update(self, testimonial: Testimonial, testimonial_data: TestimonialCreate) -> Testimonial:
        """Actualizar testimonio existente"""
        testimonial.pet_name = testimonial_data.pet_name
        testimonial.pet_type = testimonial_data.pet_type
        testimonial.stars = testimonial_data.stars
        testimonial.opinion = testimonial_data.opinion
        self.db.commit()
        self.db.refresh(testimonial)
        return testimonial

    def toggle_visibility(self, testimonial_id: int, visible: bool) -> Optional[Testimonial]:
        """Cambiar visibilidad de un testimonio (admin)"""
        testimonial = self.get_by_id(testimonial_id)
        if testimonial:
            testimonial.visible = visible
            self.db.commit()
            self.db.refresh(testimonial)
        return testimonial

    def delete(self, testimonial_id: int) -> bool:
        """Eliminar testimonio"""
        testimonial = self.get_by_id(testimonial_id)
        if testimonial:
            self.db.delete(testimonial)
            self.db.commit()
            return True
        return False
