from fastapi import FastAPI
from app.api.routes import router as trading_router
from app.api.explanations import router as explanation_router
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