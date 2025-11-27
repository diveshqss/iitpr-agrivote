#!/usr/bin/env python3
"""
Python script to hash all user passwords in MongoDB using the same algorithm as auth_routes.py
This script updates all existing users to have properly bcrypt-hashed "password"
"""

import os
import sys
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database():
    """Connect to MongoDB and return the AgriVote database"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "AgriVote")
    client = MongoClient(mongodb_url)
    return client[db_name]

def main():
    """Update all user passwords with bcrypt hash"""
    try:
        # Use direct bcrypt hashing (compatible with FastAPI bcrypt)
        password_to_hash = b"password"
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_to_hash, salt).decode('utf-8')

        print(f"Hashing password '{password_to_hash}'...")

        # Connect to database
        db = get_database()
        users_collection = db.users

        # Update all users with the hashed password
        result = users_collection.update_many(
            {},  # Update all documents
            {"$set": {"hashed_password": hashed_password}}
        )

        print(f"✅ Successfully updated {result.modified_count} users")
        print(f"Bcrypt hash: {hashed_password}")

        # Verify one user
        sample_user = users_collection.find_one({}, {"email": 1, "hashed_password": 1})
        if sample_user:
            print("\nSample user updated:")
            print(f"  Email: {sample_user.get('email', 'N/A')}")
            print(f"  Hash: {sample_user.get('hashed_password', 'N/A')}")

        print("\n🎉 All passwords updated successfully!")
        print("Users can now login with password: 'password'")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    main()
