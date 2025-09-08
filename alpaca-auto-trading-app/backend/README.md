# Alpaca Auto-Trading App Backend

This document provides an overview of the backend setup for the Alpaca Auto-Trading application. The backend is built using FastAPI or Flask and integrates with the Alpaca API for trading operations and the OpenAI API for generating trade explanations.

## Project Structure

The backend is organized as follows:

- **app/**: Contains the main application code.
  - **main.py**: Entry point for the backend application.
  - **api/**: Contains the API routes and explanations.
    - **routes.py**: Defines API endpoints for trading operations.
    - **explanations.py**: Handles requests for trade explanations.
  - **services/**: Contains business logic and interactions with external APIs.
    - **alpaca.py**: Functions to interact with the Alpaca API.
    - **chatgpt.py**: Functions to generate trade explanations using OpenAI API.
    - **backtest.py**: Implements backtesting logic using historical data.
  - **models/**: Defines data models used in the application.
    - **trade.py**: Data model for trades.
  - **database/**: Manages database connections and operations.
    - **db.py**: Database management functions.

## Setup Instructions

1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd alpaca-auto-trading-app/backend
   ```

2. **Install Dependencies**: 
   Use the following command to install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**: 
   Set up your Alpaca and OpenAI API keys in your environment variables or a `.env` file.

4. **Run the Application**: 
   Start the backend server using:
   ```
   uvicorn app.main:app --reload
   ```
   or for Flask:
   ```
   flask run
   ```

## API Endpoints

- **/api/trade**: Endpoint to place a trade.
- **/api/trades**: Endpoint to fetch trade history.
- **/api/explanation**: Endpoint to get trade explanations.

## Backtesting

The backend includes functionality to backtest trading strategies using historical data from Alpaca. Refer to the `backtest.py` service for implementation details.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.