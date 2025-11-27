import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from app.config import settings
from app.utils.response import success

# Initialize FastAPI app
from main import create_app
app = create_app()

@pytest.fixture
def client():
    """Provide a test client."""
    return TestClient(app)

@pytest.mark.asyncio
class TestAuthIntegration:
    """Integration tests for authentication routes."""

    async def test_signup_success(self, client):
        """Test successful user signup."""
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "role": "farmer"
        }

        response = client.post("/api/auth/signup", json=user_data)
        assert response.status_code == 200

        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["name"] == "Test User"

    async def test_signup_duplicate_email(self, client):
        """Test signup with already existing email."""
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "role": "farmer"
        }

        # Signup again with same email
        response = client.post("/api/auth/signup", json=user_data)
        assert response.status_code == 400

        data = response.json()
        assert "detail" in data
        assert "Email already registered" in data["detail"]

    async def test_login_success(self, client):
        """Test successful login."""
        login_data = {
            "username": "test@example.com",  # OAuth2 form uses 'username' for email
            "password": "password123"
        }

        response = client.post("/api/auth/login", data=login_data)
        assert response.status_code == 200

        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        login_data = {
            "username": "test@example.com",
            "password": "wrongpassword"
        }

        response = client.post("/api/auth/login", data=login_data)
        assert response.status_code == 401

        data = response.json()
        assert "detail" in data
        assert "Invalid credentials" in data["detail"]

@pytest.mark.asyncio
class TestFarmerIntegration:
    """Integration tests for farmer routes."""

    def test_submit_question_unauthenticated(self, client):
        """Test submitting a question without authentication."""
        question_data = {
            "text": "My paddy crops are turning yellow. What should I do?",
            "metadata": {"crop_type": "paddy", "location": "test"}
        }

        response = client.post("/api/farmer/questions", json=question_data)
        assert response.status_code == 200  # Farmer routes allow unauthenticated

        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "question_id" in data
        assert isinstance(data["question_id"], str)

    def test_get_question_success(self, client):
        """Test getting a question by ID."""
        # First create a question
        question_data = {
            "text": "How do I prevent pests in my wheat crop?",
            "metadata": {"crop_type": "wheat"}
        }
        create_response = client.post("/api/farmer/questions", json=question_data)
        assert create_response.status_code == 200
        question_id = create_response.json()["question_id"]

        # Now get the question
        response = client.get(f"/api/farmer/questions/{question_id}")
        assert response.status_code == 200

        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "question" in data
        assert data["question"]["original_text"] == "How do I prevent pests in my wheat crop?"

    def test_get_question_not_found(self, client):
        """Test getting a non-existent question."""
        response = client.get("/api/farmer/questions/507f1f77bcf86cd799439011")  # Random ObjectId
        assert response.status_code == 404

        data = response.json()
        assert "detail" in data
        assert "Question not found" in data["detail"]

@pytest.mark.asyncio
class TestHealthCheck:
    """Test health check endpoint."""

    def test_health_endpoint(self, client):
        """Test the health check."""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "ok"

    def test_docs_endpoint(self, client):
        """Test that API docs are accessible."""
        response = client.get("/docs")
        assert response.status_code == 200
        # Should return HTML content
        assert "swagger-ui" in response.text.lower()

    def test_openapi_json(self, client):
        """Test that OpenAPI JSON is accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        data = response.json()
        assert "paths" in data
        assert "/api/auth/signup" in data["paths"]
        assert "/api/auth/login" in data["paths"]
        assert "/api/farmer/questions" in data["paths"]
        assert "/health" in data["paths"]

if __name__ == "__main__":
    # Run with pytest
    pytest.main([__file__, "-v"])
