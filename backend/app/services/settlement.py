from decimal import Decimal
from typing import List, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.models.settlement import Settlement, SettlementParticipant, SettlementResult, SplitType
from app.models.user import User
from app.schemas.settlement import SettlementCreate, SettlementUpdate, GroupSettlementResults, SettlementResultResponse


class SettlementService:
    def __init__(self, db: Session):
        self.db = db

    def create_settlement(self, data: SettlementCreate, payer_id: int) -> Settlement:
        """Create a new settlement with participants."""
        settlement = Settlement(
            group_id=data.group_id,
            payer_id=payer_id,
            title=data.title,
            description=data.description,
            total_amount=data.total_amount,
            split_type=data.split_type,
            icon=data.icon,
        )
        self.db.add(settlement)
        self.db.flush()

        # Calculate and add participants
        self._add_participants(settlement, data.participants, data.split_type, data.total_amount)

        self.db.commit()
        self.db.refresh(settlement)
        return settlement

    def _add_participants(self, settlement: Settlement, participants, split_type: SplitType, total: Decimal):
        """Add participants and calculate their owed amounts."""
        participant_count = len(participants)

        for p in participants:
            if split_type == SplitType.EQUAL:
                amount_owed = total / participant_count
            elif split_type == SplitType.AMOUNT:
                amount_owed = p.amount or Decimal("0")
            elif split_type == SplitType.RATIO:
                amount_owed = total * (p.ratio or Decimal("0"))
            else:
                amount_owed = total / participant_count

            participant = SettlementParticipant(
                settlement_id=settlement.id,
                user_id=p.user_id,
                amount=p.amount,
                ratio=p.ratio,
                amount_owed=amount_owed,
            )
            self.db.add(participant)

    def update_settlement(self, settlement_id: int, data: SettlementUpdate, user_id: int) -> Settlement:
        """Update settlement details."""
        settlement = self.db.query(Settlement).filter(Settlement.id == settlement_id).first()
        if not settlement:
            raise HTTPException(status_code=404, detail="Settlement not found")

        if settlement.payer_id != user_id:
            raise HTTPException(status_code=403, detail="Only the payer can update this settlement")

        # Update fields
        for field, value in data.model_dump(exclude_unset=True, exclude={"participants"}).items():
            setattr(settlement, field, value)

        # Update participants if provided
        if data.participants is not None:
            # Remove old participants
            self.db.query(SettlementParticipant).filter(
                SettlementParticipant.settlement_id == settlement_id
            ).delete()

            self._add_participants(
                settlement,
                data.participants,
                data.split_type or settlement.split_type,
                data.total_amount or settlement.total_amount
            )

        self.db.commit()
        self.db.refresh(settlement)
        return settlement

    def calculate_settlement_results(self, group_id: int) -> GroupSettlementResults:
        """
        Calculate settlement results using Greedy Algorithm.
        Returns who needs to pay whom to minimize transactions (N-1 transactions).
        """
        # Get all unsettled settlements for the group
        settlements = self.db.query(Settlement).filter(
            Settlement.group_id == group_id,
            Settlement.is_settled == False
        ).all()

        # Calculate net balance for each user
        # balance > 0: user should receive money
        # balance < 0: user should pay money
        balances: Dict[int, Decimal] = {}

        for settlement in settlements:
            payer_id = settlement.payer_id
            total = settlement.total_amount

            # Payer paid the full amount, so they should receive their share back
            if payer_id not in balances:
                balances[payer_id] = Decimal("0")
            balances[payer_id] += total

            # Each participant owes their share
            for participant in settlement.participants:
                user_id = participant.user_id
                if user_id not in balances:
                    balances[user_id] = Decimal("0")
                balances[user_id] -= participant.amount_owed

        # Separate into debtors (negative balance) and creditors (positive balance)
        debtors = [(uid, -bal) for uid, bal in balances.items() if bal < 0]
        creditors = [(uid, bal) for uid, bal in balances.items() if bal > 0]

        # Sort by amount (descending)
        debtors.sort(key=lambda x: x[1], reverse=True)
        creditors.sort(key=lambda x: x[1], reverse=True)

        # Greedy matching
        results = []
        batch_id = str(uuid.uuid4())[:8]

        i, j = 0, 0
        while i < len(debtors) and j < len(creditors):
            debtor_id, debt_amount = debtors[i]
            creditor_id, credit_amount = creditors[j]

            transfer_amount = min(debt_amount, credit_amount)

            if transfer_amount > Decimal("0.01"):  # Ignore tiny amounts
                # Check if this result already exists
                existing = self.db.query(SettlementResult).filter(
                    SettlementResult.group_id == group_id,
                    SettlementResult.debtor_id == debtor_id,
                    SettlementResult.creditor_id == creditor_id,
                    SettlementResult.is_completed == False
                ).first()

                if existing:
                    existing.amount = transfer_amount
                    result = existing
                else:
                    result = SettlementResult(
                        group_id=group_id,
                        debtor_id=debtor_id,
                        creditor_id=creditor_id,
                        amount=transfer_amount,
                        calculation_batch=batch_id,
                    )
                    self.db.add(result)

                self.db.flush()
                results.append(result)

            # Update remaining amounts
            debtors[i] = (debtor_id, debt_amount - transfer_amount)
            creditors[j] = (creditor_id, credit_amount - transfer_amount)

            if debtors[i][1] <= Decimal("0.01"):
                i += 1
            if creditors[j][1] <= Decimal("0.01"):
                j += 1

        self.db.commit()

        # Build response with user names
        result_responses = []
        for r in results:
            debtor = self.db.query(User).filter(User.id == r.debtor_id).first()
            creditor = self.db.query(User).filter(User.id == r.creditor_id).first()

            result_responses.append(SettlementResultResponse(
                id=r.id,
                debtor_id=r.debtor_id,
                creditor_id=r.creditor_id,
                amount=r.amount,
                is_completed=r.is_completed,
                completed_at=r.completed_at,
                debtor_name=debtor.name if debtor else None,
                creditor_name=creditor.name if creditor else None,
                creditor_payment_method=creditor.payment_method if creditor else None,
                creditor_payment_account=creditor.payment_account if creditor else None,
            ))

        return GroupSettlementResults(
            group_id=group_id,
            results=result_responses,
            total_transactions=len(result_responses)
        )
