from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
import httpx

from app.config import settings
from app.database import get_db
from app.models.user import User, Avatar, AuthProvider
from app.schemas.user import SignUpRequest, LoginRequest, TokenResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def _hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def _create_access_token(self, user_id: int) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"sub": str(user_id), "exp": expire}
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def signup(self, request: SignUpRequest) -> User:
        # Check if email exists
        existing = self.db.query(User).filter(User.email == request.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        user = User(
            email=request.email,
            password_hash=self._hash_password(request.password),
            name=request.name,
            auth_provider=AuthProvider.EMAIL,
            payment_method=request.payment_method,
            payment_account=request.payment_account
        )
        self.db.add(user)
        self.db.flush()

        # Create default avatar
        avatar = Avatar(user_id=user.id)
        self.db.add(avatar)

        self.db.commit()
        self.db.refresh(user)
        return user

    def login(self, request: LoginRequest) -> TokenResponse:
        user = self.db.query(User).filter(User.email == request.email).first()
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not self._verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = self._create_access_token(user.id)
        return TokenResponse(access_token=token)

    def google_login(self, code: str, mode: str = "login") -> TokenResponse:
        """Exchange Google auth code for access token and login/register user."""
        mode = (mode or "login").lower()
        if mode not in {"login", "signup"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google auth mode"
            )

        # Get Google access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "grant_type": "authorization_code",
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "code": code,
        }

        with httpx.Client() as client:
            token_response = client.post(token_url, data=token_data)
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get Google access token"
                )
            google_token = token_response.json()["access_token"]

            # Get user info from Google
            user_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {google_token}"}
            user_response = client.get(user_url, headers=headers)
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get Google user info"
                )

        google_user = user_response.json()
        google_id = str(google_user["id"])
        google_email = google_user.get("email")
        google_name = google_user.get("name", "User")

        # Find or create user
        user = self.db.query(User).filter(User.google_id == google_id).first()
        is_new_user = False
        requires_profile_completion = False

        if not user:
            # Check if email exists (link accounts)
            if google_email:
                user = self.db.query(User).filter(User.email == google_email).first()
                if user:
                    user.google_id = google_id
                    self.db.commit()

            if not user:
                if mode == "login":
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Account not found. Please sign up."
                    )
                # Create new user with default payment method
                is_new_user = True
                requires_profile_completion = False
                user = User(
                    email=google_email or f"google_{google_id}@dutch-pay.local",
                    name=google_name,
                    google_id=google_id,
                    auth_provider=AuthProvider.GOOGLE,
                    payment_method="kakaopay"
                )
                self.db.add(user)
                self.db.flush()

                avatar = Avatar(user_id=user.id)
                self.db.add(avatar)
                self.db.commit()
                self.db.refresh(user)

        token = self._create_access_token(user.id)
        return TokenResponse(
            access_token=token,
            is_new_user=is_new_user,
            requires_profile_completion=requires_profile_completion
        )

    def complete_google_profile(self, user: User, name: str, payment_method: str, payment_account: Optional[str] = None) -> User:
        """Complete profile information for new Google users."""
        if user.auth_provider != AuthProvider.GOOGLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This endpoint is only for Google users"
            )

        user.name = name
        user.payment_method = payment_method
        user.payment_account = payment_account
        self.db.commit()
        self.db.refresh(user)
        return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user from JWT token."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user
