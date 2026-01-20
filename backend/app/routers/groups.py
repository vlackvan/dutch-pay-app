from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.schemas.group import (
    GroupCreate,
    GroupUpdate,
    GroupResponse,
    GroupListResponse,
    GroupDetailResponse,
    GroupParticipantResponse,
    InviteCodeResponse,
    JoinGroupRequest,
    InviteGroupResponse,
)
from app.schemas.settlement import SettlementResponse, GroupSettlementResults
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/groups", tags=["Groups"])


def _avatar_dict(user: User):
    if not user or not user.avatar:
        return None
    avatar = user.avatar
    return {
        "id": avatar.id,
        "user_id": avatar.user_id,
        "body": avatar.body,
        "eyes": avatar.eyes,
        "mouth": avatar.mouth,
    }


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new settlement group."""
    from app.models.group import Group, GroupParticipant

    participant_names = [name.strip() for name in group_data.participants or [] if name and name.strip()]
    unique_names = []
    seen = set()
    for name in participant_names:
        key = name.lower()
        if key not in seen:
            unique_names.append(name)
            seen.add(key)

    if not unique_names:
        unique_names = [current_user.name]

    group = Group(
        name=group_data.name,
        description=group_data.description,
        icon=group_data.icon,
        owner_id=current_user.id
    )
    db.add(group)
    db.flush()

    # Create participants (first participant is the creator's claimed persona)
    for idx, name in enumerate(unique_names):
        is_creator = idx == 0
        participant = GroupParticipant(
            group_id=group.id,
            name=name,
            user_id=current_user.id if is_creator else None,
            is_admin=is_creator
        )
        db.add(participant)
    db.commit()
    db.refresh(group)
    participants = db.query(GroupParticipant).options(joinedload(GroupParticipant.user)).filter(GroupParticipant.group_id == group.id).all()

    return GroupDetailResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        icon=group.icon,
        invite_code=group.invite_code,
        owner_id=group.owner_id,
        created_at=group.created_at,
        participants=[
            GroupParticipantResponse(
                id=p.id,
                name=p.name,
                user_id=p.user_id,
                is_admin=p.is_admin,
                joined_at=p.joined_at,
                user_name=p.user.name if p.user else None,
                user_avatar=_avatar_dict(p.user),
                user_profile_photo_url=p.user.profile_photo_url if p.user else None,
                user_full_body_photo_url=p.user.full_body_photo_url if p.user else None,
                is_claimed=bool(p.user_id),
                badges=[],
            )
            for p in participants
        ],
    )


@router.get("", response_model=List[GroupListResponse])
def get_my_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all groups the current user belongs to with unsettled amounts."""
    # TODO: Implement with unsettled amount calculation
    from app.models.group import Group, GroupParticipant

    memberships = db.query(GroupParticipant).filter(GroupParticipant.user_id == current_user.id).all()
    groups = []
    for membership in memberships:
        group = membership.group
        groups.append(GroupListResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            icon=group.icon,
            invite_code=group.invite_code,
            owner_id=group.owner_id,
            created_at=group.created_at,
            unsettled_amount=0,  # TODO: Calculate
            member_count=len(group.participants)
        ))
    return groups


