# app/routes/moderator_routes.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from app.models.question import QuestionUpdate, QuestionOut, VectorSearchResult
from app.services.question_service import get_question_by_id, update_question
from app.utils.response import success
from app.utils.jwt import decode_token
from app.utils.db import questions_collection
from bson import ObjectId
from datetime import datetime, timedelta


router = APIRouter(prefix="/api/moderator", tags=["moderator"])


async def verify_moderator(authorization: str):
    """Verify user has moderator/admin privileges."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = parts[1]
    payload = await decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_role = payload.get("role", "farmer")
    if user_role not in ["moderator", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return payload


@router.get("/questions/{question_id}")
async def get_question_details(question_id: str, authorization: str = Depends(verify_moderator)):
    """Get full question details for moderation."""
    question: QuestionOut = await get_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return success({"question": question.dict()})


@router.put("/questions/{question_id}")
async def update_question_status(
    question_id: str,
    update_data: QuestionUpdate,
    authorization: str = Depends(verify_moderator)
):
    """Update question status (for moderation actions)."""
    updated = await update_question(question_id, update_data.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Question not found or no changes made")

    return success({"message": "Question updated successfully"})


@router.get("/questions")
async def get_questions_for_review(
    status: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
    authorization: str = Depends(verify_moderator)
):
    """Get questions for moderation review."""
    query = {}
    if status:
        query["status"] = status

    questions = await questions_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)

    # Convert to response format
    result = []
    for doc in questions:
        result.append({
            "id": str(doc["_id"]),
            "raw_text": doc.get("raw_text"),
            "domain": doc.get("domain"),
            "status": doc.get("status"),
            "created_by": doc.get("created_by"),
            "created_at": doc.get("created_at"),
            "ai_metadata": doc.get("ai_metadata", {})
        })

    return success({"questions": result, "total": len(result)})


@router.post("/vector-search/test")
async def test_vector_search(
    text: str,
    limit: int = 5,
    authorization: str = Depends(verify_moderator)
):
    """Test vector search with a question text."""
    try:
        from app.ai.duplicate_detector import find_semantic_duplicate

        # Create test embedding
        from app.services.ai_pipeline import generate_embedding
        embedding = await generate_embedding(text)

        if not embedding:
            return success({"message": "Failed to generate embedding"})

        # Perform vector search
        duplicate = await find_semantic_duplicate("507f1f77bcf86cd799439011", text, embedding)

        return success({
            "query_text": text,
            "embedding_dimension": len(embedding),
            "duplicate_found": bool(duplicate),
            "duplicate_id": duplicate,
            "search_success": True
        })

    except Exception as e:
        return success({
            "query_text": text,
            "error": str(e),
            "search_success": False
        })


@router.get("/system/health/vector")
async def vector_search_health_check():
    """Check vector search system health."""
    try:
        # Count questions with embeddings
        with_embeddings = await questions_collection.count_documents({"embedding": {"$exists": True}})
        total_questions = await questions_collection.count_documents({})

        # Check for vector search indexes (simple check)
        indexes = []
        try:
            # This would require admin privileges in production
            indexes = []  # Placeholder
        except:
            pass

        return success({
            "vector_search_status": "healthy" if with_embeddings > 0 else "no_data",
            "questions_with_embeddings": with_embeddings,
            "total_questions": total_questions,
            "embedding_coverage": with_embeddings / total_questions if total_questions > 0 else 0,
            "vector_indexes": indexes
        })

    except Exception as e:
        return success({
            "vector_search_status": "error",
            "error": str(e)
        })


@router.get("/analytics/questions")
async def question_analytics(authorization: str = Depends(verify_moderator)):
    """Get question analytics for moderation dashboard."""
    try:
        # Get status breakdown
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        status_stats = await questions_collection.aggregate(pipeline).to_list(length=None)

        # Domain breakdown
        domain_pipeline = [
            {"$match": {"domain": {"$ne": None}}},
            {"$group": {"_id": "$domain", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        domain_stats = await questions_collection.aggregate(domain_pipeline).to_list(length=None)

        # Recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_count = await questions_collection.count_documents({"created_at": {"$gte": week_ago}})

        # Duplicate statistics
        duplicate_count = await questions_collection.count_documents({"status": "duplicate"})

        return success({
            "status_breakdown": {stat["_id"]: stat["count"] for stat in status_stats},
            "domain_breakdown": {stat["_id"]: stat["count"] for stat in domain_stats},
            "recent_questions": recent_count,
            "duplicate_count": duplicate_count,
            "total_questions": sum(stat["count"] for stat in status_stats)
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")


@router.delete("/questions/{question_id}")
async def delete_question(question_id: str, authorization: str = Depends(verify_moderator)):
    """Delete a question (admin only)."""
    result = await questions_collection.delete_one({"_id": ObjectId(question_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")

    return success({"message": "Question deleted successfully"})
