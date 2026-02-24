from sqlalchemy.orm import Session
from app.models.pricing import Pricing
from app.schemas.precios import PricingCreate, PricingUpdate
from typing import List, Optional

class PricingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Pricing]:
        return self.db.query(Pricing).order_by(Pricing.id).all()

    def get_by_id(self, pricing_id: int) -> Optional[Pricing]:
        return self.db.query(Pricing).filter(Pricing.id == pricing_id).first()

    def create(self, pricing_data: PricingCreate) -> Pricing:
        pricing = Pricing(**pricing_data.model_dump())
        self.db.add(pricing)
        self.db.commit()
        self.db.refresh(pricing)
        return pricing

    def update(self, pricing_id: int, pricing_data: PricingUpdate) -> Optional[Pricing]:
        pricing = self.get_by_id(pricing_id)
        if not pricing:
            return None
        
        update_data = pricing_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(pricing, field, value)
        
        self.db.commit()
        self.db.refresh(pricing)
        return pricing

    def delete(self, pricing_id: int) -> bool:
        pricing = self.get_by_id(pricing_id)
        if not pricing:
            return False
        
        self.db.delete(pricing)
        self.db.commit()
        return True

    def initialize_default_prices(self):
        """Inicializa los precios por defecto si la tabla está vacía"""
        if self.db.query(Pricing).count() == 0:
            default_prices = [
                {"size": "15x21", "style": "Blanco y negro", "price_without_frame": 37000, "price_with_frame": 43000},
                {"size": "15x21", "style": "Color", "price_without_frame": 47000, "price_with_frame": 53000},
                {"size": "20x30", "style": "Blanco y negro", "price_without_frame": 51000, "price_with_frame": 61000},
                {"size": "20x30", "style": "Color", "price_without_frame": 67000, "price_with_frame": 77000},
                {"size": "30x40", "style": "Blanco y negro", "price_without_frame": 75000, "price_with_frame": 90000},
                {"size": "30x40", "style": "Color", "price_without_frame": 98000, "price_with_frame": 113000},
            ]
            
            for price_data in default_prices:
                pricing = Pricing(**price_data)
                self.db.add(pricing)
            
            self.db.commit()
