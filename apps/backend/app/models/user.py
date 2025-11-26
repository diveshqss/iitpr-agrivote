# app/models/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    FARMER = "farmer"
    EXPERT = "expert"
    MODERATOR = "moderator"

class UserBase(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    hashed_password: str

class UserOut(UserBase):
    id: str