# app/config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# In production, you might set a different .env file based on ENV variable
env_file = ".env.production" if os.getenv("ENV") == "production" else ".env"
dotenv_path = os.path.join(os.path.dirname(__file__), "..", env_file)

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    # Fallback to default .env in parent directory
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings:
    # Database Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "agri_vote")

    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # CORS Configuration
    CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]

    # Environment Configuration
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    # Logging (optional)
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if DEBUG else "INFO")

settings = Settings()
