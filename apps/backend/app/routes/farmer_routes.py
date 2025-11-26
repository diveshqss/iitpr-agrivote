# backend/app/routes/farmer_routes.py
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from typing import Optional
from app.models.question import QuestionCreate, QuestionOut
from app.services.question_service import create_question, process_question_pipeline
from app.utils.response import success
from app.utils.jwt import decode_token
from app.utils.db import questions_collection
from bson import ObjectId

router = APIRouter(prefix="/api/farmer", tags=["farmer"])

# helper to optionally decode bearer token from Authorization header
async def get_optional_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        payload = await decode_token(token)
        if payload:
            return payload.get("user_id")
    return None

# @router.post("/questions", response_model=dict)
# async def submit_question(q: QuestionCreate, background_tasks: BackgroundTasks, user_id: Optional[str] = Depends(get_optional_user)):
#     """
#     Accept a question (authenticated user_id optional).
#     Stores raw question and triggers background AI pipeline.
#     """
#     try:
#         created_id = await create_question(user_id, q.text, q.metadata)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"DB insert error: {e}")
#     # trigger background pipeline
#     background_tasks.add_task(process_question_pipeline, created_id)
#     return success({"question_id": created_id}, message="Question submitted and processing started")
@router.post("/questions", response_model=dict)
async def submit_question(
    q: QuestionCreate,
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = Depends(get_optional_user)
):
    """
    Accept a question.
    Stores raw question and triggers background AI pipeline.
    """

    try:
        # IMPORTANT → make sure q.text exists in QuestionCreate
        created_id = await create_question(
            user_id=user_id,
            original_text=q.text,       # CHANGE THIS NAME IF YOUR SERVICE USES A DIFFERENT KEY
            metadata=q.metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert error: {e}")

    background_tasks.add_task(process_question_pipeline, created_id)

    return success({"question_id": created_id}, message="Question submitted and processing started")

@router.get("/questions/{question_id}", response_model=dict)
async def get_question(question_id: str):
    doc = await questions_collection.find_one({"_id": ObjectId(question_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Question not found")
    # convert to an output dict
    out = {
        "id": str(doc["_id"]),
        "original_text": doc.get("original_text"),
        "cleaned_text": doc.get("cleaned_text"),
        "domain": doc.get("domain"),
        "status": doc.get("status"),
        "assigned_experts": doc.get("assigned_experts") or [],
        "duplicate_of": doc.get("duplicate_of"),
        "created_at": doc.get("created_at")
    }
    return success({"question": out})
