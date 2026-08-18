from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus


def get_current_gameweek(db: Session) -> int:
    """The earliest gameweek that isn't fully finished yet.

    Once every match in a gameweek is FINISHED, this rolls forward to the
    next one automatically - there's no manual "advance gameweek" step.
    Predictions are only accepted for this gameweek (see predictions.py).
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
