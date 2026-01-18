from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.user import (
    UserResponse,
    UserProfileResponse,
    UserUpdate,
    AvatarUpdate,
    AvatarResponse,
)
from app.schemas.badge import UserBadgeResponse
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's basic info."""
    return current_user


@router.get("/me/profile", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's full profile including avatar, badges, and payment info."""
    # TODO: Implement full profile fetch with badges
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/avatar", response_model=AvatarResponse)
def update_avatar(
    avatar_data: AvatarUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's SpongeBob fish avatar (body, eyes, fin, pattern, color)."""
    from app.models.user import Avatar

    if current_user.avatar:
        for field, value in avatar_data.model_dump(exclude_unset=True).items():
            setattr(current_user.avatar, field, value)
    else:
        avatar = Avatar(user_id=current_user.id, **avatar_data.model_dump())
        db.add(avatar)

    db.commit()
    db.refresh(current_user)
    return current_user.avatar


@router.get("/me/badges", response_model=List[UserBadgeResponse])
def get_my_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all badges earned by the current user across all groups."""
    # TODO: Implement badge retrieval with group info
    return []
