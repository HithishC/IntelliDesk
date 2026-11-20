
import firebase_admin
from firebase_admin import credentials, firestore

from app.config.settings import (
    FIREBASE_PROJECT_ID,
    FIREBASE_CREDENTIALS,
    validate_firebase_settings
)

firebase_app = None
db = None


def initialize_firebase():
    global firebase_app, db

    if firebase_app is not None:
        return db

    validate_firebase_settings()

    try:
        firebase_app = firebase_admin.get_app()
    except ValueError:
        credentials_file = credentials.Certificate(
            str(FIREBASE_CREDENTIALS)
        )

        firebase_app = firebase_admin.initialize_app(
            credentials_file,
            {"projectId": FIREBASE_PROJECT_ID}
        )

    db = firestore.client(app=firebase_app)

    print("Firebase connected successfully!")
    print(f"Project: {FIREBASE_PROJECT_ID}")

    return db


def get_firestore_db():
    if db is None:
        raise RuntimeError(
            "Firebase is not initialized. "
            "Call initialize_firebase() first."
        )

    return db
