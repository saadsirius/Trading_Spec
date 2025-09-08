from datetime import datetime
import pandas as pd
from alpaca_trade_api import REST, TimeFrame

class Backtester:
    def __init__(self, api_key, secret_key, base_url):
        self.api = REST(api_key, secret_key, base_url, api_version='v2')

    def fetch_historical_data(self, symbol, start_date, end_date):
        data = self.api.get_crypto_bars(symbol, TimeFrame.Day, start=start_date, end=end_date).df
        return data

    def simulate_trades(self, historical_data, strategy):
        trades = []
        for index, row in historical_data.iterrows():
            if strategy(row):
                trades.append({
                    'symbol': row['symbol'],
                    'price': row['close'],
                    'timestamp': index,
                    'action': 'buy'
                })
        return trades

    def backtest(self, symbol, start_date, end_date, strategy):
        historical_data = self.fetch_historical_data(symbol, start_date, end_date)
        trades = self.simulate_trades(historical_data, strategy)
        return trades

# Example strategy function
def example_strategy(row):
    return row['close'] > row['open']

# Usage
# backtester = Backtester(api_key='your_api_key', secret_key='your_secret_key', base_url='https://paper-api.alpaca.markets')
# trades = backtester.backtest('BTC/USD', '2023-01-01', '2023-12-31', example_strategy)
# print(trades)