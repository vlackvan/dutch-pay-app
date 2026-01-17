from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.group import (
    GroupCreate,
    GroupUpdate,
    GroupResponse,
    GroupListResponse,
    GroupDetailResponse,
    GroupMemberResponse,
    InviteCodeResponse,
    JoinGroupRequest,
)
from app.schemas.settlement import SettlementResponse, GroupSettlementResults
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/groups", tags=["Groups"])


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new settlement group."""
    from app.models.group import Group, GroupMember

    group = Group(
        name=group_data.name,
        description=group_data.description,
        icon=group_data.icon,
        owner_id=current_user.id
    )
    db.add(group)
    db.flush()

    # Add creator as admin member
    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        nickname=current_user.name,
        is_admin=True
    )
    db.add(member)
    db.commit()
    db.refresh(group)
    return group


@router.get("", response_model=List[GroupListResponse])
def get_my_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all groups the current user belongs to with unsettled amounts."""
    # TODO: Implement with unsettled amount calculation
    from app.models.group import Group, GroupMember

    memberships = db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()
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
            member_count=len(group.members)
        ))
    return groups


@router.get("/{group_id}", response_model=GroupDetailResponse)
def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get group details including members."""
    from app.models.group import Group, GroupMember

    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check membership
    is_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    return group


@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
def get_group_members(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all members of a group with their badges."""
    from app.models.group import GroupMember

    # TODO: Verify membership and return members with badges
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    return members


@router.post("/{group_id}/invite", response_model=InviteCodeResponse)
def create_invite_code(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate/get invite code for a group."""
    from app.models.group import Group, GroupMember

    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return InviteCodeResponse(
        invite_code=group.invite_code,
        group_id=group.id,
        group_name=group.name
    )


@router.post("/join", response_model=GroupResponse)
def join_group(
    request: JoinGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a group using invite code."""
    from app.models.group import Group, GroupMember

    group = db.query(Group).filter(Group.invite_code == request.invite_code.upper()).first()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    # Check if already a member
    existing = db.query(GroupMember).filter(
        GroupMember.group_id == group.id,
        GroupMember.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this group")

    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        nickname=request.nickname or current_user.name
    )
    db.add(member)
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
