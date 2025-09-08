from fastapi import APIRouter, HTTPException
from app.services.alpaca import place_order, get_trade_data
from app.models.trade import Trade

router = APIRouter()

@router.post("/trade")
async def create_trade(trade: Trade):
    try:
        order_response = await place_order(trade)
        return {"message": "Trade placed successfully", "order_response": order_response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trade/{trade_id}")
async def read_trade(trade_id: str):
    try:
        trade_data = await get_trade_data(trade_id)
        if trade_data:
            return trade_data
        else:
            raise HTTPException(status_code=404, detail="Trade not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))