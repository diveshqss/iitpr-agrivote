# backend/app/ai/cleanup.py
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

async def clean_question_text(text: str) -> str:
    """
    Use LLM to rewrite and improve the agricultural question for clarity and disambiguation.
    """
    try:
        prompt = (
            "You are an expert agricultural advisor. Take the following farmer's question and rewrite it to make it clearer, more specific, and well-formatted. "
            "Improve grammar, remove redundant or unclear parts, and structure it as a coherent agricultural question. "
            "If the question is ambiguous, add clarifications where possible based on common agricultural context, but don't add information not implied. "
            "Keep the original intent and specific details. Return only the improved question text.\n\n"
            f"Original question: {text}\n\n"
            "Improved question:"
        )

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3
        )

        cleaned_text = response.choices[0].message.content.strip()
        # If response empty or failed, fall back to basic cleanup
        if not cleaned_text:
            return _basic_cleanup(text)
        return cleaned_text

    except Exception as e:
        print(f"Error using LLM for question cleanup: {e}")
        # Fall back to basic cleanup if LLM fails
        return _basic_cleanup(text)


def _basic_cleanup(text: str) -> str:
    """
    Basic text cleanup as fallback.
    """
    txt = text.strip()
    # remove duplicate spaces
    txt = " ".join(txt.split())
    # capitalize first char
    if len(txt) > 0:
        txt = txt[0].upper() + txt[1:]
    return txt
