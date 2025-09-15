# Alpaca Trading API - Development Commands
# Usage: make <command>

.PHONY: help dev-api test lint clean install-backend install-frontend

# Default target
help:
	@echo "Available commands:"
	@echo "  dev-api          - Start FastAPI backend with hot reload"
	@echo "  test             - Run backend tests"
	@echo "  lint             - Run linting checks"
	@echo "  clean            - Clean build artifacts and caches"
	@echo "  install-backend  - Install backend dependencies"
	@echo "  install-frontend - Install frontend dependencies"
	@echo "  docker-dev       - Start development environment with Docker"
	@echo "  docker-prod      - Start production environment with Docker"

# Backend development
dev-api:
	@echo "Starting FastAPI backend with hot reload..."
	cd backend && uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

# Testing
test:
	@echo "Running backend tests..."
	cd backend && pytest -q -v

# Linting (optional - install ruff first: pip install ruff)
lint:
	@echo "Running linting checks..."
	@which ruff > /dev/null || (echo "Installing ruff..." && pip install ruff)
	ruff check backend || true
	@echo "Linting complete"

# Clean up
clean:
	@echo "Cleaning build artifacts and caches..."
	find . -type d -name "__pycache__" -exec rm -rf {} + || true
	find . -type f -name "*.pyc" -delete || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + || true
	rm -rf .next/ dist/ build/ || true
	@echo "Cleanup complete"

# Installation commands
install-backend:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	pnpm install

# Docker commands
docker-dev:
	@echo "Starting development environment with Docker..."
	docker compose -f docker/docker-compose.dev.yml up --build

docker-prod:
	@echo "Starting production environment with Docker..."
	docker compose -f docker/docker-compose.prod.yml up --build -d

# Database commands
db-migrate:
	@echo "Running database migrations..."
	cd backend && alembic upgrade head || echo "Alembic not configured yet"

# Setup commands
setup:
	@echo "Setting up development environment..."
	@echo "1. Installing backend dependencies..."
	$(MAKE) install-backend
	@echo "2. Installing frontend dependencies..."
	$(MAKE) install-frontend
	@echo "3. Creating .env file from example..."
	cp backend/.env.example backend/.env || echo "Please create backend/.env from backend/.env.example"
	@echo "Setup complete! Edit backend/.env with your API keys"
