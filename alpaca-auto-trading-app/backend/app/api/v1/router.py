"""
API v1 router configuration.

This module aggregates all v1 API routes and provides a single router
for the main application to include.
"""

from fastapi import APIRouter

from .routes import health

# Create the main v1 router
router = APIRouter(prefix="/v1")

# Include all route modules
router.include_router(health.router)
