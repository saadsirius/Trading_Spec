from fastapi import APIRouter, HTTPException
from app.services.chatgpt_simple import ChatGPTService
import os
from typing import Dict, Any

router = APIRouter()

class TradeExplanationRequest:
    def __init__(self, trade_id: str):
        self.trade_id = trade_id

class TradeExplanationResponse:
    def __init__(self, trade_id: str, explanation: str):
        self.trade_id = trade_id
        self.explanation = explanation

@router.post("/explanations")
async def get_trade_explanation(request: Dict[str, Any]):
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        trade_id = request.get("trade_id", "unknown")
        chatgpt_service = ChatGPTService(openai_api_key)
        
        # For now, we'll create a simple trade data structure
        # In a real implementation, you'd fetch this from your database
        trade_data = {"trade_id": trade_id, "symbol": "AAPL", "quantity": 100, "side": "buy"}
        explanation = await chatgpt_service.generate_trade_explanation(trade_data)
        
        return {"trade_id": trade_id, "explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

