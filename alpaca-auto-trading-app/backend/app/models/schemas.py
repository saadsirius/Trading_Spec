"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


# Enums
class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class OrderStatus(str, Enum):
    NEW = "new"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    DONE_FOR_DAY = "done_for_day"
    CANCELED = "canceled"
    EXPIRED = "expired"
    REPLACED = "replaced"
    PENDING_CANCEL = "pending_cancel"
    PENDING_REPLACE = "pending_replace"
    ACCEPTED = "accepted"
    PENDING_NEW = "pending_new"
    ACCEPTED_FOR_BIDDING = "accepted_for_bidding"
    STOPPED = "stopped"
    REJECTED = "rejected"
    SUSPENDED = "suspended"
    CALCULATED = "calculated"


class TimeInForce(str, Enum):
    DAY = "day"
    GTC = "gtc"
    OPG = "opg"
    CLS = "cls"
    IOC = "ioc"
    FOK = "fok"


class TradingMode(str, Enum):
    PAPER = "paper"
    LIVE = "live"


class PositionSide(str, Enum):
    LONG = "long"
    SHORT = "short"


# Base Models
class BaseResponse(BaseModel):
    """Base response model with common fields."""
    success: bool = Field(..., description="Whether the operation was successful")
    message: Optional[str] = Field(None, description="Human-readable message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = Field(False, description="Always false for error responses")
    error: str = Field(..., description="Error type or code")
    detail: str = Field(..., description="Detailed error message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")


# Account Models
class AccountInfo(BaseModel):
    """Account information model."""
    id: str = Field(..., description="Account ID")
    account_number: str = Field(..., description="Account number")
    status: str = Field(..., description="Account status")
    currency: str = Field(default="USD", description="Account currency")
    buying_power: float = Field(..., description="Available buying power")
    cash: float = Field(..., description="Cash balance")
    portfolio_value: float = Field(..., description="Total portfolio value")
    equity: float = Field(..., description="Account equity")
    last_equity: float = Field(..., description="Previous day's equity")
    multiplier: float = Field(default=1.0, description="Account multiplier")
    initial_margin: float = Field(..., description="Initial margin requirement")
    maintenance_margin: float = Field(..., description="Maintenance margin requirement")
    day_trade_count: int = Field(..., description="Number of day trades today")
    pattern_day_trader: bool = Field(..., description="Whether account is PDT")
    trading_blocked: bool = Field(..., description="Whether trading is blocked")
    transfers_blocked: bool = Field(..., description="Whether transfers are blocked")
    account_blocked: bool = Field(..., description="Whether account is blocked")
    created_at: datetime = Field(..., description="Account creation date")
    trade_suspended_by_user: bool = Field(..., description="Whether trading is suspended by user")
    shorting_enabled: bool = Field(..., description="Whether shorting is enabled")
    long_market_value: float = Field(..., description="Long market value")
    short_market_value: float = Field(..., description="Short market value")
    day_trade_buying_power: float = Field(..., description="Day trade buying power")
    regt_buying_power: float = Field(..., description="Regulation T buying power")


class AccountResponse(BaseResponse):
    """Account information response."""
    data: AccountInfo = Field(..., description="Account information")


# Order Models
class OrderRequest(BaseModel):
    """Order placement request model."""
    symbol: str = Field(..., description="Trading symbol (e.g., AAPL)", min_length=1, max_length=10)
    qty: float = Field(..., description="Order quantity", gt=0)
    side: OrderSide = Field(..., description="Order side")
    type: OrderType = Field(..., description="Order type")
    time_in_force: TimeInForce = Field(default=TimeInForce.GTC, description="Time in force")
    limit_price: Optional[float] = Field(None, description="Limit price (required for limit orders)", gt=0)
    stop_price: Optional[float] = Field(None, description="Stop price (required for stop orders)", gt=0)
    client_order_id: Optional[str] = Field(None, description="Client-specified order ID", max_length=48)
    extended_hours: bool = Field(default=False, description="Whether to allow extended hours trading")
    order_class: str = Field(default="simple", description="Order class")
    take_profit: Optional[Dict[str, Any]] = Field(None, description="Take profit parameters")
    stop_loss: Optional[Dict[str, Any]] = Field(None, description="Stop loss parameters")
    trail_price: Optional[float] = Field(None, description="Trail price for trailing stop orders")
    trail_percent: Optional[float] = Field(None, description="Trail percentage for trailing stop orders")

    @validator('limit_price')
    def validate_limit_price(cls, v, values):
        if values.get('type') in ['limit', 'stop_limit'] and v is None:
            raise ValueError('limit_price is required for limit and stop_limit orders')
        return v

    @validator('stop_price')
    def validate_stop_price(cls, v, values):
        if values.get('type') in ['stop', 'stop_limit'] and v is None:
            raise ValueError('stop_price is required for stop and stop_limit orders')
        return v


class OrderInfo(BaseModel):
    """Order information model."""
    id: str = Field(..., description="Order ID")
    client_order_id: Optional[str] = Field(None, description="Client order ID")
    created_at: datetime = Field(..., description="Order creation time")
    updated_at: datetime = Field(..., description="Last update time")
    submitted_at: datetime = Field(..., description="Order submission time")
    filled_at: Optional[datetime] = Field(None, description="Order fill time")
    expired_at: Optional[datetime] = Field(None, description="Order expiration time")
    canceled_at: Optional[datetime] = Field(None, description="Order cancellation time")
    failed_at: Optional[datetime] = Field(None, description="Order failure time")
    replaced_at: Optional[datetime] = Field(None, description="Order replacement time")
    replaced_by: Optional[str] = Field(None, description="ID of order that replaced this one")
    replaces: Optional[str] = Field(None, description="ID of order this one replaces")
    asset_id: str = Field(..., description="Asset ID")
    symbol: str = Field(..., description="Trading symbol")
    asset_class: str = Field(..., description="Asset class")
    notional: Optional[float] = Field(None, description="Notional value")
    qty: float = Field(..., description="Order quantity")
    filled_qty: float = Field(..., description="Filled quantity")
    filled_avg_price: Optional[float] = Field(None, description="Average fill price")
    order_class: str = Field(..., description="Order class")
    order_type: OrderType = Field(..., description="Order type")
    type: OrderType = Field(..., description="Order type (alias)")
    side: OrderSide = Field(..., description="Order side")
    time_in_force: TimeInForce = Field(..., description="Time in force")
    limit_price: Optional[float] = Field(None, description="Limit price")
    stop_price: Optional[float] = Field(None, description="Stop price")
    status: OrderStatus = Field(..., description="Order status")
    extended_hours: bool = Field(..., description="Extended hours trading")
    legs: Optional[List[Dict[str, Any]]] = Field(None, description="Order legs for complex orders")
    trail_price: Optional[float] = Field(None, description="Trail price")
    trail_percent: Optional[float] = Field(None, description="Trail percentage")
    hwm: Optional[float] = Field(None, description="High water mark")


class OrderResponse(BaseResponse):
    """Order response model."""
    data: OrderInfo = Field(..., description="Order information")


class OrdersListResponse(BaseResponse):
    """Orders list response model."""
    data: List[OrderInfo] = Field(..., description="List of orders")
    total: int = Field(..., description="Total number of orders")


# Position Models
class PositionInfo(BaseModel):
    """Position information model."""
    asset_id: str = Field(..., description="Asset ID")
    symbol: str = Field(..., description="Trading symbol")
    exchange: str = Field(..., description="Exchange")
    asset_class: str = Field(..., description="Asset class")
    avg_entry_price: float = Field(..., description="Average entry price")
    qty: float = Field(..., description="Position quantity")
    side: PositionSide = Field(..., description="Position side")
    market_value: float = Field(..., description="Current market value")
    cost_basis: float = Field(..., description="Cost basis")
    unrealized_pl: float = Field(..., description="Unrealized profit/loss")
    unrealized_plpc: float = Field(..., description="Unrealized profit/loss percentage")
    unrealized_intraday_pl: float = Field(..., description="Unrealized intraday profit/loss")
    unrealized_intraday_plpc: float = Field(..., description="Unrealized intraday profit/loss percentage")
    current_price: float = Field(..., description="Current price")
    lastday_price: float = Field(..., description="Previous day's closing price")
    change_today: float = Field(..., description="Price change today")


class PositionResponse(BaseResponse):
    """Position response model."""
    data: PositionInfo = Field(..., description="Position information")


class PositionsListResponse(BaseResponse):
    """Positions list response model."""
    data: List[PositionInfo] = Field(..., description="List of positions")


# Trade Models
class TradeInfo(BaseModel):
    """Trade information model."""
    id: str = Field(..., description="Trade ID")
    order_id: str = Field(..., description="Associated order ID")
    symbol: str = Field(..., description="Trading symbol")
    qty: float = Field(..., description="Trade quantity")
    side: OrderSide = Field(..., description="Trade side")
    price: float = Field(..., description="Trade price")
    timestamp: datetime = Field(..., description="Trade timestamp")
    conditions: List[str] = Field(..., description="Trade conditions")
    exchange: str = Field(..., description="Exchange where trade occurred")
    tape: str = Field(..., description="Tape identifier")


class TradesListResponse(BaseResponse):
    """Trades list response model."""
    data: List[TradeInfo] = Field(..., description="List of trades")


# Portfolio Models
class PortfolioHistory(BaseModel):
    """Portfolio history entry model."""
    timestamp: datetime = Field(..., description="Timestamp")
    equity: float = Field(..., description="Portfolio equity")
    profit_loss: float = Field(..., description="Profit/loss")
    profit_loss_pct: float = Field(..., description="Profit/loss percentage")
    base_value: float = Field(..., description="Base value")
    timeframe: str = Field(..., description="Timeframe")


class PortfolioResponse(BaseResponse):
    """Portfolio response model."""
    data: List[PortfolioHistory] = Field(..., description="Portfolio history")


# AI/ML Models
class TradeExplanationRequest(BaseModel):
    """Trade explanation request model."""
    trade_id: str = Field(..., description="Trade ID to explain")
    include_analysis: bool = Field(default=True, description="Include detailed analysis")
    include_risk_assessment: bool = Field(default=True, description="Include risk assessment")
    include_market_context: bool = Field(default=True, description="Include market context")


class TradeExplanationResponse(BaseResponse):
    """Trade explanation response model."""
    data: Dict[str, Any] = Field(..., description="Trade explanation data")
    explanation: str = Field(..., description="Human-readable explanation")
    confidence_score: float = Field(..., description="AI confidence score (0-1)")
    risk_level: str = Field(..., description="Risk level assessment")
    market_context: Optional[Dict[str, Any]] = Field(None, description="Market context")


# Notification Models
class NotificationRequest(BaseModel):
    """Notification request model."""
    type: str = Field(..., description="Notification type")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    priority: str = Field(default="normal", description="Notification priority")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional notification data")


class NotificationInfo(BaseModel):
    """Notification information model."""
    id: str = Field(..., description="Notification ID")
    type: str = Field(..., description="Notification type")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    priority: str = Field(..., description="Notification priority")
    read: bool = Field(..., description="Whether notification has been read")
    created_at: datetime = Field(..., description="Creation timestamp")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional data")


class NotificationResponse(BaseResponse):
    """Notification response model."""
    data: NotificationInfo = Field(..., description="Notification information")


class NotificationsListResponse(BaseResponse):
    """Notifications list response model."""
    data: List[NotificationInfo] = Field(..., description="List of notifications")
    unread_count: int = Field(..., description="Number of unread notifications")


# Health Check Models
class HealthCheckResponse(BaseModel):
    """Health check response model."""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Check timestamp")
    version: str = Field(..., description="Service version")
    uptime: float = Field(..., description="Service uptime in seconds")


class ReadinessCheckResponse(BaseModel):
    """Readiness check response model."""
    status: str = Field(..., description="Service readiness status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Check timestamp")
    checks: Dict[str, bool] = Field(..., description="Individual service checks")
    ready: bool = Field(..., description="Overall readiness status")


# API Info Models
class APIInfo(BaseModel):
    """API information model."""
    name: str = Field(..., description="API name")
    version: str = Field(..., description="API version")
    description: str = Field(..., description="API description")
    docs_url: str = Field(..., description="Documentation URL")
    health_url: str = Field(..., description="Health check URL")
    endpoints: List[str] = Field(..., description="Available endpoints")


class APIInfoResponse(BaseModel):
    """API info response model."""
    message: str = Field(..., description="Welcome message")
    version: str = Field(..., description="API version")
    docs: str = Field(..., description="Documentation URL")
    health: str = Field(..., description="Health check URL")

