# app/utils/response.py
from fastapi import status
from typing import Any, Dict

def success(data: Any = None, message: str = "Success") -> Dict:
    return {"status": "success", "message": message, "data": data}

def error(message: str = "Error", code: int = status.HTTP_400_BAD_REQUEST) -> Dict:
    return {"status": "error", "message": message}