from alpaca_trade_api.rest import REST, TimeFrame
import os

class AlpacaService:
    def __init__(self):
        self.api_key = os.getenv("APCA_API_KEY_ID")
        self.secret_key = os.getenv("APCA_API_SECRET_KEY")
        self.base_url = os.getenv("APCA_API_BASE_URL", "https://paper-api.alpaca.markets")
        self.api = REST(self.api_key, self.secret_key, self.base_url, api_version='v2')

    def get_account(self):
        return self.api.get_account()

    def get_positions(self):
        return self.api.list_positions()

    def place_order(self, symbol, qty, side, order_type='market', time_in_force='gtc'):
        return self.api.submit_order(
            symbol=symbol,
            qty=qty,
            side=side,
            type=order_type,
            time_in_force=time_in_force
        )

    def get_market_data(self, symbol, timeframe=TimeFrame.Day, limit=100):
        return self.api.get_barset(symbol, timeframe, limit=limit).df[symbol]

    def get_trade_history(self, symbol):
        return self.api.list_orders(status='all', limit=100, symbol=symbol)