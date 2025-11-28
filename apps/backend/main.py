# backend/main.py
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth_routes
from app.routes import farmer_routes
from app.routes import moderator_routes
from app.routes import expert_routes

def create_app() -> FastAPI:
    app = FastAPI(title="AgriVote Nexus API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_routes)
    app.include_router(farmer_routes)
    app.include_router(moderator_routes)
    app.include_router(expert_routes)

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", settings.API_PORT))
    uvicorn.run("main:app", host=settings.API_HOST, port=port, reload=(settings.ENV != "production"))
