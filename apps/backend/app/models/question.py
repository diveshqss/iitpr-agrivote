# backend/app/models/question.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class QuestionStatus(str, Enum):
    SUBMITTED = "submitted"
    PROCESSING = "processing"
    DUPLICATE = "duplicate"
    ASSIGNED = "assigned"
    COMPLETED = "completed"

class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=3)
    # optional metadata fields like images, farmer contact can be added later
    metadata: Optional[dict] = None

class QuestionInDB(BaseModel):
    id: str
    user_id: Optional[str] = None
    original_text: str
    cleaned_text: Optional[str] = None
    domain: Optional[str] = None
    status: QuestionStatus
    assigned_experts: Optional[List[str]] = None
    duplicate_of: Optional[str] = None
    created_at: datetime

class QuestionOut(BaseModel):
    id: str
    original_text: str
    cleaned_text: Optional[str]
    domain: Optional[str]
    status: QuestionStatus
    assigned_experts: Optional[List[str]] = None
    duplicate_of: Optional[str] = None
    created_at: datetime
