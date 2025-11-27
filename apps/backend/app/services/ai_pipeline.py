"""
AI Pipeline Service for processing farmer questions.
Handles the background pipeline: classification -> duplicate check -> cleanup -> expert allocation.
"""

from app.utils.db import questions_collection, users_collection
from bson import ObjectId
from datetime import datetime
from app.ai import classifier, duplicate_detector, cleanup
import asyncio
from app.ai.classifier import classify_question_domain


async def process_question_pipeline(question_id: str):
    """
    Background pipeline: classification -> duplicate check -> cleanup -> simple allocation
    Update the question document as we progress. Stubs only.
    """
    qobj = await questions_collection.find_one({"_id": ObjectId(question_id)})
    if not qobj:
        return

    # mark processing
    await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"status": "processing", "ai_pipeline.status": "running"}}
    )

    text = qobj.get("original_text", "")

    # 1) classification
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

    # 2) duplicate detection
    try:
        dup = await duplicate_detector.find_semantic_duplicate(text)
        if dup and dup != question_id:
            await questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": {"status": "duplicate", "duplicate_of": dup, "ai_pipeline.status": "done"}}
            )
            return
    except Exception as e:
        print(f"Duplicate detection failed for question {question_id}: {e}")
        # Continue with pipeline even if duplicate check fails

    # 3) cleanup
    try:
        cleaned = await cleanup.clean_question_text(text)
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"cleaned_text": cleaned}}
        )
    except Exception as e:
        print(f"Text cleanup failed for question {question_id}: {e}")
        # Continue with original text

    # 4) simple allocation: pick up to 2 experts (stub: top 2 by earliest created)
    try:
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
            {"$set": {"status": "submitted"}}  # Fallback status
        )

    await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"ai_pipeline.status": "done"}}
    )


async def process_domain_classification(question_id: str, question_text: str):
    """Process domain classification for a question."""
    try:
        domain = await classify_question_domain(question_text)
        await questions_collection.update_one(
            {"_id": question_id},
            {"$set": {"domain": domain}}
        )
        return domain
    except Exception as e:
        print(f"Domain classification failed for question {question_id}: {e}")
        return "other"
