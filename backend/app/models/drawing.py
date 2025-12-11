from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base


class Drawing(Base):
    __tablename__ = "drawings"
    
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String, nullable=False)
    instagram_link = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
