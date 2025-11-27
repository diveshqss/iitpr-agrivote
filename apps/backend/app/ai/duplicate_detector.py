# app/ai/duplicate_detector.py
from app.utils.db import questions_collection
from app.utils.vector import cosine_similarity
from bson import ObjectId
from typing import Optional, List


async def find_semantic_duplicate(question_id: str, domain: str, embedding: Optional[List[float]] = None, threshold: float = 0.70):
    """
    Find semantic duplicates by comparing embeddings within the same domain.
    Falls back to text matching if no embedding or domain.
    Returns the ObjectId string of a duplicate question if found, None otherwise.
    """
    try:

        # Use local vector search if embedding and domain are available
        if embedding and len(embedding) > 0 and domain:
            # Find all questions with the same domain, excluding current, not marked as duplicate, with embeddings
            query = {
                "domain": domain,
                "_id": {"$ne": ObjectId(question_id)},
                "status": {"$nin": ["duplicate", None]},
                "embedding": {"$exists": True, "$ne": None}
            }

            cursor = questions_collection.find(query, {"_id": 1, "embedding": 1})
            candidates = await cursor.to_list(length=None)

            # Calculate similarities and find the best match
            best_match = None
            best_similarity = 0.0

            for candidate in candidates:
                sim = cosine_similarity(embedding, candidate["embedding"])
                if sim > best_similarity and sim >= threshold:
                    best_similarity = sim
                    best_match = candidate

            if best_match:
                return str(best_match["_id"])

    except Exception as e:
        print(f"Error in duplicate detection: {e}")
        # Continue with fallback

    return None
