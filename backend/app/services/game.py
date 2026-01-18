from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.game import GameResult
from app.models.settlement import Settlement, SettlementParticipant, SplitType
from app.models.group import GroupParticipant
from app.schemas.game import GameResultCreate


class GameService:
    def __init__(self, db: Session):
        self.db = db

    def create_game_result(self, data: GameResultCreate, creator_id: int) -> GameResult:
        """
        Create a game result and automatically generate a settlement item.
        The loser of the game becomes the payer for the settlement.
        """
        # Verify loser is in participants
        if data.loser_participant_id not in data.participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Loser must be one of the participants"
            )

        # Create game result
        game_result = GameResult(
            group_id=data.group_id,
            game_type=data.game_type,
            participants=data.participants,
            loser_participant_id=data.loser_participant_id,
            amount=data.amount,
            game_data=data.game_data,
        )
        self.db.add(game_result)
        self.db.flush()

        # Auto-create settlement: loser pays for all participants
        settlement = Settlement(
            group_id=data.group_id,
            payer_participant_id=data.loser_participant_id,  # Loser pays
            title=f"미니게임 - {data.game_type.value}",
            description=f"게임 결과에 의한 자동 정산",
            total_amount=data.amount,
            split_type=SplitType.EQUAL,
            icon="game",
        )
        self.db.add(settlement)
        self.db.flush()

        # Add all participants (including loser) as participants
        amount_per_person = data.amount / len(data.participants)
        for participant_id in data.participants:
            participant = SettlementParticipant(
                settlement_id=settlement.id,
                participant_id=participant_id,
                amount_owed=amount_per_person,
            )
            self.db.add(participant)

        # Link game result to settlement
        game_result.settlement_id = settlement.id

        self.db.commit()
        self.db.refresh(game_result)

        # Add loser name to response
        loser = self.db.query(GroupParticipant).filter(GroupParticipant.id == data.loser_participant_id).first()
        game_result.loser_name = loser.name if loser else None

        return game_result
