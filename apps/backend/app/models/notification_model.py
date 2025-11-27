# models/notification_model.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


# Helper to validate MongoDB ObjectId
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
# Base Notification Structure
# ---------------------------------------------------
class NotificationBase(BaseModel):
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Human readable message")

    type: str = Field(
        ...,
        description="notification type: question_assigned / answer_submitted / final_answer_published / answer_rejected / moderator_review_needed"
    )

    read: bool = Field(False, description="Whether the user has seen this")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ---------------------------------------------------
# Notification Creation
# ---------------------------------------------------
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str
    user_id: str  # To whom notification will be sent
    question_id: Optional[str] = None
    answer_id: Optional[str] = None


# ---------------------------------------------------
# Notification DB Model
# ---------------------------------------------------
class NotificationDB(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    user_id: PyObjectId = Field(
        ...,
        description="User to whom notification is sent"
    )

    question_id: Optional[PyObjectId] = Field(default=None)
    answer_id: Optional[PyObjectId] = Field(default=None)


# ---------------------------------------------------
# Notification Response Model
# ---------------------------------------------------
class NotificationResponse(NotificationDB):
    pass
