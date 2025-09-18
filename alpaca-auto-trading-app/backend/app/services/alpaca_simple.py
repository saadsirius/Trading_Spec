import httpx
from typing import Dict, Any, Optional
from app.core.secure_config import get_secure_config

class AlpacaService:
    def __init__(self):
        self.config = get_secure_config()
        self.base_url = self.config.base_url
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers with secure API keys."""
        try:
            return self.config.get_headers()
        except ValueError as e:
            return {"error": str(e)}

    async def get_account(self) -> Dict[str, Any]:
        """Get account information"""
        if not self.config.are_keys_configured():
            return {"error": "API keys not configured"}
        
        headers = self._get_headers()
        if "error" in headers:
            return {"error": headers["error"]}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/v2/account", headers=headers)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

    async def get_positions(self) -> Dict[str, Any]:
        """Get current positions"""
        if not self.config.are_keys_configured():
            return {"error": "API keys not configured"}
        
        headers = self._get_headers()
        if "error" in headers:
            return {"error": headers["error"]}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/v2/positions", headers=headers)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

    async def place_order(self, symbol: str, qty: float, side: str, order_type: str = 'market') -> Dict[str, Any]:
        """Place an order"""
        if not self.config.are_keys_configured():
            return {"error": "API keys not configured"}
        
        headers = self._get_headers()
        if "error" in headers:
            return {"error": headers["error"]}
        
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
                                           headers=headers, 
                                           json=order_data)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

    async def get_orders(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        """Get order history"""
        if not self.config.are_keys_configured():
            return {"error": "API keys not configured"}
        
        headers = self._get_headers()
        if "error" in headers:
            return {"error": headers["error"]}
        
        params = {"status": "all", "limit": 100}
        if symbol:
            params["symbol"] = symbol
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/v2/orders", 
                                          headers=headers, 
                                          params=params)
                return response.json()
            except Exception as e:
                return {"error": str(e)}

