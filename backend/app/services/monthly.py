from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.leaderboard import _ranked_rows
from app.models.contribution import Contribution
from app.schemas.monthly import MonthlyResult, MonthlyWinner
from app.services.period import current_period

PAYOUT_PERCENTAGES = [Decimal("0.6"), Decimal("0.2"), Decimal("0.1")]  # 1st, 2nd, 3rd


def get_monthly_result(db: Session, period: str) -> MonthlyResult:
    total = db.query(func.coalesce(func.sum(Contribution.amount), 0)).filter(
        Contribution.period == period
    ).scalar()
    total = Decimal(total)

    # Only rank people who've actually scored - being first in the query with
    # 0 points (nobody's played yet) isn't a real win, just an artifact of sort
    # order. No points on the board yet means no winners yet.
    rows = [r for r in _ranked_rows(db, period) if r.total_points > 0][:3]
    winners = [
        MonthlyWinner(
            rank=i + 1,
            user_id=row.user_id,
            username=row.username,
            points=row.total_points,
            payout=(total * pct).quantize(Decimal("0.01")),
        )
        for i, (row, pct) in enumerate(zip(rows, PAYOUT_PERCENTAGES))
    ]

    return MonthlyResult(
        period=period, is_current=period == current_period(), total_pool=total, winners=winners
    )


def list_past_periods(db: Session) -> list[str]:
    """Every month that ever had a contribution, oldest first, excluding the current one."""
    rows = (
        db.query(Contribution.period)
        .filter(Contribution.period < current_period())
        .distinct()
        .order_by(Contribution.period)
        .all()
    )
    return [r[0] for r in rows]
