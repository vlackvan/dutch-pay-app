from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    SignUpRequest,
    LoginRequest,
    KakaoLoginRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import AuthService

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


@router.post("/kakao", response_model=TokenResponse)
def kakao_login(request: KakaoLoginRequest, db: Session = Depends(get_db)):
    """Login/Register with Kakao OAuth authorization code."""
    service = AuthService(db)
    return service.kakao_login(request.code)
