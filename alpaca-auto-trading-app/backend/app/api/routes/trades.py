# app/api/routes/trades.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
import logging

from app.services.chatgpt_simple import ChatGPTService
from app.settings import get_settings, Settings  # see below

router = APIRouter()
log = logging.getLogger(__name__)


# ---------- Schemas ----------
class TradeExplanationRequest(BaseModel):
    trade_id: str = Field(..., min_length=1)

class TradeExplanationResponse(BaseModel):
    trade_id: str
    explanation: str
    # Optional: include the inputs you explained (useful to display)
    symbol: Optional[str] = None
    quantity: Optional[int] = None
    side: Optional[str] = None


# ---------- Dependencies ----------
def get_chatgpt_service(settings: Settings = Depends(get_settings)) -> ChatGPTService:
    if not settings.openai_api_key:
        # Misconfiguration should fail fast with 500
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured",
        )
    return ChatGPTService(settings.openai_api_key)


# ---------- Routes ----------
@router.post(
    "/explanations",
    response_model=TradeExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a natural-language explanation for a trade",
    tags=["trades"],
)
async def get_trade_explanation(
    body: TradeExplanationRequest,
    gpt: ChatGPTService = Depends(get_chatgpt_service),
):
    """
    Given a `trade_id`, returns a human-readable explanation of the trade.
    In production, fetch full trade details from your DB/broker API here.
    """
    trade_id = body.trade_id

    # TODO: replace mock with real data fetch (db/broker). If not found -> 404.
    # trade = await trades_repo.get(trade_id)
    # if not trade:
    #     raise HTTPException(status_code=404, detail="Trade not found")

    trade_data = {
        "trade_id": trade_id,
        "symbol": "AAPL",
        "quantity": 100,
        "side": "buy",
    }

    try:
        explanation: str = await gpt.generate_trade_explanation(trade_data)
    except TimeoutError:
        log.warning("OpenAI timeout for trade_id=%s", trade_id, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="LLM provider timed out. Please retry.",
        )
    except ValueError as ve:
        # If your service raises on bad inputs
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        log.exception("LLM error for trade_id=%s", trade_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to generate explanation from LLM provider.",
        ) from e

    return TradeExplanationResponse(
        trade_id=trade_id,
        explanation=explanation,
        symbol=trade_data.get("symbol"),
        quantity=trade_data.get("quantity"),
        side=trade_data.get("side"),
    )
