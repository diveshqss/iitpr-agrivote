# models/expert_model.py

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
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
# Base Expert Model (shared fields)
# ---------------------------------------------------
class ExpertBase(BaseModel):
    name: str = Field(..., description="Expert full name")
    email: EmailStr = Field(..., description="Official email")
    phone: Optional[str] = None

    expertise_domains: List[str] = Field(
        ..., description="Domains expert can answer"
    )  # e.g. ["crops", "soil", "pests"]

    rating: float = Field(5.0, description="Average rating (1-5)")
    answered_count: int = Field(0, description="How many questions answered")

    is_available: bool = Field(
        True, description="If expert is available for new assignments"
    )

    assigned_questions: List[PyObjectId] = Field(
        default_factory=list, description="Questions currently assigned"
    )

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------
# Expert Create Model
# ---------------------------------------------------
class ExpertCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]
    expertise_domains: List[str]


# ---------------------------------------------------
# Expert Update (admin/expert can update profile)
# ---------------------------------------------------
class ExpertUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    expertise_domains: Optional[List[str]] = None
    is_available: Optional[bool] = None


# ---------------------------------------------------
# Expert DB Model
# ---------------------------------------------------
class ExpertDB(ExpertBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------
# Response Model
# ---------------------------------------------------
class ExpertResponse(ExpertDB):
    pass
