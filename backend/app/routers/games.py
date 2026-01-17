from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.game import GameResultCreate, GameResultResponse
from app.services.auth import get_current_user
from app.services.game import GameService
from app.models.user import User

router = APIRouter(prefix="/api/v1/games", tags=["Mini Games"])


@router.post("/result", response_model=GameResultResponse, status_code=status.HTTP_201_CREATED)
def register_game_result(
    result_data: GameResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Register mini-game result and automatically create settlement item.
    The loser becomes the debtor for the settlement.
    """
    service = GameService(db)
    return service.create_game_result(result_data, current_user.id)
