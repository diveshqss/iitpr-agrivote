import google.generativeai as genai
import os

# Load API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.0-pro-exp-02-05"

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
- If unsure, choose 'other'.
"""

async def classify_question_domain(question: str) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""
{CLASSIFICATION_SYSTEM_PROMPT}

Farmer Question: "{question}"
"""

        response = model.generate_content(prompt)

        domain = response.text.strip().lower()
        print(question, domain)

        allowed = ["crop","soil","pest","fertilizer","irrigation","weather","other"]

        # if domain not in allowed:
        #     domain = "other"

        return domain

    except Exception as e:
        print("Gemini classification error:", e)
        return "other"
