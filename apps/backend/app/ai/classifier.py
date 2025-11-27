import os
from openai import OpenAI

# Load API key
OPENAI_API_KEY = "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"

MODEL_NAME = "gpt-4o-mini"

CLASSIFICATION_SYSTEM_PROMPT = """
You are an agricultural domain classifier for Indian farming.
Your job is to read a farmer's question and classify it into EXACTLY one of these domains:
- crop
- soil
- pest
- fertilizer
- irrigation
- weather
- other

IMPORTANT:
- Respond ONLY with the domain name.
- No explanation.
"""

async def classify_question_domain(question: str) -> str:
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""
{CLASSIFICATION_SYSTEM_PROMPT}

Farmer Question: "{question}"
"""

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}]
        )

        domain = response.choices[0].message.content.strip().lower()
        print("question with domain : ",question, domain)

        allowed_domains = ["crop", "soil", "pest", "fertilizer", "irrigation", "weather", "other"]
        if domain not in allowed_domains:
            print(f"Invalid domain '{domain}' received from OpenAI, falling back to 'other'")
            domain = "other"

        return domain

    except Exception as e:
        error_message = str(e).lower()
        if "rate" in error_message or "limit" in error_message:
            print(f"OpenAI API rate limit exceeded for question classification. Falling back to 'other' domain. Question: '{question}'")
            return "other"
        else:
            print("OpenAI classification error:", e)
            return "other"
