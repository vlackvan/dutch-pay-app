from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.badge import BadgeResponse, AwardBadgeRequest, UserBadgeResponse
from app.services.auth import get_current_user
from app.services.badge import BadgeService
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


@router.post("/calculate-weekly/{group_id}")
def calculate_weekly_badges(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate and award weekly ranking badges for a group."""
    from app.models.group import GroupParticipant

    # Verify user is a member of the group
    is_member = db.query(GroupParticipant).filter(
        GroupParticipant.group_id == group_id,
        GroupParticipant.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    badge_service = BadgeService(db)
    awarded_badges = badge_service.calculate_weekly_spending_badges(group_id)

    return {
        "badges_awarded": len(awarded_badges),
        "message": f"Successfully calculated and awarded {len(awarded_badges)} badges"
    }


@router.get("/user/{user_id}", response_model=List[UserBadgeResponse])
def get_user_badges(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all badges earned by a user."""
    from app.models.user import UserBadge

    # Only allow users to see their own badges or admins
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Can only view own badges")

    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()

    return [
        UserBadgeResponse(
            id=ub.id,
            badge=BadgeResponse(
                id=ub.badge.id,
                name=ub.badge.name,
                description=ub.badge.description,
                icon=ub.badge.icon,
                badge_type=ub.badge.badge_type,
                condition_code=ub.badge.condition_code,
                created_at=ub.badge.created_at,
            ),
            group_id=ub.group_id,
            group_name=ub.group.name if ub.group else None,
            earned_at=ub.earned_at,
        )
        for ub in user_badges
    ]
