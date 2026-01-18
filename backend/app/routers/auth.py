from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    SignUpRequest,
    LoginRequest,
    GoogleLoginRequest,
    GoogleCompleteProfileRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import AuthService, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    service = AuthService(db)
    return service.signup(request)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password, returns JWT token."""
    service = AuthService(db)
    return service.login(request)


@router.post("/google", response_model=TokenResponse)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Login/Register with Google OAuth authorization code."""
    service = AuthService(db)
    return service.google_login(request.code, request.mode)


@router.post("/google/complete-profile", response_model=UserResponse)
def complete_google_profile(
    request: GoogleCompleteProfileRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete profile information for new Google users."""
    service = AuthService(db)
    return service.complete_google_profile(
        current_user,
        request.name,
        request.payment_method,
        request.payment_account
    )
