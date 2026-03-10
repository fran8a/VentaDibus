from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.orders import OrderCreate, OrderUpdate
from typing import List, Optional, Tuple
from datetime import date as date_type
import json


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_paginated(
        self,
        page: int = 1,
        limit: int = 10,
        owner_name: Optional[str] = None,
        date_from: Optional[date_type] = None,
        date_to: Optional[date_type] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[Order], int]:
        offset = (page - 1) * limit
        query = self.db.query(Order)
        if owner_name:
            query = query.filter(Order.owner_name.ilike(f"%{owner_name}%"))
        if date_from:
            query = query.filter(Order.order_date >= date_from)
        if date_to:
            query = query.filter(Order.order_date <= date_to)
        if status:
            query = query.filter(Order.status == status)
        query = query.order_by(Order.order_date.desc())
        total = query.count()
        items = query.offset(offset).limit(limit).all()
        return items, total

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def create(self, order_data: OrderCreate, reference_images: List[str] = None) -> Order:
        db_order = Order(
            owner_name=order_data.owner_name,
            pet_name=order_data.pet_name,
            measurements=order_data.measurements,
            color=order_data.color,
            reference_images=json.dumps(reference_images or []),
            agreed_price=order_data.agreed_price,
            order_date=order_data.order_date,
            estimated_delivery_date=order_data.estimated_delivery_date,
            delivered_date=order_data.delivered_date,
            status=order_data.status,
            notes=order_data.notes,
        )
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def update(
        self,
        order_id: int,
        order_data: OrderUpdate,
        reference_images: Optional[List[str]] = None,
    ) -> Optional[Order]:
        order = self.get_by_id(order_id)
        if not order:
            return None

        # Only update fields that are explicitly non-None
        update_fields = {k: v for k, v in order_data.model_dump().items() if v is not None}
        for field, value in update_fields.items():
            setattr(order, field, value)

        if reference_images is not None:
            order.reference_images = json.dumps(reference_images)

        self.db.commit()
        self.db.refresh(order)
        return order

    def delete(self, order_id: int) -> bool:
        order = self.get_by_id(order_id)
        if order:
            self.db.delete(order)
            self.db.commit()
            return True
        return False
