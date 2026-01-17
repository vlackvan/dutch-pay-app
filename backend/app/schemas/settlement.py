from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


class SplitType(str, Enum):
    EQUAL = "equal"
    AMOUNT = "amount"
    RATIO = "ratio"


# Participant Schemas
class ParticipantInput(BaseModel):
    user_id: int
    amount: Optional[Decimal] = None  # For AMOUNT type
    ratio: Optional[Decimal] = None   # For RATIO type


class ParticipantResponse(BaseModel):
    id: int
    user_id: int
    amount_owed: Decimal
    is_paid: bool
    paid_at: Optional[datetime] = None

    # User info
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


# Settlement Schemas
class SettlementCreate(BaseModel):
    group_id: int
    title: str
    description: Optional[str] = None
    total_amount: Decimal
    split_type: SplitType = SplitType.EQUAL
    icon: Optional[str] = None
    participants: List[ParticipantInput]


class SettlementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    total_amount: Optional[Decimal] = None
    split_type: Optional[SplitType] = None
    icon: Optional[str] = None
    participants: Optional[List[ParticipantInput]] = None


class SettlementResponse(BaseModel):
    id: int
    group_id: int
    payer_id: int
    title: str
    description: Optional[str] = None
    total_amount: Decimal
    split_type: SplitType
    icon: Optional[str] = None
    receipt_image: Optional[str] = None
    is_settled: bool
    created_at: datetime

    # Payer info
    payer_name: Optional[str] = None

    participants: List[ParticipantResponse] = []

    class Config:
        from_attributes = True


# Settlement Result Schemas (Greedy Algorithm Output)
class SettlementResultResponse(BaseModel):
    """Single transfer instruction from greedy algorithm."""
    id: int
    debtor_id: int
    creditor_id: int
    amount: Decimal
    is_completed: bool
    completed_at: Optional[datetime] = None

    # User names
    debtor_name: Optional[str] = None
    creditor_name: Optional[str] = None
    creditor_payment_method: Optional[str] = None
    creditor_payment_account: Optional[str] = None

    class Config:
        from_attributes = True


class GroupSettlementResults(BaseModel):
    """All settlement results for a group."""
    group_id: int
    results: List[SettlementResultResponse]
    total_transactions: int


class PaymentCompleteRequest(BaseModel):
    """Mark a single transfer as completed."""
    pass  # No body needed, just PATCH the endpoint
