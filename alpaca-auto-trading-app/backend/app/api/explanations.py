from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.chatgpt import generate_trade_explanation

router = APIRouter()

class TradeExplanationRequest(BaseModel):
    trade_id: str

class TradeExplanationResponse(BaseModel):
    trade_id: str
    explanation: str

@router.post("/explanations", response_model=TradeExplanationResponse)
async def get_trade_explanation(request: TradeExplanationRequest):
    explanation = await generate_trade_explanation(request.trade_id)
    if explanation is None:
        raise HTTPException(status_code=404, detail="Trade explanation not found")
    return TradeExplanationResponse(trade_id=request.trade_id, explanation=explanation)