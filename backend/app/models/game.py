from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class GameType(str, enum.Enum):
    PINBALL_ROULETTE = "pinball_roulette"  # 핀볼 룰렛
    BOMB = "bomb"                           # 폭탄 게임


class GameResult(Base):
    """Mini-game results that create settlement items."""
    __tablename__ = "game_results"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    # Game type
    game_type = Column(SQLEnum(GameType), nullable=False)

    # Participants (JSON array of user IDs)
    participants = Column(JSON, nullable=False)

    # Winner/Loser (the one who has to pay)
    loser_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Amount at stake
    amount = Column(Numeric(12, 2), nullable=False)

    # Linked settlement (auto-created from game result)
    settlement_id = Column(Integer, ForeignKey("settlements.id"), nullable=True)

    # Game-specific data (e.g., bomb positions, roulette result)
    game_data = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    group = relationship("Group")
    loser = relationship("User")
    settlement = relationship("Settlement")
