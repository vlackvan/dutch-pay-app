from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class SplitType(str, enum.Enum):
    EQUAL = "equal"           # 균등 분할 (1/n)
    AMOUNT = "amount"         # 개별 금액 지정
    RATIO = "ratio"           # 비율 지정


class Settlement(Base):
    """Individual expense/payment item."""
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    # Who paid
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Payment details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=False)

    # Split type
    split_type = Column(SQLEnum(SplitType), default=SplitType.EQUAL)

    # Icon for this settlement item
    icon = Column(String(255), nullable=True)

    # Receipt image URL
    receipt_image = Column(String(500), nullable=True)

    # Status
    is_settled = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    group = relationship("Group", back_populates="settlements")
    payer = relationship("User")
    participants = relationship("SettlementParticipant", back_populates="settlement")


class SettlementParticipant(Base):
    """Participants in a settlement and their share."""
    __tablename__ = "settlement_participants"

    id = Column(Integer, primary_key=True, index=True)
    settlement_id = Column(Integer, ForeignKey("settlements.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Share details (depends on split_type)
    amount = Column(Numeric(12, 2), nullable=True)  # For AMOUNT type
    ratio = Column(Numeric(5, 2), nullable=True)    # For RATIO type (e.g., 0.25 = 25%)

    # Calculated amount owed
    amount_owed = Column(Numeric(12, 2), nullable=False)

    # Has this participant settled their share?
    is_paid = Column(Boolean, default=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    settlement = relationship("Settlement", back_populates="participants")
    user = relationship("User")


class SettlementResult(Base):
    """
    Result of greedy algorithm calculation.
    Shows who owes whom how much for final settlement.
    """
    __tablename__ = "settlement_results"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    # Debtor (who needs to pay)
    debtor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Creditor (who receives payment)
    creditor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Amount to transfer
    amount = Column(Numeric(12, 2), nullable=False)

    # Is this transfer completed?
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Calculation batch (to track which calculation this belongs to)
    calculation_batch = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    group = relationship("Group")
    debtor = relationship("User", foreign_keys=[debtor_id])
    creditor = relationship("User", foreign_keys=[creditor_id])
