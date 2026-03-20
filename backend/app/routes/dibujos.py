from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.settings import settings
from app.schemas.dibujos import DrawingCreate, DrawingResponse
from app.repositories.drawing_repository import DrawingRepository
from app.services.auth_service import AuthService
from app.services.media_storage_service import save_upload_file, delete_uploaded_file
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional

router = APIRouter(prefix="/api/drawings", tags=["Drawings"])
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


def verify_admin(user = Depends(get_current_user_from_token)):
    """Verificar que el usuario sea admin"""
    if user.email.lower() not in settings.admin_emails_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    return user


@router.get("", response_model=List[DrawingResponse])
async def get_all_drawings(db: Session = Depends(get_db)):
    """Obtener todos los dibujos (público)"""
    drawing_repo = DrawingRepository(db)
    drawings = drawing_repo.get_all()
    return drawings


@router.post("/upload", response_model=DrawingResponse)
async def upload_drawing(
    file: UploadFile = File(...),
    instagram_link: Optional[str] = Form(None),
    user = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Subir un nuevo dibujo (solo admin)"""
    # Validar tipo de archivo
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    try:
        image_url = save_upload_file(file, "drawings", prefix=str(user.id))
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save uploaded image: {exc}"
        ) from exc
    
    # Crear registro en la base de datos
    drawing_repo = DrawingRepository(db)
    drawing_data = DrawingCreate(
        image_url=image_url,
        instagram_link=instagram_link if instagram_link and instagram_link.strip() else None
    )
    
    drawing = drawing_repo.create(drawing_data, user.id)
    return drawing


@router.delete("/{drawing_id}")
async def delete_drawing(
    drawing_id: int,
    user = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Eliminar un dibujo (solo admin)"""
    drawing_repo = DrawingRepository(db)
    
    # Obtener dibujo
    drawing = drawing_repo.get_by_id(drawing_id)
    if not drawing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drawing not found"
        )
    
    # Eliminar archivo físico o remoto
    delete_uploaded_file(drawing.image_url)
    
    # Eliminar de la base de datos
    drawing_repo.delete(drawing_id)
    
    return {"message": "Drawing deleted successfully"}


@router.patch("/{drawing_id}", response_model=DrawingResponse)
async def update_drawing(
    drawing_id: int,
    instagram_link: Optional[str] = Form(None),
    user = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Actualizar link de Instagram de un dibujo (solo admin)"""
    drawing_repo = DrawingRepository(db)
    
    # Obtener dibujo
    drawing = drawing_repo.get_by_id(drawing_id)
    if not drawing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drawing not found"
        )
    
    
    # Actualizar link de Instagram
    drawing.instagram_link = instagram_link if instagram_link and instagram_link.strip() else None
    db.commit()
    db.refresh(drawing)
    
    print(f"Dibujo actualizado")
    return drawing
