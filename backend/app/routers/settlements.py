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
    """Mark a 1:1 transfer as completed and create a repayment settlement."""
    from app.models.settlement import SettlementResult, Settlement, SettlementParticipant
    from app.services.settlement import SettlementService
    from datetime import datetime
    from decimal import Decimal

    result = db.query(SettlementResult).filter(SettlementResult.id == detail_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Settlement result not found")

    # Verify user is either the debtor or creditor participant
    debtor = result.debtor
    creditor = result.creditor
    is_debtor = debtor and debtor.user_id == current_user.id
    is_creditor = creditor and creditor.user_id == current_user.id

    if not (is_debtor or is_creditor):
        raise HTTPException(status_code=403, detail="Only participants can mark as paid")

    # Mark as completed
    result.is_completed = True
    result.completed_at = datetime.utcnow()

    # Award time-based badges
    from app.services.badge import BadgeService
    badge_service = BadgeService(db)
    if debtor and debtor.user_id:
        badge_service.check_and_award_payment_speed_badges(
            result, debtor.user_id, result.group_id
        )

    # Create a repayment settlement
    repayment_settlement = Settlement(
        group_id=result.group_id,
        payer_participant_id=result.debtor_participant_id,
        title="\uc0c1\ud658",
        description=f"{debtor.name}\uc774(\uac00) {creditor.name}\uc5d0\uac8c \uc0c1\ud658",
        total_amount=result.amount,
        split_type=SplitType.EQUAL,
        icon="/icons/reimburse.png",
        is_settled=True,
    )
    db.add(repayment_settlement)
    db.flush()

    # Add creditor as the only participant (they receive the full amount)
    repayment_participant = SettlementParticipant(
        settlement_id=repayment_settlement.id,
        participant_id=result.creditor_participant_id,
        amount_owed=result.amount,
        is_paid=True
    )
    db.add(repayment_participant)

    db.commit()

    # Recalculate group balances
    service = SettlementService(db)
    service.calculate_settlement_results(result.group_id)

    db.refresh(result)
    return result
