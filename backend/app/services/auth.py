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
            auth_provider=AuthProvider.EMAIL
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

    def kakao_login(self, code: str) -> TokenResponse:
        """Exchange Kakao auth code for access token and login/register user."""
        # Get Kakao access token
        token_url = "https://kauth.kakao.com/oauth/token"
        token_data = {
            "grant_type": "authorization_code",
            "client_id": settings.KAKAO_CLIENT_ID,
            "client_secret": settings.KAKAO_CLIENT_SECRET,
            "redirect_uri": settings.KAKAO_REDIRECT_URI,
            "code": code,
        }

        with httpx.Client() as client:
            token_response = client.post(token_url, data=token_data)
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get Kakao access token"
                )
            kakao_token = token_response.json()["access_token"]

            # Get user info from Kakao
            user_url = "https://kapi.kakao.com/v2/user/me"
            headers = {"Authorization": f"Bearer {kakao_token}"}
            user_response = client.get(user_url, headers=headers)
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get Kakao user info"
                )

        kakao_user = user_response.json()
        kakao_id = str(kakao_user["id"])
        kakao_email = kakao_user.get("kakao_account", {}).get("email")
        kakao_name = kakao_user.get("properties", {}).get("nickname", "User")

        # Find or create user
        user = self.db.query(User).filter(User.kakao_id == kakao_id).first()
        if not user:
            # Check if email exists (link accounts)
            if kakao_email:
                user = self.db.query(User).filter(User.email == kakao_email).first()
                if user:
                    user.kakao_id = kakao_id
                    self.db.commit()

            if not user:
                # Create new user
                user = User(
                    email=kakao_email or f"kakao_{kakao_id}@dutch-pay.local",
                    name=kakao_name,
                    kakao_id=kakao_id,
                    auth_provider=AuthProvider.KAKAO
                )
                self.db.add(user)
                self.db.flush()

                avatar = Avatar(user_id=user.id)
                self.db.add(avatar)
                self.db.commit()
                self.db.refresh(user)

        token = self._create_access_token(user.id)
        return TokenResponse(access_token=token)


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
