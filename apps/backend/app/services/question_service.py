# app/services/question_service.py
from typing import Optional, Dict
from datetime import datetime
from bson import ObjectId
from app.utils.db import questions_collection

from app.models.question import QuestionOut

async def create_question(user_id: Optional[str], text: str, metadata: Optional[Dict] = None) -> str:
    """
    Insert a new question into DB and return inserted ID.
    """
    if metadata is None:
        metadata = {}

    doc = {
        "user_id": user_id,
        "original_text": text,
        "cleaned_text": None,
        "domain": None,
        "status": "pending",
        "assigned_experts": [],
        "duplicate_of": None,
        "metadata": metadata,
        "created_at": datetime.utcnow()
    }

    result = await questions_collection.insert_one(doc)
    return str(result.inserted_id)


async def get_question_by_id(question_id: str) -> Optional[QuestionOut]:
    """
    Fetch question by ID and return as QuestionOut.
    """
    from app.models.question import AIMetadata, AIPipelineStatus, QuestionStatus

    doc = await questions_collection.find_one({"_id": ObjectId(question_id)})
    if not doc:
        return None

    return QuestionOut(
        id=str(doc["_id"]),
        raw_text=doc.get("original_text") or doc.get("raw_text", ""),
        cleaned_text=doc.get("cleaned_text"),
        domain=doc.get("domain"),
        status=doc.get("status", QuestionStatus.NEW),
        assigned_experts=doc.get("assigned_experts") or [],
        is_duplicate_of=doc.get("duplicate_of"),
        created_by=doc.get("user_id") or doc.get("created_by", ""),
        created_at=doc.get("created_at"),
        ai_metadata=doc.get("ai_metadata", AIMetadata()),
        ai_pipeline=doc.get("ai_pipeline", AIPipelineStatus())
    )


async def update_question(question_id: str, updates: Dict) -> bool:
    """
    Update question fields. Returns True if modified.
    """
    result = await questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": updates}
    )
    return result.modified_count > 0


# # backend/app/models/question.py
# from __future__ import annotations
# from pydantic import BaseModel, Field
# from typing import Optional, List, Dict, Any
# from enum import Enum
# from datetime import datetime

# class QuestionStatus(str, Enum):
#     RAW = "raw"                  # just stored
#     CLEANED = "cleaned"          # after AI cleanup
#     DUPLICATE = "duplicate"      # marked duplicate of existing
#     CLASSIFIED = "classified"    # domain assigned
#     ALLOCATED = "allocated"      # experts assigned
#     UNDER_REVIEW = "under_review" # experts answering/reviewing
#     ANSWERED = "answered"        # moderator finalized an answer
#     REJECTED = "rejected"        # moderator rejected and will be reallocated
#     CLOSED = "closed"            # archived / closed

# class QuestionMetadata(BaseModel):
#     # optional fields that might come with the question, e.g. crop type,
#     # location, image urls, mobile number etc.
#     crop: Optional[str] = None
#     state: Optional[str] = None
#     district: Optional[str] = None
#     images: Optional[List[str]] = None
#     extra: Optional[Dict[str, Any]] = None

# class QuestionBase(BaseModel):
#     text: str = Field(..., min_length=3, max_length=5000, description="Raw question text from farmer/user")
#     metadata: Optional[QuestionMetadata] = None

# class QuestionCreate(QuestionBase):
#     # input schema for create endpoint
#     pass

# class QuestionInDB(BaseModel):
#     id: Optional[str] = Field(None, alias="_id")
#     original_text: str
#     cleaned_text: Optional[str] = None
#     domain: Optional[str] = None                    # e.g., crop, soil, pest, irrigation
#     status: QuestionStatus = QuestionStatus.RAW
#     assigned_experts: List[str] = []                # list of expert user_id strings
#     duplicate_of: Optional[str] = None              # if duplicate, the question_id of matched Q&A
#     metadata: Optional[QuestionMetadata] = None
#     created_at: datetime = Field(default_factory=datetime.utcnow)
#     updated_at: datetime = Field(default_factory=datetime.utcnow)

