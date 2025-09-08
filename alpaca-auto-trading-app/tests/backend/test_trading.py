import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.alpaca import AlpacaService

client = TestClient(app)

@pytest.fixture
def mock_alpaca_service(mocker):
    mock_service = mocker.patch.object(AlpacaService, 'place_order')
    return mock_service

def test_place_order(mock_alpaca_service):
    response = client.post("/api/trade/place_order", json={
        "symbol": "AAPL",
        "qty": 10,
        "side": "buy",
        "type": "market",
        "time_in_force": "gtc"
    })
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "Order placed successfully"}
    mock_alpaca_service.assert_called_once_with("AAPL", 10, "buy", "market", "gtc")

def test_fetch_trade_data():
    response = client.get("/api/trade/data")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Assuming it returns a list of trades

def test_invalid_order():
    response = client.post("/api/trade/place_order", json={
        "symbol": "INVALID",
        "qty": -5,
        "side": "buy",
        "type": "market",
        "time_in_force": "gtc"
    })
    assert response.status_code == 400
    assert response.json() == {"status": "error", "message": "Invalid order parameters"}