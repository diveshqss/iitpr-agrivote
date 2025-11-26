# app/utils/db.py
from motor.motor_asyncio import AsyncIOMotorClient
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# Collections (create names once; indexes can be added later)
users_collection = db["users"]
questions_collection = db["questions"]
answers_collection = db["answers"]
votes_collection = db["votes"]
workflows_collection = db["workflows"]

# db = client["agrivote_db"]

def get_question_collection():
    return db["questions"]