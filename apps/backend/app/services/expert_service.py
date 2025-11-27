"""
Expert Service
Handles expert-related operations accessing the users collection.
"""

from app.utils.db import users_collection, questions_collection, answers_collection, votes_collection, notifications_collection
from app.services.ai_service import generate_draft_answer, generate_quality_suggestions
from typing import Optional, Dict, Any, List
from bson import ObjectId
from pydantic import ValidationError
from app.models.answer import AnswerCreate, AnswerInDB, AnswerOut
from app.models.vote import Vote
from app.models.question import QuestionInDB, QuestionOut


async def get_expert_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get expert information by email from users collection.
    Returns the expert document if found and role is 'expert', None otherwise.
    """
    try:
        expert = await users_collection.find_one({"email": email, "role": "expert"})
        if expert:
            expert["id"] = str(expert.pop("_id"))  # Convert ObjectId to string
        return expert
    except Exception as e:
        print(f"Error fetching expert by email {email}: {e}")
        return None


async def get_assigned_questions(expert_id: str) -> List[Dict[str, Any]]:
    """
    Get all questions assigned to an expert.
    """
    try:
        cursor = questions_collection.find({"assigned_experts": expert_id})
        questions = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))  # Convert ObjectId to string
            questions.append(doc)
        return questions
    except Exception as e:
        print(f"Error fetching assigned questions for expert {expert_id}: {e}")
        return []


async def submit_answer(expert_id: str, question_id: str, answer_data: AnswerCreate) -> Optional[Dict[str, Any]]:
    """
    Submit an answer for a question.
    """
    try:
        # Check if expert is assigned
        q = await questions_collection.find_one({"_id": ObjectId(question_id), "assigned_experts": expert_id})
        if not q:
            return None

        answer_dict = answer_data.dict()
        answer_dict.update({
            "question_id": ObjectId(question_id),
            "expert_id": ObjectId(expert_id)
        })

        # Check for AI draft
        ai_draft = await generate_draft_answer(q["cleaned_text"] or q["raw_text"], q.get("domain"))
        if ai_draft:
            answer_dict["ai_draft"] = ai_draft

        result = await answers_collection.insert_one(answer_dict)
        return {"id": str(result.inserted_id)}
    except Exception as e:
        print(f"Error submitting answer: {e}")
        return None


async def get_answers_for_question(question_id: str) -> List[Dict[str, Any]]:
    """
    Get all answers for a question.
    """
    try:
        cursor = answers_collection.find({"question_id": ObjectId(question_id)})
        answers = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))  # Convert ObjectId to string
            doc["question_id"] = str(doc["question_id"])
            doc["expert_id"] = str(doc["expert_id"])
            answers.append(doc)
        return answers
    except Exception as e:
        print(f"Error fetching answers for question {question_id}: {e}")
        return []


async def vote_on_answer(answer_id: str, expert_id: str, vote_type: str) -> bool:
    """
    Vote on an answer (upvote or downvote). Can change vote.
    """
    try:
        # Remove existing vote if any
        await votes_collection.delete_one({"answer_id": ObjectId(answer_id), "expert_id": ObjectId(expert_id)})

        # Insert new vote
        vote = Vote(answer_id=ObjectId(answer_id), expert_id=ObjectId(expert_id), vote_type=vote_type)
        await votes_collection.insert_one(vote.dict(by_alias=True))
        return True
    except Exception as e:
        print(f"Error voting on answer {answer_id}: {e}")
        return False


async def modify_answer(answer_id: str, expert_id: str, answer_text: str) -> bool:
    """
    Modify expert's own answer.
    """
    try:
        result = await answers_collection.update_one(
            {"_id": ObjectId(answer_id), "expert_id": ObjectId(expert_id)},
            {"$set": {"answer_text": answer_text}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error modifying answer {answer_id}: {e}")
        return False


async def request_moderator(question_id: str, expert_id: str) -> bool:
    """
    Request to send question to moderator.
    """
    try:
        # Check if expert is assigned and has answered
        q = await questions_collection.find_one({"_id": ObjectId(question_id), "assigned_experts": expert_id})
        if not q:
            return False

        answer_count = await answers_collection.count_documents({"question_id": ObjectId(question_id), "expert_id": ObjectId(expert_id)})
        if answer_count == 0:
            return False

        # Update question status or flag (placeholder)
        await questions_collection.update_one({"_id": ObjectId(question_id)}, {"$set": {"moderator_requested": True}})
        return True
    except Exception as e:
        print(f"Error requesting moderator for question {question_id}: {e}")
        return False


async def get_notifications(expert_id: str) -> List[Dict[str, Any]]:
    """
    Get notifications for an expert.
    """
    try:
        cursor = notifications_collection.find({"user_id": ObjectId(expert_id)}).sort("created_at", -1)
        notifications = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            doc["user_id"] = str(doc["user_id"])
            if doc.get("question_id"):
                doc["question_id"] = str(doc["question_id"])
            if doc.get("answer_id"):
                doc["answer_id"] = str(doc["answer_id"])
            notifications.append(doc)
        return notifications
    except Exception as e:
        print(f"Error fetching notifications for expert {expert_id}: {e}")
        return []


async def get_ai_suggestions(answer_text: str, question_text: str) -> List[str]:
    """
    Get AI suggestions for improving the answer.
    """
    suggestions = await generate_quality_suggestions(answer_text, question_text)
    return suggestions
