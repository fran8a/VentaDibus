from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, Request
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.orders import OrderResponse, OrderListItem, PaginatedOrders, OrderCreate, OrderUpdate
from app.repositories.order_repository import OrderRepository
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
import shutil
import os
import math
from pathlib import Path
from datetime import date as date_type

router = APIRouter(prefix="/api/orders", tags=["Orders"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

ADMIN_EMAIL = "franochoarodriguez@gmail.com"
UPLOAD_DIR = Path("uploads/orders")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_current_user_from_token(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user


def verify_admin(user=Depends(get_current_user_from_token)):
    if user.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action",
        )
    return user


def _parse_optional_date(value: Optional[str]) -> Optional[date_type]:
    if value and value.strip():
        return date_type.fromisoformat(value.strip())
    return None


@router.get("", response_model=PaginatedOrders)
async def get_orders(
    page: int = Query(1, ge=1),
    owner_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user=Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Listar pedidos paginados con filtros opcionales (solo admin)"""
    order_repo = OrderRepository(db)
    items, total = order_repo.get_all_paginated(
        page=page,
        limit=10,
        owner_name=owner_name or None,
        date_from=_parse_optional_date(date_from),
        date_to=_parse_optional_date(date_to),
        status=status or None,
    )
    total_pages = math.ceil(total / 10) if total > 0 else 1
    return PaginatedOrders(items=items, total=total, page=page, total_pages=total_pages)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    user=Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Obtener detalle de un pedido (solo admin)"""
    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    return order


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    owner_name: str = Form(...),
    pet_name: str = Form(...),
    measurements: str = Form(...),
    color: str = Form(...),
    agreed_price: float = Form(...),
    order_date: str = Form(...),
    estimated_delivery_date: str = Form(...),
    delivered_date: Optional[str] = Form(None),
    order_status: str = Form("pendiente"),
    notes: Optional[str] = Form(None),
    reference_files: Optional[List[UploadFile]] = File(None),
    user=Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Crear un nuevo pedido (solo admin)"""
    image_urls = []
    if reference_files:
        for file in reference_files:
            if file and file.filename and file.content_type and file.content_type.startswith("image/"):
                safe_name = os.path.basename(file.filename)
                file_name = f"{order_date}_{user.id}_{safe_name}"
                file_path = UPLOAD_DIR / file_name
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                image_urls.append(f"/uploads/orders/{file_name}")

    order_data = OrderCreate(
        owner_name=owner_name,
        pet_name=pet_name,
        measurements=measurements,
        color=color,
        agreed_price=agreed_price,
        order_date=date_type.fromisoformat(order_date),
        estimated_delivery_date=date_type.fromisoformat(estimated_delivery_date),
        delivered_date=_parse_optional_date(delivered_date),
        status=order_status,
        notes=notes if notes and notes.strip() else None,
    )

    order_repo = OrderRepository(db)
    order = order_repo.create(order_data, reference_images=image_urls)
    return order


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    owner_name: Optional[str] = Form(None),
    pet_name: Optional[str] = Form(None),
    measurements: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    agreed_price: Optional[float] = Form(None),
    order_date: Optional[str] = Form(None),
    estimated_delivery_date: Optional[str] = Form(None),
    delivered_date: Optional[str] = Form(None),
    order_status: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    reference_files: Optional[List[UploadFile]] = File(None),
    user=Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Actualizar un pedido (solo admin)"""
    order_repo = OrderRepository(db)
    existing = order_repo.get_by_id(order_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    new_images = None
    if reference_files:
        valid_files = [
            f for f in reference_files
            if f and f.filename and f.content_type and f.content_type.startswith("image/")
        ]
        if valid_files:
            new_images = []
            for file in valid_files:
                safe_name = os.path.basename(file.filename)
                file_name = f"{order_id}_{user.id}_{safe_name}"
                file_path = UPLOAD_DIR / file_name
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                new_images.append(f"/uploads/orders/{file_name}")

    order_data = OrderUpdate(
        owner_name=owner_name,
        pet_name=pet_name,
        measurements=measurements,
        color=color,
        agreed_price=agreed_price,
        order_date=_parse_optional_date(order_date),
        estimated_delivery_date=_parse_optional_date(estimated_delivery_date),
        delivered_date=_parse_optional_date(delivered_date),
        status=order_status,
        notes=notes,
    )

    order = order_repo.update(order_id, order_data, reference_images=new_images)
    return order


@router.patch("/{order_id}/quick", response_model=OrderResponse)
async def quick_update_order(
    order_id: int,
    request: Request,
    user=Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Actualiza rápidamente estado y/o fecha entregado (solo admin)"""
    body = await request.json()
    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if "status" in body:
        order.status = body["status"]
    if "delivered_date" in body:
        val = body["delivered_date"]
        order.delivered_date = date_type.fromisoformat(val) if val else None

    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    user=Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Eliminar un pedido (solo admin)"""
    order_repo = OrderRepository(db)
    deleted = order_repo.delete(order_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
