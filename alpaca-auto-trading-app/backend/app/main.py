"""
Enhanced FastAPI application with comprehensive documentation and middleware.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
import time
import logging
from contextlib import asynccontextmanager

from app.api.v1.router import router as v1_router
from app.core.secure_config import get_secure_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Alpaca Trading API...")
    
    # Verify configuration
    try:
        config = get_secure_config()
        if not config.are_keys_configured():
            logger.warning("API keys not configured - some features may not work")
        else:
            logger.info("API keys configured successfully")
    except Exception as e:
        logger.error(f"Configuration error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Alpaca Trading API...")


# Create FastAPI application
app = FastAPI(
    title="Alpaca Trading API",
    description="""
    ## 🚀 Alpaca Auto-Trading Platform API
    
    A comprehensive, AI-powered trading platform built with FastAPI and Next.js.
    
    ### 🎯 **Features**
    
    - **📊 Real-time Trading**: Place and manage orders with Alpaca Markets
    - **🤖 AI Integration**: OpenAI-powered trade analysis and explanations
    - **🔐 Secure**: Encrypted API key storage and secure configuration
    - **📈 Portfolio Management**: Track positions, P&L, and performance
    - **🔔 Notifications**: Real-time alerts and trade notifications
    - **📱 Modern UI**: Responsive web interface with advanced charts
    
    ### 🛡️ **Security**
    
    - API keys are encrypted using Fernet symmetric encryption
    - Secure configuration management with environment variables
    - CORS protection and request validation
    - Rate limiting and input sanitization
    
    ### 📚 **API Documentation**
    
    - **OpenAPI 3.1** specification with detailed schemas
    - **Interactive Swagger UI** for testing endpoints
    - **Comprehensive examples** for all request/response models
    - **Error handling** with detailed error messages
    
    ### 🔧 **Getting Started**
    
    1. **Configure API Keys**: Set up your Alpaca and OpenAI API keys
    2. **Environment Setup**: Configure environment variables
    3. **Start Trading**: Use the API endpoints to place orders and manage your portfolio
    
    ### 📖 **Resources**
    
    - [Alpaca Markets API](https://alpaca.markets/docs/)
    - [OpenAI API](https://platform.openai.com/docs/)
    - [FastAPI Documentation](https://fastapi.tiangolo.com/)
    """,
    version="1.0.0",
    contact={
        "name": "Alpaca Trading API Support",
        "email": "support@alpaca-trading.com",
        "url": "https://github.com/your-org/alpaca-auto-trading-app",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.alpaca-trading.com",
            "description": "Production server"
        }
    ],
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://alpaca-trading.com",
        "https://www.alpaca-trading.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.alpaca-trading.com"]
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for monitoring and debugging."""
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host if request.client else 'unknown'}"
    )
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(
        f"Response: {response.status_code} "
        f"in {process_time:.3f}s for {request.method} {request.url.path}"
    )
    
    return response


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent error format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": time.time(),
            "path": str(request.url.path),
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": "An unexpected error occurred. Please try again later.",
            "status_code": 500,
            "timestamp": time.time(),
            "path": str(request.url.path),
        }
    )


# Include API routers
app.include_router(v1_router, prefix="/v1")


# Root endpoint
@app.get(
    "/",
    summary="API Information",
    description="""
    Get basic API information and available endpoints.
    
    This endpoint provides:
    - API name and version
    - Available documentation URLs
    - Health check endpoints
    - Basic service information
    """,
    tags=["Root"],
    responses={
        200: {
            "description": "API information retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Welcome to Alpaca Trading API",
                        "version": "1.0.0",
                        "docs": "/docs",
                        "health": "/v1/healthz",
                        "ready": "/v1/readyz"
                    }
                }
            }
        }
    }
)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Alpaca Trading API",
        "version": "1.0.0",
        "description": "AI-powered trading platform with comprehensive portfolio management",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
        "health": "/v1/healthz",
        "ready": "/v1/readyz",
        "features": [
            "Real-time trading with Alpaca Markets",
            "AI-powered trade analysis",
            "Secure API key encryption",
            "Portfolio management",
            "Real-time notifications",
            "Interactive API documentation"
        ],
        "endpoints": {
            "account": "/v1/account",
            "orders": "/v1/orders",
            "positions": "/v1/positions",
            "trades": "/v1/trades",
            "portfolio": "/v1/portfolio",
            "notifications": "/v1/notifications",
            "ai": "/v1/ai"
        }
    }


# Custom OpenAPI schema
def custom_openapi():
    """Generate custom OpenAPI schema with enhanced documentation."""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Alpaca Trading API",
        version="1.0.0",
        description=app.description,
        routes=app.routes,
    )
    
    # Add custom tags
    openapi_schema["tags"] = [
        {
            "name": "Root",
            "description": "Basic API information and health checks"
        },
        {
            "name": "Trading API v1",
            "description": "Core trading functionality including orders, positions, and account management"
        },
        {
            "name": "Account",
            "description": "Account information and balance management"
        },
        {
            "name": "Orders",
            "description": "Order placement, management, and history"
        },
        {
            "name": "Positions",
            "description": "Position tracking and management"
        },
        {
            "name": "Trades",
            "description": "Trade execution and history"
        },
        {
            "name": "Portfolio",
            "description": "Portfolio performance and analytics"
        },
        {
            "name": "AI/ML",
            "description": "AI-powered trade analysis and explanations"
        },
        {
            "name": "Notifications",
            "description": "Real-time notifications and alerts"
        },
        {
            "name": "Health",
            "description": "Service health and readiness checks"
        }
    ]
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key for authentication"
        },
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token for authentication"
        }
    }
    
    # Add examples to schemas
    if "components" in openapi_schema and "schemas" in openapi_schema["components"]:
        schemas = openapi_schema["components"]["schemas"]
        
        # Add examples to common schemas
        if "OrderRequest" in schemas:
            schemas["OrderRequest"]["example"] = {
                "symbol": "AAPL",
                "qty": 10,
                "side": "buy",
                "type": "market",
                "time_in_force": "gtc"
            }
        
        if "AccountInfo" in schemas:
            schemas["AccountInfo"]["example"] = {
                "id": "12345678-1234-1234-1234-123456789012",
                "account_number": "1234567890",
                "status": "ACTIVE",
                "currency": "USD",
                "buying_power": 10000.0,
                "cash": 5000.0,
                "portfolio_value": 15000.0,
                "equity": 15000.0
            }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# Custom Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Custom Swagger UI with enhanced styling and features."""
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Alpaca Trading API - Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
        oauth2_redirect_url="/docs/oauth2-redirect",
        init_oauth={
            "usePkceWithAuthorizationCodeGrant": True,
            "clientId": "your-client-id",
        },
        swagger_ui_parameters={
            "deepLinking": True,
            "displayRequestDuration": True,
            "filter": True,
            "showExtensions": True,
            "showCommonExtensions": True,
            "tryItOutEnabled": True,
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration
    config = get_secure_config()
    
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=config.host,
        port=config.port,
        reload=config.debug,
        log_level="info",
        access_log=True,
    )