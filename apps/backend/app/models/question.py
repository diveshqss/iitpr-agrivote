# app/models/question.py
from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ---------------------------------------------------
# Question Status Enum
# ---------------------------------------------------
class QuestionStatus(str, Enum):
    NEW = "new"
    PROCESSING = "processing"
    DUPLICATE = "duplicate"
    ASSIGNED = "assigned"
    ANSWERED = "answered"
    COMPLETED = "completed"


# ---------------------------------------------------
# AI Metadata Model
# ---------------------------------------------------
class AIMetadata(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    embedding_generated: Optional[bool] = False
    embedding_model: Optional[str] = None
    generated_at: Optional[datetime] = None
    duplicate_found: Optional[bool] = False
    similarity_score: Optional[float] = None
    model_version: Optional[str] = None


# ---------------------------------------------------
# Pipeline Status Model
# ---------------------------------------------------
class AIPipelineStatus(BaseModel):
    status: str = "pending"  # "pending", "running", "done", "failed"
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


# ---------------------------------------------------
# Question Create Model (API Input)
# ---------------------------------------------------
class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=5, max_length=5000, description="The farmer's question text")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional metadata (crop type, location, images, etc.)")

    @validator('text')
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Question text cannot be empty')
        return v.strip()


# ---------------------------------------------------
# Question In Database Model (Internal)
# ---------------------------------------------------
class QuestionInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    raw_text: str
    cleaned_text: Optional[str] = None
    embedding: Optional[List[float]] = None
    domain: Optional[str] = None
    status: QuestionStatus = QuestionStatus.NEW
    assigned_experts: List[str] = Field(default_factory=list)
    is_duplicate_of: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    ai_metadata: AIMetadata = Field(default_factory=AIMetadata)
    ai_pipeline: AIPipelineStatus = Field(default_factory=AIPipelineStatus)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ---------------------------------------------------
# Question Output Model (API Response)
# ---------------------------------------------------
class QuestionOut(BaseModel):
    id: str
    raw_text: str
    cleaned_text: Optional[str]
    domain: Optional[str]
    status: QuestionStatus
    assigned_experts: List[str]
    is_duplicate_of: Optional[str]
    created_by: str
    created_at: datetime
    ai_metadata: AIMetadata
    ai_pipeline: AIPipelineStatus

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ---------------------------------------------------
# Question Update Models
# ---------------------------------------------------
class QuestionUpdate(BaseModel):
    status: Optional[QuestionStatus] = None
    domain: Optional[str] = None
    assigned_experts: Optional[List[str]] = None
    is_duplicate_of: Optional[str] = None
    cleaned_text: Optional[str] = None


# ---------------------------------------------------
# Vector Search Result Model
# ---------------------------------------------------
class VectorSearchResult(BaseModel):
    question_id: str
    raw_text: str
    domain: Optional[str]
    created_by: str
    created_at: datetime
    similarity_score: float

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
