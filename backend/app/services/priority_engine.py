
PRIORITY_LEVELS = ["Low", "Medium", "High", "Critical"]

PRIORITY_MATRIX = {
    "Low": {
        "Low": "Low",
        "Medium": "Low",
        "High": "Medium",
        "Critical": "High"
    },
    "Medium": {
        "Low": "Low",
        "Medium": "Medium",
        "High": "High",
        "Critical": "High"
    },
    "High": {
        "Low": "Medium",
        "Medium": "High",
        "High": "High",
        "Critical": "Critical"
    },
    "Critical": {
        "Low": "High",
        "Medium": "High",
        "High": "Critical",
        "Critical": "Critical"
    }
}


def calculate_priority(urgency: str, impact: str) -> dict:
    urgency = urgency.strip().capitalize()
    impact = impact.strip().capitalize()

    if urgency not in PRIORITY_LEVELS:
        urgency = "Medium"

    if impact not in PRIORITY_LEVELS:
        impact = "Medium"

    priority = PRIORITY_MATRIX[urgency][impact]

    return {
        "urgency": urgency,
        "impact": impact,
        "priority": priority
    }


def detect_local_impact(complaint: str) -> dict:
    text = complaint.lower()

    critical_keywords = [
        "entire college",
        "whole college",
        "college-wide",
        "everyone",
        "all students",
        "all users",
        "entire campus",
        "system-wide",
        "entire organization"
    ]

    high_keywords = [
        "multiple users",
        "many students",
        "several students",
        "students cannot",
        "staff cannot",
        "everyone affected",
        "department-wide",
        "multiple departments"
    ]

    high_urgency_keywords = [
        "down",
        "outage",
        "not working",
        "cannot access",
        "completely unavailable",
        "deadline",
        "urgent",
        "blocked"
    ]

    if any(word in text for word in critical_keywords):
        urgency = "Critical"
        impact = "Critical"

    elif any(word in text for word in high_keywords):
        urgency = "High"
        impact = "High"

    elif any(word in text for word in high_urgency_keywords):
        urgency = "High"
        impact = "Medium"

    else:
        urgency = "Medium"
        impact = "Low"

    return calculate_priority(urgency, impact)
