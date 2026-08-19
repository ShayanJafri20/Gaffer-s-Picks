from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.contribution import Contribution
from app.models.user import User
from app.schemas.monthly import MonthlyResult, MyMonthSummary
from app.services.monthly import get_monthly_result, list_past_periods
from app.services.period import current_period

router = APIRouter(prefix="/monthly", tags=["monthly"])


@router.get("/current", response_model=MonthlyResult)
def current_month(db: Session = Depends(get_db)):
    return get_monthly_result(db, current_period())


@router.get("/history", response_model=list[MonthlyResult])
def history(db: Session = Depends(get_db)):
    periods = list_past_periods(db)
    return [get_monthly_result(db, p) for p in reversed(periods)]


@router.get("/me", response_model=list[MyMonthSummary])
def my_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    my_contributions = (
        db.query(Contribution)
        .filter(Contribution.user_id == current_user.id)
        .order_by(Contribution.period.desc())
        .all()
    )

    summaries = []
    for contribution in my_contributions:
        result = get_monthly_result(db, contribution.period)
        won = next(
            (w.payout for w in result.winners if w.user_id == current_user.id),
            0,
        )
        summaries.append(
            MyMonthSummary(period=contribution.period, contributed=contribution.amount, won=won)
        )
    return summaries
