.PHONY: help install build test dev clean docker-build docker-up docker-down k8s-deploy k8s-delete

help:
	@echo "Kube Credential - Makefile Commands"
	@echo "===================================="
	@echo "install          - Install dependencies for all services"
	@echo "build            - Build all services"
	@echo "test             - Run tests for all services"
	@echo "dev              - Run all services in development mode"
	@echo "clean            - Clean build artifacts and dependencies"
	@echo "docker-build     - Build Docker images"
	@echo "docker-up        - Start services with Docker Compose"
	@echo "docker-down      - Stop Docker Compose services"
	@echo "k8s-deploy       - Deploy to Kubernetes"
	@echo "k8s-delete       - Delete Kubernetes deployment"

install:
	@echo "Installing dependencies..."
	cd issuance-service && npm install
	cd verification-service && npm install
	cd frontend && npm install

build:
	@echo "Building services..."
	cd issuance-service && npm run build
	cd verification-service && npm run build
	cd frontend && npm run build

test:
	@echo "Running tests..."
	cd issuance-service && npm test
	cd verification-service && npm test
	cd frontend && npm test

dev:
	@echo "Starting services in development mode..."
	@echo "Run each service in a separate terminal:"
	@echo "  Terminal 1: cd issuance-service && npm run dev"
	@echo "  Terminal 2: cd verification-service && npm run dev"
	@echo "  Terminal 3: cd frontend && npm run dev"

clean:
	@echo "Cleaning..."
	rm -rf issuance-service/node_modules issuance-service/dist
	rm -rf verification-service/node_modules verification-service/dist
	rm -rf frontend/node_modules frontend/dist

docker-build:
	@echo "Building Docker images..."
	docker build -t issuance-service:latest ./issuance-service
	docker build -t verification-service:latest ./verification-service
	docker build -t frontend:latest ./frontend

docker-up:
	@echo "Starting Docker Compose..."
	docker-compose up --build

docker-down:
	@echo "Stopping Docker Compose..."
	docker-compose down

k8s-deploy:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/issuance-deployment.yaml
	kubectl apply -f k8s/verification-deployment.yaml
	kubectl apply -f k8s/frontend-deployment.yaml
	kubectl apply -f k8s/services.yaml
	@echo "Deployment complete! Check status with: kubectl get pods -n kube-credential"

k8s-delete:
	@echo "Deleting Kubernetes resources..."
	kubectl delete -f k8s/services.yaml
	kubectl delete -f k8s/frontend-deployment.yaml
	kubectl delete -f k8s/verification-deployment.yaml
	kubectl delete -f k8s/issuance-deployment.yaml
	kubectl delete -f k8s/namespace.yaml
