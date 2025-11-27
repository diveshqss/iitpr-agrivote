# models/vote.py

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
# Vote Model
# ---------------------------------------------------
class Vote(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    answer_id: PyObjectId = Field(..., description="Reference to the answer being voted on")
    expert_id: PyObjectId = Field(..., description="Reference to the expert who voted")
    vote_type: str = Field(..., description="Type: 'upvote' or 'downvote'")
    question_id: Optional[PyObjectId] = Field(None, description="Reference to the question for quick lookup")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str,
            datetime: lambda v: v.isoformat(),
        }
