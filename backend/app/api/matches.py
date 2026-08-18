from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.match import Match
from app.schemas.match import MatchOut
from app.services.gameweek import get_current_gameweek

router = APIRouter(prefix="/matches", tags=["matches"])


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
