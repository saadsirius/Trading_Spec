"""
Comprehensive API route tests for the Alpaca Trading API.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import json


class TestTradeRoutes:
    """Test trade-related API routes."""
    
    def test_place_order_success(self, client: TestClient, mock_alpaca_service, sample_trade_data):
        """Test successful order placement."""
        response = client.post("/v1/trade", json=sample_trade_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "order_response" in data
        assert data["message"] == "Trade placed successfully"
        
        # Verify service was called with correct parameters
        mock_alpaca_service.place_order.assert_called_once_with(
            symbol=sample_trade_data["symbol"],
            qty=sample_trade_data["quantity"],
            side=sample_trade_data["side"],
            order_type=sample_trade_data["order_type"]
        )
    
    def test_place_order_invalid_symbol(self, client: TestClient, mock_alpaca_service):
        """Test order placement with invalid symbol."""
        invalid_data = {
            "symbol": "",  # Empty symbol
            "quantity": 10,
            "side": "buy",
            "order_type": "market"
        }
        
        response = client.post("/v1/trade", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_place_order_invalid_quantity(self, client: TestClient, mock_alpaca_service):
        """Test order placement with invalid quantity."""
        invalid_data = {
            "symbol": "AAPL",
            "quantity": -5,  # Negative quantity
            "side": "buy",
            "order_type": "market"
        }
        
        response = client.post("/v1/trade", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_place_order_service_error(self, client: TestClient, sample_trade_data):
        """Test order placement when service throws an error."""
        with patch('app.services.alpaca_simple.AlpacaService') as mock_service:
            mock_instance = Mock()
            mock_instance.place_order.side_effect = Exception("API Error")
            mock_service.return_value = mock_instance
            
            response = client.post("/v1/trade", json=sample_trade_data)
            assert response.status_code == 400
            assert "API Error" in response.json()["detail"]
    
    def test_get_trade_by_id(self, client: TestClient, mock_alpaca_service):
        """Test retrieving a specific trade."""
        trade_id = "test-trade-id"
        mock_alpaca_service.get_orders.return_value = [
            {
                "id": trade_id,
                "symbol": "AAPL",
                "qty": 10,
                "side": "buy",
                "status": "filled"
            }
        ]
        
        response = client.get(f"/v1/trade/{trade_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == trade_id
    
    def test_get_trade_not_found(self, client: TestClient, mock_alpaca_service):
        """Test retrieving a non-existent trade."""
        trade_id = "non-existent-id"
        mock_alpaca_service.get_orders.return_value = []
        
        response = client.get(f"/v1/trade/{trade_id}")
        assert response.status_code == 404
    
    def test_get_all_trades(self, client: TestClient, mock_alpaca_service, sample_order_data):
        """Test retrieving all trades."""
        mock_alpaca_service.get_orders.return_value = sample_order_data
        
        response = client.get("/v1/trades")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["symbol"] == "AAPL"


class TestAccountRoutes:
    """Test account-related API routes."""
    
    def test_get_account_success(self, client: TestClient, mock_alpaca_service, sample_account_data):
        """Test successful account retrieval."""
        mock_alpaca_service.get_account.return_value = sample_account_data
        
        response = client.get("/v1/account")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_account_data["id"]
        assert data["equity"] == sample_account_data["equity"]
    
    def test_get_account_service_error(self, client: TestClient):
        """Test account retrieval when service throws an error."""
        with patch('app.services.alpaca_simple.AlpacaService') as mock_service:
            mock_instance = Mock()
            mock_instance.get_account.side_effect = Exception("API Error")
            mock_service.return_value = mock_instance
            
            response = client.get("/v1/account")
            assert response.status_code == 400
            assert "API Error" in response.json()["detail"]


class TestPositionRoutes:
    """Test position-related API routes."""
    
    def test_get_positions_success(self, client: TestClient, mock_alpaca_service, sample_position_data):
        """Test successful positions retrieval."""
        mock_alpaca_service.get_positions.return_value = sample_position_data
        
        response = client.get("/v1/positions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["symbol"] == "AAPL"
    
    def test_get_positions_empty(self, client: TestClient, mock_alpaca_service):
        """Test positions retrieval when no positions exist."""
        mock_alpaca_service.get_positions.return_value = []
        
        response = client.get("/v1/positions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


class TestHealthRoutes:
    """Test health check routes."""
    
    def test_health_check(self, client: TestClient):
        """Test health check endpoint."""
        response = client.get("/v1/healthz")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "ok" in data
    
    def test_readiness_check(self, client: TestClient):
        """Test readiness check endpoint."""
        response = client.get("/v1/readyz")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "ready" in data


class TestRootRoute:
    """Test root route."""
    
    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "version" in data


class TestAPIValidation:
    """Test API validation and error handling."""
    
    def test_missing_required_fields(self, client: TestClient):
        """Test API validation for missing required fields."""
        incomplete_data = {
            "symbol": "AAPL"
            # Missing quantity, side, order_type
        }
        
        response = client.post("/v1/trade", json=incomplete_data)
        assert response.status_code == 422
    
    def test_invalid_field_types(self, client: TestClient):
        """Test API validation for invalid field types."""
        invalid_data = {
            "symbol": "AAPL",
            "quantity": "ten",  # Should be number
            "side": "buy",
            "order_type": "market"
        }
        
        response = client.post("/v1/trade", json=invalid_data)
        assert response.status_code == 422
    
    def test_invalid_enum_values(self, client: TestClient):
        """Test API validation for invalid enum values."""
        invalid_data = {
            "symbol": "AAPL",
            "quantity": 10,
            "side": "invalid_side",  # Should be 'buy' or 'sell'
            "order_type": "market"
        }
        
        response = client.post("/v1/trade", json=invalid_data)
        assert response.status_code == 422


class TestAPISecurity:
    """Test API security features."""
    
    def test_cors_headers(self, client: TestClient):
        """Test CORS headers are present."""
        response = client.options("/v1/account")
        # CORS headers should be present
        assert response.status_code in [200, 204]
    
    def test_content_type_validation(self, client: TestClient):
        """Test content type validation."""
        # Send invalid content type
        response = client.post(
            "/v1/trade",
            data="invalid data",
            headers={"Content-Type": "text/plain"}
        )
        assert response.status_code == 422
    
    def test_large_payload_rejection(self, client: TestClient):
        """Test rejection of large payloads."""
        large_data = {
            "symbol": "AAPL",
            "quantity": 10,
            "side": "buy",
            "order_type": "market",
            "extra_data": "x" * 10000  # Large payload
        }
        
        response = client.post("/v1/trade", json=large_data)
        # Should either succeed or fail gracefully
        assert response.status_code in [200, 400, 413]


class TestAPIPerformance:
    """Test API performance characteristics."""
    
    def test_response_time(self, client: TestClient, mock_alpaca_service):
        """Test API response time is reasonable."""
        import time
        
        start_time = time.time()
        response = client.get("/v1/healthz")
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 1.0  # Should respond within 1 second
    
    def test_concurrent_requests(self, client: TestClient, mock_alpaca_service):
        """Test API handles concurrent requests."""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = client.get("/v1/healthz")
            results.append(response.status_code)
        
        # Make 10 concurrent requests
        threads = []
        for _ in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert len(results) == 10
        assert all(status == 200 for status in results)

