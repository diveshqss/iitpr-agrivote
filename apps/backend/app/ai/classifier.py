# backend/app/ai/classifier.py
async def classify_text(text: str) -> str:
    """
    Very simple heuristic classifier stub.
    Replace with an LLM / intent classifier later.
    """
    t = text.lower()
    if any(k in t for k in ["pest", "aphid", "weevil", "cutworm", "locust"]):
        return "pest"
    if any(k in t for k in ["soil", "ph", "nitrogen", "phosphorus", "potash"]):
        return "soil"
    if any(k in t for k in ["irrig", "drip", "water", "rain", "canal"]):
        return "irrigation"
    if any(k in t for k in ["disease", "blight", "rust", "mildew"]):
        return "disease"
    if any(k in t for k in ["fertilizer", "manure", "urea", "dap"]):
        return "fertilizer"
    return "crop"
