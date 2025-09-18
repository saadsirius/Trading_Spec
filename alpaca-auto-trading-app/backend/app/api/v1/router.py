"""
API v1 router configuration.

This module aggregates all v1 API routes and provides a single router
for the main application to include.
"""

from fastapi import APIRouter

# Import our comprehensive routes
from . import api_routes as comprehensive_routes

# Create the main v1 router
router = APIRouter(prefix="/v1")

# Include the comprehensive routes
router.include_router(comprehensive_routes.router)
