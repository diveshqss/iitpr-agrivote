# AgriVote Nexus: The Future of Multi-Expert Agricultural Decision Systems

In the bustling research wing of a national agricultural innovation center, a group of scientists had been quietly observing a growing problem. Every year, thousands of farmers across the country asked crucial questions about crops, soil, pests, irrigation, and fertilizers. But the answers they received varied widely depending on which expert they approached.

Some experts were extremely knowledgeable but slow, some responded quickly but skipped important details, some disagreed with one another and some forgot to check for duplicate questions already answered months earlier.

The result? Farmers often received inconsistent, delayed or repeated information.

One day, during a farmers' support camp, things became clear. A farmer approached the center with an urgent concern:
"Three different experts gave me three different solutions. Who am I supposed to trust?"

This question hit the experts hard. If even trained agricultural professionals couldn't align on one reliable answer, how could farmers depend on them and especially during emergencies like pest outbreaks or unpredictable climate conditions?

That evening, the lead architect of the research team stood up and said:
"We need a system where experts don't work alone, they work together. A system where AI helps them evaluate, vote, correct and finalize the best answer."

This idea sparked the birth of AgriVote Nexus - a multi-expert, AI-powered agricultural review and voting platform that ensures every farmer receives the best possible, verified, and consensus-driven answer.

The platform blended human expertise with intelligent AI checks. It prevented duplicate questions, cleaned farmer queries, classified domains automatically, allocated the right experts, evaluated expert quality, supported multi-expert voting and ensured every answer passed through a moderator.

For the first time, agricultural advice became scientific, collaborative and quality-controlled and thus began the journey of AgriVote Nexus, a system where multiple experts, AI intelligence and smart voting work together to create a new standard of agricultural decision-making.

## Mandatory Project Requirements

Below is how AgriVote Nexus functions from start to finish, integrating all components of the system:

1. **Intelligent Review Flow**:
   A. A farmer's question enters the review system.
   B. The question gets allocated to selected experts.
   C. Experts provide answers and review each other's responses.
   D. A voting mechanism helps highlight strong answers.
   E. A moderator reviews the top answer and finalizes it.
   F. Duplicate questions are automatically avoided.
   G. If a moderator rejects the answer → question is reallocated to another expert.

2. **AI Domain Classification**: The system uses an LLM to automatically categorize every incoming question into domains such as crop, soil, irrigation, pest, disease, fertilizer, machinery and subsidy. This ensures the right experts handle the question.

3. **AI Semantic Duplicate Detection**: Before experts see the question, AI performs semantic similarity analysis and duplicate detection. If it matches a previously solved question, the system suggests the existing Q&A instead of creating a new one.

4. **AI Question Cleanup**: To help experts understand the farmer's query easily, the system improves clarity, removes unnecessary parts and identifies missing details. Both the original and the AI-refined version are shown to experts so they can accept or further edit.

5. **AI-Powered Expert Allocation**: The system evaluates experts based on accuracy of past answers, moderator acceptance rate, peer votes, consistency, domain specialization and response time. Using these metrics, AI assigns each question to the most suitable experts.

6. **Expert Workflow**:
   i. Submit Answer:
      A. AI provides an optional draft answer
      B. AI gives quality improvement suggestions
      C. Expert edits and submits final answer
   ii. Review and Vote:
      Experts can view other expert answers, upvote high-quality responses, modify their own answers and request "Send to Moderator".

7. **AI Auto-Detection of the Best Possible Answer**: AI ranks answers using a scoring model based on accuracy, completeness, safety, practicality and compliance. The highest-scoring answer appears first.

8. **Voting + Moderator Workflow**: Rules:
   ● If an answer gets 5 expert votes, it goes to the moderator.
   ● Experts can request finalization.
   ● AI notifies the moderator only when the answer appears stable, no conflicts exist and accuracy score is high.

9. **Moderator Acceptance**: If accepted, the final answer and question is stored in the database.

10. **Moderator Rejection**: If rejected:
    i. New Expert Routing: AI identifies a new, better-suited expert based on:
       ● Who hasn't answered yet
       ● Highest expertise score
       ● Domain specialization
    ii. AI-Generated Restart Context: New experts receive:
       ● Summary of previous attempts
       ● What went wrong
       ● What needs improvement
       ● Reason for rejection

## Architecture

AgriVote Nexus is built as a modern full-stack application using the following architecture:

