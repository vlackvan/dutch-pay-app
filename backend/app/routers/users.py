from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
import os
import uuid
from pathlib import Path

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
from app.models.user import User, UserBadge

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's basic info."""
    return current_user


@router.get("/me/profile", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's full profile including avatar, badges, and payment info."""
    return (
        db.query(User)
        .options(
            joinedload(User.avatar),
            joinedload(User.badges).joinedload(UserBadge.badge),
        )
        .filter(User.id == current_user.id)
        .first()
    )


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
    from app.models.user import UserBadge
    from app.models.badge import Badge
    from app.models.group import Group
    from app.schemas.badge import UserBadgeResponse, BadgeResponse

    user_badges = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id
    ).all()

    result = []
    for ub in user_badges:
        badge = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if not badge:
            continue

        group_name = None
        if ub.group_id:
            group = db.query(Group).filter(Group.id == ub.group_id).first()
            group_name = group.name if group else None

        result.append(UserBadgeResponse(
            id=ub.id,
            badge=BadgeResponse(
                id=badge.id,
                name=badge.name,
                description=badge.description,
                icon=badge.icon,
                badge_type=badge.badge_type,
                condition_code=badge.condition_code
            ),
            group_id=ub.group_id,
            group_name=group_name,
            earned_at=ub.earned_at
        ))

    return result


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    full_body_file: UploadFile = File(None),
    body: str = Form(...),
    eyes: str = Form(...),
    mouth: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a cropped avatar image and optionally a full-body avatar image.
    Update avatar configuration.
    Accepts FormData with:
    - file: The cropped PNG image (230x200px)
    - full_body_file: The full-body PNG image (optional)
    - body: The body ID
    - eyes: The eyes ID
    - mouth: The mouth ID
    """
    from app.models.user import Avatar

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    # Generate unique filename for crop
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".png"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save the cropped file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Save the full body file if provided
    full_body_filename = None
    if full_body_file:
        if not full_body_file.content_type or not full_body_file.content_type.startswith("image/"):
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full body file must be an image"
            )
        
        full_ext = os.path.splitext(full_body_file.filename)[1] if full_body_file.filename else ".png"
        full_body_filename = f"{uuid.uuid4()}_full{full_ext}"
        full_path = upload_dir / full_body_filename

        try:
            full_contents = await full_body_file.read()
            with open(full_path, "wb") as f:
                f.write(full_contents)
        except Exception as e:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save full body file: {str(e)}"
            )

    # Update or create avatar configuration
    if current_user.avatar:
        current_user.avatar.body = body
        current_user.avatar.eyes = eyes
        current_user.avatar.mouth = mouth
    else:
        avatar = Avatar(user_id=current_user.id, body=body, eyes=eyes, mouth=mouth)
        db.add(avatar)

    # Update user's profile photo URL
    current_user.profile_photo_url = f"/uploads/{unique_filename}"
    if full_body_filename:
        current_user.full_body_photo_url = f"/uploads/{full_body_filename}"

    db.commit()
    db.refresh(current_user)

    return current_user
