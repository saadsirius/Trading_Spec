from fastapi import FastAPI
from app.api.routes_simple import router as trading_router
from app.api.explanations_simple import router as explanation_router
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Alpaca Auto-Trading App API",
    description="API for automated trading with Alpaca and AI explanations",
    version="1.0.0"
)

app.include_router(trading_router, prefix="/api/trading", tags=["trading"])
app.include_router(explanation_router, prefix="/api/explanations", tags=["explanations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Alpaca Auto-Trading App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

