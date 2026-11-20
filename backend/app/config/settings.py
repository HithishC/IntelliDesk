
import os
from pathlib import Path
from dotenv import load_dotenv

# Locate the main IntelliDesk folder
BASE_DIR = Path(__file__).resolve().parents[3]

# Load root .env file
load_dotenv(BASE_DIR / ".env")

# Firebase configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")

SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    "serviceAccountKey.json"
)

FIREBASE_CREDENTIALS = BASE_DIR / SERVICE_ACCOUNT_PATH

# Gemini configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)


def validate_firebase_settings():
    if not FIREBASE_PROJECT_ID:
        raise ValueError("Firebase Project ID is missing in .env")

    if not FIREBASE_CREDENTIALS.exists():
        raise FileNotFoundError(
            f"Service account file not found: {FIREBASE_CREDENTIALS}"
        )


def validate_gemini_settings():
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing in .env")

    if not GEMINI_MODEL:
        raise ValueError("Gemini model is missing in .env")
