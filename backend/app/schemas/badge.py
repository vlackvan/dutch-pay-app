from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    badge_type: str = "special"


class BadgeCreate(BadgeBase):
    condition_code: Optional[str] = None


class BadgeResponse(BadgeBase):
    id: int
    condition_code: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserBadgeResponse(BaseModel):
    id: int
    badge: BadgeResponse
    group_id: Optional[int] = None
    group_name: Optional[str] = None
    earned_at: datetime

    class Config:
        from_attributes = True


class AwardBadgeRequest(BaseModel):
    user_id: int
    badge_id: int
    group_id: Optional[int] = None
