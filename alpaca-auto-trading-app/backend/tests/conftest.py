"""
Pytest configuration and fixtures for backend testing.
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, AsyncMock, patch
import os
import tempfile

from app.main import app
from app.database.db import get_db, Base
from app.services.alpaca_simple import AlpacaService
from app.core.secure_config import SecureConfig
from app.core.encryption import encrypt, decrypt


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session) -> TestClient:
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_alpaca_service():
    """Mock Alpaca service for testing."""
    with patch('app.services.alpaca_simple.AlpacaService') as mock:
        mock_instance = Mock()
        mock_instance.get_account.return_value = {
            "id": "test-account",
            "equity": 10000.0,
            "cash": 5000.0,
            "buying_power": 10000.0,
            "portfolio_value": 10000.0
        }
        mock_instance.get_positions.return_value = [
            {
                "symbol": "AAPL",
                "qty": 10,
                "side": "long",
                "market_value": 1500.0,
                "unrealized_pl": 50.0
            }
        ]
        mock_instance.place_order.return_value = {
            "id": "test-order-id",
            "status": "accepted",
            "symbol": "AAPL",
            "qty": 10,
            "side": "buy"
        }
        mock_instance.get_orders.return_value = [
            {
                "id": "test-order-id",
                "symbol": "AAPL",
                "qty": 10,
                "side": "buy",
                "status": "filled",
                "created_at": "2023-01-01T00:00:00Z"
            }
        ]
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_secure_config():
    """Mock secure configuration for testing."""
    with patch('app.core.secure_config.get_secure_config') as mock:
        mock_config = Mock(spec=SecureConfig)
        mock_config.api_key = "test-api-key"
        mock_config.secret_key = "test-secret-key"
        mock_config.base_url = "https://paper-api.alpaca.markets"
        mock_config.are_keys_configured.return_value = True
        mock_config.get_headers.return_value = {
            "APCA-API-KEY-ID": "test-api-key",
            "APCA-API-SECRET-KEY": "test-secret-key",
            "Content-Type": "application/json"
        }
        mock.return_value = mock_config
        yield mock_config


@pytest.fixture
def sample_trade_data():
    """Sample trade data for testing."""
    return {
        "symbol": "AAPL",
        "quantity": 10,
        "side": "buy",
        "order_type": "market"
    }


@pytest.fixture
def sample_account_data():
    """Sample account data for testing."""
    return {
        "id": "test-account-id",
        "equity": 10000.0,
        "cash": 5000.0,
        "buying_power": 10000.0,
        "portfolio_value": 10000.0,
        "day_trade_count": 0,
        "pattern_day_trader": False
    }


@pytest.fixture
def sample_position_data():
    """Sample position data for testing."""
    return [
        {
            "symbol": "AAPL",
            "qty": 10,
            "side": "long",
            "market_value": 1500.0,
            "unrealized_pl": 50.0,
            "unrealized_plpc": 0.033,
            "avg_entry_price": 145.0,
            "current_price": 150.0
        }
    ]


@pytest.fixture
def sample_order_data():
    """Sample order data for testing."""
    return [
        {
            "id": "test-order-id",
            "symbol": "AAPL",
            "qty": 10,
            "side": "buy",
            "type": "market",
            "status": "filled",
            "created_at": "2023-01-01T00:00:00Z",
            "filled_at": "2023-01-01T00:01:00Z",
            "filled_qty": 10,
            "filled_avg_price": 150.0
        }
    ]


@pytest.fixture
def encrypted_test_data():
    """Test data for encryption testing."""
    return {
        "api_key": "test-api-key-12345",
        "secret_key": "test-secret-key-67890",
        "openai_key": "test-openai-key-abcdef"
    }


@pytest.fixture
def mock_openai_service():
    """Mock OpenAI service for testing."""
    with patch('app.services.chatgpt.ChatGPTService') as mock:
        mock_instance = Mock()
        mock_instance.generate_trade_explanation.return_value = "This is a test trade explanation."
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def temp_env_vars():
    """Temporary environment variables for testing."""
    original_env = os.environ.copy()
    
    # Set test environment variables
    test_env = {
        "SECRET_KEY": "test-secret-key-for-encryption",
        "APCA_API_KEY_ID": "test-alpaca-key",
        "APCA_API_SECRET_KEY": "test-alpaca-secret",
        "OPENAI_API_KEY": "test-openai-key",
        "APCA_API_BASE_URL": "https://paper-api.alpaca.markets"
    }
    
    os.environ.update(test_env)
    yield test_env
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)


@pytest.fixture
def mock_httpx_client():
    """Mock httpx client for testing HTTP requests."""
    with patch('httpx.AsyncClient') as mock:
        mock_client = AsyncMock()
        mock_response = Mock()
        mock_response.json.return_value = {"status": "success"}
        mock_response.status_code = 200
        mock_client.get.return_value = mock_response
        mock_client.post.return_value = mock_response
        mock.return_value.__aenter__.return_value = mock_client
        yield mock_client


# Test utilities
class TestUtils:
    """Utility functions for testing."""
    
    @staticmethod
    def create_test_user_data():
        """Create test user data."""
        return {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
            "live_enabled": False
        }
    
    @staticmethod
    def create_test_trade_data():
        """Create test trade data."""
        return {
            "id": "test-trade-id",
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 10,
            "price": 150.0,
            "order_type": "market",
            "status": "filled",
            "timestamp": "2023-01-01T00:00:00Z"
        }
    
    @staticmethod
    def assert_valid_response(response, expected_status=200):
        """Assert that a response is valid."""
        assert response.status_code == expected_status
        assert response.headers.get("content-type") == "application/json"
    
    @staticmethod
    def assert_error_response(response, expected_status=400):
        """Assert that an error response is valid."""
        assert response.status_code == expected_status
        data = response.json()
        assert "detail" in data or "error" in data


@pytest.fixture
def test_utils():
    """Provide test utilities."""
    return TestUtils

