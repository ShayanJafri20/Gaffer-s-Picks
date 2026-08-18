from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0, decimal_places=2)


class ContributionOut(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class PrizePool(BaseModel):
    total: Decimal
    contributions: list[ContributionOut]
