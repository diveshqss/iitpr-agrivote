# database.py
# Sets up the MongoDB async client using Motor

# from motor.motor_asyncio import AsyncIOMotorClient
# from app.config import settings

# class Database:
#     client: AsyncIOMotorClient = None
#     db = None

# db_instance = Database()


# async def connect_to_mongo():
#     """
#     Initialize the MongoDB client at startup.
#     """
#     db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
#     db_instance.db = db_instance.client[settings.DATABASE_NAME]
#     print("🌿 MongoDB connection established.")


# async def close_mongo_connection():
#     """
#     Close the MongoDB client on app shutdown.
#     """
#     db_instance.client.close()
#     print("🍂 MongoDB connection closed.")

# # app/utils/db.py
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
notifications_collection = db["notifications"]


def get_question_collection():
    return db["questions"]
