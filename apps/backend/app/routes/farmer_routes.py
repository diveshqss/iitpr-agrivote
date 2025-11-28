# app/routes/farmer_routes.py
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from typing import Optional
from app.models.question import QuestionCreate, QuestionOut
from app.services.question_service import create_question, get_question_by_id
from app.utils.response import success
from app.utils.jwt import decode_token

router = APIRouter(prefix="/api/farmer", tags=["farmer"])

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

@router.post("/questions", response_model=dict)
async def submit_question(q: QuestionCreate, background_tasks: BackgroundTasks, user_id: Optional[str] = Depends(get_optional_user)):
    """
    Submit a farmer question and trigger background AI pipeline
    """
    try:
        created_id = await create_question(user_id, q.text, q.metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert error: {e}")

    # Trigger AI pipeline in background
    from app.services.ai_pipeline import process_question_pipeline
    background_tasks.add_task(process_question_pipeline, created_id)

    return success({"question_id": created_id}, message="Question submitted and processing started")


@router.get("/questions/{question_id}", response_model=dict)
async def get_question(question_id: str):
    """
    Get question details by ID
    """
    question: QuestionOut = await get_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Convert to the expected response format (maintaining API compatibility)
    out = {
        "id": question.id,
        "original_text": question.raw_text,  # Use raw_text field from QuestionOut model
        "cleaned_text": question.cleaned_text,
        "domain": question.domain,
        "status": question.status.value,  # Convert enum to string
        "assigned_experts": question.assigned_experts,
        "is_duplicate_of": question.is_duplicate_of,
        "created_by": question.created_by,
        "created_at": question.created_at,
        "ai_metadata": question.ai_metadata.dict() if question.ai_metadata else {},
        "ai_pipeline": question.ai_pipeline.dict() if question.ai_pipeline else {}
    }
    return success({"question": out})
