from decimal import Decimal

from pydantic import BaseModel


class MonthlyWinner(BaseModel):
    rank: int
    user_id: int
    username: str
    points: int
    payout: Decimal


class MonthlyResult(BaseModel):
    period: str
    is_current: bool
    total_pool: Decimal
    winners: list[MonthlyWinner]


class MyMonthSummary(BaseModel):
    period: str
    contributed: Decimal
    won: Decimal