@router.get("/{group_id}", response_model=GroupDetailResponse)
def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get group details including members."""
    from app.models.group import Group, GroupParticipant
    from app.models.user import UserBadge
    from app.schemas.badge import UserBadgeResponse, BadgeResponse

    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check membership
    is_member = db.query(GroupParticipant).filter(
        GroupParticipant.group_id == group_id,
        GroupParticipant.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    participants = db.query(GroupParticipant).options(joinedload(GroupParticipant.user)).filter(GroupParticipant.group_id == group_id).all()

    participant_responses = []
    for p in participants:
        badges = []
        if p.user_id:
            user_badges = db.query(UserBadge).options(
                joinedload(UserBadge.badge),
                joinedload(UserBadge.group)
            ).filter(
                UserBadge.user_id == p.user_id,
                UserBadge.group_id == group_id
            ).all()
            badges = [
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

        participant_responses.append(GroupParticipantResponse(
            id=p.id,
            name=p.name,
            user_id=p.user_id,
            is_admin=p.is_admin,
            joined_at=p.joined_at,
            user_name=p.user.name if p.user else None,
            user_avatar=_avatar_dict(p.user),
            user_profile_photo_url=p.user.profile_photo_url if p.user else None,
            user_full_body_photo_url=p.user.full_body_photo_url if p.user else None,
            is_claimed=bool(p.user_id),
            badges=badges,
        ))

    return GroupDetailResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        icon=group.icon,
        invite_code=group.invite_code,
        owner_id=group.owner_id,
        created_at=group.created_at,
        participants=participant_responses,
    )


@router.get("/{group_id}/members", response_model=List[GroupParticipantResponse])
def get_group_members(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all members of a group with their badges."""
    from app.models.group import GroupParticipant
    from app.models.user import UserBadge
    from app.schemas.badge import UserBadgeResponse, BadgeResponse

    # Verify membership
    is_member = db.query(GroupParticipant).filter(
        GroupParticipant.group_id == group_id,
        GroupParticipant.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    participants = db.query(GroupParticipant).options(joinedload(GroupParticipant.user)).filter(GroupParticipant.group_id == group_id).all()

    result = []
    for p in participants:
        badges = []
        if p.user_id:
            # Fetch badges for this user in this group
            user_badges = db.query(UserBadge).options(
                joinedload(UserBadge.badge),
                joinedload(UserBadge.group)
            ).filter(
                UserBadge.user_id == p.user_id,
                UserBadge.group_id == group_id
            ).all()
            badges = [
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

        result.append(GroupParticipantResponse(
            id=p.id,
            name=p.name,
            user_id=p.user_id,
            is_admin=p.is_admin,
            joined_at=p.joined_at,
            user_name=p.user.name if p.user else None,
            user_avatar=_avatar_dict(p.user),
            user_profile_photo_url=p.user.profile_photo_url if p.user else None,
            user_full_body_photo_url=p.user.full_body_photo_url if p.user else None,
            is_claimed=bool(p.user_id),
            badges=badges,
        ))

    return result


@router.post("/{group_id}/invite", response_model=InviteCodeResponse)
def create_invite_code(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate/get invite code for a group."""
    from app.models.group import Group

    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return InviteCodeResponse(
        invite_code=group.invite_code,
        group_id=group.id,
        group_name=group.name
    )


@router.get("/invite/{invite_code}", response_model=InviteGroupResponse)
def get_invite_group(
    invite_code: str,
    db: Session = Depends(get_db)
):
    """Get group info and participants by invite code."""
    from app.models.group import Group, GroupParticipant

    group = db.query(Group).filter(Group.invite_code == invite_code.upper()).first()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    participants = db.query(GroupParticipant).options(joinedload(GroupParticipant.user)).filter(GroupParticipant.group_id == group.id).all()

    return InviteGroupResponse(
        invite_code=group.invite_code,
        group_id=group.id,
        group_name=group.name,
        participants=[
            GroupParticipantResponse(
                id=p.id,
                name=p.name,
                user_id=p.user_id,
                is_admin=p.is_admin,
                joined_at=p.joined_at,
                user_name=p.user.name if p.user else None,
                user_avatar=_avatar_dict(p.user),
                user_profile_photo_url=p.user.profile_photo_url if p.user else None,
                user_full_body_photo_url=p.user.full_body_photo_url if p.user else None,
                is_claimed=bool(p.user_id),
                badges=[],
            )
            for p in participants
        ],
    )

@router.post("/join", response_model=GroupResponse)
def join_group(
    request: JoinGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a group using invite code."""
    from app.models.group import Group, GroupParticipant

    group = db.query(Group).filter(Group.invite_code == request.invite_code.upper()).first()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    if request.participant_id and request.participant_name:
        raise HTTPException(status_code=400, detail="Choose existing participant or create a new one")

    if not request.participant_id and not request.participant_name:
        raise HTTPException(status_code=400, detail="Participant selection required")

    # Check if already a member
    existing = db.query(GroupParticipant).filter(
        GroupParticipant.group_id == group.id,
        GroupParticipant.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this group")

    if request.participant_id:
        participant = db.query(GroupParticipant).filter(
            GroupParticipant.id == request.participant_id,
            GroupParticipant.group_id == group.id
        ).first()
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")
        if participant.user_id is not None:
            raise HTTPException(status_code=400, detail="Participant already claimed")
        participant.user_id = current_user.id
    else:
        participant_name = (request.participant_name or "").strip()
        if not participant_name:
            raise HTTPException(status_code=400, detail="Participant name required")

        existing_name = db.query(GroupParticipant).filter(
            GroupParticipant.group_id == group.id,
            func.lower(GroupParticipant.name) == participant_name.lower()
        ).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Participant name already exists")

        participant = GroupParticipant(
            group_id=group.id,
            name=participant_name,
            user_id=current_user.id,
            is_admin=False
        )
        db.add(participant)
    db.commit()
    db.refresh(group)
    return group


@router.get("/{group_id}/settlements", response_model=List[SettlementResponse])
def get_group_settlements(
    group_id: int,
    is_settled: bool = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all settlement items for a group."""
    from app.models.settlement import Settlement

    query = db.query(Settlement).filter(Settlement.group_id == group_id)
    if is_settled is not None:
        query = query.filter(Settlement.is_settled == is_settled)

    return query.order_by(Settlement.created_at.desc()).all()


@router.get("/{group_id}/results", response_model=GroupSettlementResults)
def get_settlement_results(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate and return greedy algorithm settlement results."""
    from app.services.settlement import SettlementService

    service = SettlementService(db)
    return service.calculate_settlement_results(group_id)
