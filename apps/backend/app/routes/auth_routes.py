# app/routes/auth_routes.py
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserOut
from app.utils.db import users_collection
from passlib.context import CryptContext
from app.utils.jwt import create_access_token
from bson import ObjectId
from app.utils.response import success

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def user_doc_to_out(user_doc: dict) -> UserOut:
    return UserOut(id=str(user_doc["_id"]), name=user_doc["name"], email=user_doc["email"], role=user_doc["role"])

@router.post("/signup", response_model=dict)
async def signup(user: UserCreate):
    # check existing
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed = pwd_context.hash(user.password)
    doc = {
        "name": user.name,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else user.role,
        "hashed_password": hashed,
        "created_at": __import__("datetime").datetime.utcnow()
    }
    result = await users_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    user_out = user_doc_to_out(doc)
    return success({"user": user_out.dict()}, message="User created")

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm expects "username" + "password" form fields.
    email = form_data.username
    password = form_data.password
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not pwd_context.verify(password, user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token_payload = {"user_id": str(user["_id"]), "role": user["role"]}
    token = create_access_token(token_payload)
    return success({"access_token": token, "token_type": "bearer"}, message="Login successful")