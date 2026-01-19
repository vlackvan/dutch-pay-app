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
    # TODO: Implement badge retrieval with group info
    return []


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    body: str = Form(...),
    eyes: str = Form(...),
    mouth: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a cropped avatar image and update avatar configuration.
    Accepts FormData with:
    - file: The cropped PNG image (230x200px)
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

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".png"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save the file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
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

    db.commit()
    db.refresh(current_user)

    return current_user
