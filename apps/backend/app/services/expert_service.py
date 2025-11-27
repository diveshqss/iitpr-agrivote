"""
Expert Service
Handles expert-related operations accessing the users collection.
"""

from app.utils.db import users_collection, questions_collection, answers_collection, votes_collection, notifications_collection, peer_reviews_collection
from app.services.ai_service import generate_draft_answer, generate_quality_suggestions
from typing import Optional, Dict, Any, List
from bson import ObjectId
from pydantic import ValidationError
from app.models.answer import AnswerCreate, AnswerInDB, AnswerOut, AnswerUpdate
from app.models.vote import Vote
from app.models.peer_review import PeerReview, PeerReviewCreate, PeerReviewOut
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
            print(f"Expert {expert_id} not assigned to question {question_id}")
            return None

        answer_dict = answer_data.dict()
        answer_dict.update({
            "question_id": ObjectId(question_id),
            "expert_id": ObjectId(expert_id)
        })

        # Check for AI draft (with error handling)
        try:
            print(f"Attempting to generate AI draft for question with text: {(q['cleaned_text'] or q['raw_text'])[:100]}...")
            ai_draft = await generate_draft_answer(q["cleaned_text"] or q["raw_text"], q.get("domain"))
            if ai_draft:
                answer_dict["ai_draft"] = ai_draft
                print(f"AI draft generated successfully")
            else:
                print(f"AI draft generation returned None")
        except Exception as draft_e:
            print(f"AI draft generation failed: {draft_e} - continuing without AI draft")
            # Continue without AI draft - don't fail the entire submission

        print(f"Inserting answer with keys: {list(answer_dict.keys())}")
        result = await answers_collection.insert_one(answer_dict)
        print(f"Answer inserted successfully with ID: {result.inserted_id}")

        # Update question status to 'answered' so other experts can review it
        await questions_collection.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": {"status": "answered"}}
        )
        print(f"Question status updated to 'answered'")

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


async def submit_peer_review(expert_id: str, answer_id: str, review_data: PeerReviewCreate) -> Optional[Dict[str, Any]]:
    """
    Submit a peer review for an answer including comment and best answer vote.
    Experts can only review answers to questions they are assigned to, and cannot review their own answers.
    """
    try:
        # First, get the answer and check if this expert can review it
        answer = await answers_collection.find_one({"_id": ObjectId(answer_id)})
        if not answer:
            return None

        # Check if reviewer is the owner of the answer (experts cannot review their own answers)
        if str(answer["expert_id"]) == expert_id:
            return None

        # Check if this expert is assigned to the question
        question = await questions_collection.find_one({"_id": answer["question_id"], "assigned_experts": expert_id})
        if not question:
            return None

        # If voting for best answer, ensure this expert hasn't voted for another answer in this question
        if review_data.best_answer_vote:
            # Remove any existing best answer vote for this question by this expert
            await peer_reviews_collection.delete_many({
                "reviewer_expert_id": ObjectId(expert_id),
                "answer_id": {"$ne": ObjectId(answer_id)},
                "best_answer_vote": True
            })

        # Create the peer review
        review_dict = review_data.dict()
        review_dict.update({
            "answer_id": ObjectId(answer_id),
            "reviewer_expert_id": ObjectId(expert_id)
        })

        # Remove existing review for this answer by this expert
        await peer_reviews_collection.delete_many({
            "answer_id": ObjectId(answer_id),
            "reviewer_expert_id": ObjectId(expert_id)
        })

        result = await peer_reviews_collection.insert_one(review_dict)
        review_id = str(result.inserted_id)

        # Update peer_votes count in answer
        vote_count = await peer_reviews_collection.count_documents({
            "answer_id": ObjectId(answer_id),
            "best_answer_vote": True
        })
        await answers_collection.update_one(
            {"_id": ObjectId(answer_id)},
            {"$set": {"peer_votes": vote_count}}
        )

        # Store peer review comments in answer document
        review_out = PeerReviewOut(
            id=review_id,
            answer_id=str(ObjectId(answer_id)),
            reviewer_expert_id=expert_id,
            best_answer_vote=review_data.best_answer_vote,
            comment_text=review_data.comment_text,
            created_at=review_dict.get("created_at", None)
        )

        return {"id": review_id, "review": review_out.dict()}

    except Exception as e:
        print(f"Error submitting peer review: {e}")
        return None


async def get_peer_reviews_for_answer(answer_id: str) -> List[Dict[str, Any]]:
    """
    Get all peer reviews for a specific answer.
    """
    try:
        cursor = peer_reviews_collection.find({"answer_id": ObjectId(answer_id)}).sort("created_at", -1)
        reviews = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            doc["answer_id"] = str(doc["answer_id"])
            doc["reviewer_expert_id"] = str(doc["reviewer_expert_id"])
            reviews.append(doc)
        return reviews
    except Exception as e:
        print(f"Error fetching peer reviews for answer {answer_id}: {e}")
        return []


async def get_expert_vote_for_question(question_id: str, expert_id: str) -> Optional[Dict[str, Any]]:
    """
    Check if the expert has voted for best answer in this question and which answer they voted for.
    """
    try:
        # Find all answers for this question
        answers_cursor = answers_collection.find({"question_id": ObjectId(question_id)})
        answer_ids = []
        async for answer in answers_cursor:
            answer_ids.append(ObjectId(answer["_id"]))

        if not answer_ids:
            return None

        # Find if this expert has voted for best answer in any of these answers
        vote = await peer_reviews_collection.find_one({
            "answer_id": {"$in": answer_ids},
            "reviewer_expert_id": ObjectId(expert_id),
            "best_answer_vote": True
        })

        if vote:
            return {
                "has_voted": True,
                "answer_id": str(vote["answer_id"]),
                "review_id": str(vote["_id"])
            }
        else:
            return {"has_voted": False, "answer_id": None}

    except Exception as e:
        print(f"Error checking expert vote for question {question_id}: {e}")
        return None


async def update_expert_scores_after_revote(answer_id: ObjectId) -> bool:
    """
    Update expert scores after voting changes for a question.
    score = score + (total votes in favour of him / number of questions he is assigned to)
    """
    try:
        # Get the answer and question
        answer = await answers_collection.find_one({"_id": answer_id})
        if not answer:
            return False

        question = await questions_collection.find_one({"_id": answer["question_id"]})
        if not question:
            return False

        # Get all assigned experts for the question
        assigned_experts = question.get("assigned_experts", [])
        if str(answer["expert_id"]) not in assigned_experts:
            return False

        # Count total questions assigned to each expert
        for expert_id in assigned_experts:
            # Count assigned questions for this expert
            assigned_count = await questions_collection.count_documents({"assigned_experts": expert_id})

            if assigned_count == 0:
                continue

            # Count best answer votes received by this expert for answers in questions they're assigned to
            votes_favor = await peer_reviews_collection.count_documents({
                "answer_id": {"$in": [ObjectId(assigned_expert_id) for assigned_expert_id in assigned_experts]},
                "reviewer_expert_id": {"$ne": ObjectId(expert_id)},
                "best_answer_vote": True
            })

            # Calculate new score
            performance_score = votes_favor / assigned_count if assigned_count > 0 else 0

            # Update expert's score in users collection
            await users_collection.update_one(
                {"_id": ObjectId(expert_id)},
                {"$set": {"score": performance_score}}
            )

        return True

    except Exception as e:
        print(f"Error updating expert scores: {e}")
        return False
