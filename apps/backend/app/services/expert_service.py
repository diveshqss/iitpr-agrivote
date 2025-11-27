"""
Expert Service
Handles expert-related operations accessing the users collection.
"""

from app.utils.db import users_collection
from typing import Optional, Dict, Any


async def get_expert_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get expert information by email from users collection.
    Returns the expert document if found and role is 'expert', None otherwise.
    """
    try:
        expert = await users_collection.find_one({"email": email, "role": "expert"})
        return expert
    except Exception as e:
        print(f"Error fetching expert by email {email}: {e}")
        return None
