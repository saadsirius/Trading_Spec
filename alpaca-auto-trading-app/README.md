# 🚀 Alpaca Auto-Trading App

## 📋 Overview
The Alpaca Auto-Trading App is a comprehensive, AI-powered trading platform that combines the power of Alpaca API with advanced machine learning to provide users with intelligent trading signals, real-time market analysis, and a professional-grade interface. Built with React, Node.js, and modern web technologies, it offers a complete trading ecosystem with automated decision-making, risk management, and portfolio optimization.

## ✨ Key Features

### 🎯 **Core Trading Features**
- **🤖 AI-Powered Auto-Trading**: Execute trades automatically based on advanced ML models and confidence scoring
- **📊 Advanced Charting**: TradingView-style charts with candlesticks, indicators, and Smart Money Concept (SMC) analysis
- **⚡ Real-Time Market Data**: Live price updates, order book, and market depth visualization
- **🎯 Risk Management**: Automatic position sizing, stop-loss, and take-profit management
- **📈 Portfolio Management**: Comprehensive portfolio tracking and performance analytics

### 🧠 **AI & Machine Learning**
- **🎯 Confidence Scoring**: AI models provide confidence levels for each trading decision
- **📊 Market Volatility Analysis**: Automatic position sizing based on market volatility
- **🔍 Pattern Recognition**: Smart Money Concept indicators and clickable chart patterns
- **📰 News Sentiment Analysis**: AI-powered market sentiment and news impact analysis
- **🎲 Backtesting Engine**: Historical strategy testing with performance metrics

### 🎨 **User Experience**
- **💎 Modern UI/UX**: Revolut-inspired design with smooth animations and transitions
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🌙 Dark/Light Themes**: Customizable appearance with multiple theme options
- **🔔 Smart Notifications**: Toast notifications with de-duplication (no spam within 5 minutes)
- **⚙️ Comprehensive Settings**: Detailed configuration for trading, security, and display preferences

### 📊 **Advanced Analytics**
- **📈 Trading History**: Complete trade journal with performance tracking
- **🎯 Pending Trades Management**: Dedicated page for trade opportunities and partial executions
- **⭐ Watchlist System**: Advanced asset management with real-time price updates
- **🔍 Asset Search**: Comprehensive search across stocks, crypto, CFDs, ETFs, REITs, and commodities
- **📊 Performance Metrics**: Detailed analytics and reporting tools

### 🔒 **Security & Reliability**
- **🛡️ Secure Authentication**: Multi-factor authentication and session management
- **🔐 Data Encryption**: End-to-end encryption for sensitive trading data
- **📝 Audit Logging**: Complete activity tracking and compliance reporting
- **⚡ High Performance**: Optimized for speed with caching and compression
- **🔄 Real-Time Sync**: Cross-page synchronization with global state management

## 🏗️ Technical Architecture

### 🎯 **Frontend Stack**
- **⚛️ React 18**: Modern component-based architecture with hooks and context
- **🎨 Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **🎭 Framer Motion**: Advanced animations and smooth transitions
- **📊 Chart.js**: Professional-grade financial charting with candlesticks and indicators
- **🔄 Context API**: Global state management for cross-component synchronization
- **📱 Responsive Design**: Mobile-first approach with breakpoint optimization

### 🧠 **AI & ML Components**
- **🎯 Market Volatility Service**: Real-time volatility analysis and position sizing
- **📊 Smart Money Concept**: Advanced trading indicators (BOS, CHoCH, FVG, Order Blocks)
- **🔍 Pattern Recognition**: Clickable chart patterns for educational purposes
- **📈 Confidence Scoring**: ML-based trade confidence assessment
- **⚡ Auto-Position Sizing**: Dynamic position adjustment based on market conditions

### 🔧 **Core Services**
- **📡 Alpaca Service**: Comprehensive API integration for trading and market data
- **🔔 Notification System**: Smart toast notifications with de-duplication logic
- **💾 Trading Context**: Global state management for trades, portfolio, and watchlist
- **⚙️ Settings Management**: Persistent user preferences and configuration
- **🔄 Real-Time Updates**: WebSocket integration for live market data

