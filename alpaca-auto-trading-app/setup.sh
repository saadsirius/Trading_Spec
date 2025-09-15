#!/bin/bash

echo "🚀 Setting up Alpaca Auto-Trading App..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Alpaca API Configuration
APCA_API_KEY_ID=your_alpaca_api_key_here
APCA_API_SECRET_KEY=your_alpaca_secret_key_here
APCA_API_BASE_URL=https://paper-api.alpaca.markets

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./trades.db
EOF
    echo "⚠️  Please edit backend/.env file with your actual API keys"
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend/web_app

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

cd ../..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env file with your Alpaca and OpenAI API keys"
echo "2. Start the backend server:"
echo "   cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend/web_app && npm start"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"

