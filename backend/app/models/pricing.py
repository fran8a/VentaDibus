from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.config.database import Base

class Pricing(Base):
    __tablename__ = "pricing"

    id = Column(Integer, primary_key=True, index=True)
    size = Column(String, nullable=False)  # "15x21", "20x30", "30x40"
    style = Column(String, nullable=False)  # "Blanco y negro", "Color"
    price_without_frame = Column(Integer, nullable=False)
    price_with_frame = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
