# backend/app/services/question_service.py
from app.utils.db import questions_collection, users_collection
from bson import ObjectId
from datetime import datetime
from app.ai import classifier, duplicate_detector, cleanup
import asyncio

async def create_question(user_id: str | None, original_text: str, metadata: dict | None = None):
    doc = {
        "user_id": user_id,
        "original_text": original_text,
        "cleaned_text": None,
        "domain": None,
        "status": "submitted",
        "assigned_experts": [],
        "duplicate_of": None,
        "metadata": metadata or {},
        "created_at": datetime.utcnow(),
        "ai_pipeline": {"status": "pending"}
    }
    res = await questions_collection.insert_one(doc)
    doc["_id"] = res.inserted_id
    return str(res.inserted_id)

async def process_question_pipeline(question_id: str):
    """
    Background pipeline: classification -> duplicate check -> cleanup -> simple allocation
    Update the question document as we progress. Stubs only.
    """
    qobj = await questions_collection.find_one({"_id": ObjectId(question_id)})
    if not qobj:
        return

    # mark processing
    await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"status": "processing", "ai_pipeline.status": "running"}})

    text = qobj.get("original_text", "")

    # 1) classification
    domain = await classifier.classify_text(text)
    await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"domain": domain}})

    # 2) duplicate detection
    dup = await duplicate_detector.find_semantic_duplicate(text)
    if dup and dup != question_id:
        await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"status": "duplicate", "duplicate_of": dup, "ai_pipeline.status": "done"}})
        return

    # 3) cleanup
    cleaned = await cleanup.clean_question_text(text)
    await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"cleaned_text": cleaned}})

    # 4) simple allocation: pick up to 2 experts (stub: top 2 by earliest created)
    cursor = users_collection.find({"role": "expert"}).sort("created_at", 1).limit(2)
    experts = []
    async for e in cursor:
        experts.append(str(e["_id"]))
    if experts:
        await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"assigned_experts": experts, "status": "assigned"}})
    else:
        await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"status": "assigned"}})

    await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"ai_pipeline.status": "done"}})
