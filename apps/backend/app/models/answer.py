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
# Answer
