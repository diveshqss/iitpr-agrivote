# AgriVote Monorepo Development Commands

This document describes all available commands for developing the AgriVote application in the NX monorepo setup.

## Environment Variables

Before running commands, ensure you have the appropriate environment files:

### Frontend Environment Files (in `apps/AgriVote/`)
- `.env.development.local` - Development environment (automatically loaded)
- `.env.production.local` - Production configuration (for production builds)

### Backend Environment Files (in `apps/backend/`)
- `.env` - Development environment (automatically loaded)
- `.env.production.example` - Copy this to `.env.production` for production

## Development Commands

### Full Stack Development
```bash
# Start both frontend and backend in development mode
npm run dev

# Frontend only (port 3000, development mode)
npm run dev:frontend:only
# or
nx serve:dev AgriVote

# Backend only (development environment, port 8000)
npm run dev:backend:only
# or
nx serve:dev backend

# Default NX commands (same as above)
nx serve AgriVote          # Frontend (port 3000)
nx serve:dev AgriVote      # Frontend (port 3000, explicit dev)
nx serve:dev backend       # Backend (ENV=development)
```

## Production Commands

### Full Stack Production
```bash
# Start both frontend and backend in production mode
npm run serve:prod

# Frontend only (port 3001, production mode)
npm run prod:frontend:only
# or
nx serve:prod AgriVote

# Backend only (production environment, port from .env.production)
npm run prod:backend:only
# or
nx serve:prod backend
```

## Build Commands

### Frontend Builds
```bash
# Default build (production)
npm run build
# or
nx build AgriVote

# Development build
npm run build:dev
# or
nx build:dev AgriVote

# Production build
npm run build:prod
# or
nx build:prod AgriVote
```

## Backend Commands

### Backend Dependencies
```bash
# Install Python dependencies (uses venv pip)
npm run install:backend
# or
nx install backend
```

### Backend Servers (Direct NX)
```bash
# Development mode
nx serve backend           # Uses .env (development)
nx serve:dev backend       # Explicit development
nx serve:prod backend      # Uses .env.production (production)
```

## Quality & Testing

```bash
# Lint all apps
npm run lint
# or
nx run-many -t lint

# Type checking
npm run type-check
# or
nx run-many -t type-check

# Test (if configured)
npm test
```

## Environment-Specific Behavior

### Frontend (React Router)
- **Development**: Uses `apps/AgriVote/.env.development.local` → `http://localhost:8000` API
- **Production**: Uses `apps/AgriVote/.env.production.local` → `https://api.agri-vote.com` API

### Backend (FastAPI)
- **Development** (`ENV=development`): Loads `.env`, DEBUG=True, CORS allows localhost:3000
- **Production** (`ENV=production`): Loads `.env.production`, DEBUG=False, CORS for production domain

## Port Configuration

| Service     | Development | Production |
|-------------|-------------|------------|
| Frontend    | localhost:3000 | localhost:3001 |
| Backend     | localhost:8000 | localhost:8000 |

## Troubleshooting

### Frontend Issues
- Ensure `.env.development.local` exists with correct `VITE_API_BASE_URL`
- Check browser console for Vite environment variables

### Backend Issues
- Ensure `.env` exists for development or `.env.production` for production
- Check `ENV=production` environment variable is set
- Verify MongoDB connection string

### Common Commands
```bash
# Kill all processes on port 3000/3001
npx kill-port 3000 3001 8000

# Clear NX cache
npx nx reset

# Install all dependencies
npm install && npm run install:backend
```

## Deployment Notes

### Production Deployment
1. Copy `.env.production.example` to `.env.production` and configure
2. Set environment variable `ENV=production`
3. Run `npm run build:prod` for frontend
4. Run `npm run prod:backend:only` for backend

### Development Deployment
1. Ensure `.env` and `.env.development.local` exist
2. Run `npm run dev` for full-stack development
3. Access at http://localhost:3000 (frontend) and http://localhost:8000 (backend)
