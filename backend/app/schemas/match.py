from datetime import datetime

from pydantic import BaseModel

from app.models.match import MatchStatus


class MatchOut(BaseModel):
    id: int
    gameweek: int
    home_team: str
    away_team: str
    kickoff_time: datetime
    home_score: int | None
    away_score: int | None
    status: MatchStatus

    model_config = {"from_attributes": True}
