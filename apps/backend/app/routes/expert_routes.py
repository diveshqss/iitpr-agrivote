from fastapi import APIRouter, HTTPException
from app.services.expert_service import get_expert_by_email
from app.utils.response import success

router = APIRouter(prefix="/api/expert", tags=["expert"])

@router.get("/by-email/{email}")
async def get_expert_by_email_route(email: str):
    """
    Get expert information by email from users collection.
    """
    expert = await get_expert_by_email(email)
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")

    return success({"expert": expert})
