from app.config import settings
import numpy as np
from app.utils.db import questions_collection
from openai import AsyncOpenAI
import os
from typing import List

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

# ---- Get Embedding from Open AI ----
async def get_embedding(text: str):
    try:
        result = await client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return result.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return empty list to indicate failure
        return []


# ---- Generate AI Draft Answer ----
async def generate_draft_answer(question_text: str, domain: str = None) -> str:
    """
    Generate a draft answer using AI based on question text and domain.
    """
    try:
        prompt = f"Provide a draft answer for the following agricultural question:\nQuestion: {question_text}"
        if domain:
            prompt = f"Provide a draft answer for the following {domain} agricultural question:\nQuestion: {question_text}"

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating draft answer: {e}")
        return ""


# ---- Generate Quality Improvement Suggestions ----
async def generate_quality_suggestions(answer_text: str, question_text: str) -> List[str]:
    """
    Generate suggestions to improve answer quality.
    """
    try:
        prompt = f"For the question: '{question_text}'\nEvaluate the answer: '{answer_text}'\nProvide up to 3 suggestions to improve the answer quality:"

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        suggestions_text = response.choices[0].message.content
        # Parse into list
        return [s.strip() for s in suggestions_text.split('\n') if s.strip()][:3]
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return []


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
