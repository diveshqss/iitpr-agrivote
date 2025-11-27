"""
AI Pipeline Service for processing farmer questions.
Handles the background pipeline: embedding -> classification -> duplicate check -> cleanup -> expert allocation.
Uses OpenAI for embeddings and MongoDB Atlas Vector Search for duplicate detection.
"""

from app.utils.db import questions_collection, users_collection
from bson import ObjectId
from datetime import datetime
from app.ai import classifier, duplicate_detector, cleanup
import asyncio
from typing import List
from openai import OpenAI
import os


async def generate_embedding(text: str) -> List[float]:
    """Generate text embedding using OpenAI for duplicate detection."""
    try:
        client = OpenAI(api_key="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")
        result = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return result.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return empty list to indicate failure
        return []


async def process_question_pipeline(question_id: str):
    """
    Background pipeline: embedding -> classification -> duplicate check -> cleanup -> expert allocation
    Update the question document as we progress.
    """
    qobj = await questions_collection.find_one({"_id": ObjectId(question_id)})
    if not qobj:
        return

    # Mark processing
    await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"status": "processing", "ai_pipeline.status": "running"}}
    )

    text = qobj.get("original_text", "")

    # 1) Generate embedding
    try:
        embedding = await generate_embedding(text)
        if embedding:  # Only update if we got a valid embedding
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {
                    "embedding": embedding,
                    "ai_metadata": {
                        "embedding_generated": True,
                        "embedding_model": "text-embedding-3-small",
                        "generated_at": datetime.utcnow()
                    }
                }}
            )
            print(embedding)
    except Exception as e:
        print(f"Embedding generation failed for question {question_id}: {e}")
        # Continue without embedding

    # 2) Classification
    try:
        domain = await classifier.classify_question_domain(text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"domain": domain}}
        )
    except Exception as e:
        print(f"Classification failed for question {question_id}: {e}")
        domain = "other"
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"domain": domain}}
        )

    # 3) Duplicate detection (now uses vector search if embedding available)
    try:
        # Pass both text and embedding to duplicate detector
        embedding_data = qobj.get("embedding") if "embedding" in qobj and qobj["embedding"] else None
        dup = await duplicate_detector.find_semantic_duplicate(question_id, text, embedding_data)

        if dup:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {
                    "status": "duplicate",
                    "is_duplicate_of": dup,
                    "ai_pipeline.status": "done",
                    "ai_metadata.duplicate_found": True
                }}
            )
            return
    except Exception as e:
        print(f"Duplicate detection failed for question {question_id}: {e}")
        # Continue with pipeline even if duplicate check fails

    # 4) Cleanup
    try:
        cleaned = await cleanup.clean_question_text(text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"cleaned_text": cleaned}}
        )
    except Exception as e:
        print(f"Text cleanup failed for question {question_id}: {e}")
        # Continue with original text

    # 5) Expert allocation (TODO: Make this smarter based on domain/expertise)
    try:
        # Simple allocation: pick up to 2 experts (sort by creation date)
        cursor = users_collection.find({"role": "expert"}).sort("created_at", 1).limit(2)
        experts = []
        async for e in cursor:
            experts.append(str(e["_id"]))
        if experts:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {"assigned_experts": experts, "status": "assigned"}}
            )
        else:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {"status": "assigned"}}
            )
    except Exception as e:
        print(f"Expert allocation failed for question {question_id}: {e}")
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"status": "processed"}}  # Fallback status
        )

    # Mark pipeline complete
    await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"ai_pipeline.status": "done"}}
    )


async def process_domain_classification(question_id: str, question_text: str):
    """Process domain classification for a question."""
    try:
        domain = await classify_question_domain(question_text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"domain": domain}}
        )
        return domain
    except Exception as e:
        print(f"Domain classification failed for question {question_id}: {e}")
        return "other"
