from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.settings import settings
from app.schemas.testimonials import TestimonialCreate, TestimonialResponse, TestimonialToggleVisibility
from app.repositories.testimonial_repository import TestimonialRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer
from typing import List

router = APIRouter(prefix="/api/testimonials", tags=["Testimonials"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Obtener usuario actual desde token"""
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
    return user


def verify_admin(user=Depends(get_current_user_from_token)):
    """Verificar que el usuario sea admin"""
    if user.email.lower() not in settings.admin_emails_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    return user


def _build_response(testimonial, user_repo: UserRepository) -> dict:
    """Construir respuesta con datos del usuario"""
    user = user_repo.get_by_id(testimonial.user_id)
    return {
        "id": testimonial.id,
        "user_id": testimonial.user_id,
        "user_name": user.name if user else "Usuario eliminado",
        "user_picture": user.picture if user else None,
        "pet_name": testimonial.pet_name,
        "pet_type": testimonial.pet_type,
        "stars": testimonial.stars,
        "opinion": testimonial.opinion,
        "visible": testimonial.visible,
        "created_at": testimonial.created_at,
    }


@router.get("", response_model=List[TestimonialResponse])
async def get_public_testimonials(db: Session = Depends(get_db)):
    """Obtener todos los testimonios visibles (público)"""
    repo = TestimonialRepository(db)
    user_repo = UserRepository(db)
    testimonials = repo.get_all_visible()
    return [_build_response(t, user_repo) for t in testimonials]


@router.get("/all", response_model=List[TestimonialResponse])
async def get_all_testimonials(
    user=Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Obtener todos los testimonios incluyendo ocultos (solo admin)"""
    repo = TestimonialRepository(db)
    user_repo = UserRepository(db)
    testimonials = repo.get_all()
    return [_build_response(t, user_repo) for t in testimonials]


@router.get("/mine", response_model=TestimonialResponse)
async def get_my_testimonial(
    user=Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Obtener el testimonio del usuario autenticado"""
    repo = TestimonialRepository(db)
    user_repo = UserRepository(db)
    testimonial = repo.get_by_user_id(user.id)
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No has dejado ningún testimonio aún"
        )
    return _build_response(testimonial, user_repo)


@router.post("", response_model=TestimonialResponse)
async def create_testimonial(
    testimonial_data: TestimonialCreate,
    user=Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Crear o actualizar testimonio del usuario autenticado (uno por usuario)"""
    repo = TestimonialRepository(db)
    user_repo = UserRepository(db)

    existing = repo.get_by_user_id(user.id)
    if existing:
        testimonial = repo.update(existing, testimonial_data)
    else:
        testimonial = repo.create(testimonial_data, user.id)

    return _build_response(testimonial, user_repo)


@router.patch("/{testimonial_id}/visibility", response_model=TestimonialResponse)
async def toggle_testimonial_visibility(
    testimonial_id: int,
    visibility_data: TestimonialToggleVisibility,
    user=Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Cambiar visibilidad de un testimonio (solo admin)"""
    repo = TestimonialRepository(db)
    user_repo = UserRepository(db)

    testimonial = repo.toggle_visibility(testimonial_id, visibility_data.visible)
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    return _build_response(testimonial, user_repo)


@router.delete("/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: int,
    user=Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Eliminar un testimonio (solo admin)"""
    repo = TestimonialRepository(db)
    if not repo.delete(testimonial_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    return {"message": "Testimonial deleted successfully"}
