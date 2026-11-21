# Cloud Kitchen Food Delivery Platform

A single-seller food delivery website built as a monorepo with React, Express, and PostgreSQL.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MONOREPO STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│  apps/web/          ─ Frontend (Next.js + Redux)            │
│  apps/api/          ─ Backend (Express + Prisma)            │
│  packages/types/    ─ Shared TypeScript types                 │
│  packages/utils/     ─ Shared utilities                       │
│  docker/            ─ Docker Compose for local dev            │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React 18, Redux Toolkit, Tailwind CSS | SSR, client state, styling |
| **Backend** | Express, Prisma, PostgreSQL | REST API, ORM |
| **Database** | PostgreSQL 15 | Relational data |
| **Cache/OTP** | Redis 7 | OTP (TTL), rate limiting |
| **Queue** | Kafka | Async events (orders, notifications) |
| **Deployment** | Docker, Kubernetes (future) | Containerization |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or via Docker)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Run with Docker
docker-compose up
```

### Local Development

```bash
# Terminal 1: Database
docker compose up db redis kafka -d

# Terminal 2: API
cd apps/api
npm run dev

# Terminal 3: Web
cd apps/web
npm run dev
```

## Project Structure

```
food-delivery/
├── apps/
│   ├── web/           # Next.js frontend
│   │   ├── app/       # App Router pages
│   │   ├── src/       # Components, store
│   │   └── public/    # Static assets
│   └── api/           # Express backend
│       ├── src/       # API routes, middleware
│       └── prisma/    # Database schema
├── packages/
│   ├── types/         # Shared types
│   └── utils/         # Shared utilities
├── prisma/            # Monorepo-level schema
└── docker/            # Docker Compose configs
```

## Key Features

1. **OTP Authentication** - Phone-based login with Redis TTL
2. **Menu Management** - CRUD for menu items with categories
3. **Order System** - Create orders with Kafka events
4. **Admin Panel** - Staff dashboard (future)

## License

MIT