# backend/app/ai/cleanup.py
async def clean_question_text(text: str) -> str:
    """
    Simple cleanup stub. In real system use LLM to rewrite + disambiguate.
    """
    txt = text.strip()
    # remove duplicate spaces
    txt = " ".join(txt.split())
    # capitalize first char
    if len(txt) > 0:
        txt = txt[0].upper() + txt[1:]
    return txt
