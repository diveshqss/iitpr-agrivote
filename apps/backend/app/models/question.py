# models/question_model.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


# ---------------------------------------------------
# Helper for ObjectId serialization
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
# Base Question Model (shared fields)
# ---------------------------------------------------
class QuestionBase(BaseModel):
    farmer_id: PyObjectId = Field(..., description="Farmer asking the question")
    raw_question: str = Field(..., description="Original question from farmer")
    cleaned_question: Optional[str] = Field(None, description="AI cleaned version")
    ai_domain: Optional[str] = Field(None, description="AI generated domain")
    is_duplicate: bool = False
    duplicate_of: Optional[PyObjectId] = None
    assigned_expert_id: Optional[PyObjectId] = None
    status: str = Field("pending", description="pending / answered / rejected")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------
# Question Create Model (input to API)
# ---------------------------------------------------
class QuestionCreate(BaseModel):
    farmer_id: str
    question: str


# ---------------------------------------------------
# Question DB Model (final stored model)
# ---------------------------------------------------
class QuestionDB(QuestionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------
# Response Model (sent back to UI)
# ---------------------------------------------------
class QuestionResponse(QuestionDB):
    pass

# # backend/app/models/question.py
# from pydantic import BaseModel, Field
# from typing import Optional, List
# from datetime import datetime
from enum import Enum

class QuestionStatus(str, Enum):
    SUBMITTED = "submitted"
    PROCESSING = "processing"
    DUPLICATE = "duplicate"
    ASSIGNED = "assigned"
    COMPLETED = "completed"

# class QuestionCreate(BaseModel):
#     text: str = Field(..., min_length=3)
#     # optional metadata fields like images, farmer contact can be added later
#     metadata: Optional[dict] = None

# class QuestionInDB(BaseModel):
#     id: str
#     user_id: Optional[str] = None
#     original_text: str
#     cleaned_text: Optional[str] = None
#     domain: Optional[str] = None
#     status: QuestionStatus
#     assigned_experts: Optional[List[str]] = None
#     duplicate_of: Optional[str] = None
#     created_at: datetime

class QuestionOut(BaseModel):
    id: str
    original_text: str
    cleaned_text: Optional[str]
    domain: Optional[str]
    status: QuestionStatus
    assigned_experts: Optional[List[str]] = None
    duplicate_of: Optional[str] = None
    created_at: datetime
