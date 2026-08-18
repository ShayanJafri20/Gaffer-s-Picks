from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.match import Match, MatchStatus
from app.schemas.match import MatchOut

router = APIRouter(prefix="/matches", tags=["matches"])


def get_current_gameweek(db: Session) -> int:
    """The earliest gameweek that isn't fully finished yet.

    Once every match in a gameweek is FINISHED, this rolls forward to the
    next one automatically - there's no manual "advance gameweek" step.
    """
    gameweek = (
        db.query(func.min(Match.gameweek))
        .filter(Match.status != MatchStatus.FINISHED)
        .scalar()
    )
    if gameweek is None:
        # every match ever synced is finished (season over) - show the last gameweek
        gameweek = db.query(func.max(Match.gameweek)).scalar()
    return gameweek or 1


@router.get("/current-gameweek")
def current_gameweek(db: Session = Depends(get_db)):
    return {"gameweek": get_current_gameweek(db)}


@router.get("", response_model=list[MatchOut])
def list_matches(gameweek: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Match)
    if gameweek is not None:
        query = query.filter(Match.gameweek == gameweek)
    return query.order_by(Match.kickoff_time).all()


@router.get("/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.get(Match, match_id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match
