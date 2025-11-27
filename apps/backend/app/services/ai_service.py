import google.generativeai as genai
from app.config import Config
import numpy as np
from app.utils.db import questions_collection

genai.configure(api_key=Config.GEMINI_API_KEY)

# ---- Get Embedding from Gemini ----
async def get_embedding(text: str):
    model = "models/embedding-001"
    result = genai.embed_content(
        model=model,
        content=text
    )
    return np.array(result["embedding"])


# ---- Duplicate Detection ----
async def find_duplicate_question(new_question: str, threshold: float = 0.88):
    """
    Returns: existing_question_id OR None
    """
    new_emb = await get_embedding(new_question)

    cursor = questions_collection.find(
        {"embedding": {"$exists": True}},
        {"embedding": 1}
    )

    best_score = 0
    best_match = None

    async for doc in cursor:
        existing_emb = np.array(doc["embedding"])
        # cosine similarity
        similarity = np.dot(new_emb, existing_emb) / (
            np.linalg.norm(new_emb) * np.linalg.norm(existing_emb)
        )

        if similarity > best_score:
            best_score = similarity
            best_match = doc

    if best_score >= threshold:
        return str(best_match["_id"])

    return None