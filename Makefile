# Verbum Backend Makefile

.PHONY: help install dev build start stop clean test lint format db-setup db-migrate db-seed docker-up docker-down

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run start:dev

build: ## Build the application
	npm run build

start: ## Start production server
	npm run start:prod

stop: ## Stop the application
	pkill -f "node.*dist/main.js" || true

# Testing
test: ## Run tests
	npm run test

test-e2e: ## Run e2e tests
	npm run test:e2e

test-cov: ## Run tests with coverage
	npm run test:cov

# Code quality
lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

# Database
db-setup: ## Setup database
	npx prisma generate
	npx prisma db push

db-migrate: ## Run database migrations
	npx prisma migrate dev

db-seed: ## Seed database
	npx prisma db seed

db-studio: ## Open Prisma Studio
	npx prisma studio

db-reset: ## Reset database
	npx prisma migrate reset

# Docker
docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-build: ## Build Docker image
	docker-compose build

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-dev: ## Start development with Docker
	docker-compose -f docker-compose.dev.yml up -d

docker-dev-down: ## Stop development Docker containers
	docker-compose -f docker-compose.dev.yml down

# Cleanup
clean: ## Clean up generated files
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	rm -rf .nyc_output/

clean-docker: ## Clean up Docker resources
	docker-compose down -v
	docker system prune -f

# Monitoring
monitor: ## Open monitoring dashboards
	@echo "Opening monitoring dashboards..."
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001"
	@echo "API Docs: http://localhost:3000/api/docs"
	@echo "Health Check: http://localhost:3000/health"

# Full setup
setup: install db-setup db-seed ## Full setup for development
	@echo "Setup complete! Run 'make dev' to start development server."

# Production deployment
deploy: build ## Deploy to production
	docker-compose up -d --build

# Health check
health: ## Check application health
	curl -f http://localhost:3000/health || echo "Application is not running"
