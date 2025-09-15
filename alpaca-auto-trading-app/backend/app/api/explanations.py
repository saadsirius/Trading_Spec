from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chatgpt_simple import ChatGPTService
import os

router = APIRouter()

class TradeExplanationRequest(BaseModel):
    trade_id: str

class TradeExplanationResponse(BaseModel):
    trade_id: str
    explanation: str

@router.post("/explanations", response_model=TradeExplanationResponse)
async def get_trade_explanation(request: TradeExplanationRequest):
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        chatgpt_service = ChatGPTService(openai_api_key)
        # For now, we'll create a simple trade data structure
        # In a real implementation, you'd fetch this from your database
        trade_data = {"trade_id": request.trade_id, "symbol": "AAPL", "quantity": 100, "side": "buy"}
        explanation = await chatgpt_service.generate_trade_explanation(trade_data)
        
        return TradeExplanationResponse(trade_id=request.trade_id, explanation=explanation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))