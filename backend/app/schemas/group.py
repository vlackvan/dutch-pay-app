from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.schemas.badge import UserBadgeResponse


class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class GroupCreate(GroupBase):
    participants: List[str] = []


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None


class GroupParticipantResponse(BaseModel):
    id: int
    name: str
    user_id: Optional[int] = None
    is_admin: bool
    joined_at: datetime

    # User info
    user_name: Optional[str] = None
    user_avatar: Optional[dict] = None
    is_claimed: bool = False

    # Badges earned in this group
    badges: List[UserBadgeResponse] = []

    class Config:
        from_attributes = True


class GroupResponse(GroupBase):
    id: int
    invite_code: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GroupListResponse(GroupResponse):
    """Group with unsettled amount for main screen."""
    unsettled_amount: Decimal = Decimal("0")
    member_count: int = 0


class GroupDetailResponse(GroupResponse):
    participants: List[GroupParticipantResponse] = []


class InviteCodeResponse(BaseModel):
    invite_code: str
    group_id: int
    group_name: str


class JoinGroupRequest(BaseModel):
    invite_code: str
    participant_id: Optional[int] = None
    participant_name: Optional[str] = None


class InviteGroupResponse(BaseModel):
    invite_code: str
    group_id: int
    group_name: str
    participants: List[GroupParticipantResponse] = []
