from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class KakaoLoginRequest(BaseModel):
    code: str  # Kakao authorization code


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


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
    badges: List["BadgeResponse"] = []

    class Config:
        from_attributes = True


# Badge Schemas (basic reference)
class BadgeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    badge_type: str
    earned_at: Optional[datetime] = None
    group_id: Optional[int] = None

    class Config:
        from_attributes = True


UserProfileResponse.model_rebuild()
