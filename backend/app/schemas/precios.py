from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PricingBase(BaseModel):
    size: str
    style: str
    price_without_frame: int
    price_with_frame: int

class PricingCreate(PricingBase):
    pass

class PricingUpdate(BaseModel):
    size: Optional[str] = None
    style: Optional[str] = None
    price_without_frame: Optional[int] = None
    price_with_frame: Optional[int] = None

class PricingResponse(PricingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