#     class Config:
#         # allow population by field name/_id mapping from Mongo docs
#         populate_by_name = True
#         json_encoders = {
#             datetime: lambda v: v.isoformat()
#         }

# class QuestionOut(BaseModel):
#     id: str
#     original_text: str
#     cleaned_text: Optional[str] = None
#     domain: Optional[str] = None
#     status: QuestionStatus
#     assigned_experts: List[str] = []
#     duplicate_of: Optional[str] = None
#     metadata: Optional[QuestionMetadata] = None
#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         json_encoders = {datetime: lambda v: v.isoformat()}

# def question_doc_to_out(doc: dict) -> QuestionOut:
#     """
#     Convert a MongoDB question document (with _id / datetime types) to QuestionOut.
#     Ensures _id is converted to string and missing fields get defaults.
#     """
#     if not doc:
#         raise ValueError("Empty document")

#     out = {
#         "id": str(doc.get("_id")),
#         "original_text": doc.get("original_text"),
#         "cleaned_text": doc.get("cleaned_text"),
#         "domain": doc.get("domain"),
#         "status": doc.get("status", QuestionStatus.RAW),
#         "assigned_experts": doc.get("assigned_experts", []) or [],
#         "duplicate_of": str(doc["duplicate_of"]) if doc.get("duplicate_of") else None,
#         "metadata": doc.get("metadata"),
#         "created_at": doc.get("created_at"),
#         "updated_at": doc.get("updated_at"),
#     }
#     return QuestionOut(**out) -----------------------------------------
# # backend/app/services/question_service.py
# from app.utils.db import questions_collection, users_collection
# from bson import ObjectId
# from datetime import datetime
# from app.ai import classifier, duplicate_detector, cleanup
# import asyncio
# from app.ai.classifier import classify_question_domain


# async def create_question(user_id: str | None, original_text: str, metadata: dict | None = None):
#     doc = {
#         "user_id": user_id,
#         "original_text": original_text,
#         "cleaned_text": None,
#         "domain": None,
#         "status": "submitted",
#         "assigned_experts": [],
#         "duplicate_of": None,
#         "metadata": metadata or {},
#         "created_at": datetime.utcnow(),
#         "ai_pipeline": {"status": "pending"}
#     }
#     res = await questions_collection.insert_one(doc)
#     doc["_id"] = res.inserted_id
#     return str(res.inserted_id)

# async def process_question_pipeline(question_id: str):
#     """
#     Background pipeline: classification -> duplicate check -> cleanup -> simple allocation
#     Update the question document as we progress. Stubs only.
#     """
#     qobj = await questions_collection.find_one({"_id": ObjectId(question_id)})
#     if not qobj:
#         return

#     # mark processing
#     await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"status": "processing", "ai_pipeline.status": "running"}})

#     text = qobj.get("original_text", "")

#     # 1) classification
#     domain = await classifier.classify_question_domain(text)
#     await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"domain": domain}})

#     # 2) duplicate detection
#     dup = await duplicate_detector.find_semantic_duplicate(text)
#     if dup and dup != question_id:
#         await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"status": "duplicate", "duplicate_of": dup, "ai_pipeline.status": "done"}})
#         return

#     # 3) cleanup
#     cleaned = await cleanup.clean_question_text(text)
#     await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"cleaned_text": cleaned}})

#     # 4) simple allocation: pick up to 2 experts (stub: top 2 by earliest created)
#     cursor = users_collection.find({"role": "expert"}).sort("created_at", 1).limit(2)
#     experts = []
#     async for e in cursor:
#         experts.append(str(e["_id"]))
#     if experts:
#         await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"assigned_experts": experts, "status": "assigned"}})
#     else:
#         await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"status": "assigned"}})

#     await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"ai_pipeline.status": "done"}})

# async def process_domain_classification(question_id: str, question_text: str):
#     from app.utils.db import db

#     domain = await classify_question_domain(question_text)

#     await db.questions.update_one(
#         {"_id": question_id},
#         {"$set": {"domain": domain}}
#     )

#     return domain
