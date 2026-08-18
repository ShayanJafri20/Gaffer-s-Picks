from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.contribution import Contribution
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionCreate, PredictionOut
from app.services.gameweek import get_current_gameweek

router = APIRouter(tags=["predictions"])


@router.post("/matches/{match_id}/prediction", response_model=PredictionOut)
def submit_prediction(
    match_id: int,
    payload: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    has_contributed = (
        db.query(Contribution).filter(Contribution.user_id == current_user.id).first()
        is not None
    )
    if not has_contributed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add your contribution to the prize pool before predicting",
        )

    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if datetime.now(timezone.utc) >= match.kickoff_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Predictions are locked once the match has kicked off",
        )

    if match.gameweek != get_current_gameweek(db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Predictions are only open for the current gameweek",
        )

    existing = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id, Prediction.match_id == match_id)
        .first()
    )

    if existing:
        existing.prediction = payload.prediction
        existing.home_score_prediction = payload.home_score_prediction
        existing.away_score_prediction = payload.away_score_prediction
        prediction = existing
    else:
        prediction = Prediction(
            user_id=current_user.id,
            match_id=match_id,
            prediction=payload.prediction,
            home_score_prediction=payload.home_score_prediction,
            away_score_prediction=payload.away_score_prediction,
        )
        db.add(prediction)

    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/predictions/me", response_model=list[PredictionOut])
def my_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
