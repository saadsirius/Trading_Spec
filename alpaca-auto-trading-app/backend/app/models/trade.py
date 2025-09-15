from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

Base = declarative_base()

class Trade(Base):
    __tablename__ = 'trades'

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    side = Column(String, nullable=False, default='buy')  # 'buy' or 'sell'
    order_type = Column(String, nullable=False, default='market')
    timestamp = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Trade(id={self.id}, symbol='{self.symbol}', quantity={self.quantity}, price={self.price}, side='{self.side}', timestamp={self.timestamp})>"

# Pydantic model for API requests
class TradeCreate(BaseModel):
    symbol: str
    quantity: float
    price: Optional[float] = None
    side: str = 'buy'
    order_type: str = 'market'

    class Config:
        from_attributes = True