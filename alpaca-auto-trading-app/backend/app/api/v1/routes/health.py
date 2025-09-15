"""
Health check endpoints for monitoring and load balancer health checks.

This module provides simple health endpoints that can be used by:
- Load balancers for health checks
- Monitoring systems for uptime verification
- DevOps tools for service availability checks
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz", tags=["Health"])
async def health_check() -> dict[str, str]:
    """
    Basic health check endpoint.
    
    Returns a simple status response indicating the service is running.
    This endpoint should be fast and lightweight for load balancer health checks.
    
    Returns:
        dict: Simple status response with "ok" status
    """
    return {"status": "ok"}


@router.get("/readyz", tags=["Health"])
async def readiness_check() -> dict[str, str]:
    """
    Readiness check endpoint.
    
    This endpoint can be extended to check:
    - Database connectivity
    - External service availability (Alpaca API, OpenAI, etc.)
    - Required environment variables
    - Any other dependencies
    
    For now, returns a simple ready status. In production, this should
    verify that all critical dependencies are available.
    
    Returns:
        dict: Readiness status response
    """
    # TODO: Add actual readiness checks:
    # - Database connection
    # - Alpaca API connectivity
    # - Required environment variables
    # - Cache availability
    
    return {"status": "ready"}
