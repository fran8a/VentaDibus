from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TestimonialCreate(BaseModel):
    pet_name: str = Field(..., min_length=1, max_length=100)
    pet_type: str = Field(..., min_length=1, max_length=40)
    stars: int = Field(..., ge=1, le=5)
    opinion: str = Field(..., min_length=1, max_length=1000)


class TestimonialResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_picture: Optional[str]
    pet_name: str
    pet_type: str
    stars: int
    opinion: str
    visible: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TestimonialToggleVisibility(BaseModel):
    visible: bool
