from fastapi import APIRouter, HTTPException
from app.services.alpaca_simple import AlpacaService
from app.models.trade import TradeCreate

router = APIRouter()

@router.post("/trade")
async def create_trade(trade: TradeCreate):
    try:
        alpaca_service = AlpacaService()
        order_response = await alpaca_service.place_order(
            symbol=trade.symbol,
            qty=trade.quantity,
            side=trade.side,
            order_type=trade.order_type
        )
        return {"message": "Trade placed successfully", "order_response": order_response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trade/{trade_id}")
async def read_trade(trade_id: str):
    try:
        alpaca_service = AlpacaService()
        trade_data = await alpaca_service.get_orders(trade_id)
        if trade_data and "error" not in trade_data:
            return trade_data
        else:
            raise HTTPException(status_code=404, detail="Trade not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trades")
async def get_all_trades():
    try:
        alpaca_service = AlpacaService()
        trades = await alpaca_service.get_orders()
        return trades
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/account")
async def get_account():
    try:
        alpaca_service = AlpacaService()
        account = await alpaca_service.get_account()
        return account
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/positions")
async def get_positions():
    try:
        alpaca_service = AlpacaService()
        positions = await alpaca_service.get_positions()
        return positions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))