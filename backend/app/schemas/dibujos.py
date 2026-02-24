from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class DrawingCreate(BaseModel):
    image_url: str
    instagram_link: Optional[str] = None


class DrawingResponse(BaseModel):
    id: int
    image_url: str
    instagram_link: Optional[str]
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True
