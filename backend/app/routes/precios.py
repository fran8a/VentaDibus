from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.config.database import get_db
from app.config.settings import settings
from app.schemas.precios import PricingResponse, PricingCreate, PricingUpdate
from app.repositories.pricing_repository import PricingRepository
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/api/pricing", tags=["pricing"])
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

@router.get("/", response_model=List[PricingResponse])
def get_all_pricing(db: Session = Depends(get_db)):
    """Obtener todos los precios (público)"""
    repo = PricingRepository(db)
    # Inicializar precios por defecto si no existen
    repo.initialize_default_prices()
    return repo.get_all()

@router.get("/{pricing_id}", response_model=PricingResponse)
def get_pricing(pricing_id: int, db: Session = Depends(get_db)):
    """Obtener un precio específico"""
    repo = PricingRepository(db)
    pricing = repo.get_by_id(pricing_id)
    if not pricing:
        raise HTTPException(status_code=404, detail="Precio no encontrado")
    return pricing

@router.post("/", response_model=PricingResponse)
def create_pricing(
    pricing_data: PricingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(verify_admin)
):
    """Crear un nuevo precio (solo admin)"""
    repo = PricingRepository(db)
    return repo.create(pricing_data)

@router.patch("/{pricing_id}", response_model=PricingResponse)
def update_pricing(
    pricing_id: int,
    pricing_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(verify_admin)
):
    """Actualizar un precio existente (solo admin)"""
    repo = PricingRepository(db)
    pricing = repo.get_by_id(pricing_id)
    if not pricing:
        raise HTTPException(status_code=404, detail="Precio no encontrado")
    
    # Actualizar campos válidos
    valid_fields = {'price_without_frame', 'price_with_frame', 'size', 'style'}
    for field, value in pricing_data.items():
        if field in valid_fields:
            setattr(pricing, field, value)
    
    db.commit()
    db.refresh(pricing)
    return pricing

@router.delete("/{pricing_id}")
def delete_pricing(
    pricing_id: int,
    db: Session = Depends(get_db),
):
    """Eliminar un precio (solo admin)"""
    repo = PricingRepository(db)
    if not repo.delete(pricing_id):
        raise HTTPException(status_code=404, detail="Precio no encontrado")
    return {"message": "Precio eliminado exitosamente"}
