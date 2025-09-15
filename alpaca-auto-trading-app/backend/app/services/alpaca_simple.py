import os
import httpx
from typing import Dict, Any, Optional

class AlpacaService:
    def __init__(self):
        self.api_key = os.getenv("APCA_API_KEY_ID")
        self.secret_key = os.getenv("APCA_API_SECRET_KEY")
        self.base_url = os.getenv("APCA_API_BASE_URL", "https://paper-api.alpaca.markets")
        self.headers = {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.secret_key,
            "Content-Type": "application/json"
        }

    async def get_account(self) -> Dict[str, Any]:
        """Get account information"""
        if not self.api_key or not self.secret_key:
            return {"error": "API keys not configured"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/v2/account", headers=self.headers)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

    async def get_positions(self) -> Dict[str, Any]:
        """Get current positions"""
        if not self.api_key or not self.secret_key:
            return {"error": "API keys not configured"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/v2/positions", headers=self.headers)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

    async def place_order(self, symbol: str, qty: float, side: str, order_type: str = 'market') -> Dict[str, Any]:
        """Place an order"""
        if not self.api_key or not self.secret_key:
            return {"error": "API keys not configured"}
        
        order_data = {
            "symbol": symbol,
            "qty": str(int(qty)),
            "side": side,
            "type": order_type,
            "time_in_force": "gtc"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.base_url}/v2/orders", 
                                           headers=self.headers, 
                                           json=order_data)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

    async def get_orders(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        """Get order history"""
        if not self.api_key or not self.secret_key:
            return {"error": "API keys not configured"}
        
        params = {"status": "all", "limit": 100}
        if symbol:
            params["symbol"] = symbol
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/v2/orders", 
                                          headers=self.headers, 
                                          params=params)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

