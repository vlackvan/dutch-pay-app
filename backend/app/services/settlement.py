from decimal import Decimal
from typing import List, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.models.settlement import Settlement, SettlementParticipant, SettlementResult, SplitType
from app.models.group import GroupParticipant
from app.schemas.settlement import SettlementCreate, SettlementUpdate, GroupSettlementResults, SettlementResultResponse


class SettlementService:
    def __init__(self, db: Session):
        self.db = db

    def create_settlement(self, data: SettlementCreate) -> Settlement:
        """Create a new settlement with participants."""
        from datetime import datetime

        payer_participant = self.db.query(GroupParticipant).filter(
            GroupParticipant.id == data.payer_participant_id,
            GroupParticipant.group_id == data.group_id
        ).first()
        if not payer_participant:
            raise HTTPException(status_code=400, detail="Invalid payer participant")

        participant_ids = {p.participant_id for p in data.participants}
        if data.payer_participant_id not in participant_ids:
            raise HTTPException(status_code=400, detail="Payer must be included in participants")

        settlement = Settlement(
            group_id=data.group_id,
            payer_participant_id=data.payer_participant_id,
            title=data.title,
            description=data.description,
            total_amount=data.total_amount,
            split_type=data.split_type,
            icon=data.icon,
        )

        # Set custom date if provided
        if data.date:
            try:
                settlement.created_at = datetime.fromisoformat(data.date)
            except ValueError:
                pass  # Use default if invalid date

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
        if participant_count == 0:
            raise HTTPException(status_code=400, detail="At least one participant is required")

        for p in participants:
            participant = self.db.query(GroupParticipant).filter(
                GroupParticipant.id == p.participant_id,
                GroupParticipant.group_id == settlement.group_id
            ).first()
            if not participant:
                raise HTTPException(status_code=400, detail="Invalid participant")

            if split_type == SplitType.EQUAL:
                amount_owed = total / participant_count
            elif split_type == SplitType.AMOUNT:
                amount_owed = p.amount or Decimal("0")
            elif split_type == SplitType.RATIO:
                amount_owed = total * (p.ratio or Decimal("0"))
            else:
                amount_owed = total / participant_count

            settlement_participant = SettlementParticipant(
                settlement_id=settlement.id,
                participant_id=p.participant_id,
                amount=p.amount,
                ratio=p.ratio,
                amount_owed=amount_owed,
            )
            self.db.add(settlement_participant)

    def update_settlement(self, settlement_id: int, data: SettlementUpdate, user_id: int) -> Settlement:
        """Update settlement details."""
        from datetime import datetime

        settlement = self.db.query(Settlement).filter(Settlement.id == settlement_id).first()
        if not settlement:
            raise HTTPException(status_code=404, detail="Settlement not found")

        # Check if user is a member of the group
        user_participant = self.db.query(GroupParticipant).filter(
            GroupParticipant.group_id == settlement.group_id,
            GroupParticipant.user_id == user_id
        ).first()
        if not user_participant:
            raise HTTPException(status_code=403, detail="Only group members can update this settlement")

        # Update fields
        for field, value in data.model_dump(exclude_unset=True, exclude={"participants", "date"}).items():
            setattr(settlement, field, value)

        # Update date if provided
        if data.date:
            try:
                settlement.created_at = datetime.fromisoformat(data.date)
            except ValueError:
                pass  # Keep existing date if invalid

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
            payer_id = settlement.payer_participant_id
            total = settlement.total_amount

            # Payer paid the full amount, so they should receive their share back
            if payer_id not in balances:
                balances[payer_id] = Decimal("0")
            balances[payer_id] += total

            # Each participant owes their share
            for participant in settlement.participants:
                participant_id = participant.participant_id
                if participant_id not in balances:
                    balances[participant_id] = Decimal("0")
                balances[participant_id] -= participant.amount_owed

        # Separate into debtors (negative balance) and creditors (positive balance)
        debtors = [(pid, -bal) for pid, bal in balances.items() if bal < 0]
        creditors = [(pid, bal) for pid, bal in balances.items() if bal > 0]

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
                    SettlementResult.debtor_participant_id == debtor_id,
                    SettlementResult.creditor_participant_id == creditor_id,
                    SettlementResult.is_completed == False
                ).first()

                if existing:
                    existing.amount = transfer_amount
                    result = existing
                else:
                    result = SettlementResult(
                        group_id=group_id,
                        debtor_participant_id=debtor_id,
                        creditor_participant_id=creditor_id,
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
            debtor = self.db.query(GroupParticipant).filter(GroupParticipant.id == r.debtor_participant_id).first()
            creditor = self.db.query(GroupParticipant).filter(GroupParticipant.id == r.creditor_participant_id).first()

            result_responses.append(SettlementResultResponse(
                id=r.id,
                debtor_participant_id=r.debtor_participant_id,
                creditor_participant_id=r.creditor_participant_id,
                amount=r.amount,
                is_completed=r.is_completed,
                completed_at=r.completed_at,
                debtor_name=debtor.name if debtor else None,
                creditor_name=creditor.name if creditor else None,
                debtor_user_id=debtor.user_id if debtor else None,
                creditor_user_id=creditor.user_id if creditor else None,
                creditor_payment_method=creditor.user.payment_method if creditor and creditor.user else None,
                creditor_payment_account=creditor.user.payment_account if creditor and creditor.user else None,
            ))

        return GroupSettlementResults(
            group_id=group_id,
            results=result_responses,
            total_transactions=len(result_responses)
        )
