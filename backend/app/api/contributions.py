from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.contribution import Contribution
from app.models.user import User
from app.schemas.contribution import ContributionCreate, ContributionOut, PrizePool
from app.services.period import current_period

router = APIRouter(prefix="/contributions", tags=["contributions"])


@router.get("", response_model=PrizePool)
def list_contributions(
    month: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    period = month or current_period()
    rows = (
        db.query(Contribution, User.username)
        .join(User, User.id == Contribution.user_id)
        .filter(Contribution.period == period)
        .order_by(Contribution.created_at)
        .all()
    )
    contributions = [
        ContributionOut(
            id=c.id,
            user_id=c.user_id,
            username=username,
            amount=c.amount,
            period=c.period,
            created_at=c.created_at,
        )
        for c, username in rows
    ]
    total = sum((c.amount for c in contributions), Decimal("0"))
    has_contributed = any(c.user_id == current_user.id for c in contributions)
    return PrizePool(
        period=period, total=total, contributions=contributions, has_contributed=has_contributed
    )


@router.post("", response_model=ContributionOut, status_code=201)
def add_contribution(
    payload: ContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    period = current_period()
    already_contributed = (
        db.query(Contribution)
        .filter(Contribution.user_id == current_user.id, Contribution.period == period)
        .first()
    )
    if already_contributed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You've already contributed for {period}",
        )

    contribution = Contribution(user_id=current_user.id, amount=payload.amount, period=period)
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    return ContributionOut(
        id=contribution.id,
        user_id=contribution.user_id,
        username=current_user.username,
        amount=contribution.amount,
        period=contribution.period,
        created_at=contribution.created_at,
    )
