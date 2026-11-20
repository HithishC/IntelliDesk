
from pathlib import Path
import joblib

MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "ml"
    / "saved_models"
    / "ticket_classifier.pkl"
)

ml_model = joblib.load(MODEL_PATH)

LABEL_NAMES = [
    "Active Directory",
    "Computer-Services",
    "EOL",
    "Fileservice",
    "O365",
    "Software",
    "Support general"
]

CATEGORY_MAPPING = {
    "Active Directory": "Account / Access",
    "Computer-Services": "Hardware",
    "EOL": "Other",
    "Fileservice": "Other",
    "O365": "Software",
    "Software": "Software",
    "Support general": "Other"
}

EXTRA_KEYWORDS = {
    "Network": [
        "wifi", "internet", "network",
        "router", "connection", "disconnect"
    ],
    "Database": [
        "database", "sql", "query",
        "firestore", "database server"
    ]
}


def classify_category(text: str) -> dict:

    text = text.strip()
    lower_text = text.lower()

    if not text:
        return {
            "category": "Other",
            "source": "fallback"
        }

    # General support fallback
    general_keywords = [
        "general it support",
        "general support",
        "need technical help",
        "need it assistance"
    ]

    if any(word in lower_text for word in general_keywords):
        return {
            "category": "Other",
            "source": "keyword_fallback"
        }

    # Network and Database fallback
    for category, keywords in EXTRA_KEYWORDS.items():
        if any(word in lower_text for word in keywords):
            return {
                "category": category,
                "source": "keyword_fallback"
            }

    # Trained ML prediction
    predicted_label = int(ml_model.predict([text])[0])

    original_category = LABEL_NAMES[predicted_label]

    return {
        "category": CATEGORY_MAPPING[original_category],
        "original_category": original_category,
        "source": "trained_ml"
    }
