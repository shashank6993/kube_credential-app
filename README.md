# Kube Credential

A microservice-based credential issuance and verification system built with Node.js, TypeScript, React, and Kubernetes.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview

Kube Credential is a distributed system for issuing and verifying credentials. It consists of two independent backend microservices and a React frontend, all containerized and ready for deployment to Kubernetes or a cloud of your choice.

## Hosted Demo

- Frontend (Railway): [frontend-production-1984.up.railway.app](https://frontend-production-1984.up.railway.app/)

How to test:

1. Go to the Hosted Frontend link above.
2. Issue a credential on the "Issue" page using a unique `id`, `name`, and `role`.
3. Verify the same credential on the "Verify" page using the same values.

Note: When hosting the backend on Railway (or any cloud), set the frontend environment variables so the app can call your APIs:

- `VITE_ISSUANCE_API_URL` = e.g., `https://<your-issuance-service-domain>`
- `VITE_VERIFICATION_API_URL` = e.g., `https://<your-verification-service-domain>`

## Architecture

```
┌─────────────────┐
│     Frontend    │
│   (React App)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Issuance│ │ Verification │
│ Service │ │   Service    │
│ (Node)  │ │   (Node)     │
└────┬────┘ └──────┬───────┘
     │             │
     ▼             ▼
┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │ PostgreSQL  │
│ (Supabase)  │ │ (Supabase)  │
└─────────────┘ └─────────────┘
```

### Components

1. **Issuance Service** (Port 3000)

   - Issues new credentials
   - Prevents duplicate issuance
   - Tracks which worker issued each credential
   - Persists data in PostgreSQL (Supabase)

2. **Verification Service** (Port 3001)

   - Verifies credential authenticity
   - Returns issuance details
   - Independent database (PostgreSQL/Supabase) for verification

3. **Frontend** (Port 5173)
   - React + TypeScript + Vite
   - Two pages: Issue and Verify
   - Modern, responsive UI

## Features

- ✅ Independent, scalable microservices
- ✅ Worker identification for load balancing
- ✅ Duplicate credential detection
- ✅ Full TypeScript type safety
- ✅ Comprehensive error handling
- ✅ Request logging with Winston
- ✅ Health check endpoints
- ✅ Docker containerization
- ✅ Kubernetes manifests with auto-scaling
- ✅ Unit tests with Jest/Vitest
- ✅ CORS-enabled APIs

## Tech Stack

**Backend:**

- Node.js 20
- TypeScript 5
- Express.js
- PostgreSQL (`pg`)
- Winston (logging)
- Jest (testing)

**Frontend:**

- React 18
- TypeScript 5
- Vite
- React Router
- Axios
- Vitest (testing)

**DevOps:**

- Docker & Docker Compose
- Kubernetes
- Railway (deployment)

## Project Structure

```
kube-credential/
├── issuance-service/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── index.ts         # Entry point
│   ├── tests/               # Unit tests
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── verification-service/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript types
│   │   ├── test/            # Component tests
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── k8s/
│   ├── namespace.yaml
│   ├── issuance-deployment.yaml
│   ├── verification-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── services.yaml
│   └── ingress.yaml
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- kubectl (for Kubernetes deployment)
- Git

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/kube-credential.git
cd kube-credential
```

2. **Install dependencies for each service**

```bash
# Issuance Service
cd issuance-service
npm install
cp .env.example .env
npm run dev

# Verification Service
cd ../verification-service
npm install
cp .env.example .env
npm run dev

# Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

3. **Access the application**

- Frontend: http://localhost:5173
- Issuance API: http://localhost:3000
- Verification API: http://localhost:3001

### Docker Compose Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Documentation

### Issuance Service

#### POST `/issue`

Issue a new credential.

**Request:**

```json
{
  "id": "abc123",
  "name": "John Doe",
  "role": "Engineer"
}
```

**Success Response (201):**

```json
{
  "message": "credential issued by worker-a1b2c3d4",
  "timestamp": "2025-10-07T10:00:00.000Z"
}
```

**Duplicate Response (409):**

```json
{
  "message": "credential already issued"
}
```

**Error Response (400):**

```json
{
  "error": "Missing required fields: id, name, role"
}
```

#### GET `/health`

Health check endpoint.

**Response (200):**

```json
{
  "status": "healthy",
  "workerId": "worker-a1b2c3d4"
}
```

### Verification Service

#### POST `/verify`

Verify a credential.

**Request:**

```json
{
  "id": "abc123",
  "name": "John Doe",
  "role": "Engineer"
}
```

**Success Response (200):**

```json
{
  "message": "credential verified",
  "workerId": "worker-a1b2c3d4",
  "timestamp": "2025-10-07T10:00:00.000Z",
  "credential": {
    "id": "abc123",
    "name": "John Doe",
    "role": "Engineer"
  }
}
```

**Not Found Response (404):**

```json
{
  "error": "credential not found"
}
```

**Error Response (400):**

```json
{
  "error": "Missing required fields: id, name, role"
}
```

#### GET `/health`

Health check endpoint.

## Deployment

### Hosting

Deploy to any free tier (e.g., AWS free tier, Render, Railway). Set environment variables as documented below for your chosen platform.

### Kubernetes Deployment

1. **Build Docker images**

```bash
# Build all images
docker build -t issuance-service:latest ./issuance-service
docker build -t verification-service:latest ./verification-service
docker build -t frontend:latest ./frontend

# Or use a registry
docker tag issuance-service:latest your-registry/issuance-service:latest
docker push your-registry/issuance-service:latest
```

2. **Deploy to Kubernetes**

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy services
kubectl apply -f k8s/issuance-deployment.yaml
kubectl apply -f k8s/verification-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/services.yaml

# Optional: Create ingress
kubectl apply -f k8s/ingress.yaml
```

3. **Verify deployment**

```bash
kubectl get pods -n kube-credential
kubectl get services -n kube-credential

# Port forward for testing
kubectl port-forward -n kube-credential svc/frontend-service 8080:80
```

4. **Scale deployments**

```bash
kubectl scale deployment issuance-deployment --replicas=5 -n kube-credential
kubectl scale deployment verification-deployment --replicas=5 -n kube-credential
```

### Environment Variables

**Issuance Service:**

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (info/debug/error)
- `DATABASE_URL` - PostgreSQL connection string (e.g., Supabase)

**Verification Service:**

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level
- `DATABASE_URL` - PostgreSQL connection string (e.g., Supabase)

**Frontend:**

- `VITE_ISSUANCE_API_URL` - Issuance API endpoint
- `VITE_VERIFICATION_API_URL` - Verification API endpoint

## Supabase (PostgreSQL) Setup

Use a managed PostgreSQL instance (e.g., Supabase) for both services. Each service uses the same `credentials` table structure and initializes it if missing.

- Create the table (also in `DATABASE_Setup.md`):

```sql
CREATE TABLE IF NOT EXISTS public.credentials (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  worker_id TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
```

- Configure env vars for each service:
  - `DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require`
  - Or via parts: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE=require`

Notes:

- SSL is required on Supabase: keep `sslmode=require`.
- No client-side Supabase SDK is used; services connect via standard PostgreSQL (`pg`).

## Testing with Postman

Base URLs:

- Local: `http://localhost:3000` (issuance), `http://localhost:3001` (verification)
- Kubernetes Ingress: `https://<your-host>/issue` and `https://<your-host>/verify`
- Cloud (e.g., Railway): your deployed API URLs

Common headers:

- `Content-Type: application/json`

Requests:

- Issue credential

```http
POST <ISSUANCE_BASE_URL>/issue
Content-Type: application/json

{
  "id": "abc123",
  "name": "John Doe",
  "role": "Engineer"
}
```

- Verify credential

```http
POST <VERIFICATION_BASE_URL>/verify
Content-Type: application/json

{
  "id": "abc123",
  "name": "John Doe",
  "role": "Engineer"
}
```

Expected responses are shown in the API Documentation section above.

## Testing

### Backend Tests

```bash
# Issuance Service
cd issuance-service
npm test
npm run test:watch

# Verification Service
cd verification-service
npm test
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:ui
```

### Test Coverage

```bash
npm test -- --coverage
```

## Security

- Input validation on all endpoints
- CORS configuration
- SQL injection prevention (parameterized queries)
- Error handling without exposing internals
- Security headers in nginx configuration

## Monitoring & Logging

All services include:

- Structured JSON logging with Winston
- Request/response logging
- Error tracking
- Worker ID in all logs
- Timestamps in ISO 8601 format
