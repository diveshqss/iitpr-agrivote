from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List, Dict
from app.services.expert_service import (
    get_expert_by_email, get_assigned_questions, submit_answer,
    get_answers_for_question, vote_on_answer, modify_answer, request_moderator,
    get_notifications, get_ai_suggestions
)
from app.utils.response import success
from app.utils.jwt import decode_token
from app.models.answer import AnswerCreate
from app.utils.db import questions_collection
from bson import ObjectId

router = APIRouter(prefix="/api/expert", tags=["expert"])

async def get_current_expert(authorization: str = Header(...)):
    """
    Dependency to get current expert from JWT.
    """
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1]
    payload = await decode_token(token)
    if not payload or payload.get("role") != "expert":
        raise HTTPException(status_code=401, detail="Invalid token or not an expert")

    return payload["user_id"]

@router.get("/by-email/{email}")
async def get_expert_by_email_route(email: str):
    """
    Get expert information by email from users collection.
    """
    expert = await get_expert_by_email(email)
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")

    return success({"expert": expert})

@router.get("/assigned-questions")
async def get_assigned_questions_route(expert_id: str = Depends(get_current_expert)):
    """
    Get all questions assigned to the current expert.
    """
    questions = await get_assigned_questions(expert_id)
    return success({"questions": questions})

@router.post("/answer/submit/{question_id}")
async def submit_answer_route(
    question_id: str,
    answer_data: AnswerCreate,
    expert_id: str = Depends(get_current_expert)
):
    """
    Submit an answer for a specific question.
    """
    result = await submit_answer(expert_id, question_id, answer_data)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to submit answer or expert not assigned")

    return success(result, message="Answer submitted successfully")

@router.get("/question/{question_id}/answers")
async def get_answers_for_question_route(
    question_id: str,
    expert_id: str = Depends(get_current_expert)
):
    """
    Get all answers for a specific question (for review by assigned experts).
    """
    answers = await get_answers_for_question(question_id)
    return success({"answers": answers})

@router.post("/answer/{answer_id}/vote")
async def vote_on_answer_route(
    answer_id: str,
    vote_type: str,
    expert_id: str = Depends(get_current_expert)
):
    """
    Vote on an answer (upvote or downvote).
    """
    if vote_type not in ["upvote", "downvote"]:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    success_vote = await vote_on_answer(answer_id, expert_id, vote_type)
    if not success_vote:
        raise HTTPException(status_code=400, detail="Failed to vote")

    return success({}, message="Vote recorded")

@router.put("/answer/{answer_id}/modify")
async def modify_answer_route(
    answer_id: str,
    answer_text: str,
    expert_id: str = Depends(get_current_expert)
):
    """
    Modify the expert's own answer.
    """
    success_modify = await modify_answer(answer_id, expert_id, answer_text)
    if not success_modify:
        raise HTTPException(status_code=400, detail="Failed to modify answer")

    return success({}, message="Answer modified successfully")

@router.post("/question/{question_id}/request-moderator")
async def request_moderator_route(
    question_id: str,
    expert_id: str = Depends(get_current_expert)
):
    """
    Request to send the question to moderator.
    """
    success_request = await request_moderator(question_id, expert_id)
    if not success_request:
        raise HTTPException(status_code=400, detail="Failed to request moderator")

    return success({}, message="Moderator requested successfully")

@router.get("/notifications")
async def get_notifications_route(expert_id: str = Depends(get_current_expert)):
    """
    Get notifications for the current expert.
    """
    notifications = await get_notifications(expert_id)
    return success({"notifications": notifications})

@router.post("/answer/{answer_id}/ai-suggestions")
async def get_ai_suggestions_route(
    answer_id: str,
    expert_id: str = Depends(get_current_expert)
):
    """
    Get AI suggestions for improving an answer.
    """
    # Get the answer text
    from app.utils.db import answers_collection
    answer = await answers_collection.find_one({"_id": ObjectId(answer_id), "expert_id": ObjectId(expert_id)})
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    # Get question text
    question = await questions_collection.find_one({"_id": answer["question_id"]})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    suggestions = await get_ai_suggestions(answer["answer_text"], question["cleaned_text"] or question["raw_text"])
    return success({"suggestions": suggestions})
