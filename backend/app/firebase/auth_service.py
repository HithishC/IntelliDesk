
from firebase_admin import auth
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


security = HTTPBearer(auto_error=False)


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify Firebase ID token and return authenticated user details.
    """
    try:
        decoded_token = auth.verify_id_token(
            id_token,
            check_revoked=True
        )
        return decoded_token

    except Exception as error:
        print(f"Firebase authentication failed: {error}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Reusable FastAPI dependency for protecting API routes.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return verify_firebase_token(credentials.credentials)