## 📁 Project Structure
```
alpaca-auto-trading-app/
├── 📁 backend/                    # Python FastAPI backend
│   ├── 📁 app/                   # Main application code
│   ├── 📄 requirements.txt       # Python dependencies
│   └── 📄 README.md             # Backend documentation
├── 📁 frontend/
│   ├── 📁 web_app/              # React web application
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/   # React components
│   │   │   │   ├── 📁 charts/   # Chart components (TradingView, Advanced)
│   │   │   │   ├── 📁 layout/   # Layout components (Header, Sidebar, etc.)
│   │   │   │   ├── 📁 pages/    # Page components (Dashboard, Settings, etc.)
│   │   │   │   └── 📁 notifications/ # Notification system
│   │   │   ├── 📁 context/      # React Context for state management
│   │   │   ├── 📁 services/     # API services and utilities
│   │   │   ├── 📁 hooks/        # Custom React hooks
│   │   │   └── 📄 index.css     # Global styles and animations
│   │   ├── 📄 package.json      # Node.js dependencies
│   │   └── 📄 README.md         # Frontend documentation
│   └── 📁 flutter_app/          # Flutter mobile app (future)
├── 📁 docker/                   # Docker configuration
│   ├── 📄 Dockerfile.backend    # Backend container
│   ├── 📄 Dockerfile.frontend   # Frontend container
│   └── 📄 docker-compose.yml    # Multi-container setup
├── 📁 tests/                    # Test suites
│   ├── 📁 backend/              # Backend tests
│   ├── 📁 frontend/             # Frontend tests
│   └── 📄 README.md             # Testing documentation
└── 📄 README.md                 # This file
```

## 🎯 **Available Pages & Features**

### 📊 **Trading Dashboard**
- **📈 Advanced Charts**: TradingView-style candlestick charts with technical indicators
- **🎯 Smart Money Concept**: BOS, CHoCH, FVG, Liquidity Pools, Order Blocks, Supply/Demand Zones
- **🔍 Clickable Patterns**: Educational chart patterns (Double Top/Bottom, Head & Shoulders, Triangles)
- **⚡ Real-Time Data**: Live price updates, order book, and recent trades
- **🎨 Dynamic Levels**: SL, TP1, TP2, TP3 levels that update with market conditions

### 🎯 **Pending Trades Management**
- **📋 Trade Opportunities**: Dedicated page for new trading opportunities
- **⚖️ Partial Execution**: Support for partial buy/sell orders
- **🎯 Asset Types**: Stocks, CFDs, Crypto, ETFs, REITs, Commodities, Options
- **📊 Confidence Scoring**: AI-generated confidence levels for each trade
- **🔄 Real-Time Sync**: Cross-page synchronization with global state

### ⭐ **Watchlist System**
- **🔍 Asset Search**: Comprehensive search across 200+ Alpaca assets
- **📊 Real-Time Prices**: Live price updates with visual indicators
- **🎯 Asset Management**: Add/remove assets with detailed information
- **📈 Performance Tracking**: Track price changes and performance metrics
- **🔔 Price Alerts**: Set up notifications for price movements

### 🔍 **Asset Discovery**
- **🌐 Global Markets**: Access to stocks, crypto, CFDs, ETFs, REITs, commodities
- **🔍 Advanced Search**: Filter by asset type, market cap, sector, and more
- **📊 Asset Details**: Comprehensive information for each asset
- **⭐ Watchlist Integration**: One-click addition to watchlist
- **📈 Market Data**: Real-time pricing and market information

### ⚙️ **Settings & Configuration**
- **🎯 Trading Preferences**: Auto-trading, risk management, position sizing
- **🔔 Notification Settings**: Push notifications, email alerts, quiet hours
- **🛡️ Security Options**: Two-factor authentication, session management
- **🎨 Display Customization**: Themes, languages, chart preferences
- **⚡ Performance Tuning**: Real-time updates, caching, optimization

### 📊 **Portfolio & Analytics**
- **💰 Portfolio Overview**: Complete portfolio tracking and valuation
- **📈 Performance Metrics**: Detailed analytics and reporting
- **📋 Trade History**: Complete trading journal with explanations
- **🎯 Risk Analysis**: Portfolio risk assessment and management
- **📊 Performance Charts**: Visual representation of portfolio performance

## 🚀 Getting Started

### 📋 Prerequisites
- **🐍 Python 3.8+**: For backend services
- **⚛️ Node.js 16+**: For React frontend
- **📡 Alpaca API Account**: Paper trading recommended for testing
- **🤖 OpenAI API Account**: For AI-powered trade explanations
- **🌐 Modern Browser**: Chrome, Firefox, Safari, or Edge

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/alpaca-auto-trading-app.git
   cd alpaca-auto-trading-app
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

3. **Configure API keys**:
   Edit `backend/.env` file with your actual API keys:
   ```env
   APCA_API_KEY_ID=your_actual_alpaca_key
   APCA_API_SECRET_KEY=your_actual_alpaca_secret
   OPENAI_API_KEY=your_actual_openai_key
   ```

