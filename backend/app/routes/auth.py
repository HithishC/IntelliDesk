
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.firebase.auth_service import verify_firebase_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBearer(auto_error=False)


@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication token is required"
        )

    user = verify_firebase_token(credentials.credentials)

    return {
        "message": "Authentication successful",
        "uid": user.get("uid"),
        "email": user.get("email"),
        "email_verified": user.get("email_verified", False)
    }
