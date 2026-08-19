from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, MyRank
from app.services.period import current_period

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def _ranked_rows(db: Session, period: str):
    """Every non-hidden user, ranked by points earned in the given month.

    Admins and accounts flagged hide_from_leaderboard never appear. A user
    with zero predictions that month still shows up (0 points), via the
    outer join against a pre-filtered subquery of that month's predictions.
    """
    period_expr = func.to_char(func.timezone("Asia/Karachi", Match.kickoff_time), "YYYY-MM")

    month_predictions = (
        db.query(
            Prediction.user_id.label("user_id"),
            Prediction.id.label("pred_id"),
            Prediction.points.label("points"),
        )
        .join(Match, Match.id == Prediction.match_id)
        .filter(period_expr == period)
        .subquery()
    )

    rows = (
        db.query(
            User.id.label("user_id"),
            User.username.label("username"),
            func.coalesce(func.sum(month_predictions.c.points), 0).label("total_points"),
            func.coalesce(
                func.sum(case((month_predictions.c.points > 0, 1), else_=0)), 0
            ).label("correct_predictions"),
            func.count(month_predictions.c.pred_id).label("total_predictions"),
        )
        .outerjoin(month_predictions, month_predictions.c.user_id == User.id)
        .filter(User.hide_from_leaderboard == False, User.is_admin == False)  # noqa: E712
        .group_by(User.id, User.username)
        .order_by(func.coalesce(func.sum(month_predictions.c.points), 0).desc())
        .all()
    )
    return rows


@router.get("", response_model=list[LeaderboardEntry])
def get_leaderboard(month: str | None = None, db: Session = Depends(get_db)):
    period = month or current_period()
    rows = _ranked_rows(db, period)
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
    rows = _ranked_rows(db, current_period())
    for i, row in enumerate(rows):
        if row.user_id == current_user.id:
            return MyRank(
                rank=i + 1,
                total_points=row.total_points,
                correct_predictions=row.correct_predictions,
                total_predictions=row.total_predictions,
            )
    return MyRank(rank=len(rows), total_points=0, correct_predictions=0, total_predictions=0)
