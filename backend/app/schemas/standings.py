from pydantic import BaseModel


class StandingsRow(BaseModel):
    position: int
    team_name: str
    team_crest: str | None
    played: int
    won: int
    draw: int
    lost: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int
