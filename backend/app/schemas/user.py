from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from app.schemas.badge import UserBadgeResponse


# Avatar Schemas
class AvatarBase(BaseModel):
    head: str = "default"
    face: str = "default"
    hat: str = "none"


class AvatarUpdate(AvatarBase):
    pass


class AvatarResponse(AvatarBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# Auth Schemas
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    payment_method: Optional[str] = None
    payment_account: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    code: str  # Google authorization code
    mode: str = "login"  # "login" or "signup"


class GoogleCompleteProfileRequest(BaseModel):
    name: str
    payment_method: str  # kakaopay, toss, bank
    payment_account: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool = False
    requires_profile_completion: bool = False


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    payment_method: Optional[str] = None
    payment_account: Optional[str] = None


class UserResponse(UserBase):
    id: int
    payment_method: Optional[str] = None
    payment_account: Optional[str] = None
    avatar: Optional[AvatarResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    badges: List[UserBadgeResponse] = []

    class Config:
        from_attributes = True


UserProfileResponse.model_rebuild()
