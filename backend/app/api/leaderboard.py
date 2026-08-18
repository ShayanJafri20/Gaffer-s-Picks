from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, MyRank

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def _ranked_rows(db: Session):
    """Every non-hidden user, ranked by total points.

    Admins and accounts explicitly flagged hide_from_leaderboard (e.g. test
    accounts) never appear here - they're not real competing friends.
    """
    rows = (
        db.query(
            User.id.label("user_id"),
            User.username.label("username"),
            func.coalesce(func.sum(Prediction.points), 0).label("total_points"),
            func.coalesce(
                func.sum(case((Prediction.points > 0, 1), else_=0)), 0
            ).label("correct_predictions"),
            func.count(Prediction.id).label("total_predictions"),
        )
        .outerjoin(Prediction, Prediction.user_id == User.id)
        .filter(User.hide_from_leaderboard == False, User.is_admin == False)  # noqa: E712
        .group_by(User.id, User.username)
        .order_by(func.coalesce(func.sum(Prediction.points), 0).desc())
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
                total_predictions=row.total_predictions,
            )
    return MyRank(rank=len(rows), total_points=0, correct_predictions=0, total_predictions=0)
