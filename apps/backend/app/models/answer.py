# models/answer_model.py

from pydantic import BaseModel, Field
from typing import Optional, List
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
# Base Answer Model
# ---------------------------------------------------
class AnswerBase(BaseModel):
    answer_text: str = Field(..., description="Expert’s final answer")

    images: Optional[List[str]] = Field(
        default=None,
        description="Optional image URLs submitted by expert"
    )

    status: str = Field(
        "submitted",
        description="Status: submitted / reviewed / published / rejected"
    )

    upvotes: int = Field(0, description="Upvotes by farmers")
    downvotes: int = Field(0, description="Downvotes by farmers")
    peer_votes: int = Field(0, description="Peer votes for best answer")
    peer_review_comments: List[dict] = Field(default_factory=list, description="Peer review comments from other experts")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------
# Answer Create Model (Expert Submits)
# ---------------------------------------------------
class AnswerCreate(BaseModel):
    answer_text: str
    images: Optional[List[str]] = None  # S3/Cloudinary URLs


# ---------------------------------------------------
# Answer In DB Model
# ---------------------------------------------------
class AnswerInDB(AnswerBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    question_id: PyObjectId = Field(..., description="Reference to the question")
    expert_id: PyObjectId = Field(..., description="Reference to the expert")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ai_draft: Optional[str] = Field(None, description="AI-generated draft answer")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str,
            datetime: lambda v: v.isoformat(),
        }


# ---------------------------------------------------
# Answer Out Model (API Response)
# ---------------------------------------------------
class AnswerOut(AnswerBase):
    id: str
    question_id: str
    expert_id: str
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ---------------------------------------------------
# Answer Update Model
# ---------------------------------------------------
class AnswerUpdate(BaseModel):
    answer_text: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
