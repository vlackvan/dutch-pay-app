from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum


class GameType(str, Enum):
    PINBALL_ROULETTE = "pinball_roulette"
    BOMB = "bomb"


class GameResultCreate(BaseModel):
    group_id: int
    game_type: GameType
    participants: List[int]  # List of user IDs
    loser_id: int  # The one who lost and has to pay
    amount: Decimal
    game_data: Optional[dict] = None  # Game-specific data


class GameResultResponse(BaseModel):
    id: int
    group_id: int
    game_type: GameType
    participants: List[int]
    loser_id: int
    amount: Decimal
    settlement_id: Optional[int] = None
    game_data: Optional[dict] = None
    created_at: datetime

    # User name of loser
    loser_name: Optional[str] = None

    class Config:
        from_attributes = True
