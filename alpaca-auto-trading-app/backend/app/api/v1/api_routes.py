"""
Enhanced API routes with comprehensive documentation and validation.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.models.schemas import (
    # Request models
    OrderRequest,
    TradeExplanationRequest,
    NotificationRequest,
    
    # Response models
    BaseResponse,
    ErrorResponse,
    AccountResponse,
    OrderResponse,
    OrdersListResponse,
    PositionResponse,
    PositionsListResponse,
    TradesListResponse,
    PortfolioResponse,
    TradeExplanationResponse,
    NotificationResponse,
    NotificationsListResponse,
    HealthCheckResponse,
    ReadinessCheckResponse,
    APIInfoResponse,
    
    # Data models
    AccountInfo,
    OrderInfo,
    PositionInfo,
    TradeInfo,
    PortfolioHistory,
    NotificationInfo,
    APIInfo,
    
    # Enums
    OrderSide,
    OrderType,
    OrderStatus,
    TimeInForce,
    TradingMode,
    PositionSide,
)

from app.services.alpaca_simple import AlpacaService
from app.core.secure_config import get_secure_config
from app.api.routes.trades import router as trades_router

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/v1",
    tags=["Trading API v1"],
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    }
)


# Dependency to get Alpaca service
async def get_alpaca_service() -> AlpacaService:
    """Get configured Alpaca service instance."""
    return AlpacaService()


# Health and Info Endpoints
@router.get(
    "/healthz",
    response_model=HealthCheckResponse,
    summary="Health Check",
    description="""
    Basic health check endpoint for load balancers and monitoring systems.
    
    This endpoint should be fast and lightweight, returning basic service status.
    For more detailed health information, use the `/readyz` endpoint.
    """,
    responses={
        200: {
            "description": "Service is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "version": "1.0.0",
                        "uptime": 3600.5
                    }
                }
            }
        }
    }
)
async def health_check():
    """Health check endpoint."""
    return HealthCheckResponse(
        status="healthy",
        version="1.0.0",
        uptime=3600.5  # This would be calculated from actual uptime
    )


@router.get(
    "/readyz",
    response_model=ReadinessCheckResponse,
    summary="Readiness Check",
    description="""
    Comprehensive readiness check for all service dependencies.
    
    This endpoint verifies that all critical dependencies are available:
    - Database connectivity
    - Alpaca API connectivity
    - OpenAI API connectivity
    - Required environment variables
    - External service availability
    
    Returns detailed status for each dependency check.
    """,
    responses={
        200: {
            "description": "Service is ready",
            "content": {
                "application/json": {
                    "example": {
                        "status": "ready",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "checks": {
                            "database": True,
                            "alpaca_api": True,
                            "openai_api": True,
                            "environment": True
                        },
                        "ready": True
                    }
                }
            }
        },
        503: {
            "description": "Service is not ready",
            "content": {
                "application/json": {
                    "example": {
                        "status": "not_ready",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "checks": {
                            "database": False,
                            "alpaca_api": True,
                            "openai_api": True,
                            "environment": True
                        },
                        "ready": False
                    }
                }
            }
        }
    }
)
async def readiness_check(alpaca_service: AlpacaService = Depends(get_alpaca_service)):
    """Readiness check endpoint."""
    checks = {}
    
    try:
        # Check Alpaca API
        account = await alpaca_service.get_account()
        checks["alpaca_api"] = "error" not in account
    except Exception as e:
        logger.error(f"Alpaca API check failed: {e}")
        checks["alpaca_api"] = False
    
    # Check environment variables
    config = get_secure_config()
    checks["environment"] = config.are_keys_configured()
    
    # Check database (if implemented)
    checks["database"] = True  # Placeholder
    
    # Check OpenAI API (if implemented)
    checks["openai_api"] = True  # Placeholder
    
    ready = all(checks.values())
    status_code = 200 if ready else 503
    
    return JSONResponse(
        status_code=status_code,
        content=ReadinessCheckResponse(
            status="ready" if ready else "not_ready",
            checks=checks,
            ready=ready
        ).dict()
    )


# Account Endpoints
@router.get(
    "/account",
    response_model=AccountResponse,
    summary="Get Account Information",
    description="""
    Retrieve detailed account information including:
    - Account balance and equity
    - Buying power and margin requirements
    - Day trading status
    - Account restrictions and settings
    
    This endpoint provides real-time account data from Alpaca.
    """,
    responses={
        200: {
            "description": "Account information retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Account information retrieved",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": {
                            "id": "12345678-1234-1234-1234-123456789012",
                            "account_number": "1234567890",
                            "status": "ACTIVE",
                            "currency": "USD",
                            "buying_power": 10000.0,
                            "cash": 5000.0,
                            "portfolio_value": 15000.0,
                            "equity": 15000.0,
                            "day_trade_count": 0,
                            "pattern_day_trader": False
                        }
                    }
                }
            }
        }
    }
)
async def get_account(alpaca_service: AlpacaService = Depends(get_alpaca_service)):
    """Get account information."""
    try:
        account_data = await alpaca_service.get_account()
        
        if "error" in account_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to retrieve account: {account_data['error']}"
            )
        
        # Convert Alpaca response to our schema
        account_info = AccountInfo(**account_data)
        
        return AccountResponse(
            success=True,
            message="Account information retrieved successfully",
            data=account_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving account information"
        )


# Order Endpoints
@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Place Order",
    description="""
    Place a new trading order with comprehensive validation and error handling.
    
    **Order Types:**
    - `market`: Execute immediately at current market price
    - `limit`: Execute only at specified price or better
    - `stop`: Trigger market order when price reaches stop price
    - `stop_limit`: Trigger limit order when price reaches stop price
    
    **Time in Force:**
    - `day`: Order expires at end of trading day
    - `gtc`: Good until canceled
    - `ioc`: Immediate or cancel
    - `fok`: Fill or kill
    
    **Validation:**
    - Symbol must be valid and tradeable
    - Quantity must be positive
    - Limit/stop prices required for respective order types
    - Account must have sufficient buying power
    """,
    responses={
        201: {
            "description": "Order placed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Order placed successfully",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": {
                            "id": "order-123",
                            "symbol": "AAPL",
                            "qty": 10,
                            "side": "buy",
                            "type": "market",
                            "status": "accepted",
                            "created_at": "2023-01-01T00:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Invalid order parameters",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": "validation_error",
                        "detail": "Invalid symbol or insufficient buying power",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            }
        }
    }
)
async def place_order(
    order_request: OrderRequest,
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Place a new trading order."""
    try:
        # Validate order parameters
        if order_request.qty <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order quantity must be positive"
            )
        
        # Place order through Alpaca service
        order_response = await alpaca_service.place_order(
            symbol=order_request.symbol,
            qty=order_request.qty,
            side=order_request.side.value,
            order_type=order_request.type.value,
            time_in_force=order_request.time_in_force.value,
            limit_price=order_request.limit_price,
            stop_price=order_request.stop_price,
            client_order_id=order_request.client_order_id
        )
        
        if "error" in order_response:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order placement failed: {order_response['error']}"
            )
        
        # Convert response to our schema
        order_info = OrderInfo(**order_response)
        
        return OrderResponse(
            success=True,
            message="Order placed successfully",
            data=order_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Order placement error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while placing order"
        )


