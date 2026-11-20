
import json
import requests

from app.services.category_classifier import classify_category
from app.services.priority_engine import (
    calculate_priority,
    detect_local_impact
)

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:3b"


def add_priority(result: dict) -> dict:
    priority_data = calculate_priority(
        result.get("urgency", "Medium"),
        result.get("impact", "Medium")
    )
    result.update(priority_data)
    return result


def fallback_analysis(complaint: str) -> dict:
    classification = classify_category(complaint)
    priority_data = detect_local_impact(complaint)

    result = {
        "summary": complaint[:150],
        "category": classification["category"],
        "suggested_action": "Forward to the relevant support team",
        "source": "local_fallback"
    }

    result.update(priority_data)
    return result


def analyze_complaint(complaint: str) -> dict:

    prompt = f"""
You are IntelliDesk, an IT incident intelligence assistant.

Analyze this complaint:

{complaint}

Return ONLY valid JSON with these fields:
summary, category, urgency, impact, suggested_action.

Allowed categories:
Hardware, Software, Network, Account / Access, Database, Other.

Urgency and impact must be one of:
Low, Medium, High, Critical.

Consider the number of affected users and seriousness.

Do not invent information.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2
                }
            },
            timeout=(5, 120)
        )

        response.raise_for_status()

        response_data = response.json()
        result = json.loads(response_data["response"])

        allowed_categories = [
            "Hardware",
            "Software",
            "Network",
            "Account / Access",
            "Database",
            "Other"
        ]

        if result.get("category") not in allowed_categories:
            raise ValueError("Invalid category returned by Ollama")

        if result.get("urgency") not in ["Low", "Medium", "High", "Critical"]:
            raise ValueError("Invalid urgency returned by Ollama")

        if result.get("impact") not in ["Low", "Medium", "High", "Critical"]:
            raise ValueError("Invalid impact returned by Ollama")

        result["source"] = "ollama"

        return add_priority(result)

    except Exception as error:
        print(f"Ollama unavailable: {error}")
        print("Switching to local fallback analysis.")

        return fallback_analysis(complaint)


def analyze_complaint_local(complaint: str) -> dict:
    return fallback_analysis(complaint)


def analyze_complaint_with_gemini(complaint: str) -> dict:
    # Kept for compatibility with the existing tickets.py import.
    return analyze_complaint(complaint)
