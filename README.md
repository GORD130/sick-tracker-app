# FluentUI Full-Stack Application

A modern full-stack application built with TypeScript, FluentUI, Express, PostgreSQL, Redis, and Docker.

## 🚀 Features

- **Frontend**: React with FluentUI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Kysely ORM
- **Caching**: Redis for performance optimization
- **Containerization**: Docker and Docker Compose
- **Development**: Hot reloading for both frontend and backend

## 🛠️ Tech Stack

### Frontend
- React 18
- FluentUI React Components
- TypeScript
- Vite (build tool)

### Backend
- Express.js
- TypeScript
- Kysely (SQL query builder)
- PostgreSQL
- Redis
- Helmet (security)
- CORS
- Morgan (logging)

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## 🏃‍♂️ Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd fluentui-app
   ```

2. **Start all services:**
   ```bash
   npm run docker:up
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Manual Setup

1. **Install dependencies:**
   ```bash
   # Root dependencies
   npm install

   # Backend dependencies
   cd backend && npm install && cd ..

   # Frontend dependencies
   cd frontend && npm install && cd ..
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start PostgreSQL and Redis:**
   ```bash
   # Using Docker
   docker-compose up -d postgres redis
   ```

4. **Run database migrations:**
   ```bash
   cd backend
   npm run migrate:latest
   cd ..
   ```

5. **Start development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start them separately
   npm run dev:backend
   npm run dev:frontend
   ```

## 📁 Project Structure

```
fluentui-app/
├── backend/
│   ├── src/
│   │   ├── cache/
│   │   │   └── redis.ts          # Redis client and utilities
│   │   ├── database/
│   │   │   ├── db.ts             # Database connection
│   │   │   ├── schema.ts         # Database schema types
│   │   │   └── migrations/       # Database migrations
│   │   └── server.ts             # Express server
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application component
│   │   ├── main.tsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── package.json
└── README.md
```

## 🗄️ Database

### Schema

The application uses a simple user management system:

```sql
users
├── id (serial, primary key)
├── name (varchar, not null)
├── email (varchar, not null, unique)
├── created_at (timestamp, default now())
└── updated_at (timestamp, default now())
```

### Migrations

Run database migrations:

```bash
cd backend

# Run all pending migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:down

# Create new migration (manual)
# Create file in src/database/migrations/ with up/down functions
```

## 🔧 API Endpoints

### Users

- `GET /api/users` - Get all users (cached for 30s)
- `GET /api/users/:id` - Get user by ID (cached for 60s)
- `POST /api/users` - Create new user

### Health

- `GET /api/health` - Health check endpoint

## 🐳 Docker Services

| Service   | Port  | Description                    |
|-----------|-------|--------------------------------|
| Frontend  | 3000  | React development server       |
| Backend   | 5000  | Express API server             |
| PostgreSQL| 5432  | Database                       |
| Redis     | 6379  | Cache                          |

### Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# Rebuild containers
npm run docker:build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

## 🔒 Environment Variables

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://fluentui_user:fluentui_password@postgres:5432/fluentui_app

# Redis
REDIS_URL=redis://redis:6379
```

### Frontend (vite.config.ts)

```env
VITE_API_URL=http://localhost:5000
```

## 🧪 Development

### Backend Development

```bash
cd backend
npm run dev  # Uses tsx for hot reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite development server
```

### Running Tests

```bash
# Backend tests (when added)
cd backend && npm test

# Frontend tests (when added)
cd frontend && npm test
```

## 📦 Production Build

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

### Production Docker

Update `docker-compose.prod.yml` (to be created) for production deployment with:
- Environment-specific configurations
- SSL/TLS certificates
- Load balancing
- Monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3001, 5173, 5432, or 6379 are already in use
2. **Database connection**: Ensure PostgreSQL container is running and healthy
3. **Redis connection**: Check Redis container status
4. **Docker issues**: Try rebuilding containers with `docker-compose build --no-cache`

### Logs

```bash
# View all service logs
docker-compose logs

# View specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details# sick-tracker-app