### Manual Setup

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend/web_app
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1):
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend/web_app
   npm start
   ```

3. **Access the application**:
   - **🌐 Frontend**: http://localhost:3000
   - **🔧 Backend API**: http://localhost:8000
   - **📚 API Documentation**: http://localhost:8000/docs

## 🆕 **Latest Features & Updates**

### 🔔 **Smart Notification System**
- **🚫 De-duplication Logic**: Prevents notification spam (no repeats within 5 minutes)
- **🎯 Contextual Alerts**: Clickable notifications that show relevant information
- **⚡ Real-Time Updates**: Instant notifications for trade executions and market events
- **🎨 Toast Animations**: Smooth slide-in/out animations with Framer Motion

### 🧠 **AI-Powered Market Analysis**
- **📊 Volatility Service**: Real-time market volatility analysis and position sizing
- **🎯 Auto-Position Sizing**: Automatic position adjustment based on market conditions
- **📈 Confidence Scoring**: ML-based confidence assessment for trading decisions
- **🔍 Pattern Recognition**: Smart Money Concept indicators and educational patterns

### 🎨 **Enhanced User Experience**
- **💎 Revolut-Style Design**: Modern, clean interface with premium feel
- **🎭 Smooth Animations**: Framer Motion animations throughout the application
- **📱 Mobile-First**: Fully responsive design optimized for all devices
- **🌙 Theme Support**: Dark/light themes with customizable preferences

### 🔄 **Advanced State Management**
- **⚛️ Trading Context**: Global state management for cross-page synchronization
- **🔄 Real-Time Sync**: All pages stay synchronized with live updates
- **💾 Persistent Settings**: User preferences saved across sessions
- **📊 Live Data**: Real-time price updates and market data streaming

### 🛡️ **Security & Performance**
- **🔐 Secure Authentication**: Multi-factor authentication and session management
- **⚡ High Performance**: Optimized rendering with caching and compression
- **📝 Audit Logging**: Complete activity tracking for compliance
- **🔄 Auto-Save**: Automatic saving of user preferences and settings

### Docker Setup (Alternative)
```bash
cd docker
docker-compose up --build
```

## 🏗️ **Build & Deployment**

### 📦 **Production Build**
```bash
# Build the React frontend for production
cd frontend/web_app
npm run build

# The build folder will be created with optimized files
# Serve with a static server:
npm install -g serve
serve -s build
```

### 🐳 **Docker Deployment**
```bash
# Build and run with Docker Compose
cd docker
docker-compose up --build

# Or build individual containers
docker build -f Dockerfile.frontend -t alpaca-trading-frontend .
docker build -f Dockerfile.backend -t alpaca-trading-backend .
```

### 🚀 **Deployment Options**
- **🌐 Vercel**: Deploy frontend with `vercel --prod`
- **☁️ Netlify**: Connect GitHub repo for automatic deployments
- **🐳 Docker**: Containerized deployment on any cloud provider
- **🖥️ VPS**: Traditional server deployment with nginx/apache

## 🧪 **Testing**

### 🔬 **Frontend Tests**
```bash
cd frontend/web_app
npm test                    # Run test suite
npm run test:coverage      # Run with coverage report
npm run test:watch         # Watch mode for development
```

### 🐍 **Backend Tests**
```bash
cd backend
python -m pytest          # Run all tests
python -m pytest -v       # Verbose output
python -m pytest --cov    # With coverage
```

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

### 🐛 **Bug Reports**
- Use GitHub Issues to report bugs
- Include steps to reproduce
- Provide system information and logs

### ✨ **Feature Requests**
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Consider implementation complexity

### 🔧 **Code Contributions**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📋 **Development Guidelines**
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📞 **Support & Community**

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/yourusername/alpaca-auto-trading-app/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/yourusername/alpaca-auto-trading-app/discussions)
- **📧 Email**: support@alpaca-trading-app.com
- **📚 Documentation**: [Wiki](https://github.com/yourusername/alpaca-auto-trading-app/wiki)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **📡 Alpaca Markets**: For providing the trading API
- **🤖 OpenAI**: For AI-powered trade explanations
- **⚛️ React Team**: For the amazing frontend framework
- **🎨 Tailwind CSS**: For the utility-first CSS framework
- **🎭 Framer Motion**: For smooth animations
- **📊 Chart.js**: For professional charting capabilities

---

**⭐ If you find this project helpful, please give it a star on GitHub!**