### Frontend
- **Framework**: React 19 with React Router v7
- **Build Tool**: Vite
- **UI Library**: Radix UI primitives with Tailwind CSS
- **State Management**: React hooks and context
- **Key Features**: Responsive design, accessible components, farmer portal, expert dashboard, moderator dashboard

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with vector search capabilities
- **Authentication**: JWT-based with bcrypt password hashing
- **API Documentation**: Automatic OpenAPI/Swagger docs at `/docs`

### AI Components
- **Embedding Service**: OpenAI text-embedding-3-small (1536 dimensions)
- **Classification Engine**: OpenAI GPT-4o-mini for domain classification
- **Text Cleanup**: OpenAI GPT-3.5-turbo for question rewriting
- **Similarity Detection**: Cosine similarity using NumPy

### Database Schema
- **Questions**: Store farmer questions with embeddings, metadata, status tracking
- **Users**: Farmers, experts, moderators with roles and specializations
- **Answers**: Expert responses with voting data
- **Votes**: Peer review and ranking system
- **Workflow**: Tracking question lifecycle

## AI Pipeline

The AI pipeline processes farmer questions through several stages:

1. **Question Submission**: Farmer submits question via API
2. **Embedding Generation**: OpenAI creates text embedding for semantic search
3. **Domain Classification**: GPT-4o-mini classifies question into agricultural domains (crop, soil, pest, fertilizer, irrigation, weather, other)
4. **Duplicate Detection**: Vector similarity search finds existing similar questions within same domain
5. **Text Cleanup**: GPT-3.5-turbo rewrites question for clarity and specificity
6. **Expert Allocation**: Matches experts based on domain specialization and vector similarity of expertise embeddings
7. **Draft Answer Generation**: Optional AI-generated draft for experts
8. **Quality Suggestions**: AI feedback on answer improvements

## How to Run the Project Locally

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone and Setup
```bash
git clone <repository-url>
cd AgriVote
npm install
```

### 2. MongoDB Setup
#### Option A: Local MongoDB
```bash
# Install MongoDB locally (Windows with Winget or download directly)
winget install MongoDB.MongoDB

# Start MongoDB service
mongod

# Update .env with local URI
MONGODB_URL=mongodb://localhost:27017/agri_vote
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `.env` in `apps/backend/`:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/agri_vote
```

### 3. Backend Setup
```bash
cd apps/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment (copy and edit .env)
cp .env .env.local
# Edit .env.local with your MongoDB URL and OpenAI API key
```

### 4. Seed Expert Data
```bash
# Generate sample experts
python generate_experts.py
```

### 5. Run the Application
```bash
# From project root (recommended - runs both frontend and backend)
npm run dev

# Or run separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:8000

# Alternative individual commands:
nx serve AgriVote          # Frontend only
nx serve:dev backend       # Backend only
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Seed Data Creation

To populate the database with initial expert data:

```bash
cd apps/backend
python generate_experts.py
```

This script:
- Generates 50 sample agriculture experts across different domains
- Creates embeddings for specialization texts using OpenAI
- Inserts experts into the `users_collection`
- Provides domain distribution statistics

Sample expert domains include crop farming, soil management, pest control, fertilizer optimization, irrigation systems, and weather advisory.

## Project Status

⚠️ **Important Note**: This project is not yet complete. Several key modules are pending implementation:

### Pending Features:
- **Moderator Module**: Full moderator workflow for answer review and acceptance/rejection
- **Admin Dashboard**: Administrative controls and analytics
- **Answer Ranking AI**: Auto-detection and scoring of best answers (answer_ranker.py exists but not implemented)
- **Complete Voting System**: Full peer review and voting mechanics
- **Notification System**: Email/SMS notifications for experts and farmers
- **Advanced Analytics**: Question trends, expert performance metrics

### Current Functionality:
✅ Farmer question submission
✅ AI pipeline processing (classification, cleanup, duplicate detection)
✅ Expert allocation
✅ Basic user authentication
✅ RESTful API endpoints
✅ Frontend dashboards for all user types
✅ MongoDB integration with vector search

## Development

### Available Scripts
```bash
npm run dev          # Run both frontend and backend
npm run build        # Build frontend for production
npm run lint         # Run ESLint
npm run test         # Run tests (when available)
```

### Code Structure
```
apps/
├── AgriVote/        # React frontend
│   ├── app/         # Route-based components
│   ├── components/  # Reusable UI components
│   └── lib/         # Utilities and API clients
└── backend/         # FastAPI backend
    ├── app/
    │   ├── ai/      # AI processing modules
    │   ├── models/  # Pydantic models
    │   ├── routes/  # API endpoints
    │   ├── services/# Business logic
    │   └── utils/   # Database, JWT, etc.
    └── generate_experts.py  # Seed data script
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

MIT License
