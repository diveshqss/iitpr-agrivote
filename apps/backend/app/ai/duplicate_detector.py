# backend/app/ai/duplicate_detector.py
from app.utils.db import questions_collection
from bson import ObjectId
import asyncio

async def find_semantic_duplicate(text: str, threshold: float = 0.8):
    """
    Very naive duplicate check: checks exact substring matches in recent questions.
    Replace with embeddings+vector DB later.
    Returns matched question _id (ObjectId) or None.
    """
    # simple substring search (case-insensitive) among recent items
    query = {"original_text": {"$regex": text[:50], "$options": "i"}}  # naive
    doc = await questions_collection.find_one(query)
    if doc:
        return str(doc["_id"])
    return None
