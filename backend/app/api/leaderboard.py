from fastapi import APIRouter, Depends
from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.match import Match, MatchStatus
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, MyRank

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def _ranked_rows(db: Session):
    """Every non-hidden user, ranked by total points across the whole season.

    A prediction only counts as "correct" or "wrong" once its match has
    actually finished - predictions on matches still to be played are
    neither, they're just pending. Total still counts every prediction made.
    """
    predictions_with_match = (
        db.query(
            Prediction.user_id.label("user_id"),
            Prediction.id.label("pred_id"),
            Prediction.points.label("points"),
            Match.status.label("match_status"),
        )
        .join(Match, Match.id == Prediction.match_id)
        .subquery()
    )

    finished = predictions_with_match.c.match_status == MatchStatus.FINISHED.value

    rows = (
        db.query(
            User.id.label("user_id"),
            User.username.label("username"),
            func.coalesce(func.sum(predictions_with_match.c.points), 0).label("total_points"),
            func.coalesce(
                func.sum(
                    case((and_(finished, predictions_with_match.c.points > 0), 1), else_=0)
                ),
                0,
            ).label("correct_predictions"),
            func.coalesce(
                func.sum(
                    case((and_(finished, predictions_with_match.c.points == 0), 1), else_=0)
                ),
                0,
            ).label("wrong_predictions"),
            func.count(predictions_with_match.c.pred_id).label("total_predictions"),
        )
        .outerjoin(predictions_with_match, predictions_with_match.c.user_id == User.id)
        .filter(User.hide_from_leaderboard == False, User.is_admin == False)  # noqa: E712
        .group_by(User.id, User.username)
        .order_by(func.coalesce(func.sum(predictions_with_match.c.points), 0).desc())
        .all()
    )
    return rows


@router.get("", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    rows = _ranked_rows(db)
    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=row.user_id,
            username=row.username,
            total_points=row.total_points,
            correct_predictions=row.correct_predictions,
            wrong_predictions=row.wrong_predictions,
            total_predictions=row.total_predictions,
        )
        for i, row in enumerate(rows)
    ]


@router.get("/me", response_model=MyRank)
def get_my_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = _ranked_rows(db)
    for i, row in enumerate(rows):
        if row.user_id == current_user.id:
            return MyRank(
                rank=i + 1,
                total_points=row.total_points,
                correct_predictions=row.correct_predictions,
                wrong_predictions=row.wrong_predictions,
                total_predictions=row.total_predictions,
            )
    return MyRank(rank=len(rows), total_points=0, correct_predictions=0, wrong_predictions=0, total_predictions=0)
