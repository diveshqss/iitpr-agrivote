# app/ai/duplicate_detector.py
from app.utils.db import questions_collection
from bson import ObjectId
from typing import Optional, List


async def calculate_embedding_similarity(emb1: List[float], emb2: List[float]) -> float:
    """Calculate cosine similarity between two embeddings. Fallback method."""
    if not emb1 or not emb2 or len(emb1) != len(emb2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(emb1, emb2))
    norm1 = sum(a * a for a in emb1) ** 0.5
    norm2 = sum(b * b for b in emb2) ** 0.5

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot_product / (norm1 * norm2)


async def find_semantic_duplicate(question_id: str, text: str, embedding: Optional[List[float]] = None, threshold: float = 0.85):
    """
    Find semantic duplicates using MongoDB Atlas Vector Search when embedding available.
    Falls back to text matching if no embedding.
    Returns the ObjectId string of a duplicate question if found, None otherwise.
    """
    try:
        # Use MongoDB Atlas Vector Search if embedding available
        if embedding and len(embedding) > 0:
            # Atlas Vector Search aggregation pipeline
            pipeline = [
                {
                    "$vectorSearch": {
                        "index": "default",
                        "path": "embedding",
                        "queryVector": embedding,
                        "numCandidates": 100,
                        "limit": 10
                    }
                },
                {
                    "$match": {
                        "_id": {"$ne": ObjectId(question_id)},
                        "status": {"$nin": ["duplicate", None]},
                        "embedding": {"$exists": True, "$ne": None}
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "cleaned_text": 1,
                        "score": {"$meta": "vectorSearchScore"}
                    }
                },
                {"$match": {"score": {"$gte": threshold}}}
            ]

            results = await questions_collection.aggregate(pipeline).to_list(length=None)

            if results:
                # Return the highest scoring match
                best_match = max(results, key=lambda x: x.get("score", 0))
                if best_match.get("score", 0) >= threshold:
                    return str(best_match["_id"])

        # Fallback: simple text-based matching (case-insensitive substring)
        query = {
            "raw_text": {"$regex": text[:50], "$options": "i"},
            "_id": {"$ne": ObjectId(question_id)},
            "status": {"$ne": "duplicate"}
        }
        doc = await questions_collection.find_one(query)
        if doc:
            return str(doc["_id"])

    except Exception as e:
        print(f"Error in duplicate detection: {e}")
        # Continue with fallback even if vector search fails

    return None
