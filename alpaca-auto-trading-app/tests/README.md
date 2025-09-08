# This file provides documentation for running the tests. 

## Running Tests

To run the tests for the Alpaca Auto-Trading App, follow these steps:

### Backend Tests

1. Navigate to the backend test directory:
   ```
   cd tests/backend
   ```

2. Install the required dependencies if you haven't already:
   ```
   pip install -r ../../backend/requirements.txt
   ```

3. Run the tests using pytest:
   ```
   pytest test_trading.py
   ```

### Frontend Tests

1. Navigate to the frontend test directory:
   ```
   cd tests/frontend
   ```

2. Install the required dependencies if you haven't already:
   ```
   cd ../../frontend/flutter_app
   flutter pub get
   ```

3. Run the tests using the Flutter test command:
   ```
   flutter test test_dashboard.dart
   ```

### Additional Notes

- Ensure that your backend server is running if your tests depend on it.
- You can also run all tests in one command by using a test runner that supports both backend and frontend tests.

For any issues or questions regarding the tests, please refer to the documentation in the respective backend and frontend directories.