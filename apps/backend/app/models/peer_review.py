# models/peer_review.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


# ---------------------------------------------------
# ObjectId Helper
# ---------------------------------------------------
class PyObjectId(ObjectId):

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


# ---------------------------------------------------
# Peer Review Model (stored in separate collection)
# ---------------------------------------------------
class PeerReview(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    answer_id: PyObjectId = Field(..., description="Reference to the answer being reviewed")
    reviewer_expert_id: PyObjectId = Field(..., description="Reference to the expert writing review")
    best_answer_vote: bool = Field(..., description="Whether this review votes for this answer as best")
    comment_text: str = Field(..., description="Review comment text")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str,
            datetime: lambda v: v.isoformat(),
        }


# ---------------------------------------------------
# Peer Review Create Model
# ---------------------------------------------------
class PeerReviewCreate(BaseModel):
    best_answer_vote: bool
    comment_text: str = Field(..., description="Review comment from expert")


# ---------------------------------------------------
# Peer Review Out Model (API Response)
# ---------------------------------------------------
class PeerReviewOut(BaseModel):
    id: str
    answer_id: str
    reviewer_expert_id: str
    best_answer_vote: bool
    comment_text: str
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
