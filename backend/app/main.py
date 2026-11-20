
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.firebase.firebase_admin import (
    initialize_firebase,
    get_firestore_db
)

from app.firebase.auth_service import get_current_user

from app.routes.dashboard import router as dashboard_router
from app.routes.feedback import router as feedback_router
from app.routes.incidents import router as incidents_router
from app.routes.tickets import router as tickets_router
from app.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_firebase()
    yield


app = FastAPI(
    title="IntelliDesk API",
    description="AI Incident Intelligence System by ZERITH",
    version="1.0.0",
    lifespan=lifespan
)


# Register API routes
app.include_router(tickets_router)
app.include_router(incidents_router)
app.include_router(feedback_router)
app.include_router(dashboard_router)
app.include_router(auth_router)


# CORS configuration for existing and new frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Public API welcome endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to IntelliDesk API",
        "project": "IntelliDesk",
        "team": "ZERITH",
        "status": "running"
    }


# Public backend health endpoint
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "IntelliDesk Backend"
    }


# Protected Firebase health endpoint
@app.get("/health/firebase")
def firebase_health(
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_firestore_db()

        db.collection("_connection_test").limit(1).get()

        return {
            "status": "connected",
            "database": "Cloud Firestore",
            "message": "Firebase connection successful!"
        }

    except Exception as error:
        print(f"Firebase health check failed: {error}")

        raise HTTPException(
            status_code=503,
            detail="Firebase connection failed"
        ) from error
