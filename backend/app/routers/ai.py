from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/ai", tags=["AI Features"])


@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze uploaded image and return auto-generated tags.
    Bonus feature for receipt/icon analysis.
    """
    # TODO: Implement AI image analysis
    # This could use OpenAI Vision API, Google Cloud Vision, etc.
    return {
        "tags": ["food", "restaurant", "receipt"],
        "suggested_icon": "restaurant",
        "suggested_title": "식사"
    }
