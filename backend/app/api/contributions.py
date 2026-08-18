from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.connection import get_db
from app.models.contribution import Contribution
from app.models.user import User
from app.schemas.contribution import ContributionCreate, ContributionOut, PrizePool

router = APIRouter(prefix="/contributions", tags=["contributions"])


@router.get("", response_model=PrizePool)
def list_contributions(db: Session = Depends(get_db)):
    contributions = db.query(Contribution).order_by(Contribution.created_at).all()
    total = db.query(func.coalesce(func.sum(Contribution.amount), 0)).scalar()
    return PrizePool(total=Decimal(total), contributions=contributions)


@router.post("", response_model=ContributionOut, status_code=201)
def add_contribution(
    payload: ContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contribution = Contribution(user_id=current_user.id, amount=payload.amount)
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    return contribution
