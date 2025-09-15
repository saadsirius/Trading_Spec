from typing import Optional
from dataclasses import dataclass

@dataclass
class TradeCreate:
    symbol: str
    quantity: float
    price: Optional[float] = None
    side: str = 'buy'
    order_type: str = 'market'

