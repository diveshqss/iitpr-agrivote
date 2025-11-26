# Backend Environment Configuration

This document describes how to manage environment variables for the Python backend in the NX monorepo.

## File Structure

```
apps/backend/
├── .env                    # Development environment (NOT committed)
├── .env.production.example # Production environment template (committed)
└── your-deployment.env     # For different deployments (NOT committed)
```

## Development Setup

For local development:

1. **Copy `.env.development.local`** or rename from `.env` if needed
2. **Update values** for your local setup
3. **Run the backend**: `nx serve backend`

## Production Setup

For production deployments:

1. **Create `.env.production`** by copying `.env.production.example`
2. **Update all values** with production settings
3. **Set ENV=production** in your deployment environment
4. **DO NOT commit** the actual `.env.production` file

### Example Production Command
```bash
# Set environment variable and run
ENV=production python main.py
# or
export ENV=production && python main.py
```

## Environment Variable Reference

### Core Configuration
- `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: Database name
- `SECRET_KEY`: JWT signing secret (use strong random string)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT expiration time

### Security & CORS
- `CORS_ORIGINS`: Comma-separated allowed frontend URLs
- `ENV`: Environment name (development/production)
- `DEBUG`: Enable/disable debug mode

### API Settings
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)
- `LOG_LEVEL`: Logging level (DEBUG/INFO/WARNING/ERROR)

## Frontend Backend Communication

Ensure CORS_ORIGINS in backend includes the frontend URL:

**Development**: `CORS_ORIGINS=http://localhost:3000` (React dev server)
**Production**: `CORS_ORIGINS=https://yourdomain.com` (your frontend domain)

## Security Best Practices

1. **Never commit secrets** to git (use .env.local files)
2. **Use different secrets** for each environment
3. **Restrict CORS origins** to specific domains
4. **Enable DEBUG=False** in production
5. **Monitor logging levels** appropriately
