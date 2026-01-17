from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None


class GroupMemberResponse(BaseModel):
    id: int
    user_id: int
    nickname: Optional[str] = None
    is_admin: bool
    joined_at: datetime

    # User info
    user_name: Optional[str] = None
    user_avatar: Optional[dict] = None

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
    members: List[GroupMemberResponse] = []


class InviteCodeResponse(BaseModel):
    invite_code: str
    group_id: int
    group_name: str


class JoinGroupRequest(BaseModel):
    invite_code: str
    nickname: Optional[str] = None
