from pydantic import BaseModel, field_validator
from pydantic import ConfigDict
from typing import Optional, List
from datetime import date, datetime
import json


class OrderCreate(BaseModel):
    owner_name: str
    pet_name: str
    measurements: str
    color: str
    agreed_price: float
    order_date: date
    estimated_delivery_date: date
    delivered_date: Optional[date] = None
    status: str = "pendiente"
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    owner_name: Optional[str] = None
    pet_name: Optional[str] = None
    measurements: Optional[str] = None
    color: Optional[str] = None
    agreed_price: Optional[float] = None
    order_date: Optional[date] = None
    estimated_delivery_date: Optional[date] = None
    delivered_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class OrderListItem(BaseModel):
    id: int
    owner_name: str
    agreed_price: float
    estimated_delivery_date: date
    status: str

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    owner_name: str
    pet_name: str
    measurements: str
    color: str
    reference_images: List[str]
    agreed_price: float
    order_date: date
    estimated_delivery_date: date
    delivered_date: Optional[date]
    status: str
    notes: Optional[str]
    created_at: datetime

    @field_validator("reference_images", mode="before")
    @classmethod
    def parse_reference_images(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []

    model_config = ConfigDict(from_attributes=True)


class PaginatedOrders(BaseModel):
    items: List[OrderListItem]
    total: int
    page: int
    total_pages: int