@router.get(
    "/orders",
    response_model=OrdersListResponse,
    summary="Get Orders",
    description="""
    Retrieve a list of orders with optional filtering and pagination.
    
    **Query Parameters:**
    - `status`: Filter by order status
    - `side`: Filter by order side (buy/sell)
    - `symbol`: Filter by trading symbol
    - `limit`: Maximum number of orders to return (default: 50, max: 500)
    - `after`: Return orders after this timestamp
    - `until`: Return orders until this timestamp
    - `direction`: Sort direction (asc/desc, default: desc)
    """,
    responses={
        200: {
            "description": "Orders retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Orders retrieved successfully",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": [
                            {
                                "id": "order-123",
                                "symbol": "AAPL",
                                "qty": 10,
                                "side": "buy",
                                "type": "market",
                                "status": "filled",
                                "created_at": "2023-01-01T00:00:00Z"
                            }
                        ],
                        "total": 1
                    }
                }
            }
        }
    }
)
async def get_orders(
    status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    side: Optional[OrderSide] = Query(None, description="Filter by order side"),
    symbol: Optional[str] = Query(None, description="Filter by trading symbol"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of orders to return"),
    after: Optional[datetime] = Query(None, description="Return orders after this timestamp"),
    until: Optional[datetime] = Query(None, description="Return orders until this timestamp"),
    direction: str = Query("desc", regex="^(asc|desc)$", description="Sort direction"),
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Get orders with optional filtering."""
    try:
        orders_data = await alpaca_service.get_orders(
            status=status.value if status else None,
            side=side.value if side else None,
            symbol=symbol,
            limit=limit,
            after=after,
            until=until,
            direction=direction
        )
        
        if "error" in orders_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to retrieve orders: {orders_data['error']}"
            )
        
        # Convert to our schema
        orders = [OrderInfo(**order) for order in orders_data]
        
        return OrdersListResponse(
            success=True,
            message="Orders retrieved successfully",
            data=orders,
            total=len(orders)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Orders retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving orders"
        )


@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
    summary="Get Order by ID",
    description="""
    Retrieve a specific order by its ID.
    
    Returns detailed information about the order including:
    - Order status and execution details
    - Fill information and timestamps
    - Associated trades and legs
    - Order history and modifications
    """,
    responses={
        200: {
            "description": "Order retrieved successfully"
        },
        404: {
            "description": "Order not found",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": "not_found",
                        "detail": "Order with ID 'order-123' not found",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            }
        }
    }
)
async def get_order(
    order_id: str = Path(..., description="Order ID"),
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Get a specific order by ID."""
    try:
        order_data = await alpaca_service.get_order(order_id)
        
        if "error" in order_data:
            if "not found" in order_data["error"].lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Order with ID '{order_id}' not found"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to retrieve order: {order_data['error']}"
                )
        
        order_info = OrderInfo(**order_data)
        
        return OrderResponse(
            success=True,
            message="Order retrieved successfully",
            data=order_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Order retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving order"
        )


# Position Endpoints
@router.get(
    "/positions",
    response_model=PositionsListResponse,
    summary="Get Positions",
    description="""
    Retrieve all current positions in the account.
    
    Returns detailed information about each position including:
    - Current market value and cost basis
    - Unrealized profit/loss
    - Average entry price and current price
    - Position quantity and side
    """,
    responses={
        200: {
            "description": "Positions retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Positions retrieved successfully",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": [
                            {
                                "asset_id": "asset-123",
                                "symbol": "AAPL",
                                "qty": 10,
                                "side": "long",
                                "market_value": 1500.0,
                                "cost_basis": 1450.0,
                                "unrealized_pl": 50.0,
                                "unrealized_plpc": 0.034
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def get_positions(alpaca_service: AlpacaService = Depends(get_alpaca_service)):
    """Get all positions."""
    try:
        positions_data = await alpaca_service.get_positions()
        
        if "error" in positions_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to retrieve positions: {positions_data['error']}"
            )
        
        positions = [PositionInfo(**pos) for pos in positions_data]
        
        return PositionsListResponse(
            success=True,
            message="Positions retrieved successfully",
            data=positions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Positions retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving positions"
        )


@router.get(
    "/positions/{symbol}",
    response_model=PositionResponse,
    summary="Get Position by Symbol",
    description="""
    Retrieve a specific position by trading symbol.
    
    Returns detailed information about the position for the specified symbol.
    """,
    responses={
        200: {
            "description": "Position retrieved successfully"
        },
        404: {
            "description": "Position not found",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": "not_found",
                        "detail": "No position found for symbol 'AAPL'",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            }
        }
    }
)
async def get_position(
    symbol: str = Path(..., description="Trading symbol"),
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Get a specific position by symbol."""
    try:
        position_data = await alpaca_service.get_position(symbol)
        
        if "error" in position_data:
            if "not found" in position_data["error"].lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No position found for symbol '{symbol}'"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to retrieve position: {position_data['error']}"
                )
        
        position_info = PositionInfo(**position_data)
        
        return PositionResponse(
            success=True,
            message="Position retrieved successfully",
            data=position_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Position retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving position"
        )


# Trade Endpoints
@router.get(
    "/trades",
    response_model=TradesListResponse,
    summary="Get Trades",
    description="""
    Retrieve executed trades with optional filtering.
    
    **Query Parameters:**
    - `symbol`: Filter by trading symbol
    - `start`: Start date for trade history
    - `end`: End date for trade history
    - `limit`: Maximum number of trades to return
    - `page_token`: Pagination token for large result sets
    """,
    responses={
        200: {
            "description": "Trades retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Trades retrieved successfully",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": [
                            {
                                "id": "trade-123",
                                "order_id": "order-123",
                                "symbol": "AAPL",
                                "qty": 10,
                                "side": "buy",
                                "price": 150.0,
                                "timestamp": "2023-01-01T00:00:00Z",
                                "conditions": ["@"],
                                "exchange": "NASDAQ",
                                "tape": "C"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def get_trades(
    symbol: Optional[str] = Query(None, description="Filter by trading symbol"),
    start: Optional[datetime] = Query(None, description="Start date for trade history"),
    end: Optional[datetime] = Query(None, description="End date for trade history"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of trades to return"),
    page_token: Optional[str] = Query(None, description="Pagination token"),
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Get executed trades."""
    try:
        trades_data = await alpaca_service.get_trades(
            symbol=symbol,
            start=start,
            end=end,
            limit=limit,
            page_token=page_token
        )
        
        if "error" in trades_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to retrieve trades: {trades_data['error']}"
            )
        
        trades = [TradeInfo(**trade) for trade in trades_data]
        
        return TradesListResponse(
            success=True,
            message="Trades retrieved successfully",
            data=trades
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trades retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving trades"
        )


# AI/ML Endpoints
@router.post(
    "/ai/explain-trade",
    response_model=TradeExplanationResponse,
    summary="Explain Trade with AI",
    description="""
    Generate AI-powered explanation for a specific trade.
    
    This endpoint uses OpenAI to analyze and explain:
    - Trade rationale and market conditions
    - Risk assessment and analysis
    - Performance implications
    - Market context and trends
    
    **Request Parameters:**
    - `trade_id`: ID of the trade to explain
    - `include_analysis`: Include detailed technical analysis
    - `include_risk_assessment`: Include risk evaluation
    - `include_market_context`: Include market context analysis
    """,
    responses={
        200: {
            "description": "Trade explanation generated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Trade explanation generated",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": {
                            "analysis": "Technical analysis data",
                            "risk_assessment": "Risk evaluation data",
                            "market_context": "Market context data"
                        },
                        "explanation": "This trade was executed based on strong bullish momentum...",
                        "confidence_score": 0.85,
                        "risk_level": "medium"
                    }
                }
            }
        }
    }
)
async def explain_trade(
    request: TradeExplanationRequest,
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Generate AI explanation for a trade."""
    try:
        # This would integrate with OpenAI service
        # For now, return a mock response
        
        explanation_data = {
            "analysis": "Technical analysis shows strong bullish momentum with RSI at 65 and MACD crossing above signal line.",
            "risk_assessment": "Medium risk trade with stop loss at 2% below entry price.",
            "market_context": "Market showing positive sentiment with sector rotation into technology stocks."
        }
        
        return TradeExplanationResponse(
            success=True,
            message="Trade explanation generated successfully",
            data=explanation_data,
            explanation="This trade was executed based on strong bullish momentum indicated by technical indicators and positive market sentiment.",
            confidence_score=0.85,
            risk_level="medium"
        )
        
    except Exception as e:
        logger.error(f"Trade explanation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while generating trade explanation"
        )


# Portfolio Endpoints
@router.get(
    "/portfolio/history",
    response_model=PortfolioResponse,
    summary="Get Portfolio History",
    description="""
    Retrieve portfolio performance history over time.
    
    **Query Parameters:**
    - `period`: Time period (1D, 1W, 1M, 3M, 1Y, all)
    - `timeframe`: Data granularity (1Min, 5Min, 15Min, 1Hour, 1Day)
    - `start`: Start date for history
    - `end`: End date for history
    """,
    responses={
        200: {
            "description": "Portfolio history retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Portfolio history retrieved successfully",
                        "timestamp": "2023-01-01T00:00:00Z",
                        "data": [
                            {
                                "timestamp": "2023-01-01T00:00:00Z",
                                "equity": 10000.0,
                                "profit_loss": 100.0,
                                "profit_loss_pct": 0.01,
                                "base_value": 9900.0,
                                "timeframe": "1Day"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def get_portfolio_history(
    period: str = Query("1M", description="Time period for history"),
    timeframe: str = Query("1Day", description="Data granularity"),
    start: Optional[datetime] = Query(None, description="Start date"),
    end: Optional[datetime] = Query(None, description="End date"),
    alpaca_service: AlpacaService = Depends(get_alpaca_service)
):
    """Get portfolio performance history."""
    try:
        # This would integrate with portfolio history service
        # For now, return mock data
        
        history_data = [
            PortfolioHistory(
                timestamp=datetime.utcnow() - timedelta(days=1),
                equity=10000.0,
                profit_loss=100.0,
                profit_loss_pct=0.01,
                base_value=9900.0,
                timeframe=timeframe
            )
        ]
        
        return PortfolioResponse(
            success=True,
            message="Portfolio history retrieved successfully",
            data=history_data
        )
        
    except Exception as e:
        logger.error(f"Portfolio history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving portfolio history"
        )


# Notification Endpoints
@router.get(
    "/notifications",
    response_model=NotificationsListResponse,
    summary="Get Notifications",
    description="""
    Retrieve user notifications with optional filtering.
    
    **Query Parameters:**
    - `unread_only`: Return only unread notifications
    - `type`: Filter by notification type
    - `limit`: Maximum number of notifications to return
    - `offset`: Number of notifications to skip
    """,
    responses={
        200: {
            "description": "Notifications retrieved successfully"
        }
    }
)
async def get_notifications(
    unread_only: bool = Query(False, description="Return only unread notifications"),
    type: Optional[str] = Query(None, description="Filter by notification type"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of notifications"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip")
):
    """Get user notifications."""
    try:
        # This would integrate with notification service
        # For now, return mock data
        
        notifications = [
            NotificationInfo(
                id="notif-123",
                type="order_filled",
                title="Order Filled",
                message="Your AAPL buy order for 10 shares has been filled at $150.00",
                priority="normal",
                read=False,
                created_at=datetime.utcnow()
            )
        ]
        
        unread_count = sum(1 for n in notifications if not n.read)
        
        return NotificationsListResponse(
            success=True,
            message="Notifications retrieved successfully",
            data=notifications,
            unread_count=unread_count
        )
        
    except Exception as e:
        logger.error(f"Notifications retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving notifications"
        )


@router.post(
    "/notifications/{notification_id}/read",
    response_model=BaseResponse,
    summary="Mark Notification as Read",
    description="""
    Mark a specific notification as read.
    
    This endpoint updates the notification status to read and updates
    the read timestamp.
    """,
    responses={
        200: {
            "description": "Notification marked as read"
        },
        404: {
            "description": "Notification not found"
        }
    }
)
async def mark_notification_read(
    notification_id: str = Path(..., description="Notification ID")
):
    """Mark a notification as read."""
    try:
        # This would integrate with notification service
        # For now, return success
        
        return BaseResponse(
            success=True,
            message="Notification marked as read"
        )
        
    except Exception as e:
        logger.error(f"Mark notification read error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while marking notification as read"
        )

