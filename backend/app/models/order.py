from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from app.config.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String, nullable=False)
    pet_name = Column(String, nullable=False)
    measurements = Column(String, nullable=False)
    color = Column(String, nullable=False)
    reference_images = Column(String, nullable=True, default="[]")  # JSON array of URLs
    agreed_price = Column(Float, nullable=False)
    order_date = Column(Date, nullable=False)
    estimated_delivery_date = Column(Date, nullable=False)
    delivered_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="pendiente")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
