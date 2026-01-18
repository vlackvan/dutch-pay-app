from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.database import get_db
from app.schemas.settlement import (
    SettlementCreate,
    SettlementUpdate,
    SettlementResponse,
    SettlementResultResponse,
    SplitType,
)
from app.services.auth import get_current_user
from app.services.settlement import SettlementService
from app.models.user import User

router = APIRouter(prefix="/api/v1/settlements", tags=["Settlements"])


@router.post("", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
def create_settlement(
    settlement_data: SettlementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new settlement item (expense)."""
    from app.models.group import GroupParticipant

    is_member = db.query(GroupParticipant).filter(
        GroupParticipant.group_id == settlement_data.group_id,
        GroupParticipant.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    service = SettlementService(db)
    return service.create_settlement(settlement_data)


@router.post("/upload", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
async def create_settlement_with_receipt(
    group_id: int = Form(...),
    payer_participant_id: int = Form(...),
    title: str = Form(...),
    total_amount: Decimal = Form(...),
    split_type: SplitType = Form(SplitType.EQUAL),
    participant_ids: str = Form(...),  # Comma-separated participant IDs
    description: Optional[str] = Form(None),
    icon: Optional[str] = Form(None),
    receipt: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create settlement with receipt image upload (Multipart form)."""
    from app.schemas.settlement import SettlementCreate, ParticipantInput
    from app.models.group import GroupParticipant

    is_member = db.query(GroupParticipant).filter(
        GroupParticipant.group_id == group_id,
        GroupParticipant.user_id == current_user.id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    # Parse participant IDs
    participants = [
        ParticipantInput(participant_id=int(uid.strip()))
        for uid in participant_ids.split(",")
    ]

    settlement_data = SettlementCreate(
        group_id=group_id,
        payer_participant_id=payer_participant_id,
        title=title,
        description=description,
        total_amount=total_amount,
        split_type=split_type,
        icon=icon,
        participants=participants
    )

    service = SettlementService(db)
    settlement = service.create_settlement(settlement_data)

    # TODO: Handle receipt upload to storage
    if receipt:
        # Save receipt and update settlement.receipt_image
        pass

    return settlement


@router.get("/{settlement_id}", response_model=SettlementResponse)
def get_settlement(
    settlement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get settlement details."""
    from app.models.settlement import Settlement

    settlement = db.query(Settlement).filter(Settlement.id == settlement_id).first()
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    return settlement


@router.put("/{settlement_id}", response_model=SettlementResponse)
def update_settlement(
    settlement_id: int,
    update_data: SettlementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update settlement item (amount, participants, etc.)."""
    service = SettlementService(db)
    return service.update_settlement(settlement_id, update_data, current_user.id)


@router.patch("/pay/{detail_id}", response_model=SettlementResultResponse)
def mark_payment_complete(
    detail_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a 1:1 transfer as completed."""
    from app.models.settlement import SettlementResult
    from datetime import datetime

    result = db.query(SettlementResult).filter(SettlementResult.id == detail_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Settlement result not found")

    # Verify user is the debtor participant
    debtor = result.debtor
    if not debtor or debtor.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the debtor can mark as paid")

    result.is_completed = True
    result.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(result)
    return result
