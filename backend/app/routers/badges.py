from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.badge import BadgeResponse, AwardBadgeRequest, UserBadgeResponse
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/badges", tags=["Badges"])


@router.get("", response_model=List[BadgeResponse])
def get_all_badges(db: Session = Depends(get_db)):
    """Get list of all available badges."""
    from app.models.badge import Badge
    return db.query(Badge).all()


@router.post("/award", response_model=UserBadgeResponse, status_code=status.HTTP_201_CREATED)
def award_badge(
    request: AwardBadgeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Award a badge to a user (internal/admin use)."""
    from app.models.user import UserBadge
    from app.models.badge import Badge

    badge = db.query(Badge).filter(Badge.id == request.badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")

    user_badge = UserBadge(
        user_id=request.user_id,
        badge_id=request.badge_id,
        group_id=request.group_id
    )
    db.add(user_badge)
    db.commit()
    db.refresh(user_badge)
    return user_badge
