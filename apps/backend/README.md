# AgriVote Backend

A FastAPI-based backend service for the AgriVote platform that processes farmer questions using AI-powered pipelines.

## Features

- **Question Submission**: Farmers can submit questions with optional metadata
- **AI Pipeline Processing**:
  - Text embedding generation (Google Gemini)
  - Domain classification (crop, soil, pest, etc.)
  - Semantic duplicate detection (MongoDB Atlas Vector Search)
  - Text cleanup and normalization
  - Expert allocation
- **RESTful API**: FastAPI with automatic OpenAPI documentation

## Setup

### Prerequisites

- Python 3.9+
- MongoDB Atlas cluster
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables (copy from `.env.production.example`):
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

### MongoDB Atlas Setup

#### 1. Create Vector Search Index

In your MongoDB Atlas dashboard:

1. **Navigate to**: Your cluster → Collections → `questions` collection
2. **Click**: "Search Indexes" tab → "Create Search Index"
3. **Choose**: "Vector Search (JSON Editor)"

Use this index definition:

```json
{
  "fields": [
    {
      "numDimensions": 768,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
```

**Configuration**:
- **Index Name**: `vector_index`
- **Database**: `agri_vote_prod` (or your database name)
- **Collection**: `questions`
- **Vector Path**: `embedding`
- **Dimensions**: 768 (Gemini's text-embedding-004 dimension)
- **Similarity**: `cosine`

#### 2. Index Creation Steps in Atlas UI:

1. Go to your Atlas cluster
2. Click "Search" in the left sidebar
3. Click "Create Search Index"
4. Select "Vector Search"
5. Choose your cluster and database
6. Enter the JSON definition above
7. Name the index `vector_index`
8. Click "Create"

The index will take a few minutes to build. You can monitor the status in the "Search Indexes" tab.

#### 3. Verify Index Creation

Once created, the index will appear in the "Search Indexes" tab with status "Ready".

### Environment Variables

Create a `.env.production` file with:

```env
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/production_db
DATABASE_NAME=agri_vote_prod

# AI APIs
GEMINI_API_KEY=your-gemini-api-key-here

# Security
SECRET_KEY=your-production-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
CORS_ORIGINS=https://your-frontend-domain.com

# App
ENV=production
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000
```

### Running the Application

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode (with Gunicorn)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## API Endpoints

### Farmer Questions

- `POST /api/farmer/questions` - Submit a new question
- `GET /api/farmer/questions/{question_id}` - Get question details

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

## Project Structure

```
apps/backend/
├── app/
│   ├── ai/              # AI services (classification, embeddings, cleanup)
│   ├── models/          # Pydantic models
│   ├── routes/          # FastAPI route handlers
│   ├── services/        # Business logic services
│   └── utils/           # Utilities (DB, JWT, response helpers)
├── tests/               # Test files
├── main.py             # FastAPI application entry point
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Development

### Running Tests

```bash
pytest tests/ -v
```

### Code Formatting

The project uses Prettier and ESLint for formatting (see root README).

## Architecture

### Question Processing Pipeline

1. **Question Submission**: Farmer submits question via API
2. **Embedding Generation**: Google Gemini creates text embedding (768 dimensions)
3. **Domain Classification**: AI classifies question into agricultural domains
4. **Duplicate Detection**: Vector search finds similar existing questions
5. **Text Cleanup**: Normalize and clean question text
6. **Expert Allocation**: Assign to relevant agricultural experts
7. **Response**: Question processed and ready for expert review

### Database Schema

Questions collection:
```javascript
{
  "_id": ObjectId,
  "raw_text": "Farmer's original question",
  "cleaned_text": "AI-cleaned version",
  "embedding": [0.123, -0.456, ...], // 768-dim vector
  "domain": "crop",
  "is_duplicate_of": ObjectId, // if duplicate found
  "status": "new|processing|duplicate|assigned|answered|completed",
  "created_by": "userId",
  "created_at": ISODate,
  "ai_metadata": { // Pipeline tracking
    "embedding_generated": true,
    "embedding_model": "gemini-text-embedding-004",
    "duplicate_found": false
  },
  "assigned_experts": ["expertId1", "expertId2"],
  "ai_pipeline": {"status": "done"}
}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

[Your License Here]
